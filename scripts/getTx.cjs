const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tx = await prisma.transaction.findFirst();
    if (tx) {
        console.log("FOUND_TX_ID: " + tx.id);
    } else {
        console.log("No transactions found.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
