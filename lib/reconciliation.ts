import { prisma } from '@/lib/prisma';

export interface SettlementRecord {
    processor: string; // 'YOCO', 'NORTH'
    processorChargeId: string;
    amount: number; // in cents
    status: string; // 'SUCCESS', 'FAILED', 'REFUNDED'
}

export async function processSettlements(records: SettlementRecord[]) {
    const results = {
        totalProcessed: records.length,
        discrepanciesFound: 0,
        newRecordsCreated: 0,
    };

    for (const record of records) {
        let type: string | null = null;
        let details: Record<string, any> = {};

        // Find the transaction in the DB by charge ID
        const transaction = await prisma.transaction.findFirst({
            where: { yocoChargeId: record.processorChargeId }
        });

        if (!transaction) {
            type = 'MISSING_IN_LEDGER';
            details = { message: 'Processor settled a transaction not found in Switch Ledger', record };
        } else {
            // Check for amount mismatch
            if (transaction.amount !== record.amount) {
                type = 'AMOUNT_MISMATCH';
                details = {
                    message: `Ledger amount (${transaction.amount}) !== Processor amount (${record.amount})`,
                    ledgerAmount: transaction.amount,
                    processorAmount: record.amount
                };
            }
            // Check for status mismatch (e.g. FAILED in switch, SUCCESS in processor)
            // Note: External processor 'status' might need mapping to our 'status'.
            // For now, assume exact match expected for standard statuses.
            else if (transaction.status !== record.status) {
                type = 'STATUS_MISMATCH';
                details = {
                    message: `Ledger status (${transaction.status}) !== Processor status (${record.status})`,
                    ledgerStatus: transaction.status,
                    processorStatus: record.status
                };
            }
        }

        if (type) {
            results.discrepanciesFound++;
            // Check if discrepancy already exists to avoid duplicates
            const existing = await prisma.discrepancy.findFirst({
                where: { processorChargeId: record.processorChargeId, resolved: false, type }
            });

            if (!existing) {
                await prisma.discrepancy.create({
                    data: {
                        processor: record.processor,
                        processorChargeId: record.processorChargeId,
                        type,
                        details: JSON.stringify(details),
                        transactionId: transaction?.id || null,
                    }
                });
                results.newRecordsCreated++;
            }
        }
    }

    return results;
}
