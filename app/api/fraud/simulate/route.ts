import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const rules = await req.json();
        const maxAmount = parseFloat((rules.maxAmount || "5000").replace(/,/g, "")) * 100; // Expected in UI as Rands, DB in cents
        // For simulation, we'll just check max amount limits and block countries roughly.
        // If we had country data on Transactions we could use blockedCountries.

        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const recentTx = await prisma.transaction.findMany({
            where: { createdAt: { gte: since24h } },
            select: { id: true, amount: true, status: true }
        });

        let hypotheticalBlocks = 0;

        for (const tx of recentTx) {
            // Check Auto-Reject max limit
            if (rules.autoReject && tx.amount > maxAmount) {
                hypotheticalBlocks++;
                continue;
            }
        }

        return NextResponse.json({
            totalChecked: recentTx.length,
            blocked: hypotheticalBlocks
        });
    } catch (error) {
        console.error("POST /api/fraud/simulate error:", error);
        return NextResponse.json({ error: "Failed to run simulation" }, { status: 500 });
    }
}
