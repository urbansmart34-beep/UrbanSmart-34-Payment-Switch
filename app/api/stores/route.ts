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

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ error: "Store name is required" }, { status: 400 });
        }

        // Generate a mock API key for the new store
        const randomString = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        const apiKey = `pk_test_${randomString}`;

        const newStore = await prisma.store.create({
            data: {
                name: body.name,
                apiKey,
            }
        });

        return NextResponse.json({ success: true, store: newStore }, { status: 201 });
    } catch (error) {
        console.error("POST /api/stores error:", error);
        return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
    }
}
