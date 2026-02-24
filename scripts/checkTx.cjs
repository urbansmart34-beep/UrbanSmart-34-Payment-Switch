const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTx() {
    try {
        const tx = await prisma.transaction.findUnique({
            where: { id: '9f211c60-69c0-4981-99a5-4c9b90bdccc3' }
        });
        if (tx) {
            console.log("Status:", tx.status);
            console.log("Metadata:", tx.metadata);
        } else {
            console.log("Transaction not found in ledger");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkTx();
