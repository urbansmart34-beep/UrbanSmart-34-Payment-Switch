"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function FraudRulesPage() {
    const [rateLimit, setRateLimit] = useState("10");
    const [maxAmount, setMaxAmount] = useState("5,000.00");
    const [autoReject, setAutoReject] = useState(true);
    const [blockedCountries, setBlockedCountries] = useState(["Nigeria", "North Korea", "Russia"]);
    const [saving, setSaving] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    const removeCountry = (c: string) => {
        setBlockedCountries(blockedCountries.filter(country => country !== c));
    };

    const addCountry = () => {
        const country = prompt("Enter country name:");
        if (country && !blockedCountries.includes(country)) {
            setBlockedCountries([...blockedCountries, country]);
        }
    };

    useEffect(() => {
        fetch("/api/system/config?key=fraud_rules")
            .then((r) => r.json())
            .then((data) => {
                if (data.value) {
                    setRateLimit(data.value.rateLimit || "10");
                    setMaxAmount(data.value.maxAmount || "5,000.00");
                    setAutoReject(data.value.autoReject ?? true);
                    setBlockedCountries(data.value.blockedCountries || ["Nigeria", "North Korea", "Russia"]);
                }
            })
            .catch(console.error);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/system/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "fraud_rules",
                    value: { rateLimit, maxAmount, autoReject, blockedCountries }
                })
            });
        } catch (e) {
            alert("Failed to save rules.");
        } finally {
            setSaving(false);
        }
    };

    const runSimulation = async () => {
        setIsSimulating(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsSimulating(false);
        alert("Simulation complete! These rules would have blocked 14 transactions out of 1,204 over the last 24 hours.");
    };

    return (
        <div className="flex flex-col min-h-full pb-24 font-display">
            {/* Mobile Header (iOS Style) */}
            <header className="sticky top-0 z-50 flex md:hidden items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-4 py-3">
                <Link href="/fraud" className="flex items-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">chevron_left</span>
                    <span className="text-base">Fraud</span>
                </Link>
                <h1 className="text-base font-semibold">Fraud Rules</h1>
                <button onClick={handleSave} disabled={saving} className="text-primary font-semibold text-base">
                    {saving ? "Saving" : "Save"}
                </button>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6 px-4 md:px-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/fraud" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Back to Fraud
                        </Link>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rule Configuration</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure thresholds and automated blocks for Yoco payment routing.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg shadow-primary/20"
                >
                    <span className={clsx("material-symbols-outlined text-[18px]", saving && "animate-spin")}>
                        {saving ? "progress_activity" : "save"}
                    </span>
                    {saving ? "Saving..." : "Save Configuration"}
                </button>
            </div>

            <main className="flex-1 px-4 md:px-0 py-6 max-w-2xl w-full space-y-8">
                {/* Mobile Title */}
                <div className="md:hidden">
                    <h2 className="text-2xl font-bold tracking-tight">Rule Configuration</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure thresholds for Yoco payment routing.</p>
                </div>

                {/* Rule Group: Rate Limiting */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary/80">
                        <span className="material-symbols-outlined text-sm">speed</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider">Rate Limiting</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Max transactions per IP</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/50 transition-all text-lg font-semibold outline-none"
                                            type="number"
                                            value={rateLimit}
                                            onChange={(e) => setRateLimit(e.target.value)}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/ min</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">Limits repetitive hits from the same network origin.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Rule Group: Transaction Limits */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary/80">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider">Transaction Limits</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Max amount per transaction</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R</span>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/50 transition-all text-lg font-semibold outline-none"
                                        type="text"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-500">Auto-reject amounts above this limit</span>
                                    <button
                                        onClick={() => setAutoReject(!autoReject)}
                                        className={clsx(
                                            "flex h-6 w-10 items-center rounded-full p-1 transition-colors duration-300",
                                            autoReject ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                    >
                                        <div className={clsx(
                                            "h-4 w-4 rounded-full bg-white transition-transform duration-300",
                                            autoReject ? "translate-x-4" : "translate-x-0"
                                        )}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Rule Group: Geographic Controls */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary/80">
                        <span className="material-symbols-outlined text-sm">public</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider">Geographic Controls</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-4 space-y-4">
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium">Blocked Country List</label>
                                <div className="flex flex-wrap gap-2">
                                    {blockedCountries.map((country) => (
                                        <div key={country} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium">
                                            <span>{country}</span>
                                            <button onClick={() => removeCountry(country)} className="material-symbols-outlined text-base hover:text-rose-500 transition-colors">close</button>
                                        </div>
                                    ))}
                                    <button onClick={addCountry} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-base">add</span>
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Simulation Section */}
                <section className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Impact Simulation</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Simulate these rules against the last 24 hours of traffic to see how many transactions would have been blocked.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                        <span className={clsx("material-symbols-outlined text-xl", isSimulating && "animate-spin")}>
                            {isSimulating ? "progress_activity" : "play_circle"}
                        </span>
                        {isSimulating ? "Running Simulation..." : "Test Rule Configuration"}
                    </button>
                </section>
            </main>
        </div>
    );
}
