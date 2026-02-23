import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const storeFilter = searchParams.get("store") || "all";
    const statusFilter = searchParams.get("status") || "all";

    try {
        const where: Record<string, unknown> = {};

        if (storeFilter !== "all") {
            where.store = { name: { contains: storeFilter } };
        }

        if (statusFilter !== "all") {
            where.status = statusFilter.toUpperCase();
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: { store: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        const totalVolume = transactions.reduce((s: number, t: { amount: number }) => s + t.amount, 0);

        const rows = transactions.map((t) => ({
            id: t.id,
            timestamp: new Date(t.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }),
            storeId: t.store?.name ?? t.storeId,
            amount: t.amount / 100,
            status: t.status,
            yocoRef: t.yocoChargeId ?? null,
        }));

        return NextResponse.json({ rows, totalVolume, totalRecords: transactions.length });
    } catch {
        return NextResponse.json({ rows: [], totalVolume: 0, totalRecords: 0 });
    }
}
