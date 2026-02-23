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





const fmt = (cents: number) => `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

export default function ReconciliationPage() {
    const [activeTab, setActiveTab] = useState<ViewTab>("Issues");
    const [items, setItems] = useState<DiscrepancyItem[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }));
    const [dbStats, setDbStats] = useState({ total: 0, discrepancies: 0 });
    const [driftBars, setDriftBars] = useState<{ h: string, color: string }[]>([]);
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
                if (Array.isArray(data.driftBars)) {
                    setDriftBars(data.driftBars);
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
        await new Promise((r) => setTimeout(r, 800)); // UX delay
        loadData();
        setSyncing(false);
        setLastSync(new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }));
    };

    const handleFix = (id: string) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, resolved: true, type: "MATCHED" } : item));
    };

    const handleImport = (id: string) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, resolved: true, type: "MATCHED", platformAmount: item.yocoAmount } : item));
    };

    const handleExport = () => {
        if (items.length === 0) return alert("No items to export");
        const headers = ["ID", "Charge ID", "Date", "Type", "Platform Amount", "Yoco Amount", "Note", "Status"];
        const rows = items.map(i => [
            i.id,
            i.chargeId,
            i.date,
            i.type,
            i.platformAmount ? (i.platformAmount / 100).toFixed(2) : "0.00",
            i.yocoAmount ? (i.yocoAmount / 100).toFixed(2) : "0.00",
            `"${i.note}"`,
            i.resolved ? "Resolved" : "Unresolved"
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reconciliation_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const historyItems = items.filter((i) => i.resolved);
    const displayItems = activeTab === "Issues" ? items.filter((i) => !i.resolved) : activeTab === "History" ? historyItems : items;

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 px-4 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Ledger Tool</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Platform-wide</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reconciliation Tool</h2>
                    <p className="text-slate-500 dark:text-slate-400">Compare platform ledger vs. Yoco API data</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export CSV
                    </button>
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
                </div>
            </div>

            <main className="flex-1 pb-8 space-y-4">
                {/* Batch Summary Card */}
                <section className="px-4 md:px-0">
                    <div className="rounded-xl bg-white dark:bg-slate-800/60 p-5 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity pointer-events-none">
                            <span className="material-symbols-outlined text-6xl text-slate-900 dark:text-white">receipt_long</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                                    Batch #{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-Yoco
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-xs">Updated {lastSync}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Volume</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {fmt(dbStats.total)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-rose-500 dark:text-rose-400 text-xs font-medium uppercase tracking-wide">Discrepancies</p>
                                    <p className="text-2xl font-bold text-rose-500 dark:text-rose-400">
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
                                    {syncing ? "Syncing..." : "Run Reconcillation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Segmented Control */}
                <div className="px-4 md:px-0 sticky top-[73px] md:top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-2">
                    <div className="flex h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                        {(["Overview", "Issues", "History"] as ViewTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "flex h-full flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                                    activeTab === tab
                                        ? "bg-white dark:bg-background-dark text-primary shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                {tab}
                                {tab === "Issues" && items.filter((i) => !i.resolved).length > 0 && (
                                    <span className="ml-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
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
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                                {activeTab === "Issues" ? "Unresolved Items" : "Resolved Items"}
                            </h3>
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">Sorted by: Amount (High-Low)</span>
                        </div>
                        {displayItems.length === 0 && (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-4xl block mb-2 text-emerald-500">check_circle</span>
                                <p className="font-semibold text-emerald-500 dark:text-emerald-400">All items reconciled!</p>
                            </div>
                        )}
                        {displayItems.map((item) => {
                            const isResolved = item.type === "MATCHED";
                            return (
                                <div key={item.id} className={clsx(
                                    "rounded-xl border p-4 space-y-3 bg-white dark:bg-slate-900 overflow-hidden relative shadow-sm",
                                    isResolved
                                        ? "border-slate-200 dark:border-slate-700/40 opacity-70"
                                        : "border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5"
                                )}>
                                    {!isResolved && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}
                                    <div className="flex justify-between items-start pl-2">
                                        <div>
                                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {item.chargeId}</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.date}</p>
                                        </div>
                                        <span className={clsx(
                                            "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold",
                                            item.type === "MISMATCH" && "bg-rose-500 text-white",
                                            item.type === "NOT_FOUND" && "bg-rose-500 text-white",
                                            item.type === "MATCHED" && "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        )}>
                                            <span className="material-symbols-outlined text-[12px]">
                                                {item.type === "MATCHED" ? "check_circle" : item.type === "NOT_FOUND" ? "search_off" : "warning"}
                                            </span>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50 ml-2">
                                        <div className="border-r border-slate-200 dark:border-slate-700/50 pr-2">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Platform Ledger</p>
                                            {item.platformAmount !== null
                                                ? <p className={clsx("text-lg font-bold", isResolved ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100")}>{fmt(item.platformAmount)}</p>
                                                : <p className="text-lg font-bold text-slate-400 dark:text-slate-500 italic">Missing</p>
                                            }
                                        </div>
                                        <div className="pl-2">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Yoco API</p>
                                            <p className={clsx("text-lg font-bold", isResolved ? "text-slate-500 dark:text-slate-400" : item.type === "MISMATCH" ? "text-rose-500 dark:text-rose-400" : "text-slate-900 dark:text-slate-100")}>
                                                {item.yocoAmount !== null ? fmt(item.yocoAmount) : "—"}
                                            </p>
                                        </div>
                                    </div>
                                    {!isResolved && (
                                        <div className="flex items-center justify-between pt-1 ml-2">
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{item.note}</p>
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
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">Drift Analysis</h3>
                        <div className="w-full bg-white dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden shadow-sm">
                            <div
                                className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none"
                                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #135bec 1px, transparent 0)", backgroundSize: "20px 20px" }}
                            />
                            <div className="flex items-end gap-3 h-24 mb-4">
                                {driftBars.length > 0 ? driftBars.map((bar, i) => (
                                    <div key={i} className={clsx("flex-1 rounded-t-sm transition-all animate-pulse", bar.color)} style={{ height: bar.h }} />
                                )) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">Loading drift data...</div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">Daily reconciliation drift (last 7 days)</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Matched", value: items.filter((i) => i.type === "MATCHED").length, color: "text-emerald-500 dark:text-emerald-400" },
                                { label: "Mismatches", value: items.filter((i) => i.type === "MISMATCH" && !i.resolved).length, color: "text-rose-500 dark:text-rose-400" },
                                { label: "Not Found", value: items.filter((i) => i.type === "NOT_FOUND" && !i.resolved).length, color: "text-amber-500 dark:text-amber-400" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 text-center shadow-sm">
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
