const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
    console.log("Starting Webhook Integration Test...");

    // 1. Get or create a store
    let store = await prisma.store.findFirst();
    if (!store) {
        store = await prisma.store.create({
            data: { name: "Test Store", apiKey: "pk_test_12345" }
        });
    }
    console.log("Using Store:", store.id);

    // 2. Ensure we have a webhook endpoint configured
    let endpoint = await prisma.webhookEndpoint.findFirst();
    if (!endpoint) {
        endpoint = await prisma.webhookEndpoint.create({
            data: { url: "https://httpstat.us/200", events: "all", enabled: true }
        });
    }
    console.log("Using Webhook Endpoint:", endpoint.url);

    // 3. Trigger a payment (this will hit the Yoco circuit breaker and dispatch a webhook)
    console.log("Simulating POST /api/process-payment...");
    const res = await fetch("http://localhost:3000/api/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: 5000,
            currency: "ZAR",
            token: "tok_test_123",
            storeId: store.id
        })
    });

    const data = await res.json();
    console.log("Payment API Response:", res.status, data);

    // 4. Wait a moment for async webhook dispatcher to complete
    await new Promise(r => setTimeout(r, 2000));

    // 5. Check Delivery Logs
    const logs = await prisma.deliveryLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2
    });

    console.log("\n--- Recent Webhook Delivery Logs ---");
    logs.forEach(log => {
        console.log(`Event: ${log.event} | Status: ${log.status} | HttpCode: ${log.httpCode}`);
    });

    if (logs.length > 0) {
        console.log("SUCCESS: Webhook dispatcher is working!");
    } else {
        console.log("FAILURE: No delivery logs found.");
    }
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
