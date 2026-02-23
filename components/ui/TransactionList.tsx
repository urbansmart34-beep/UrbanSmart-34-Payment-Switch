"use client";

import clsx from "clsx";
import { useState } from "react";
import { refundTransaction } from "@/app/actions/refund";

export interface Transaction {
    id: string;
    store: string;
    time: string;
    amount: number;
    status: string;
    icon: string;
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleRefund = async (id: string) => {
        if (!confirm("Are you sure you want to refund this transaction?")) return;

        setProcessingId(id);
        const result = await refundTransaction(id);
        setProcessingId(null);

        if (result.success) {
            alert("Refund processed successfully");
        } else {
            alert("Refund failed: " + result.error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-[#0bda5e]/10 text-[#0bda5e]";
            case "PENDING": return "bg-amber-500/10 text-amber-500";
            case "FAILED": return "bg-red-500/10 text-red-500";
            case "REFUNDED": return "bg-slate-200 text-slate-500 line-through";
            default: return "bg-slate-100 text-slate-500";
        }
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto pr-1">
            {transactions.length === 0 ? (
                <div className="text-center text-slate-400 py-4 text-sm">No recent transactions</div>
            ) : transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="group flex items-center gap-4 bg-white dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                    <div className="size-11 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                            {tx.icon}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {tx.store}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">{new Date(tx.time).toLocaleTimeString()} • {tx.status}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {(tx.amount / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" })}
                        </p>
                        <div className="flex items-center gap-2">
                            <span
                                className={clsx(
                                    "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                                    getStatusStyle(tx.status)
                                )}
                            >
                                {tx.status}
                            </span>
                            {tx.status === "SUCCESS" && (
                                <button
                                    onClick={() => handleRefund(tx.id)}
                                    disabled={processingId === tx.id}
                                    className="hidden group-hover:inline-flex text-[10px] text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                                >
                                    {processingId === tx.id ? "Refunding..." : "Refund"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
