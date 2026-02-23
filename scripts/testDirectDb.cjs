process.env.NODE_ENV = 'development';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function testDirect() {
    try {
        console.log("Checking endpoints...");
        const endpoints = await prisma.webhookEndpoint.findMany();
        console.log("Endpoints:", endpoints.length);
        if (endpoints.length === 0) return;

        console.log("Attempting direct DB write...");
        const log = await prisma.deliveryLog.create({
            data: {
                endpointId: endpoints[0].id,
                status: "success",
                httpCode: 200,
                response: "test",
                event: "test.event",
                payloadId: "123"
            }
        });
        console.log("Log created:", log.id);
    } catch (e) {
        console.error("Direct write failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}
testDirect();
