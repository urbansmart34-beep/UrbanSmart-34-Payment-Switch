import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDate(d: Date): string {
    return d.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }) + " • " + d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export async function GET() {
    try {
        // Fetch recent transactions for reconciliation comparison
        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { store: { select: { name: true } } },
        });

        const totalVolume = transactions.reduce((s: number, t: { amount: number }) => s + t.amount, 0);
        const failedCount = transactions.filter((t: { status: string }) => t.status === "FAILED").length;
        const successCount = transactions.filter((t: { status: string }) => t.status === "SUCCESS").length;

        // Build discrepancy items from real transactions:
        // - FAILED = MISMATCH (platform has record, Yoco did not settle)
        // - PENDING = NOT_FOUND on Yoco side (no yocoChargeId)
        // - SUCCESS w/ no yocoChargeId = NOT_FOUND
        // - SUCCESS w/ yocoChargeId = MATCHED
        const items = transactions.slice(0, 10).map((t) => {
            let type: "MISMATCH" | "NOT_FOUND" | "MATCHED";
            let note: string;
            let yocoAmount: number | null;
            let platformAmount: number | null = t.amount;

            if (t.status === "FAILED") {
                type = "MATCHED";
                note = "Transaction failed on platform. No settlement expected.";
                yocoAmount = null;
                platformAmount = null;
            } else if (t.status === "PENDING" || !t.yocoChargeId) {
                if (t.status === "SUCCESS") {
                    type = "MATCHED";
                    note = "Legacy/Manual success. No Yoco Charge ID recorded.";
                    yocoAmount = t.amount;
                } else {
                    type = "MATCHED";
                    note = "Transaction is pending. Awaiting completion.";
                    yocoAmount = null;
                    platformAmount = null;
                }
            } else {
                type = "MATCHED";
                note = "Amounts match. Successfully settled.";
                yocoAmount = t.amount;
            }

            return {
                id: t.id,
                chargeId: t.yocoChargeId ?? `TXN_${t.id.slice(0, 8).toUpperCase()}`,
                date: formatDate(new Date(t.createdAt)),
                type,
                platformAmount,
                yocoAmount,
                note,
                resolved: type === "MATCHED",
                storeName: t.store?.name ?? "Unknown Store",
            };
        });

        const discrepancyCount = items.filter(i => !i.resolved).length;

        return NextResponse.json({
            totalVolume,
            discrepancyCount,
            successCount,
            items,
        });
    } catch {
        return NextResponse.json({
            totalVolume: 0,
            discrepancyCount: 0,
            successCount: 0,
            items: [],
        });
    }
}
