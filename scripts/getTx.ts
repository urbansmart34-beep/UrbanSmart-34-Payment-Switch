import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const tx = await prisma.transaction.findFirst();
    if (tx) {
        console.log("TX_ID_FOUND:" + tx.id);
    } else {
        console.log("No transactions found. We should create one.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
