"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

// Mock Data matching the Stitch Design
const transactions = [
    { id: "88294", store: "STORE_CAP_01", time: "Oct 24, 14:25", amount: 1250.00, status: "Settled", type: "success" },
    { id: "88293", store: "STORE_JHB_04", time: "Oct 24, 14:22", amount: 4899.99, status: "Processing", type: "pending" },
    { id: "88292", store: "STORE_DBN_12", time: "Oct 24, 14:18", amount: 850.00, status: "Declined", type: "declined" },
    { id: "88291", store: "STORE_CAP_01", time: "Oct 24, 14:05", amount: 2100.00, status: "Settled", type: "success" },
    { id: "88290", store: "STORE_PTA_03", time: "Oct 24, 13:58", amount: 12450.00, status: "Settled", type: "success" },
];

export default function TransactionsPage() {
    const [activeFilter, setActiveFilter] = useState("All");

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
                        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">sync</span>
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
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <span className="material-symbols-outlined">sync</span>
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
                {/* Quick Summary Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Volume</p>
                        <p className="text-xl md:text-2xl font-bold mt-1">R 128,450</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Success Rate</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xl md:text-2xl font-bold">94.2%</p>
                            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Transactions</h2>
                    <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                </div>

                {/* Transaction List */}
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    tx.type === "success" && "bg-emerald-500/10 text-emerald-500",
                                    tx.type === "pending" && "bg-amber-500/10 text-amber-500",
                                    tx.type === "declined" && "bg-rose-500/10 text-rose-500"
                                )}>
                                    <span className="material-symbols-outlined">
                                        {tx.type === "success" && "check_circle"}
                                        {tx.type === "pending" && "schedule"}
                                        {tx.type === "declined" && "error"}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">{tx.store}</span>
                                    </div>
                                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">Order #{tx.id}</p>
                                    <p className="text-xs text-slate-500">{tx.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">R {tx.amount.toFixed(2)}</p>
                                <span className={clsx(
                                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mt-1",
                                    tx.type === "success" && "bg-emerald-500/10 text-emerald-500",
                                    tx.type === "pending" && "bg-amber-500/10 text-amber-500",
                                    tx.type === "declined" && "bg-rose-500/10 text-rose-500"
                                )}>
                                    {tx.status}
                                </span>
                            </div>
                        </Link>
                    ))}

                    {/* Ghost/Opacity Example from Design */}
                    <Link href="/transactions/88290" className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">STORE_PTA_03</span>
                                </div>
                                <p className="font-semibold text-sm">Order #88290</p>
                                <p className="text-xs text-slate-500">Oct 24, 13:58</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">R 12,450.00</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase">Settled</span>
                        </div>
                    </Link>
                </div>
            </main>

            {/* Floating Action Button (Optional Export) */}
            <div className="fixed right-4 bottom-20 md:bottom-8 md:right-8 z-30">
                <button className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 active:scale-95 transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-2xl">download</span>
                </button>
            </div>
        </div>
    );
}
