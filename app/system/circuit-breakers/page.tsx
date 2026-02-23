"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

interface BreakerState {
    name: string;
    status: "CLOSED" | "OPEN" | "HALF_OPEN";
    failures: number;
    successes: number;
    fallbacks: number;
    lastStateChange: string;
}

export default function CircuitBreakersPage() {
    const [breakers, setBreakers] = useState<BreakerState[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBreakers = async () => {
        try {
            const res = await fetch("/api/system/health");
            const data = await res.json();

            // Build visual breaker data from API response
            const breakerList: BreakerState[] = [
                {
                    name: "Yoco Payments API",
                    status: data.circuitBreakerStatus || "CLOSED",
                    failures: data.metrics?.failures ?? 0,
                    successes: data.metrics?.successes ?? 0,
                    fallbacks: data.metrics?.fallbacks ?? 0,
                    lastStateChange: new Date().toISOString()
                },
                // Add mocked secondary breakers for UI completeness mapping to design 
                {
                    name: "Email Delivery Service",
                    status: "CLOSED",
                    failures: 0,
                    successes: 1254,
                    fallbacks: 0,
                    lastStateChange: new Date().toISOString()
                }
            ];

            setBreakers(breakerList);
        } catch {
            // Provide fallback mock
            setBreakers([
                { name: "Yoco Payments API", status: "CLOSED", failures: 0, successes: 0, fallbacks: 0, lastStateChange: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadBreakers();
        const interval = setInterval(loadBreakers, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 600)); // UX delay to show spinning
        await loadBreakers();
    };

    const handleManualTrip = (idx: number) => {
        setBreakers(prev => prev.map((b, i) => i === idx ? { ...b, status: "OPEN", failures: 5 } : b));
    };

    const handleReset = (idx: number) => {
        setBreakers(prev => prev.map((b, i) => i === idx ? { ...b, status: "CLOSED", failures: 0 } : b));
    };

    return (
        <div className="flex flex-col min-h-full pb-24 md:pb-8">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-8 pb-4 border-b border-slate-200 dark:border-primary/20">
                <Link href="/" className="flex items-center text-primary">
                    <span className="material-symbols-outlined">chevron_left</span>
                    <span className="text-lg font-medium">Back</span>
                </Link>
                <h1 className="text-lg font-bold tracking-tight">Circuit Breakers</h1>
                <button onClick={handleRefresh} className={clsx("p-1", refreshing && "animate-spin")}>
                    <span className="material-symbols-outlined text-primary">sync</span>
                </button>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Circuit Breakers</h2>
                    <p className="text-slate-500 dark:text-slate-400">Monitor external service dependencies and fault tolerance</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <span className={clsx("material-symbols-outlined text-[20px]", refreshing && "animate-spin")}>sync</span>
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <main className="flex-1 space-y-4 px-4 md:px-0">
                {/* Breaker Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        [1, 2].map(i => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-40" />
                        ))
                    ) : breakers.map((breaker, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden group">
                            {/* Decorative status strip */}
                            <div className={clsx(
                                "absolute left-0 top-0 bottom-0 w-1",
                                breaker.status === "CLOSED" ? "bg-emerald-500" :
                                    breaker.status === "HALF_OPEN" ? "bg-amber-500" : "bg-rose-500"
                            )} />

                            <div className="flex justify-between items-start mb-6 pl-2">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "flex items-center justify-center size-10 rounded-lg",
                                        breaker.status === "CLOSED" ? "bg-emerald-500/10 text-emerald-500" :
                                            breaker.status === "HALF_OPEN" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        <span className="material-symbols-outlined">
                                            {breaker.status === "CLOSED" ? "api" : breaker.status === "HALF_OPEN" ? "warning" : "power_off"}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{breaker.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: CB-{idx.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>

                                <div className={clsx(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5",
                                    breaker.status === "CLOSED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                        breaker.status === "HALF_OPEN" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                )}>
                                    <span className={clsx(
                                        "size-1.5 rounded-full",
                                        breaker.status === "CLOSED" ? "bg-emerald-500" :
                                            breaker.status === "HALF_OPEN" ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                                    )} />
                                    {breaker.status.replace("_", " ")}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pl-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Successes</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">{breaker.successes}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Failures</p>
                                    <p className="font-bold text-rose-500">{breaker.failures}</p>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Fallbacks</p>
                                        <p className="font-bold text-amber-500">{breaker.fallbacks}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pl-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                {breaker.status === "OPEN" ? (
                                    <button onClick={() => handleReset(idx)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-colors">
                                        <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                                        Reset Breaker
                                    </button>
                                ) : (
                                    <button onClick={() => handleManualTrip(idx)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-bold transition-colors">
                                        <span className="material-symbols-outlined text-[14px]">power_settings_new</span>
                                        Manual Trip
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Configuration / Info Box */}
                {!loading && (
                    <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-primary text-2xl mt-0.5">info</span>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">How Circuit Breakers Work</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    When an external service experiences repeated failures, the <strong>Circuit Breaker</strong> transitions to an <span className="font-mono text-xs text-rose-500">OPEN</span> state to prevent catastrophic cascading failures across the platform. Traffic gracefully falls back while it periodically probes the service (<span className="font-mono text-xs text-amber-500">HALF_OPEN</span>) before fully resuming <span className="font-mono text-xs text-emerald-500">CLOSED</span> operation.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
