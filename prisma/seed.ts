import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding database...")

    // Seed Stores
    const store1 = await prisma.store.upsert({
        where: { apiKey: 'sk_test_store1' },
        update: {},
        create: {
            name: 'STORE_CAP_01',
            apiKey: 'sk_test_store1',
        },
    })

    const store2 = await prisma.store.upsert({
        where: { apiKey: 'sk_test_store2' },
        update: {},
        create: {
            name: 'STORE_JHB_04',
            apiKey: 'sk_test_store2',
        },
    })

    // Seed Transactions
    await prisma.transaction.createMany({
        data: [
            {
                amount: 125000,
                currency: 'ZAR',
                status: 'SUCCESS',
                storeId: store1.id,
                yocoChargeId: 'ch_test_1',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            {
                amount: 489999,
                currency: 'ZAR',
                status: 'PENDING',
                storeId: store2.id,
                yocoChargeId: 'ch_test_2',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
            },
            {
                amount: 85000,
                currency: 'ZAR',
                status: 'FAILED',
                storeId: store1.id,
                yocoChargeId: 'ch_test_3',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
            {
                amount: 210000,
                currency: 'ZAR',
                status: 'SUCCESS',
                storeId: store1.id,
                yocoChargeId: 'ch_test_4',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
            },
            {
                amount: 1245000,
                currency: 'ZAR',
                status: 'SUCCESS',
                storeId: store2.id,
                yocoChargeId: 'ch_test_5',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            }
        ]
    })
    console.log("Seeding finished.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
