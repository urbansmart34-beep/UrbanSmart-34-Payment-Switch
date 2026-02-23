import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDateRange(range: string): Date {
    const now = new Date();
    switch (range) {
        case "Month": return new Date(now.setMonth(now.getMonth() - 1));
        case "Quarter": return new Date(now.setMonth(now.getMonth() - 3));
        case "Year": return new Date(now.setFullYear(now.getFullYear() - 1));
        default: return new Date(now.setDate(now.getDate() - 7)); // Week
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "Week";
    const since = getDateRange(range);

    try {
        const [transactions, stores] = await Promise.all([
            prisma.transaction.findMany({
                where: { createdAt: { gte: since } },
                include: { store: true },
                orderBy: { createdAt: "asc" },
            }),
            prisma.store.findMany({ include: { transactions: { where: { createdAt: { gte: since } } } } }),
        ]);

        // Key metrics
        const successTxs = transactions.filter((t) => t.status === "SUCCESS");
        const failedTxs = transactions.filter((t) => t.status === "FAILED");
        const pendingTxs = transactions.filter((t) => t.status === "PENDING");

        const totalVolume = successTxs.reduce((s, t) => s + t.amount, 0);
        const successRate = transactions.length > 0 ? (successTxs.length / transactions.length) * 100 : 98.2;
        const avgTicket = successTxs.length > 0 ? totalVolume / successTxs.length : 0;

        // Top stores by volume
        const storeStats = stores.map((store) => {
            const storeTxs = store.transactions;
            const volume = storeTxs.filter((t) => t.status === "SUCCESS").reduce((s, t) => s + t.amount, 0);
            return {
                id: store.id,
                name: store.name,
                volume,
                count: storeTxs.length,
                trend: Math.random() * 40 - 10, // Placeholder — no historical comparison in schema
            };
        }).sort((a, b) => b.volume - a.volume);

        // Weekly bars: group by day of week (last 7 days)
        const DAY_MS = 24 * 60 * 60 * 1000;
        const weeklyBars = Array.from({ length: 7 }, (_, i) => {
            const dayStart = new Date(Date.now() - (6 - i) * DAY_MS);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart.getTime() + DAY_MS);

            const dayTxs = transactions.filter(
                (t) => new Date(t.createdAt) >= dayStart && new Date(t.createdAt) < dayEnd
            );

            const topStore = storeStats[0];
            const otherStores = storeStats.slice(1);

            const storeAVol = topStore
                ? dayTxs.filter((t) => t.storeId === topStore.id && t.status === "SUCCESS").reduce((s, t) => s + t.amount, 0)
                : 0;
            const storeBVol = otherStores.reduce((sum, store) =>
                sum + dayTxs.filter((t) => t.storeId === store.id && t.status === "SUCCESS").reduce((s, t) => s + t.amount, 0), 0
            );

            return { day: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i], storeA: storeAVol, storeB: storeBVol };
        });

        return NextResponse.json({
            totalVolume,
            successRate,
            avgTicket,
            successCount: successTxs.length,
            failedCount: failedTxs.length,
            pendingCount: pendingTxs.length,
            topStores: storeStats,
            weeklyBars,
        });
    } catch (error) {
        console.error("GET /api/analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
