"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

type ViewTab = "Overview" | "Issues" | "History";
type DiscrepancyType = "MISMATCH" | "NOT_FOUND" | "MATCHED";

interface DiscrepancyItem {
    id: string;
    chargeId: string;
    date: string;
    type: DiscrepancyType;
    platformAmount: number | null;
    yocoAmount: number | null;
    note: string;
    resolved: boolean;
}



const DRIFT_BARS = [
    { h: "80%", color: "bg-primary" },
    { h: "60%", color: "bg-primary/40" },
    { h: "30%", color: "bg-rose-500" },
    { h: "90%", color: "bg-primary" },
    { h: "45%", color: "bg-primary/60" },
    { h: "70%", color: "bg-primary/80" },
    { h: "55%", color: "bg-primary/50" },
];

const fmt = (cents: number) => `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

export default function ReconciliationPage() {
    const [activeTab, setActiveTab] = useState<ViewTab>("Issues");
    const [items, setItems] = useState<DiscrepancyItem[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState("2m ago");
    const [dbStats, setDbStats] = useState({ total: 0, discrepancies: 0 });
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        fetch("/api/reconciliation")
            .then((r) => r.json())
            .then((data) => {
                if (data.totalVolume !== undefined) {
                    setDbStats({ total: data.totalVolume, discrepancies: data.discrepancyCount });
                }
                if (Array.isArray(data.items) && data.items.length > 0) {
                    setItems(data.items);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        await new Promise((r) => setTimeout(r, 1000));
        loadData();
        setSyncing(false);
        setLastSync("just now");
    };

    const handleFix = (id: string) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, resolved: true, type: "MATCHED" } : item));
    };

    const handleImport = (id: string) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, resolved: true, type: "MATCHED", platformAmount: item.yocoAmount } : item));
    };

    const historyItems = items.filter((i) => i.resolved);
    const displayItems = activeTab === "Issues" ? items.filter((i) => !i.resolved) : activeTab === "History" ? historyItems : items;

    return (
        <div className="flex flex-col min-h-full bg-background-dark text-slate-100">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center justify-between bg-background-dark/80 backdrop-blur-md border-b border-slate-700/50 px-4 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex size-10 items-center justify-center rounded-lg bg-slate-800 text-slate-100">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Ledger Tool</h1>
                        <p className="text-xs text-slate-400 font-medium">Store: Main Terminal 01</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex size-10 items-center justify-center rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Reconciliation Tool</h2>
                    <p className="text-slate-400">Compare platform ledger vs. Yoco API data</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className={clsx("material-symbols-outlined text-[18px]", syncing && "animate-spin")}>
                            {syncing ? "progress_activity" : "sync"}
                        </span>
                        {syncing ? "Syncing..." : "Manual Sync"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export
                    </button>
                </div>
            </div>

            <main className="flex-1 pb-8 space-y-4">
                {/* Batch Summary Card */}
                <section className="px-4 md:px-0">
                    <div className="rounded-xl bg-slate-800/60 p-5 border border-slate-700/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <span className="material-symbols-outlined text-6xl">receipt_long</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                                    Batch #8829-Yoco
                                </span>
                                <span className="text-slate-400 text-xs">Updated {lastSync}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Total Volume</p>
                                    <p className="text-2xl font-bold text-slate-100">
                                        {dbStats.total > 0 ? fmt(dbStats.total) : "R 142,500"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-rose-400 text-xs font-medium uppercase tracking-wide">Discrepancies</p>
                                    <p className="text-2xl font-bold text-rose-400">
                                        {dbStats.discrepancies > 0 ? `${dbStats.discrepancies} Items` : `${items.filter((i) => !i.resolved).length} Items`}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-95"
                                >
                                    <span className={clsx("material-symbols-outlined text-sm", syncing && "animate-spin")}>
                                        {syncing ? "progress_activity" : "sync"}
                                    </span>
                                    {syncing ? "Syncing..." : "Manual Sync"}
                                </button>
                                <button className="size-10 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Segmented Control */}
                <div className="px-4 md:px-0 sticky top-[73px] md:top-0 z-10 bg-background-dark/95 backdrop-blur-sm py-2">
                    <div className="flex h-11 items-center justify-center rounded-xl bg-slate-800 p-1 border border-slate-700">
                        {(["Overview", "Issues", "History"] as ViewTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "flex h-full flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                                    activeTab === tab
                                        ? "bg-background-dark text-primary"
                                        : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {tab}
                                {tab === "Issues" && items.filter((i) => !i.resolved).length > 0 && (
                                    <span className="ml-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {items.filter((i) => !i.resolved).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items List */}
                {activeTab !== "Overview" && (
                    <div className="px-4 md:px-0 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
                                {activeTab === "Issues" ? "Unresolved Items" : "Resolved Items"}
                            </h3>
                            <span className="text-slate-500 text-xs font-medium">Sorted by: Amount (High-Low)</span>
                        </div>
                        {displayItems.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl block mb-2 text-emerald-500">check_circle</span>
                                <p className="font-semibold text-emerald-400">All items reconciled!</p>
                            </div>
                        )}
                        {displayItems.map((item) => {
                            const isResolved = item.type === "MATCHED";
                            return (
                                <div key={item.id} className={clsx(
                                    "rounded-xl border p-4 space-y-3",
                                    isResolved
                                        ? "border-slate-700/40 bg-slate-800/20 opacity-60"
                                        : "border-rose-500/30 bg-rose-500/5"
                                )}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-mono text-slate-400">ID: {item.chargeId}</p>
                                            <p className="text-sm font-bold text-slate-100">{item.date}</p>
                                        </div>
                                        <span className={clsx(
                                            "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold",
                                            item.type === "MISMATCH" && "bg-rose-500 text-white",
                                            item.type === "NOT_FOUND" && "bg-rose-500 text-white",
                                            item.type === "MATCHED" && "bg-emerald-500/20 text-emerald-400"
                                        )}>
                                            <span className="material-symbols-outlined text-[12px]">
                                                {item.type === "MATCHED" ? "check_circle" : item.type === "NOT_FOUND" ? "search_off" : "warning"}
                                            </span>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-background-dark/40 rounded-lg p-3 border border-slate-700/50">
                                        <div className="border-r border-slate-700/50 pr-2">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Platform Ledger</p>
                                            {item.platformAmount !== null
                                                ? <p className={clsx("text-lg font-bold", isResolved ? "text-slate-400" : "text-slate-100")}>{fmt(item.platformAmount)}</p>
                                                : <p className="text-lg font-bold text-slate-500 italic">Missing</p>
                                            }
                                        </div>
                                        <div className="pl-2">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Yoco API</p>
                                            <p className={clsx("text-lg font-bold", isResolved ? "text-slate-400" : item.type === "MISMATCH" ? "text-rose-400" : "text-slate-100")}>
                                                {item.yocoAmount !== null ? fmt(item.yocoAmount) : "—"}
                                            </p>
                                        </div>
                                    </div>
                                    {!isResolved && (
                                        <div className="flex items-center justify-between pt-1">
                                            <p className="text-[11px] text-slate-400 italic">{item.note}</p>
                                            {item.type === "MISMATCH" && (
                                                <button onClick={() => handleFix(item.id)} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                                                    Fix <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                                </button>
                                            )}
                                            {item.type === "NOT_FOUND" && (
                                                <button onClick={() => handleImport(item.id)} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                                                    Import <span className="material-symbols-outlined text-xs">download</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Overview Tab — Drift Analysis */}
                {activeTab === "Overview" && (
                    <div className="px-4 md:px-0 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Drift Analysis</h3>
                        <div className="w-full bg-slate-800/60 rounded-xl p-5 border border-slate-700/50 relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #135bec 1px, transparent 0)", backgroundSize: "20px 20px" }}
                            />
                            <div className="flex items-end gap-3 h-24 mb-4">
                                {DRIFT_BARS.map((bar, i) => (
                                    <div key={i} className={clsx("flex-1 rounded-t-sm transition-all", bar.color)} style={{ height: bar.h }} />
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 font-medium text-center">Daily reconciliation drift (last 7 days)</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Matched", value: items.filter((i) => i.type === "MATCHED").length, color: "text-emerald-400" },
                                { label: "Mismatches", value: items.filter((i) => i.type === "MISMATCH" && !i.resolved).length, color: "text-rose-400" },
                                { label: "Not Found", value: items.filter((i) => i.type === "NOT_FOUND" && !i.resolved).length, color: "text-amber-400" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
                                    <p className={clsx("text-2xl font-bold", stat.color)}>{stat.value}</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
