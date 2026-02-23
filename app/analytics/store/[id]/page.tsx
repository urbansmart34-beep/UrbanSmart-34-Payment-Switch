"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function StoreAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [timeRange, setTimeRange] = useState("Last 30 Days");
    const [filter, setFilter] = useState("All");

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/analytics/store/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    setData(res);
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [id]);

    const filteredTransactions = data?.transactions?.filter((tx: any) => {
        if (filter === "All") return true;
        if (filter === "Success") return tx.status === "SUCCESS";
        if (filter === "Failed") return tx.status === "FAILED";
        if (filter === "Refunds") return tx.status === "REFUNDED";
        return true;
    }) || [];

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <Link href="/stores" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 hover:opacity-80 transition-opacity">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back_ios_new</span>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">{loading ? "Loading..." : data?.store?.name || "Store Details"}</h1>
                                {data?.store?.isActive && (
                                    <>
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {id.substring(0, 12).toUpperCase()}</p>
                        </div>
                    </div>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined">sync</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 space-y-8 max-w-2xl mx-auto w-full">
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="col-span-2 flex flex-col gap-1 rounded-xl p-5 bg-primary text-white shadow-lg shadow-primary/20">
                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Total Volume</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-3xl font-bold">R {loading ? "0.00" : ((data?.kpis?.totalVolume || 0) / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Avg. Transaction</p>
                        <p className="text-lg font-bold mt-1">R {loading ? "0.00" : ((data?.kpis?.avgTicket || 0) / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Success Rate</p>
                        <p className="text-lg font-bold mt-1">{loading ? "0" : (data?.kpis?.successRate || 0).toFixed(1)}%</p>
                    </div>
                </div>

                {/* Performance Chart Area */}
                <div className="rounded-xl bg-white dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Yoco Success Rate</h2>
                        <select
                            className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-0 cursor-pointer"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[160px] w-full relative group">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 150">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#135bec" stopOpacity="0.2"></stop>
                                    <stop offset="100%" stopColor="#135bec" stopOpacity="0"></stop>
                                </linearGradient>
                            </defs>
                            <path d="M0,120 Q50,110 80,130 T150,90 T220,110 T300,40 T400,60 L400,150 L0,150 Z" fill="url(#chartGradient)"></path>
                            <path d="M0,120 Q50,110 80,130 T150,90 T220,110 T300,40 T400,60" fill="none" stroke="#135bec" strokeLinecap="round" strokeWidth="3"></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg backdrop-blur-md">May 22: 96.4%</div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-4 px-1">
                        <span className="text-[10px] font-bold text-slate-400">1 MAY</span>
                        <span className="text-[10px] font-bold text-slate-400">15 MAY</span>
                        <span className="text-[10px] font-bold text-slate-400">29 MAY</span>
                    </div>
                </div>

                <div className="md:grid md:grid-cols-2 md:gap-8">
                    {/* API Credentials Module */}
                    <div className="space-y-3 mb-8 md:mb-0">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Active Credentials</h3>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm">
                            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-lg">key</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Store API Key</p>
                                        <p className="text-xs text-slate-500 font-mono">
                                            {loading ? "Loading..." : data?.store?.apiKey ? `••••••••••••${data.store.apiKey.slice(-4)}` : "No Key"}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Feed */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Recent Transactions</h3>
                            <Link href="/transactions" className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                            {["All", "Success", "Failed", "Refunds"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                                        filter === f
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-2">
                            {filteredTransactions.map((tx: any) => (
                                <Link href={`/transactions/88${tx.id}`} key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/40 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                                            tx.status === "SUCCESS" && "bg-emerald-500/10 text-emerald-500",
                                            tx.status === "FAILED" && "bg-rose-500/10 text-rose-500",
                                            tx.status === "PENDING" && "bg-amber-500/10 text-amber-500",
                                        )}>
                                            <span className="material-symbols-outlined text-lg">
                                                {tx.status === "SUCCESS" && "check_circle"}
                                                {tx.status === "FAILED" && "cancel"}
                                                {tx.status === "PENDING" && "history"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{tx.name}</p>
                                            <p className="text-[10px] text-slate-500">{tx.time} • {tx.card}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        R {tx.amount.toFixed(2)}
                                    </p>
                                </Link>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <div className="text-center py-6 text-slate-500 text-sm">
                                    No transactions found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
