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

        // Fetch live discrepancies from the database
        const discrepancies = await prisma.discrepancy.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                transaction: {
                    include: { store: { select: { name: true } } }
                }
            }
        });

        // Map them to the UI's expected format
        const items = discrepancies.map((d: any) => {
            const parsedDetails = JSON.parse(d.details || '{}');
            let note = parsedDetails.message || "Mismatch detected.";

            return {
                id: d.id, // Using discrepancy ID for UI keys
                chargeId: d.processorChargeId,
                date: formatDate(new Date(d.createdAt)),
                type: d.type === 'MISSING_IN_LEDGER' ? 'NOT_FOUND' : 'MISMATCH', // Adapting DB types to UI chips
                platformAmount: parsedDetails.ledgerAmount || d.transaction?.amount || null,
                yocoAmount: parsedDetails.processorAmount || null,
                note,
                resolved: d.resolved,
                storeName: d.transaction?.store?.name ?? "Unknown Store",
                processor: d.processor
            };
        });

        const discrepancyCount = items.filter((i: any) => !i.resolved).length;

        // Dynamic drift bars (concept unchanged for visual dashboard flair)
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
