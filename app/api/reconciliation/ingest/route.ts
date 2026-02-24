import { NextResponse } from 'next/server';
import { processSettlements } from '@/lib/reconciliation';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Expected format: { records: SettlementRecord[] }
        if (!payload || !Array.isArray(payload.records)) {
            return NextResponse.json({ error: "Invalid payload format. Expected { records: [] }" }, { status: 400 });
        }

        const results = await processSettlements(payload.records);

        return NextResponse.json({
            success: true,
            message: "Reconciliation ingestion complete",
            results
        });
    } catch (e: any) {
        console.error("Reconciliation Ingest Error:", e);
        return NextResponse.json({ error: "Failed to process settlement ingestion" }, { status: 500 });
    }
}
