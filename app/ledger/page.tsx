"use client";

import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";

interface LedgerRow {
    id: string;
    timestamp: string;
    storeId: string;
    amount: number;
    status: string;
    yocoRef: string | null;
}

export default function LedgerPage() {
    const [activeStore, setActiveStore] = useState("All Stores");
    const [activeStatus, setActiveStatus] = useState("All");
    const [rows, setRows] = useState<LedgerRow[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (activeStore !== "All Stores") params.set("store", activeStore);
        if (activeStatus !== "All") params.set("status", activeStatus);
        try {
            const res = await fetch(`/api/ledger?${params}`);
            const data = await res.json();
            setRows(data.rows ?? []);
            setTotalRecords(data.totalRecords ?? 0);
            setTotalVolume(data.totalVolume ?? 0);
        } catch {
            // keep previous data on error
        } finally {
            setLoading(false);
        }
    }, [activeStore, activeStatus]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display pb-32 md:pb-0">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-4 md:py-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 md:hidden">
                <button className="p-2 -ml-2 text-primary">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight">Ledger & Export</h1>
                <button className="p-2 -mr-2 text-primary">
                    <span className="material-symbols-outlined text-2xl">help</span>
                </button>
            </header>

            <header className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Master Ledger</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and export transaction history across all stores</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <span className="material-symbols-outlined">filter_list</span>
                        Filter
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">download</span>
                        Export
                    </button>
                </div>
            </header>

            <main className="flex-1 space-y-6">
                {/* Date Picker Section */}
                <section>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block px-4 md:px-0">Report Period</label>
                    <div className="mx-4 md:mx-0 flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            <div>
                                <p className="text-sm font-medium">Oct 1, 2023 - Oct 31, 2023</p>
                                <p className="text-xs text-slate-500">31 Days selected</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </div>
                </section>

                {/* Filters Section */}
                <section className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-4 md:px-0">Filters</label>

                    {/* Store Filter */}
                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 px-4 md:px-0">Store Selection</p>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 md:px-0 pb-1">
                            {["All Stores", "Store-A (CPT)", "Store-B (JHB)", "Online Portal"].map((store) => (
                                <button
                                    key={store}
                                    onClick={() => setActiveStore(store)}
                                    className={clsx(
                                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                        activeStore === store
                                            ? "bg-primary text-white"
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                                    )}
                                >
                                    {store}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 px-4 md:px-0">Transaction Status</p>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 md:px-0 pb-1">
                            <button
                                onClick={() => setActiveStatus("Success")}
                                className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">check_circle</span> Success
                            </button>
                            <button
                                onClick={() => setActiveStatus("Refunded")}
                                className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">replay</span> Refunded
                            </button>
                            <button
                                onClick={() => setActiveStatus("Failed")}
                                className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">error</span> Failed
                            </button>
                        </div>
                    </div>
                </section>

                {/* Summary Bar */}
                <section className="bg-primary/5 border-y border-primary/10 px-4 py-4 flex justify-between items-center -mx-4 md:mx-0 md:rounded-xl md:border">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Total Records</p>
                        <p className="text-lg md:text-2xl font-bold">{loading ? "—" : totalRecords.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Total Value</p>
                        <p className="text-lg md:text-2xl font-bold">
                            {loading ? "—" : `R ${(totalVolume / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </section>

                {/* Preview Table */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-4 md:px-0">
                        <h3 className="text-sm font-bold">Preview (Last 50 rows)</h3>
                        <button className="text-xs text-primary font-semibold hover:underline">View Full Table</button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mx-4 md:mx-0">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Store</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">Loading...</td></tr>
                                )}
                                {!loading && rows.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No records found</td></tr>
                                )}
                                {rows.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                        <td className="px-4 py-3 text-sm">{tx.timestamp}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{tx.storeId}</td>
                                        <td className={clsx("px-4 py-3 text-sm text-right font-bold", tx.status === "REFUNDED" ? "text-primary" : "")}>
                                            R {tx.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={clsx(
                                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                tx.status === "SUCCESS" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                                tx.status === "REFUNDED" && "bg-primary/10 text-primary",
                                                tx.status === "FAILED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                tx.status === "PENDING" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                            )}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-4 italic">Pull up to load more preview data</p>
                </section >
            </main >

            {/* Export Action Sheet (Mobile Fixed, Desktop Hidden) */}
            < div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 pt-4 pb-24 z-10 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]" >
                <div className="max-w-md mx-auto space-y-3">
                    <button className="w-full h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform">
                        <span className="material-symbols-outlined">csv</span>
                        Export as CSV (.csv)
                    </button>
                    <div className="flex gap-3">
                        <button className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                            <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                            PDF
                        </button>
                        <button className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                            <span className="material-symbols-outlined text-xl">share</span>
                            Share
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}
