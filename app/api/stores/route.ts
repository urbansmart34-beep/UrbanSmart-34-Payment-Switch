import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            include: {
                transactions: {
                    select: { amount: true, status: true, createdAt: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const mapped = stores.map((store) => {
            const totalSales = store.transactions
                .filter((tx) => tx.status === "SUCCESS")
                .reduce((sum, tx) => sum + tx.amount, 0);

            const lastTx = store.transactions[0];
            const daysSinceLastTx = lastTx
                ? (Date.now() - new Date(lastTx.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                : Infinity;

            // A store is "active" if it has had a transaction in the last 30 days
            const isActive = store.transactions.length > 0 && daysSinceLastTx < 30;

            return {
                id: store.id,
                name: store.name,
                apiKey: store.apiKey,
                isActive,
                totalSales,
                transactionCount: store.transactions.length,
            };
        });

        return NextResponse.json({ stores: mapped });
    } catch (error) {
        console.error("GET /api/stores error:", error);
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
    }
}
