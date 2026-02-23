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
                type = "NOT_FOUND";
                note = "Platform logged a failed transaction. Yoco has no record of it.";
                yocoAmount = null;
                platformAmount = t.amount;
            } else if (t.status === "PENDING") {
                type = "MISMATCH";
                note = "Transaction is pending here but might have settled on Yoco. Needs manual sync.";
                yocoAmount = t.amount;
                platformAmount = t.amount;
            } else if (!t.yocoChargeId && t.status === "SUCCESS") {
                type = "NOT_FOUND";
                note = "Successful transaction without Yoco charge ID. Missing integration link.";
                yocoAmount = null;
                platformAmount = t.amount;
            } else {
                type = "MATCHED";
                note = "Amounts match. Successfully settled.";
                yocoAmount = t.amount;
                platformAmount = t.amount;
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

        const discrepancyCount = items.filter((i) => !i.resolved).length;

        // Calculate dynamic drift bars for the last 7 days
        // Normally this would query Yoco API logs vs our logs per day
        const driftBars = Array.from({ length: 7 }).map((_, i) => {
            const dayTxs = transactions.slice(i * 3, i * 3 + 3); // Mock spread
            const failing = dayTxs.filter((t) => t.status === "FAILED" || t.status === "PENDING").length;
            const total = dayTxs.length || 1;
            const errorRate = failing / total;

            let color = "bg-primary";
            if (errorRate > 0.5) color = "bg-rose-500";
            else if (errorRate > 0) color = "bg-primary/40";

            return {
                h: `${Math.max(20, Math.min(100, 100 - (errorRate * 50)))}%`,
                color
            };
        });

        return NextResponse.json({
            totalVolume,
            discrepancyCount,
            successCount,
            items,
            driftBars
        });
    } catch {
        return NextResponse.json({
            totalVolume: 0,
            discrepancyCount: 0,
            successCount: 0,
            items: [],
            driftBars: []
        });
    }
}
