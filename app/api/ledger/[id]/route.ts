import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const tx = await prisma.transaction.findUnique({
            where: { id },
            include: {
                store: {
                    select: { name: true, id: true }
                }
            }
        });

        if (!tx) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        let metadataObj = null;
        if (tx.metadata) {
            try {
                metadataObj = JSON.parse(tx.metadata);
            } catch (e) {
                // Ignore parse errors
            }
        }

        const data = {
            id: tx.id,
            amount: tx.amount,
            status: tx.status,
            currency: tx.currency,
            date: new Date(tx.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "medium" }),
            chargeId: tx.yocoChargeId || "N/A",
            yocoToken: metadataObj?.token?.id || "N/A", // From Yoco inline if available
            storeId: tx.store?.name || tx.storeId,
            orderId: metadataObj?.metadata?.checkoutId || `#ORD-${tx.id.substring(0, 8).toUpperCase()}`,
            customerEmail: metadataObj?.customer?.email || "Unknown",
            routingPath: "Yoco API Gateway",
            jsonPayload: metadataObj || { status: tx.status, amount: tx.amount, currency: tx.currency },
            timeline: [
                { title: "Transaction Initiated", detail: `${new Date(tx.createdAt).toLocaleTimeString("en-ZA")} - Client SDK -> Switch`, icon: "rocket_launch", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
                { title: "Gateway Processing", detail: "POST /v1/charges", icon: "sync_alt", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
                {
                    title: tx.status === "SUCCESS" ? "Payment Captured" : tx.status === "FAILED" ? "Payment Failed" : "Payment Pending",
                    detail: `${new Date(tx.updatedAt).toLocaleTimeString("en-ZA")} - Gateway Response`,
                    icon: tx.status === "SUCCESS" ? "check" : tx.status === "FAILED" ? "close" : "schedule",
                    color: tx.status === "SUCCESS" ? "bg-emerald-500 text-white" : tx.status === "FAILED" ? "bg-rose-500 text-white" : "bg-amber-500 text-white",
                    textClass: tx.status === "SUCCESS" ? "text-emerald-500" : tx.status === "FAILED" ? "text-rose-500" : "text-amber-500"
                },
            ]
        };

        return NextResponse.json({ success: true, data });
    } catch (e) {
        console.error("Failed to fetch transaction", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
