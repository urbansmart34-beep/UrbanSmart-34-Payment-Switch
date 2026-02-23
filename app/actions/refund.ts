"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function refundTransaction(transactionId: string) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) throw new Error("Transaction not found");

        if (transaction.status !== "SUCCESS") {
            throw new Error("Only successful transactions can be refunded");
        }

        // TODO: Call Yoco Refund API
        // For now, simulate refund

        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "REFUNDED" },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
    }
}
