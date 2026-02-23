const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = 'bbf94a0d-2fbf-49ed-9b93-634feb1d9a4d';
    const tx = await prisma.transaction.findUnique({ where: { id } });
    console.log("Transaction:", tx);

    const logs = await prisma.$queryRaw`SELECT * FROM DeliveryLog WHERE payloadId = ${id}`;
    console.log("Delivery Logs:", logs);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
