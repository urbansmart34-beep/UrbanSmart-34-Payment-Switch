"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
    const totalSalesAggregate = await prisma.transaction.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: "SUCCESS",
        },
    });

    const transactionCount = await prisma.transaction.count();

    const activeStores = await prisma.store.count();

    const failedTransactions = await prisma.transaction.count({
        where: { status: "FAILED" }
    });

    const refundRate = transactionCount > 0 ? (failedTransactions / transactionCount) * 100 : 0;

    const recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            store: true,
        }
    });

    return {
        totalSales: totalSalesAggregate._sum.amount || 0,
        transactionCount,
        activeStores,
        refundRate,
        recentTransactions: recentTransactions.map((tx) => ({
            id: tx.id,
            store: tx.store?.name || "Unknown Store",
            time: tx.createdAt.toISOString(),
            amount: tx.amount,
            status: tx.status,
            icon: "store"
        }))
    };
}
