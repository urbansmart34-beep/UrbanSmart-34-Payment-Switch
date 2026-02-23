import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Create a Test Store
    const store = await prisma.store.upsert({
        where: { apiKey: 'sk_test_urbansmart_store_1' },
        update: {},
        create: {
            name: 'UrbanSmart Demo Store',
            apiKey: 'sk_test_urbansmart_store_1',
        },
    })

    console.log({ store })

    // 2. Create some transactions
    await prisma.transaction.createMany({
        data: [
            {
                amount: 42500, // R425.00
                currency: 'ZAR',
                status: 'SUCCESS',
                storeId: store.id,
                metadata: JSON.stringify({ item: "Premium Plan" }),
                createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
            },
            {
                amount: 1250, // R12.50
                currency: 'ZAR',
                status: 'SUCCESS',
                storeId: store.id,
                metadata: JSON.stringify({ item: "Coffee" }),
                createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
            },
            {
                amount: 490, // R4.90
                currency: 'ZAR',
                status: 'PENDING',
                storeId: store.id,
                metadata: JSON.stringify({ item: "Cookie" }),
                createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
            },
            {
                amount: 9900, // R99.00
                currency: 'ZAR',
                status: 'FAILED',
                storeId: store.id,
                metadata: JSON.stringify({ item: "Failed Order", failure_reason: "Insufficient Funds" }),
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            }
        ]
    })

    console.log('Seeded transactions.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
