import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dispatchWebhooks } from '@/lib/webhook';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const txId = searchParams.get('tx');

    if (!txId) {
        return NextResponse.json({ success: false, error: 'Missing transaction ID' }, { status: 400 });
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: txId },
        });

        if (!transaction) {
            return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.status === 'SUCCESS') {
            return NextResponse.json({ success: true, status: 'SUCCESS' });
        }

        if (!transaction.yocoChargeId) {
            return NextResponse.json({ success: false, error: 'Payment not initiated properly' }, { status: 400 });
        }

        // Verify with Yoco Checkouts API
        const yocoRes = await fetch(`https://payments.yoco.com/api/checkouts/${transaction.yocoChargeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY || ''}`,
            }
        });

        if (!yocoRes.ok) {
            return NextResponse.json({ success: false, error: 'Failed to verify with Yoco' }, { status: 502 });
        }

        const yocoData = await yocoRes.json();

        if (yocoData.status === 'succeeded' || yocoData.status === 'paid' || yocoData.paymentStatus === 'paid') {
            const successTx = await prisma.transaction.update({
                where: { id: txId },
                data: { status: 'SUCCESS' },
            });
            await dispatchWebhooks(successTx.id, "payment.succeeded", successTx);
            return NextResponse.json({ success: true, status: 'SUCCESS' });
        } else if (yocoData.status === 'failed') {
            const failedTx = await prisma.transaction.update({
                where: { id: txId },
                data: { status: 'FAILED' },
            });
            await dispatchWebhooks(failedTx.id, "payment.failed", failedTx);
            return NextResponse.json({ success: false, status: 'FAILED' });
        }

        // Still pending
        return NextResponse.json({ success: true, status: yocoData.status || 'PENDING' });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
