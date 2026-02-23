import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const store = await prisma.store.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 50
                }
            }
        });

        if (!store) {
            return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
        }

        const txs = store.transactions;
        const totalVolume = txs.reduce((sum, t) => sum + t.amount, 0);
        const successCount = txs.filter(t => t.status === "SUCCESS").length;
        const successRate = txs.length > 0 ? (successCount / txs.length) * 100 : 0;
        const avgTicket = txs.length > 0 ? totalVolume / txs.length : 0;

        // IsActive logic: 1 transaction in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = txs.some(t => new Date(t.createdAt) >= thirtyDaysAgo);

        const recentTransactions = txs.slice(0, 10).map((t) => {
            let card = "Unknown";
            if (t.metadata) {
                try {
                    const parsed = JSON.parse(t.metadata);
                    if (parsed.card) {
                        card = `${parsed.card.brand || "card"} **** ${parsed.card.last4 || "****"}`;
                    }
                } catch {
                    // Ignore parse error
                }
            }

            return {
                id: t.id,
                name: `Order #${t.id.substring(0, 8).toUpperCase()}`,
                time: new Date(t.createdAt).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" }),
                card,
                amount: t.amount / 100,
                status: t.status
            };
        });

        return NextResponse.json({
            success: true,
            store: {
                id: store.id,
                name: store.name,
                apiKey: store.apiKey,
                isActive
            },
            kpis: {
                totalVolume,
                successRate,
                avgTicket
            },
            transactions: recentTransactions
        });
    } catch (e) {
        console.error("Store Analytics Error:", e);
        return NextResponse.json({ success: false, error: "Failed to fetch store analytics" }, { status: 500 });
    }
}
