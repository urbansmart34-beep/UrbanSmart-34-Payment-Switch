// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';
import { dispatchWebhooks } from '@/lib/webhook';

/**
 * GET /api/refunds
 * Returns a list of refunds from the new Refund table.
 */
export async function GET() {
    try {
        const refundsData = await prisma.refund.findMany({
            include: { transaction: { include: { store: true } } },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        const refunds = refundsData.map((r) => ({
            id: r.id,
            txId: r.transactionId,
            storeName: r.transaction.store?.name ?? "Unknown Store",
            storeIcon: "storefront",
            amount: r.amount,
            status: r.status,
            yocoRefundId: r.yocoRefundId,
            errorReason: r.errorReason,
            createdAt: r.createdAt.toISOString(),
        }));

        return NextResponse.json({ refunds });
    } catch (error) {
        console.error("GET /api/refunds error:", error);
        return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
    }
}

/**
 * POST /api/refunds
 * Creates a new refund request for a transaction.
 */
export async function POST(req: Request) {
    try {
        const { transactionId } = await req.json();

        if (!transactionId) {
            return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
        }

        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!tx) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Check if a refund already exists
        const existing = await prisma.refund.findFirst({
            where: { transactionId }
        });

        if (existing && existing.status !== "FAILED") {
            return NextResponse.json({ error: "Refund already requested or completed for this transaction" }, { status: 400 });
        }

        // Create or update the Refund record
        let refund;
        if (existing) {
            refund = await prisma.refund.update({
                where: { id: existing.id },
                data: { status: "PROCESSING", errorReason: null }
            });
        } else {
            refund = await prisma.refund.create({
                data: {
                    transactionId: tx.id,
                    amount: tx.amount, // Full refund by default for now
                    status: "REQUESTED"
                }
            });
            dispatchWebhooks(refund.id, "refund.requested", refund).catch(console.error);
        }

        // Connect to Yoco Refund API
        // https://developer.yoco.com/online/api/reference#tag/Refunds/operation/refundsCreate
        if (!tx.yocoChargeId) {
            const failedRefund = await prisma.refund.update({
                where: { id: refund.id },
                data: { status: "FAILED", errorReason: "Missing Yoco Charge ID" }
            });
            dispatchWebhooks(failedRefund.id, "refund.failed", failedRefund).catch(console.error);
            return NextResponse.json({ error: "Cannot refund: Original charge ID is missing" }, { status: 400 });
        }

        const idempotencyKey = crypto.randomUUID();

        const yocoRes = await fetch('https://online.yoco.com/v1/refunds/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY || '',
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                chargeId: tx.yocoChargeId
            })
        });

        const yocoData = await yocoRes.json();

        if (!yocoRes.ok) {
            console.error("Yoco Refund Failed:", yocoData);
            const failedRefund = await prisma.refund.update({
                where: { id: refund.id },
                data: { status: "FAILED", errorReason: yocoData.message || "Yoco API Error" }
            });
            dispatchWebhooks(failedRefund.id, "refund.failed", failedRefund).catch(console.error);
            return NextResponse.json({ error: yocoData.message || "Failed to process refund with Yoco" }, { status: 400 });
        }

        // Success
        const finalRefund = await prisma.refund.update({
            where: { id: refund.id },
            data: {
                status: "COMPLETED",
                yocoRefundId: yocoData.id
            }
        });

        dispatchWebhooks(finalRefund.id, "refund.completed", finalRefund).catch(console.error);

        return NextResponse.json({ refund: finalRefund });
    } catch (error) {
        console.error("POST /api/refunds error:", error);
        return NextResponse.json({ error: "Failed to create refund" }, { status: 500 });
    }
}
