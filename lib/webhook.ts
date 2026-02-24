// @ts-nocheck
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

type WebhookEvent = "payment.succeeded" | "payment.failed" | "refund.requested" | "refund.completed" | "refund.failed";

interface WebhookPayload {
    id: string; // event id
    type: WebhookEvent;
    created_at: string;
    data: any; // The main payload (transaction or refund)
}

/**
 * Dispatches a webhook payload to all active endpoints configured for the specified store
 * that are subscribed to the matched event type.
 */
export async function dispatchWebhooks(eventId: string, eventType: WebhookEvent, payloadData: any) {
    // if (!process.env.WEBHOOKS_ENABLED && process.env.NODE_ENV !== "development") {
    //    console.log(`[Webhook] Dispatch skipped for ${eventType} (WEBHOOKS_ENABLED is false)`);
    //    return;
    // }

    try {
        // Find all enabled endpoints that subscribe to this exact event or "all"
        const endpoints = await prisma.webhookEndpoint.findMany({
            where: {
                enabled: true
            }
        });

        // Filter endpoints by event subscription locally (stored as comma-separated string)
        const targetEndpoints = endpoints.filter(ep => {
            if (!ep.events || ep.events.trim() === "" || ep.events.includes("all")) return true;
            return ep.events.split(",").map(e => e.trim()).includes(eventType);
        });

        if (targetEndpoints.length === 0) {
            console.log(`[Webhook] No active endpoints subscribed to ${eventType}`);
            return;
        }

        const payload: WebhookPayload = {
            id: eventId,
            type: eventType,
            created_at: new Date().toISOString(),
            data: payloadData
        };

        // Cryptographically sign the payload so client stores can verify it wasn't intercepted/spoofed
        const payloadString = JSON.stringify(payload);
        const secret = process.env.WEBHOOK_SECRET || 'urbansmart_default_secret_123';
        const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

        const dispatchPromises = targetEndpoints.map(async (endpoint) => {
            const start = Date.now();
            let status = "failed";
            let httpCode = 0;
            let responseBody = "";

            try {
                const res = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'UrbanSmart-Switch/1.0',
                        'X-UrbanSmart-Signature': signature
                    },
                    body: payloadString,
                    // Keep timeout relatively short to not block the system indefinitely
                    signal: AbortSignal.timeout(5000)
                });

                httpCode = res.status;
                if (res.ok) {
                    status = "success";
                }
                responseBody = await res.text();
            } catch (err: any) {
                console.error(`[Webhook] Failed to deliver to ${endpoint.url}:`, err.message);
                responseBody = err.message;
            }

            const latency = Date.now() - start;

            // Log delivery attempt asynchronously without blocking
            const logId = crypto.randomUUID();
            try {
                await prisma.$executeRaw`
                    INSERT INTO DeliveryLog (id, endpointId, status, httpCode, event, payloadId, createdAt)
                    VALUES (${logId}, ${endpoint.id}, ${status}, ${httpCode}, ${eventType}, ${eventId}, ${new Date().toISOString()})
                `;
            } catch (e) {
                console.error("[Webhook] Failed to write DeliveryLog to DB via raw SQL:", e);
            }


            console.log(`[Webhook] Dispatched ${eventType} to ${endpoint.url} - Status: ${status} (${httpCode}) in ${latency}ms`);
        });

        // Fire and forget - don't await the results to prevent slowing down the primary request
        Promise.allSettled(dispatchPromises);

    } catch (e) {
        console.error(`[Webhook] Error initiating dispatch for ${eventType}:`, e);
    }
}
