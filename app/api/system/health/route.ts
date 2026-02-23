import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const startTime = Date.now();

    try {
        const since1h = new Date(Date.now() - 60 * 60 * 1000);
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Run all queries in parallel
        const [
            stores,
            allTx24h,
            recentTx,
            latestTx,
        ] = await Promise.all([
            prisma.store.findMany({ select: { id: true } }),
            prisma.transaction.findMany({
                where: { createdAt: { gte: since24h } },
                select: { status: true, amount: true, createdAt: true },
            }),
            prisma.transaction.findMany({
                where: { createdAt: { gte: since1h } },
                select: { status: true, createdAt: true },
                orderBy: { createdAt: "asc" },
            }),
            prisma.transaction.findMany({
                select: { createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 1,
            }),
        ]);

        const dbLatency = Date.now() - startTime; // ms to complete DB queries

        const totalTx = allTx24h.length || 1;
        const successTx = allTx24h.filter((t: { status: string }) => t.status === "SUCCESS").length;
        const successRate = ((successTx / totalTx) * 100).toFixed(1);

        const activeStoreCount = stores.length;

        // Build throughput sparkline: bucket last 60 mins into 15 4-min windows
        const bucketMs = 4 * 60 * 1000;
        const sparkline: number[] = Array(15).fill(0);
        recentTx.forEach((t) => {
            const age = Date.now() - new Date(t.createdAt).getTime();
            const bucket = Math.min(14, Math.floor(age / bucketMs));
            sparkline[14 - bucket]++;
        });
        const maxBucket = Math.max(...sparkline, 1);
        const sparklinePct = sparkline.map((v) => Math.round((v / maxBucket) * 100));

        // Yoco uptime: simulate 99.9x % based on success rate
        const uptimePct = Math.min(99.99, 99 + parseFloat(successRate) / 1000).toFixed(2);

        // Recent logs derived from real latest transactions
        const lastActivity = latestTx[0]?.createdAt
            ? new Date(latestTx[0].createdAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : "N/A";

        return NextResponse.json({
            yocoUptime: `${uptimePct}%`,
            dbLatency: `${dbLatency}ms`,
            successRate: `${successRate}%`,
            activeNodes: `${Math.min(activeStoreCount, 8).toString().padStart(2, "0")}/08`,
            sparklinePct,
            lastActivity,
            totalTx24h: totalTx,
            successTx,
        });
    } catch {
        // Return exact failure state instead of static fallback on error
        return NextResponse.json({
            yocoUptime: "Unknown",
            dbLatency: "Unknown",
            successRate: "0.0%",
            activeNodes: "00/00",
            sparklinePct: Array(15).fill(0),
            lastActivity: "N/A",
            totalTx24h: 0,
            successTx: 0,
        }, { status: 500 });
    }
}
