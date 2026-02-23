"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

type Sensitivity = "Low" | "Medium" | "High";

interface FraudAlert {
    id: string;
    storeName: string;
    reason: string;
    amount: number;
    status: "Blocked" | "Flagged";
    icon: string;
    iconBg: string;
    time: string;
}



export default function FraudPage() {
    const [sensitivity, setSensitivity] = useState<Sensitivity>("Medium");
    const [autoBlock, setAutoBlock] = useState(true);
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [riskScore, setRiskScore] = useState(0);
    const [metrics, setMetrics] = useState({ flagged: 0, blocked: 0, saved: 0 });
    const [clearing, setClearing] = useState(false);

    // Fetch real fraud data on mount
    useEffect(() => {
        fetch("/api/fraud")
            .then((r) => r.json())
            .then((data) => {
                setRiskScore(data.riskScore ?? 12);
                setMetrics({
                    flagged: data.flagged ?? 0,
                    blocked: data.blocked ?? 0,
                    saved: data.savedCents ?? 0,
                });
                setAlerts(data.alerts ?? []);
            })
            .catch(() => {
                // keep at zeros on network error
                setAlerts([]);
                setRiskScore(0);
                setMetrics({ flagged: 0, blocked: 0, saved: 0 });
            });
    }, []);

    // Compute risk score label
    const riskLabel = riskScore < 30 ? "Low Risk" : riskScore < 60 ? "Medium Risk" : "High Risk";
    const riskColor = riskScore < 30 ? "text-emerald-500" : riskScore < 60 ? "text-amber-500" : "text-rose-500";

    // SVG gauge: r=58, circumference = 2π×58 = 364.4
    const C = 364.4;
    const dashOffset = C - (riskScore / 100) * C;

    const handleClearAlerts = async () => {
        setClearing(true);
        await new Promise((r) => setTimeout(r, 1200));
        setAlerts([]);
        setMetrics((m) => ({ ...m, flagged: 0 }));
        setRiskScore(Math.max(0, riskScore - 8));
        setClearing(false);
    };

    const formatAmount = (cents: number) =>
        `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

    return (
        <div className="flex flex-col min-h-full pb-40 md:pb-8">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/20 px-4 pt-8 pb-4">
                <Link href="/" className="flex items-center text-primary">
                    <span className="material-symbols-outlined">chevron_left</span>
                    <span className="text-lg font-medium">Back</span>
                </Link>
                <h1 className="text-lg font-bold tracking-tight">Fraud Monitoring</h1>
                <Link href="/fraud/rules" className="text-primary">
                    <span className="material-symbols-outlined">tune</span>
                </Link>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fraud Detection</h2>
                    <p className="text-slate-500 dark:text-slate-400">Real-time risk monitoring across all stores</p>
                </div>
                <Link href="/fraud/rules" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                    Configure Rules
                </Link>
            </div>

            <main className="flex-1 pb-4 space-y-6">
                {/* Risk Score Gauge */}
                <section className="px-4 md:px-0">
                    <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-primary/10 p-6 flex flex-col items-center shadow-sm">
                        <div className="relative flex items-center justify-center w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                {/* Track */}
                                <circle
                                    className="text-slate-100 dark:text-slate-800"
                                    cx="64" cy="64"
                                    fill="transparent" r="58"
                                    stroke="currentColor" strokeWidth="8"
                                />
                                {/* Progress */}
                                <circle
                                    className={clsx("transition-all duration-700",
                                        riskScore < 30 ? "text-emerald-500" : riskScore < 60 ? "text-amber-500" : "text-rose-500"
                                    )}
                                    cx="64" cy="64"
                                    fill="transparent" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={C}
                                    strokeDashoffset={dashOffset}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{riskScore}</span>
                                <span className={clsx("text-[10px] uppercase tracking-widest font-semibold", riskColor)}>
                                    {riskLabel}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <h2 className="text-xl font-bold">Fraud Risk Score</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aggregated across all Yoco routes</p>
                        </div>
                    </div>
                </section>

                {/* Metrics Scroll */}
                <section className="flex gap-4 px-4 md:px-0 overflow-x-auto hide-scrollbar -mx-0 md:grid md:grid-cols-3">
                    {[
                        { label: "Flagged", value: metrics.flagged.toString(), trend: "trending_down", trendColor: "text-emerald-500", trendText: "5%" },
                        { label: "Blocked", value: metrics.blocked.toString(), trend: null, trendText: "Stable", trendColor: "text-slate-400" },
                        { label: "Saved", value: `R ${(metrics.saved / 100 / 1000).toFixed(1)}k`, trend: "trending_up", trendColor: "text-emerald-500", trendText: "12%" },
                    ].map((m) => (
                        <div key={m.label} className="flex min-w-[140px] flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-primary/10 shadow-sm">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{m.label}</span>
                            <span className="text-2xl font-bold">{m.value}</span>
                            <span className={clsx("text-xs font-semibold flex items-center gap-0.5", m.trendColor)}>
                                {m.trend && <span className="material-symbols-outlined text-sm">{m.trend}</span>}
                                {m.trendText}
                            </span>
                        </div>
                    ))}
                </section>

                {/* Sensitivity Controls */}
                <section className="px-4 md:px-0">
                    <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-primary/10 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-base">Auto-block Sensitivity</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Current setting: {sensitivity}</p>
                            </div>
                            {/* Toggle */}
                            <button
                                onClick={() => setAutoBlock(!autoBlock)}
                                className={clsx(
                                    "flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300",
                                    autoBlock ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                                )}
                            >
                                <div className={clsx(
                                    "h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300",
                                    autoBlock ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        {/* Sensitivity Segmented Control */}
                        <div className={clsx("flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg transition-opacity", !autoBlock && "opacity-40 pointer-events-none")}>
                            {(["Low", "Medium", "High"] as Sensitivity[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSensitivity(s)}
                                    className={clsx(
                                        "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                                        sensitivity === s
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                                            : "text-slate-500 dark:text-slate-400"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Alerts List */}
                <section className="px-4 md:px-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Recent Alerts</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {alerts.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 block text-emerald-500">verified_user</span>
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">All clear! No active alerts.</p>
                                <p className="text-sm mt-1">The system is monitoring all transactions.</p>
                            </div>
                        ) : alerts.map((alert) => (
                            <div key={alert.id} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                                <div className={clsx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", alert.iconBg)}>
                                    <span className="material-symbols-outlined">{alert.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold truncate">{alert.storeName}</span>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 ml-2">{alert.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{alert.reason}</p>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-sm font-bold">{formatAmount(alert.amount)}</span>
                                        <span className={clsx(
                                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                            alert.status === "Blocked"
                                                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                        )}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Sticky Bottom CTA - Mobile */}
            <div className={clsx(
                "fixed bottom-0 left-0 right-0 z-30 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-primary/20 px-4 pt-4 pb-6 md:hidden",
                alerts.length === 0 && "opacity-50 pointer-events-none"
            )}>
                <button
                    onClick={handleClearAlerts}
                    disabled={clearing || alerts.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg active:scale-95 disabled:opacity-60 transition-all"
                >
                    <span className={clsx("material-symbols-outlined", clearing && "animate-spin")}>
                        {clearing ? "progress_activity" : "done_all"}
                    </span>
                    {clearing ? "Clearing..." : `Review & Clear ${alerts.length} Alert${alerts.length !== 1 ? "s" : ""}`}
                </button>
            </div>

            {/* Desktop CTA */}
            {alerts.length > 0 && (
                <div className="hidden md:block mt-4 px-0">
                    <button
                        onClick={handleClearAlerts}
                        disabled={clearing}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all"
                    >
                        <span className={clsx("material-symbols-outlined text-[20px]", clearing && "animate-spin")}>
                            {clearing ? "progress_activity" : "done_all"}
                        </span>
                        {clearing ? "Clearing..." : `Review & Clear ${alerts.length} Alerts`}
                    </button>
                </div>
            )}
        </div>
    );
}
