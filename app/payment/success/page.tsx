"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const txId = searchParams.get('tx');
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'pending'>('verifying');

    useEffect(() => {
        if (!txId) {
            setStatus('failed');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/verify-payment?tx=${txId}`);
                const data = await res.json();

                if (data.status === 'SUCCESS') {
                    setStatus('success');
                } else if (data.status === 'FAILED') {
                    setStatus('failed');
                } else {
                    setStatus('pending');
                }
            } catch (error) {
                console.error("Verification error", error);
                setStatus('failed');
            }
        };

        verify();
    }, [txId]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            {status === 'verifying' && (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="size-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Verifying your payment...</h2>
                    <p className="text-slate-500">Please do not close this page.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="size-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Thank you for your payment. Your transaction <strong className="text-slate-700 dark:text-slate-300">{txId?.split('-')[0]}</strong> has been safely recorded in the ledger.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Link href="/transactions" className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                            View Ledger
                        </Link>
                        <Link href="/payment" className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-xl transition-colors">
                            New Payment
                        </Link>
                    </div>
                </div>
            )}

            {status === 'failed' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="size-20 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">error</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Failed Workspace</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        We could not verify your payment. It may have been declined or cancelled.
                    </p>
                    <button onClick={() => router.push('/payment')} className="mt-8 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-medium rounded-xl transition-colors">
                        Try Again
                    </button>
                </div>
            )}

            {status === 'pending' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="size-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">schedule</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Pending</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Your payment is still being processed by the bank. Please check your ledger later.
                    </p>
                    <Link href="/transactions" className="mt-8 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-medium rounded-xl transition-colors">
                        Go to Dashboard
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
            <SuccessPageContent />
        </Suspense>
    );
}
