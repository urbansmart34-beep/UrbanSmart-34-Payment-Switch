"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface YocoPaymentProps {
    amountInCents: number;
    currency?: "ZAR";
    storeId?: string;
    name?: string;
    description?: string;
}

export function YocoPayment({ amountInCents, currency = "ZAR", storeId = "811298f2-31aa-4e90-9071-41999bfe47a0", name = "URBANSMART-34 Store", description = "Payment for order" }: YocoPaymentProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handlePay = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/process-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amountInCents,
                    currency,
                    storeId,
                    metadata: { name, description }
                }),
            });
            const data = await response.json();
            if (data.success && data.checkoutUrl) {
                // Redirect user to Yoco Gateway
                window.location.href = data.checkoutUrl;
            } else {
                setError("Payment initiation failed: " + (data.error || "Unknown Error"));
                setLoading(false);
            }
        } catch {
            setError("Network error starting payment");
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total to Pay</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {(amountInCents / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" })}
                    </span>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">credit_card</span>
                            Go to Secure Checkout
                        </>
                    )}
                </button>

                <div className="flex justify-center gap-2 opacity-50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Secured by Yoco</span>
                </div>
            </div>
        </div>
    );
}
