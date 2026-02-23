"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

type Environment = "production" | "sandbox";

interface SecurityToggle {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
}

export default function ApiSecurityPage() {
    const [env, setEnv] = useState<Environment>("production");
    const [showSecret, setShowSecret] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [ips, setIps] = useState<string[]>([]);
    const [ipInput, setIpInput] = useState("");
    const [showIpInput, setShowIpInput] = useState(false);
    const [toggles, setToggles] = useState<SecurityToggle[]>([
        { id: "ip", label: "IP Whitelisting", description: "Restrict API calls to specific IPs", enabled: true },
        { id: "https", label: "Enforce HTTPS", description: "Reject all non-secure requests", enabled: true },
        { id: "fraud", label: "Fraud Detection Mode", description: "Enable advanced transaction scoring", enabled: false },
    ]);
    const [keys, setKeys] = useState<{ public: string; secret: string }>({ public: "Loading...", secret: "Loading..." });
    const [webhookUrl, setWebhookUrl] = useState("Loading...");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWebhookUrl(`${window.location.origin}/api/webhooks`);
        }

        // Fetch existing configuration (IPs, env mode, toggles)

        fetch("/api/system/config?key=api_settings")
            .then(res => res.json())
            .then(data => {
                if (data.value) {
                    if (data.value.env) setEnv(data.value.env);
                    if (data.value.ips) setIps(data.value.ips);
                    if (data.value.toggles) setToggles(data.value.toggles);
                }
            })
            .catch(console.error);

        // Fetch secure API keys from runtime environment
        fetch("/api/system/credentials")
            .then(res => res.json())
            .then(data => {
                setKeys({ public: data.publicKey, secret: data.secretKey });
            })
            .catch(console.error);
    }, []);

    const handleCopy = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text).catch(() => { });
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult("idle");
        try {
            const res = await fetch("/api/webhooks/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: webhookUrl })
            });
            if (res.ok) {
                setTestResult("success");
            } else {
                setTestResult("error");
            }
        } catch (e) {
            setTestResult("error");
        } finally {
            setTesting(false);
            setTimeout(() => setTestResult("idle"), 3000);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/system/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "api_settings",
                    value: { env, ips, toggles }
                })
            });
        } catch (e) {
            alert("Failed to save settings");
        } finally {
            setSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        }
    };

    const toggleSecurity = (id: string) => {
        setToggles((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
    };

    const addIp = () => {
        if (ipInput.trim()) {
            setIps([...ips, ipInput.trim()]);
            setIpInput("");
            setShowIpInput(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 flex md:hidden items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
                <Link href="/settings" className="flex items-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">chevron_left</span>
                    <span className="text-lg">Settings</span>
                </Link>
                <h1 className="text-lg font-semibold tracking-tight">API &amp; Security</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-primary font-medium text-lg disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">API &amp; Security</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage credentials, webhooks, and security policies</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={clsx(
                        "flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-lg",
                        saveSuccess ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/20"
                    )}
                >
                    <span className={clsx("material-symbols-outlined text-[18px]", saving && "animate-spin")}>
                        {saving ? "progress_activity" : saveSuccess ? "check" : "save"}
                    </span>
                    {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                </button>
            </div>

            <main className="flex-1 pb-24 md:pb-8 space-y-0 md:space-y-6">
                {/* Environment Toggle */}
                <div className="px-4 py-6 md:px-0 md:py-0 flex items-center justify-between md:justify-start gap-4">
                    <div className="flex h-10 w-full md:max-w-xs items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 p-1">
                        {(["production", "sandbox"] as Environment[]).map((e) => (
                            <button
                                key={e}
                                onClick={() => setEnv(e)}
                                className={clsx(
                                    "flex h-full grow items-center justify-center rounded-md px-2 transition-all text-sm font-medium capitalize",
                                    env === e
                                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                                        : "text-slate-600 dark:text-slate-400"
                                )}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Keys are securely loaded from your Render <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">.env</code>
                    </div>
                </div>

                {/* API Credentials */}
                <section className="mb-8 md:mb-0">
                    <div className="px-4 md:px-0 mb-2 flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">API Credentials</h2>
                        <span className="material-symbols-outlined text-slate-400 text-sm cursor-help" title="These keys map exactly to the physical store's payment capabilities.">help</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border-y md:border md:rounded-xl border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                        {/* Public Key */}
                        <div className="flex items-center gap-4 px-4 py-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                <span className="material-symbols-outlined">key</span>
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                                <p className="text-sm font-medium">Public Key</p>
                                <p className="text-xs text-slate-500 truncate font-mono">{keys.public}</p>
                            </div>
                            <button onClick={() => handleCopy(keys.public, "public")} className="text-slate-400 hover:text-primary transition-colors shrink-0">
                                <span className="material-symbols-outlined">{copied === "public" ? "check" : "content_copy"}</span>
                            </button>
                        </div>
                        {/* Secret Key */}
                        <div className="flex items-center gap-4 px-4 py-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                                <p className="text-sm font-medium">Secret Key</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500 font-mono tracking-widest">
                                        {showSecret ? keys.secret : "•••••••••••••••••••••••••••••••••"}
                                    </p>
                                    <button onClick={() => setShowSecret(!showSecret)} className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">{showSecret ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => handleCopy(keys.secret, "secret")} className="text-slate-400 hover:text-primary transition-colors shrink-0">
                                <span className="material-symbols-outlined">{copied === "secret" ? "check" : "content_copy"}</span>
                            </button>
                        </div>
                    </div>
                    <div className="px-4 md:px-0 mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        To rotate your API keys, generate them in your <a href="https://portal.yoco.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Yoco Dashboard</a> and update your Render Environment Variables.
                    </div>
                </section>

                {/* Webhook Settings */}
                <section className="mb-8 md:mb-0">
                    <div className="px-4 md:px-0 mb-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yoco Webhooks</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border-y md:border md:rounded-xl border-slate-200 dark:border-slate-800 px-4 py-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Notification URL</p>
                                <span className={clsx(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-tighter",
                                    testResult === "error"
                                        ? "bg-rose-500/10 text-rose-500"
                                        : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                    {testResult === "success" ? "Verified" : testResult === "error" ? "Failed" : "Active"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">link</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate">{webhookUrl}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
                                >
                                    <span className={clsx("material-symbols-outlined text-[14px]", testing && "animate-spin")}>
                                        {testing ? "progress_activity" : "bolt"}
                                    </span>
                                    {testing ? "Testing..." : "Test Connection"}
                                </button>
                                <button onClick={() => handleCopy(webhookUrl, "webhook")} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">{copied === "webhook" ? "check" : "content_copy"}</span>
                                    Copy URL
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Options */}
                <section className="mb-8 md:mb-0">
                    <div className="px-4 md:px-0 mb-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security &amp; Fraud</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border-y md:border md:rounded-xl border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                        {toggles.map((t) => (
                            <div key={t.id}>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium">{t.label}</p>
                                        <p className="text-xs text-slate-500">{t.description}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleSecurity(t.id)}
                                        className={clsx(
                                            "relative h-6 w-11 rounded-full transition-colors duration-300 shrink-0",
                                            t.enabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                    >
                                        <div className={clsx(
                                            "absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                                            t.enabled ? "translate-x-[22px] left-0" : "translate-x-0 left-[2px]"
                                        )} />
                                    </button>
                                </div>
                                {/* IP Tags (when IP whitelisting enabled) */}
                                {t.id === "ip" && t.enabled && (
                                    <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/20">
                                        <div className="flex flex-wrap gap-2">
                                            {ips.map((ip) => (
                                                <div key={ip} className="flex items-center gap-1.5 rounded bg-slate-200 dark:bg-slate-800 px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                                                    {ip}
                                                    <button onClick={() => setIps(ips.filter((i) => i !== ip))}>
                                                        <span className="material-symbols-outlined text-[14px] hover:text-rose-500 transition-colors">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            {showIpInput ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        autoFocus
                                                        value={ipInput}
                                                        onChange={(e) => setIpInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && addIp()}
                                                        placeholder="0.0.0.0"
                                                        className="text-[11px] font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-28 outline-none focus:border-primary"
                                                    />
                                                    <button onClick={addIp} className="text-primary text-[11px] font-semibold">Add</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setShowIpInput(true)} className="flex items-center gap-1 text-[11px] font-medium text-primary py-1">
                                                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                                    Add IP
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
