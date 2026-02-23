"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    interface TxDetail {
        amount: number;
        status: string;
        date: string;
        chargeId: string;
        yocoToken: string;
        storeId: string;
        orderId: string;
        customerEmail: string;
        routingPath: string;
        jsonPayload: any;
        timeline: { title: string; detail: string; icon: string; color: string; textClass?: string }[];
    }

    const [tx, setTx] = useState<TxDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/ledger/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    setTx(res.data);
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen py-24 flex items-center justify-center">
                <p className="text-slate-500 animate-pulse">Loading transaction details...</p>
            </div>
        );
    }

    if (!tx) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                <h2 className="text-xl font-bold mb-2">Transaction Not Found</h2>
                <p className="text-slate-500 mb-6">The transaction ID you are looking for does not exist in the ledger.</p>
                <Link href="/transactions" className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                    Return to Ledger
                </Link>
            </div>
        );
    }

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setToastMessage(`${label} copied to clipboard`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-full pb-32 font-display relative">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
                    <Link href="/transactions" className="flex items-center text-primary hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-[28px]">chevron_left</span>
                        <span className="text-lg">Logs</span>
                    </Link>
                    <h1 className="text-[17px] font-semibold tracking-tight absolute left-1/2 -translate-x-1/2">Transaction Details</h1>
                    <button className="text-primary hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-[24px]">share</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto">
                {/* Status Header */}
                <section className="flex flex-col items-center py-8 px-4 bg-gradient-to-b from-primary/5 to-transparent">
                    <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center mb-4 text-4xl",
                        tx.status === "SUCCESS" ? "bg-emerald-500/20 text-emerald-500" :
                            tx.status === "FAILED" ? "bg-rose-500/20 text-rose-500" :
                                "bg-amber-500/20 text-amber-500"
                    )}>
                        <span className="material-symbols-outlined">
                            {tx.status === "SUCCESS" ? "check_circle" : tx.status === "FAILED" ? "error" : "schedule"}
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">R {(tx.amount / 100).toFixed(2)}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={clsx("inline-block w-2 h-2 rounded-full",
                            tx.status === "SUCCESS" ? "bg-emerald-500" :
                                tx.status === "FAILED" ? "bg-rose-500" :
                                    "bg-amber-500"
                        )}></span>
                        <p className={clsx("font-medium",
                            tx.status === "SUCCESS" ? "text-emerald-500" :
                                tx.status === "FAILED" ? "text-rose-500" :
                                    "text-amber-500"
                        )}>{tx.status}</p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{tx.date}</p>
                </section>

                <div className="md:grid md:grid-cols-2 md:gap-6 md:px-4">
                    <div className="space-y-6">
                        {/* Core Identifiers Card */}
                        <div className="px-4 md:px-0">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Core Identifiers</h3>
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                                <div className="flex items-center justify-between p-4 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-xl">fingerprint</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Charge ID</p>
                                            <p className="font-mono text-sm font-medium truncate">{tx.chargeId}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCopy(tx.chargeId, "Charge ID")} className="p-2 text-slate-400 hover:text-primary transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-xl">content_copy</span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-xl">key</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Yoco Token</p>
                                            <p className="font-mono text-sm font-medium truncate">{tx.yocoToken}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCopy(tx.yocoToken, "Yoco Token")} className="p-2 text-slate-400 hover:text-primary transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-xl">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="px-4 md:px-0">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Business Metadata</h3>
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                <div className="flex justify-between p-4">
                                    <span className="text-slate-500 dark:text-slate-400">Store ID</span>
                                    <span className="font-medium">{tx.storeId}</span>
                                </div>
                                <div className="flex justify-between p-4">
                                    <span className="text-slate-500 dark:text-slate-400">Order ID</span>
                                    <span className="font-medium">{tx.orderId}</span>
                                </div>
                                <div className="flex justify-between p-4">
                                    <span className="text-slate-500 dark:text-slate-400">Customer Email</span>
                                    <span className="font-medium">{tx.customerEmail}</span>
                                </div>
                                <div className="flex justify-between p-4">
                                    <span className="text-slate-500 dark:text-slate-400">Routing Path</span>
                                    <span className="font-medium">{tx.routingPath}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mt-6 md:mt-0">
                        {/* API Response JSON */}
                        <div className="px-4 md:px-0">
                            <div className="flex items-center justify-between mb-2 ml-1">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Raw API Response</h3>
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">JSON</span>
                            </div>
                            <div className="bg-slate-950 rounded-xl p-4 overflow-hidden border border-slate-800 relative group">
                                <button onClick={() => handleCopy(JSON.stringify(tx.jsonPayload, null, 2), "JSON payload")} className="absolute top-2 right-2 p-2 bg-slate-800/80 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                </button>
                                <pre className="font-mono text-xs leading-relaxed overflow-x-auto custom-scrollbar text-slate-300">
                                    {JSON.stringify(tx.jsonPayload, null, 2).split('\n').map((line, i) => {
                                        // Simple syntax highlighting mock
                                        let stylized = line;
                                        stylized = stylized.replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:');
                                        stylized = stylized.replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>');
                                        stylized = stylized.replace(/: ([0-9]+)/g, ': <span class="text-orange-400">$1</span>');
                                        return <div key={i} dangerouslySetInnerHTML={{ __html: stylized }} />;
                                    })}
                                </pre>
                            </div>
                        </div>

                        {/* Lifecycle Timeline */}
                        <div className="px-4 md:px-0 mb-6">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-1">Lifecycle Events</h3>
                            <div className="space-y-6 relative before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                {tx.timeline.map((event, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        <div className={clsx("w-10 h-10 rounded-full border-4 border-background-light dark:border-background-dark z-10 flex items-center justify-center shrink-0", event.color)}>
                                            <span className="material-symbols-outlined text-sm">{event.icon}</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className={clsx("text-sm font-semibold", event.textClass || "text-slate-900 dark:text-white")}>{event.title}</p>
                                            <p className="text-xs text-slate-500">{event.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Actions */}
            <div className="fixed bottom-0 md:bottom-6 md:w-[600px] md:rounded-2xl md:left-1/2 md:-translate-x-1/2 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t md:border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 shadow-2xl z-40">
                <Link href={`/refunds`} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 md:py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl">restart_alt</span>
                    Issue Full Refund
                </Link>
            </div>

            {/* Floating Copy Confirmation */}
            <div className={clsx(
                "fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium pointer-events-none transition-all duration-300 z-50",
                toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
                {toastMessage}
            </div>
        </div>
    );
}
