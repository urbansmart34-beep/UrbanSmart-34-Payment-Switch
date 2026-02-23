"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

type DateRange = "Week" | "Month" | "Quarter" | "Year";

interface AnalyticsData {
    totalVolume: number;
    successRate: number;
    avgTicket: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    topStores: { id: string; name: string; volume: number; count: number; trend: number }[];
    weeklyBars: { day: string; storeA: number; storeB: number }[];
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function AnalyticsPage() {
    const [range, setRange] = useState<DateRange>("Week");
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        fetch(`/api/analytics?range=${range}`)
            .then((r) => r.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [range]);
    const handleExportCSV = () => {
        if (!data) return alert("No data available to export");

        const headers = ["Metric", "Value"];
        const csvRows = [
            ["Report Range", range],
            ["Total Volume (ZAR)", (data.totalVolume / 100).toFixed(2)],
            ["Avg Ticket (ZAR)", (data.avgTicket / 100).toFixed(2)],
            ["Success Rate", `${data.successRate.toFixed(1)}%`],
            ["Success Count", data.successCount],
            ["Failed Count", data.failedCount],
            ["Pending Count", data.pendingCount],
        ];

        const csvString = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics_export_${range.toLowerCase()}_${new Date().toISOString().substring(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatCurrency = (cents: number) =>
        `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const barMax = data
        ? Math.max(...data.weeklyBars.map((b) => Math.max(b.storeA, b.storeB)), 1)
        : 1;

    const totalHealth = (data?.successCount ?? 0) + (data?.failedCount ?? 0) + (data?.pendingCount ?? 0);
    const successPct = totalHealth > 0 ? (data!.successCount / totalHealth) * 100 : 98;
    const failedPct = totalHealth > 0 ? (data!.failedCount / totalHealth) * 100 : 1.5;

    // SVG donut values (circle circumference ≈ 100.5 for r=16)
    const C = 100.5;
    const successDash = `${(successPct / 100) * C}, ${C}`;
    const failedOffset = -(successPct / 100) * C;
    const failedDash = `${(failedPct / 100) * C}, ${C}`;

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden flex-col bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-8 pb-4 gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Payment Switch</p>
                        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    </div>
                    <button className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
                {/* Date Tabs */}
                <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
                    {(["Week", "Month", "Quarter", "Year"] as DateRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={clsx(
                                "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                range === r
                                    ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sales & Analytics</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Performance overview across all stores</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Desktop Date Tabs */}
                    <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
                        {(["Week", "Month", "Quarter", "Year"] as DateRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={clsx(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    range === r
                                        ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export
                    </button>
                </div>
            </div>

            <main className="px-4 md:px-0 py-4 md:py-0 space-y-6">
                {/* Key Metrics Scroll Row */}
                <section className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
                    {[
                        {
                            label: "Total Volume",
                            value: loading ? "—" : formatCurrency(data?.totalVolume ?? 0),
                            trend: 12.4,
                            up: true
                        },
                        {
                            label: "Success Rate",
                            value: loading ? "—" : `${(data?.successRate ?? 0).toFixed(1)}%`,
                            trend: 0.2,
                            up: false
                        },
                        {
                            label: "Avg. Ticket",
                            value: loading ? "—" : formatCurrency(data?.avgTicket ?? 0),
                            trend: 4.1,
                            up: true
                        }
                    ].map((metric) => (
                        <div key={metric.label} className="flex-none w-40 md:w-auto p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{metric.label}</p>
                            <h3 className="text-xl font-bold">{metric.value}</h3>
                            <div className={clsx("flex items-center mt-2 text-xs font-bold", metric.up ? "text-emerald-500" : "text-rose-500")}>
                                <span className="material-symbols-outlined text-sm mr-1">
                                    {metric.up ? "trending_up" : "trending_down"}
                                </span>
                                {metric.trend}%
                            </div>
                        </div>
                    ))}
                </section>

                {/* Store Comparison Bar Chart */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Store Comparison</h2>
                        <div className="flex gap-3">
                            <span className="flex items-center text-[10px] font-bold uppercase tracking-tighter text-primary">
                                <span className="w-2 h-2 rounded-full bg-primary mr-1"></span> Primary
                            </span>
                            <span className="flex items-center text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-slate-400 mr-1"></span> Others
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-end justify-between h-32 gap-1">
                            {loading
                                ? DAY_LABELS.map((d, i) => (
                                    <div key={d} className="flex-1 flex flex-col justify-end gap-1 h-full">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t animate-pulse" style={{ height: `${(i % 3 + 1) * 20 + 20}%` }} />
                                        <div className="w-full bg-slate-100 dark:bg-slate-600 rounded-t animate-pulse" style={{ height: `${(i % 2 + 1) * 15 + 10}%` }} />
                                    </div>
                                ))
                                : (data?.weeklyBars ?? []).map((bar, i) => {
                                    const aH = barMax > 0 ? (bar.storeA / barMax) * 100 : 0;
                                    const bH = barMax > 0 ? (bar.storeB / barMax) * 100 : 0;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group">
                                            <div className="w-full bg-slate-400/20 group-hover:bg-slate-400/40 rounded-t transition-all" style={{ height: `${Math.max(bH, 4)}%` }} />
                                            <div className="w-full bg-primary group-hover:bg-primary/80 rounded-t transition-all" style={{ height: `${Math.max(aH, 4)}%` }} />
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-700">
                            {DAY_LABELS.map((d) => <span key={d}>{d}</span>)}
                        </div>
                    </div>
                </section>

                {/* Transaction Health + Top Stores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transaction Health Donut */}
                    <section className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase">Transaction Health</h2>
                        <div className="flex items-center gap-6">
                            <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    {/* Track */}
                                    <circle className="stroke-slate-200 dark:stroke-slate-700" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
                                    {/* Success */}
                                    <circle
                                        className="stroke-primary transition-all duration-700"
                                        cx="18" cy="18" fill="none" r="16"
                                        strokeWidth="3"
                                        strokeDasharray={successDash}
                                    />
                                    {/* Failed */}
                                    <circle
                                        className="stroke-rose-500 transition-all duration-700"
                                        cx="18" cy="18" fill="none" r="16"
                                        strokeWidth="3"
                                        strokeDasharray={failedDash}
                                        strokeDashoffset={failedOffset}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold">{loading ? "—" : `${successPct.toFixed(0)}%`}</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-xs font-medium">Successful</span>
                                    </div>
                                    <span className="text-xs font-bold">{loading ? "—" : (data?.successCount ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="text-xs font-medium">Failed</span>
                                    </div>
                                    <span className="text-xs font-bold">{loading ? "—" : (data?.failedCount ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-xs font-medium">Pending</span>
                                    </div>
                                    <span className="text-xs font-bold">{loading ? "—" : (data?.pendingCount ?? 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Top Performing Stores */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Top Performing Units</h2>
                            <Link href="/stores" className="text-xs font-semibold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                        <div className="ml-3 flex-1 space-y-2">
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : (data?.topStores ?? []).slice(0, 3).map((store, i) => (
                                <Link href={`/analytics/store/${store.id}`} key={store.id} className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30 group">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                                        i === 0 ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                    )}>
                                        {i + 1}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{store.name}</p>
                                        <p className="text-[10px] text-slate-500">{store.count.toLocaleString()} Trans • Yoco Routing</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{formatCurrency(store.volume)}</p>
                                        <p className={clsx("text-[10px] font-medium", store.trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                            {store.trend >= 0 ? "+" : ""}{store.trend.toFixed(1)}%
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Gateway Status Banner */}
                <section className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary tracking-wide">GATEWAY STATUS</p>
                            <p className="text-[10px] font-medium opacity-70">Connected to Yoco Switch Primary</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-primary text-xl">cloud_done</span>
                </section>
            </main>
        </div>
    );
}
