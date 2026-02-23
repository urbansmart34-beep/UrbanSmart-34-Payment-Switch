import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { yocoBreaker } from '@/lib/circuitBreaker';
import { rateLimit } from '@/lib/rateLimit';
import { dispatchWebhooks } from '@/lib/webhook';

// Validation Schema
const paymentSchema = z.object({
    amount: z.number().int().positive(),
    currency: z.literal('ZAR'),
    storeId: z.string().uuid(),
    metadata: z.any().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();


        // 0. Rate Limiting
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        if (!await rateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: "Too many requests" },
                { status: 429 }
            );
        }

        // 1. Validate Input
        const result = paymentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            );
        }
        let { amount, currency, storeId, metadata } = result.data;
        metadata = metadata || {};

        // 2. Verify Store
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Invalid Store ID' },
                { status: 401 }
            );
        }

        // 2.5 Fraud Detection Mode Check
        const apiConfigRecord = await prisma.systemConfig.findUnique({ where: { key: "api_settings" } });
        if (apiConfigRecord && apiConfigRecord.value) {
            try {
                const apiConfig = JSON.parse(apiConfigRecord.value);
                const isFraudEnabled = apiConfig.toggles?.find((t: any) => t.id === 'fraud')?.enabled;
                if (isFraudEnabled) {

                    // 1. Fetch specific Fraud Rules
                    const rulesRecord = await prisma.systemConfig.findUnique({ where: { key: "fraud_rules" } });
                    if (rulesRecord && rulesRecord.value) {
                        try {
                            const rules = JSON.parse(rulesRecord.value);

                            // 1a. Amount Constraint
                            if (rules.autoReject && rules.maxAmount) {
                                // Strip formatting from string like "5,000.00" -> 500000
                                const maxAllowedCents = Math.round(parseFloat(rules.maxAmount.replace(/,/g, '')) * 100);
                                if (amount > maxAllowedCents) {
                                    return NextResponse.json(
                                        { success: false, error: 'Transaction declined by Fraud Prevention System', details: { reason: `Amount exceeds maximum limit of R ${rules.maxAmount}` } },
                                        { status: 403 }
                                    );
                                }
                            }
                            // 1b. Geofencing (in a real app, you'd geo-locate their IP. We'll simulate it passing for local test)
                        } catch (e) {
                            console.error("Failed to parse specific fraud rules", e);
                        }
                    }

                    // 2. ML Risk Scoring Simulation
                    // Generates a random risk score 1-100. Over 85 is automatically rejected.
                    const fraudScore = Math.floor(Math.random() * 100) + 1;
                    if (fraudScore > 85) {
                        return NextResponse.json(
                            { success: false, error: 'Transaction declined by Fraud Prevention System', details: { score: fraudScore, reason: "High Risk Profile" } },
                            { status: 403 }
                        );
                    }
                    // If it passes, inject the fraud score footprint into the transaction logs securely
                    metadata = { ...metadata, _internalFraudScore: fraudScore, _fraudCheckPassed: true };
                }
            } catch (e) {
                console.error("Failed to parse API settings for fraud check", e);
            }
        }

        // 3. Log Pending Transaction
        const transaction = await prisma.transaction.create({
            data: {
                amount,
                currency,
                status: 'PENDING',
                storeId,
                metadata: JSON.stringify(metadata || {}),
            },
        });

        // 4. Call Yoco API (via Circuit Breaker)
        let yocoResponse: Response;
        try {
            const baseUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            yocoResponse = await yocoBreaker.fire({
                amount: amount,
                currency,
                successUrl: `${baseUrl}/payment/success?tx=${transaction.id}`,
                cancelUrl: `${baseUrl}/payment?error=cancelled`,
                metadata: { transactionId: transaction.id }
            }) as Response;
        } catch (err: unknown) {
            // Circuit Breaker Open or Timeout
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'FAILED', metadata: JSON.stringify({ error: (err as Error).message }) }
            });
            return NextResponse.json(
                { success: false, error: "Payment Service Unavailable", details: (err as Error).message },
                { status: 503 }
            );
        }

        const yocoData = await yocoResponse.json();

        if (!yocoResponse.ok) {
            // 5a. Handle Failure
            const failedTx = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'FAILED',
                    metadata: JSON.stringify({ ...metadata, failure_reason: yocoData }),
                },
            });

            await dispatchWebhooks(failedTx.id, "payment.failed", failedTx);

            return NextResponse.json(
                { success: false, error: 'Payment Declined', details: yocoData },
                { status: 402 }
            );
        }

        // 5b. Handle Success Intent Creation
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                yocoChargeId: yocoData.id,
            },
        });

        // Redirect to Yoco checkout page
        return NextResponse.json({
            success: true,
            transactionId: transaction.id,
            status: 'PENDING',
            checkoutUrl: yocoData.redirectUrl,
        });

    } catch (error) {
        console.error('Payment Switch Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
