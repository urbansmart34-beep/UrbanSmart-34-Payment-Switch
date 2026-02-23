"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";

interface LedgerRow {
    id: string;
    timestamp: string;
    storeId: string;
    amount: number;
    status: string;
    yocoRef: string | null;
}

export default function TransactionsPage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [transactions, setTransactions] = useState<LedgerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalVolume: 0, totalRecords: 0 });
    const [searchQuery, setSearchQuery] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ledger").then(r => r.json());
            setTransactions(res.rows || []);
            setStats({ totalVolume: res.totalVolume || 0, totalRecords: res.totalRecords || 0 });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = useMemo(() => {
        return transactions.filter(t => {
            const searchLower = searchQuery.toLowerCase();
            const matchSearch = t.id.toLowerCase().includes(searchLower) ||
                (t.storeId && t.storeId.toLowerCase().includes(searchLower)) ||
                (t.yocoRef && t.yocoRef.toLowerCase().includes(searchLower));
            if (!matchSearch) return false;

            if (activeFilter === "All" || activeFilter === "Date") return true;
            if (activeFilter === "Success") return t.status === "SUCCESS";
            if (activeFilter === "Pending") return t.status === "PENDING";
            if (activeFilter === "Declined") return t.status === "FAILED";
            return true;
        });
    }, [transactions, activeFilter, searchQuery]);

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display pb-24 md:pb-0">
            {/* Header (Mobile) */}
            <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 md:hidden">
                <div className="flex items-center justify-between px-4 pt-8 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_tree</span>
                        <h1 className="text-lg font-bold tracking-tight">Master Ledger</h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <span className={clsx("material-symbols-outlined", loading && "animate-spin")}>sync</span>
                        </button>
                        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 pb-3">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="Search Order ID or Store ID..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Horizontal Filter Chips */}
                <div className="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
                    {["All", "Success", "Pending", "Declined", "Date"].map((filter) => {
                        const isActive = activeFilter === filter;
                        // Specific styling for status chips based on design
                        let indicatorColor = "";
                        if (filter === "Success") indicatorColor = "bg-emerald-500";
                        if (filter === "Pending") indicatorColor = "bg-amber-500";
                        if (filter === "Declined") indicatorColor = "bg-rose-500";

                        return (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={clsx(
                                    "flex items-center gap-1.5 shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
                                )}
                            >
                                {indicatorColor && <span className={`w-2 h-2 rounded-full ${indicatorColor}`}></span>}
                                {filter === "Date" && <span className="material-symbols-outlined text-[18px]">calendar_today</span>}
                                {filter}
                            </button>
                        )
                    })}
                </div>
            </header>

            {/* Header (Desktop) */}
            <header className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Master Ledger</h1>
                    <p className="text-slate-500 dark:text-slate-400">Real-time transaction monitoring and status tracking</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="Search transactions..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <span className={clsx("material-symbols-outlined", loading && "animate-spin")}>sync</span>
                        </button>
                        <button className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Desktop Filter Chips */}
            <div className="hidden md:flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
                {["All", "Success", "Pending", "Declined", "Date"].map((filter) => {
                    const isActive = activeFilter === filter;
                    // Specific styling for status chips based on design
                    let indicatorColor = "";
                    if (filter === "Success") indicatorColor = "bg-emerald-500";
                    if (filter === "Pending") indicatorColor = "bg-amber-500";
                    if (filter === "Declined") indicatorColor = "bg-rose-500";

                    return (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={clsx(
                                "flex items-center gap-1.5 shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
                                isActive
                                    ? "bg-primary text-white"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            {indicatorColor && <span className={`w-2 h-2 rounded-full ${indicatorColor}`}></span>}
                            {filter === "Date" && <span className="material-symbols-outlined text-[18px]">calendar_today</span>}
                            {filter}
                        </button>
                    )
                })}
            </div>

            <main className="flex-1 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Volume</p>
                        <p className="text-xl md:text-2xl font-bold mt-1">R {(stats.totalVolume / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Success Rate</p>
                        <div className="flex items-center gap-2 mt-1">
                            {stats.totalRecords > 0 ? (
                                <p className="text-xl md:text-2xl font-bold">
                                    {Math.round((transactions.filter(t => t.status === "SUCCESS").length / stats.totalRecords) * 100)}%
                                </p>
                            ) : (
                                <p className="text-xl md:text-2xl font-bold">0%</p>
                            )}
                            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Transactions</h2>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500 text-sm">Loading ledger history...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">No transactions found matching your criteria.</div>
                    ) : filtered.map((tx) => (
                        <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    tx.status === "SUCCESS" && "bg-emerald-500/10 text-emerald-500",
                                    tx.status === "PENDING" && "bg-amber-500/10 text-amber-500",
                                    tx.status === "FAILED" && "bg-rose-500/10 text-rose-500"
                                )}>
                                    <span className="material-symbols-outlined">
                                        {tx.status === "SUCCESS" && "check_circle"}
                                        {tx.status === "PENDING" && "schedule"}
                                        {tx.status === "FAILED" && "error"}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">{tx.storeId}</span>
                                    </div>
                                    <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate max-w-[150px] md:max-w-xs" title={tx.id}>Order #{tx.id.substring(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-slate-500">{tx.timestamp}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">R {tx.amount.toFixed(2)}</p>
                                <span className={clsx(
                                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mt-1",
                                    tx.status === "SUCCESS" && "bg-emerald-500/10 text-emerald-500",
                                    tx.status === "PENDING" && "bg-amber-500/10 text-amber-500",
                                    tx.status === "FAILED" && "bg-rose-500/10 text-rose-500"
                                )}>
                                    {tx.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            {/* Stationary Download Button */}
            <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
                <button className="flex items-center justify-center size-14 border border-slate-700/50 bg-slate-800 dark:bg-slate-900 shadow-xl shadow-slate-900/20 text-slate-100 rounded-full hover:bg-slate-700 dark:hover:bg-slate-800 transition-transform active:scale-95 group">
                    <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-0.5 transition-transform">download</span>
                </button>
            </div>
        </div>
    );
}
