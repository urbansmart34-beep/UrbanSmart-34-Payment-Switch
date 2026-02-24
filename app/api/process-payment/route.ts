import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { yocoBreaker } from '@/lib/circuitBreaker';
import { northBreaker } from '@/lib/northApi';
import { determineOptimalProcessor, PaymentProcessor } from '@/lib/routingEngine';
import { rateLimit } from '@/lib/rateLimit';
import { dispatchWebhooks } from '@/lib/webhook';
import { cache } from '@/lib/cache';
import { maskPII } from '@/lib/masking';

// Validation Schema
const paymentSchema = z.object({
    amount: z.number().int().positive(),
    currency: z.literal('ZAR'),
    storeId: z.string().uuid(),
    metadata: z.any().optional(),
});

export async function POST(request: Request) {
    const startTime = performance.now();
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
            const latencyMs = Math.round(performance.now() - startTime);
            console.warn(`[API] Payment request failed validation in ${latencyMs}ms.`, result.error.flatten());
            return NextResponse.json(
                { success: false, error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            );
        }
        let { amount, currency, storeId, metadata } = result.data;
        // 1.5 PII Data Masking
        // Scrub any sensitive information the store might have included in the metadata payload
        metadata = maskPII(metadata || {});

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
        // Try to get cached api_settings, fallback to DB
        let apiConfigRecord = cache.get<any>("api_settings");
        if (!apiConfigRecord) {
            apiConfigRecord = await prisma.systemConfig.findUnique({ where: { key: "api_settings" } });
            if (apiConfigRecord) cache.set("api_settings", apiConfigRecord, 60000); // cache for 1 minute
        }

        if (apiConfigRecord && apiConfigRecord.value) {
            try {
                const apiConfig = JSON.parse(apiConfigRecord.value);
                const isFraudEnabled = apiConfig.toggles?.find((t: any) => t.id === 'fraud')?.enabled;
                if (isFraudEnabled) {

                    // 1. Fetch specific Fraud Rules (Try Cache first)
                    let rulesRecord = cache.get<any>("fraud_rules");
                    if (!rulesRecord) {
                        rulesRecord = await prisma.systemConfig.findUnique({ where: { key: "fraud_rules" } });
                        if (rulesRecord) cache.set("fraud_rules", rulesRecord, 60000); // cache for 1 min
                    }

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

        // 4. Intelligent Routing
        const primaryProcessor = determineOptimalProcessor({ amount, currency, storeId });
        let finalProcessorUsed = primaryProcessor;

        const baseUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const payload = {
            amount: amount,
            currency,
            successUrl: `${baseUrl}/payment/success?tx=${transaction.id}`,
            cancelUrl: `${baseUrl}/payment?error=cancelled`,
            metadata: { transactionId: transaction.id }
        };

        const tryProcessor = async (processor: PaymentProcessor): Promise<Response> => {
            if (processor === 'YOCO') {
                return await yocoBreaker.fire(payload) as Response;
            } else {
                return await northBreaker.fire(payload) as Response;
            }
        }

        // 5. Execute Payment with Automatic Failover
        let gatewayResponse: Response;
        try {
            gatewayResponse = await tryProcessor(primaryProcessor);
        } catch (err: unknown) {
            console.warn(`[API] Primary processor (${primaryProcessor}) failed: ${(err as Error).message}. Triggering automatic failover.`);

            const fallbackProcessor = primaryProcessor === 'YOCO' ? 'NORTH' : 'YOCO';
            try {
                console.log(`[API] Routing to fallback processor: ${fallbackProcessor}`);
                gatewayResponse = await tryProcessor(fallbackProcessor);
                finalProcessorUsed = fallbackProcessor;
            } catch (fallbackErr: unknown) {
                // Both processors failed
                const latencyMs = Math.round(performance.now() - startTime);
                console.error(`[API] Both processors failed after ${latencyMs}ms:`, fallbackErr);

                // Circuit Breaker Open or hard Timeout after retries on both
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'FAILED', metadata: JSON.stringify({ ...metadata, _processingLatencyMs: latencyMs, error: "All Payment Services Unavailable", _breakerTripped: true }) }
                });
                return NextResponse.json(
                    { success: false, error: "Payment Service Unavailable", details: (fallbackErr as Error).message },
                    { status: 503 }
                );
            }
        }

        const gatewayData = await gatewayResponse.json();
        const apiLatencyMs = Math.round(performance.now() - startTime);

        if (!gatewayResponse.ok) {
            // 6a. Handle Failure
            console.error(`[API] ${finalProcessorUsed} returned failure ${gatewayResponse.status} after ${apiLatencyMs}ms:`, gatewayData);

            const failedTx = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'FAILED',
                    metadata: JSON.stringify({ ...metadata, _processor: finalProcessorUsed, _processingLatencyMs: apiLatencyMs, failure_reason: gatewayData }),
                },
            });

            await dispatchWebhooks(failedTx.id, "payment.failed", failedTx);

            return NextResponse.json(
                { success: false, error: 'Payment Declined', details: gatewayData },
                { status: 402 }
            );
        }

        // 6b. Handle Success Intent Creation
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                yocoChargeId: gatewayData.id, // Using the same field for now to support both
                metadata: JSON.stringify({ ...metadata, _processor: finalProcessorUsed, _processingLatencyMs: apiLatencyMs }),
            },
        });

        console.log(`[API] Payment Intent created successfully via ${finalProcessorUsed} in ${apiLatencyMs}ms (${transaction.id})`);

        // Redirect to the assigned gateway's checkout page
        return NextResponse.json({
            success: true,
            transactionId: transaction.id,
            status: 'PENDING',
            checkoutUrl: gatewayData.redirectUrl,
        });

    } catch (error) {
        const totalLatencyMs = Math.round(performance.now() - startTime);
        console.error(`[API] Critical Payment Switch Error after ${totalLatencyMs}ms:`, error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
