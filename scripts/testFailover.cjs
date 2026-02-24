const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFailover() {
    try {
        console.log("Fetching an active store...");
        const store = await prisma.store.findFirst();
        if (!store) {
            console.error("No store found to test with.");
            return;
        }

        console.log(`Simulating transaction for store: ${store.name} (${store.id})`);

        // Simulating the exact payload from the frontend checkout
        const payload = {
            amount: 5000, // 50.00 ZAR
            currency: 'ZAR',
            storeId: store.id,
            metadata: {
                paymentType: 'Auto Failover Test',
                customerEmail: 'test@example.com' // Should trigger PII masking too!
            }
        };

        console.log(`\nSending POST request to http://localhost:3000/api/process-payment...`);
        const startTime = Date.now();
        const response = await fetch('http://localhost:3000/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const duration = Date.now() - startTime;

        console.log(`\nResponse received in ${duration}ms:`);
        console.log(`Status: ${response.status}`);
        console.dir(data, { depth: null });

        if (data.gateway === 'NORTH') {
            console.log('\n✅ FAILOVER SUCCESS: The primary Yoco gateway failed and the transaction was automatically routed to NORTH!');
        } else {
            console.log(`\n❌ FAILOVER DID NOT TRIGGER. Transaction was handled by: ${data.gateway || 'Unknown'}`);
        }

    } catch (e) {
        console.error("Test script failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testFailover();
