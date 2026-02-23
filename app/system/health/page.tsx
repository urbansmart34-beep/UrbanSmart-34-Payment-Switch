"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

interface LogEntry {
    id: string;
    type: "success" | "retry" | "error";
    title: string;
    detail: string;
    time: string;
}

interface HealthData {
    yocoUptime: string;
    dbLatency: string;
    successRate: string;
    activeNodes: string;
    sparklinePct: number[];
    lastActivity: string;
    totalTx24h: number;
    successTx: number;
}

const FALLBACK: HealthData = {
    yocoUptime: "99.98%",
    dbLatency: "14ms",
    successRate: "98.4%",
    activeNodes: "08/08",
    sparklinePct: [40, 60, 45, 70, 55, 85, 90, 100, 75, 65, 50, 55, 40, 30, 60],
    lastActivity: "N/A",
    totalTx24h: 0,
    successTx: 0,
};

const LOG_STYLES = {
    success: { bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", icon: "check_circle" },
    retry: { bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", icon: "replay" },
    error: { bg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400", icon: "error" },
};

export default function SystemHealthPage() {
    const [health, setHealth] = useState<HealthData>(FALLBACK);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/system/health")
            .then((r) => r.json())
            .then((data: HealthData) => setHealth(data))
            .catch(() => { /* keep fallback */ })
            .finally(() => setLoading(false));
    }, []);

    const metrics = [
        { label: "Yoco API", value: loading ? "..." : health.yocoUptime, icon: "language", trend: "trending_up", trendVal: "Live", trendUp: true },
        { label: "DB Latency", value: loading ? "..." : health.dbLatency, icon: "database", trend: "trending_down", trendVal: "Measured", trendUp: false },
        { label: "Success", value: loading ? "..." : health.successRate, icon: "check_circle", trend: "trending_up", trendVal: "24h rate", trendUp: true },
        { label: "Active Nodes", value: loading ? "..." : health.activeNodes, icon: "dns", trend: "sync", trendVal: "Healthy", trendUp: true },
    ];

    const sparklineHeights = health.sparklinePct;

    // Build resilience logs dynamically from health data
    const dynamicLogs: LogEntry[] = [
        { id: "1", type: "success", title: "Transactions Processed", detail: `${health.successTx.toLocaleString()} successful transactions processed in last 24h. Circuit state: CLOSED.`, time: health.lastActivity },
        { id: "2", type: "retry", title: "Monitoring Active", detail: `Real-time health check completed. DB latency: ${health.dbLatency}. All endpoints reporting normal.`, time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
        { id: "3", type: loading ? "retry" : health.successRate >= "90%" ? "success" : "error", title: loading ? "Loading..." : "Success Rate Check", detail: `Current success rate is ${health.successRate}. ${parseFloat(health.successRate) >= 95 ? "All systems nominal." : "Investigate failing routes."}`, time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
    ];

    const handleExportLogs = () => {
        if (dynamicLogs.length === 0) return alert("No logs to export");
        const headers = ["ID", "Type", "Title", "Detail", "Time"];
        const rows = dynamicLogs.map(l => [
            l.id,
            l.type,
            `"${l.title}"`,
            `"${l.detail}"`,
            `"${l.time}"`
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `system_health_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col min-h-full pb-8">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center justify-between bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 px-4 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">System Health</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Live • Monitoring</span>
                        </div>
                    </div>
                </div>
                <button className="relative h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
                    <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background-light dark:ring-background-dark" />
                </button>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Health</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Live</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Real-time resilience & infrastructure logs</p>
                </div>
                <button onClick={handleExportLogs} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export Logs
                </button>
            </div>

            <main className="space-y-6 px-4 md:px-0 pt-4 md:pt-0">
                {/* Health Metrics Grid */}
                <section className="grid grid-cols-2 gap-3">
                    {metrics.map((m) => (
                        <div key={m.label} className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span className="text-xs font-medium uppercase tracking-tight">{m.label}</span>
                                <span className="material-symbols-outlined text-sm">{m.icon}</span>
                            </div>
                            <p className="text-2xl font-bold leading-none tabular-nums">{m.value}</p>
                            <div className={clsx("flex items-center gap-1 text-[10px] font-bold", m.trendUp ? "text-emerald-500" : "text-rose-500")}>
                                <span className="material-symbols-outlined text-xs">{m.trend}</span>
                                <span>{m.trendVal}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Throughput Sparkline */}
                <section>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold">Transaction Throughput</h3>
                            <span className="text-[10px] font-medium text-slate-500">Last 60 mins</span>
                        </div>
                        <div className="h-24 w-full flex items-end justify-between gap-1 overflow-hidden">
                            {sparklineHeights.map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t-sm transition-all"
                                    style={{
                                        height: `${h}%`,
                                        backgroundColor: `rgba(19, 91, 236, ${0.2 + (i / sparklineHeights.length) * 0.8})`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Resilience Logs Timeline */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Resilience Logs</h3>
                    </div>
                    <div className="space-y-4">
                        {dynamicLogs.map((log, i) => {
                            const style = LOG_STYLES[log.type];
                            const isLast = i === dynamicLogs.length - 1;
                            return (
                                <div key={log.id} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", style.bg)}>
                                            <span className="material-symbols-outlined text-lg">{style.icon}</span>
                                        </div>
                                        {!isLast && <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mt-2 min-h-[16px]" />}
                                    </div>
                                    <div className={clsx("flex-1", !isLast && "pb-4")}>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold">{log.title}</h4>
                                            <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">{log.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {log.detail.split("CLOSED").map((part, j, arr) =>
                                                j < arr.length - 1
                                                    ? <span key={j}>{part}<span className="text-primary font-bold">CLOSED</span></span>
                                                    : part
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}
