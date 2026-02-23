"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

const QUICK_LINKS = [
    { label: "View API Docs", icon: "description", href: "/settings/api" },
    { label: "Regenerate Keys", icon: "autorenew", href: "/settings/api" },
    { label: "Invite Member", icon: "person_add", href: "/settings/team" },
];

export default function SettingsIndexPage() {
    const [platformName, setPlatformName] = useState("URBANSMART-34 Payment SWITCH");
    const [supportEmail, setSupportEmail] = useState("support@urbansmart.co.za");
    const [defaultCurrency, setDefaultCurrency] = useState("ZAR");

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/system/config?key=general_settings")
            .then(res => res.json())
            .then(data => {
                if (data.value) {
                    setPlatformName(data.value.platformName || "URBANSMART-34 Payment SWITCH");
                    setSupportEmail(data.value.supportEmail || "support@urbansmart.co.za");
                    setDefaultCurrency(data.value.defaultCurrency || "ZAR");
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/system/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "general_settings",
                    value: { platformName, supportEmail, defaultCurrency }
                })
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                alert("Failed to save settings");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full pb-24 md:pb-8">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-8 pb-4">
                <h1 className="text-xl font-bold tracking-tight">General Settings</h1>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">General Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your core platform details and defaults.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all",
                        saved ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/20 hover:bg-primary/90",
                        (saving || loading) && "opacity-70"
                    )}
                >
                    <span className={clsx("material-symbols-outlined text-[18px]", saving && "animate-spin")}>
                        {saved ? "check" : saving ? "progress_activity" : "save"}
                    </span>
                    {saved ? "Saved" : "Save Changes"}
                </button>
            </div>

            <main className="flex-1 space-y-8">
                {/* General Settings Form */}
                <section className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Platform Identity</h3>

                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Platform Name</label>
                            <input
                                type="text"
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="e.g. UrbanSmart Switch"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Support Contact Email</label>
                            <input
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="support@yourcompany.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Default Currency</label>
                            <select
                                value={defaultCurrency}
                                onChange={(e) => setDefaultCurrency(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                disabled={loading}
                            >
                                <option value="ZAR">ZAR (South African Rand)</option>
                                <option value="USD">USD (US Dollar)</option>
                                <option value="GBP">GBP (British Pound)</option>
                                <option value="EUR">EUR (Euro)</option>
                            </select>
                        </div>
                    </div>

                    {/* Mobile Save Button */}
                    <div className="md:hidden mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className={clsx(
                                "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white shadow-lg transition-all",
                                saved ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/20",
                                (saving || loading) && "opacity-70"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined text-[18px]", saving && "animate-spin")}>
                                {saved ? "check" : saving ? "progress_activity" : "save"}
                            </span>
                            {saved ? "Saved" : "Save General Settings"}
                        </button>
                    </div>
                </section>

                {/* Quick Links */}
                <section className="px-4 md:px-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</p>
                    <div className="grid grid-cols-3 gap-3">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 py-4 px-2 text-center hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-md hover:border-primary/30 transition-all"
                            >
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                    <span className="material-symbols-outlined text-primary text-[20px]">{link.icon}</span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">{link.label}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Platform Info Footer */}
                <section className="px-4 md:px-0">
                    <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/15 p-4 flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white uppercase truncate">{platformName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">v1.0.0 · Yoco Gateway · SQLite (dev)</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider shrink-0">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative rounded-full size-2 bg-emerald-500" />
                            </span>
                            Live
                        </span>
                    </div>
                </section>
            </main>
        </div>
    );
}
