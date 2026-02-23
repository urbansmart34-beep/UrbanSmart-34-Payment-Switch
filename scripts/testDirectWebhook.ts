import { dispatchWebhooks } from "../lib/webhook";
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Direct webhook dispatch test...");

    // Ensure we have an endpoint
    let ep = await prisma.webhookEndpoint.findFirst();
    if (!ep) {
        ep = await prisma.webhookEndpoint.create({
            data: { url: "https://httpstat.us/200", events: "all", enabled: true }
        });
    }

    // Force existing endpoints to accept all to avoid skipped dispatch
    await prisma.$executeRaw`UPDATE WebhookEndpoint SET events = 'all'`;

    console.log("Calling dispatchWebhooks...");
    await dispatchWebhooks("test-event-id", "payment.succeeded", { test: true });

    await new Promise(r => setTimeout(r, 2000));

    // Check Delivery Logs
    const logs = await prisma.deliveryLog.findMany();
    console.log("Total DeliveryLogs in DB:", logs.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
