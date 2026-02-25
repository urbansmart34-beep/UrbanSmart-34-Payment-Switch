"use client";

import { YocoPayment } from "@/components/payment/YocoPayment";

export default function PaymentPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                        Checkout Demo
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                        URBANSMART-34 Payment SWITCH
                    </p>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-center py-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Premium Plan</span>
                        <span className="text-slate-900 dark:text-white font-bold">R 150.00</span>
                    </div>

                    <YocoPayment
                        amountInCents={15000}
                        currency="ZAR"
                        name="Premium Plan"
                        description="Monthly subscription"
                        storeId="811298f2-31aa-4e90-9071-41999bfe47a0"
                    />

                    <p className="text-xs text-center text-slate-400">
                        Test Mode Active: No real money will be charged.
                    </p>
                </div>
            </div>
        </div>
    );
}
