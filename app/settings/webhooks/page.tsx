"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

type DeliveryStatus = "success" | "failed";

interface WebhookEndpoint {
    id: string;
    url: string;
    events: string[];
    enabled: boolean;
    latency: number;
    createdAgo: string;
}

interface DeliveryLog {
    id: string;
    status: DeliveryStatus;
    event: string;
    payloadId: string;
    endpoint: string;
    timeAgo: string;
    httpCode: number;
}

const SPARKLINE = [40, 60, 30, 80, 50, 20, 70, 90, 45, 65];



export default function WebhooksPage() {
    const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
    const [logs, setLogs] = useState<DeliveryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [redelivering, setRedelivering] = useState<string | null>(null);
    const [showPayload, setShowPayload] = useState<string | null>(null);
    const [showAddEndpoint, setShowAddEndpoint] = useState(false);
    const [newUrl, setNewUrl] = useState("");

    useEffect(() => {
        fetch("/api/webhooks")
            .then(res => res.json())
            .then(data => {
                if (data.endpoints) setEndpoints(data.endpoints);
                if (data.logs) setLogs(data.logs);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleEndpoint = (id: string) => {
        setEndpoints((prev) => prev.map((ep) => ep.id === id ? { ...ep, enabled: !ep.enabled } : ep));
    };

    const handleRedeliver = async (logId: string) => {
        setRedelivering(logId);
        await new Promise((r) => setTimeout(r, 1200));
        setRedelivering(null);
        setLogs((prev) => prev.map((l) => l.id === logId ? { ...l, status: "success", httpCode: 200 } : l));
    };

    const handleAddEndpoint = async () => {
        if (!newUrl.trim()) return;
        try {
            const res = await fetch("/api/webhooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: newUrl })
            });
            if (res.ok) {
                const refreshed = await fetch("/api/webhooks").then((r) => r.json());
                if (refreshed.endpoints) setEndpoints(refreshed.endpoints);
                if (refreshed.logs) setLogs(refreshed.logs);
                setNewUrl("");
                setShowAddEndpoint(false);
            } else {
                alert("Failed to create webhook.");
            }
        } catch (e) {
            alert("Network error.");
        }
    };

    const activeCount = endpoints.filter((e) => e.enabled).length;

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-0 py-4 md:py-6 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">hub</span>
                    <h1 className="text-xl font-bold tracking-tight">Webhooks</h1>
                </div>
                <button
                    onClick={() => setShowAddEndpoint(true)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Endpoint</span>
                </button>
            </div>

            <main className="flex-1 pb-8 space-y-6 px-4 md:px-0">
                {/* Active Endpoints */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Endpoints</h2>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{activeCount} Active</span>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-sm text-slate-500 py-4 px-2">Loading endpoints...</div>
                        ) : endpoints.length === 0 ? (
                            <div className="text-sm text-slate-500 py-4 px-2">No webhook endpoints configured.</div>
                        ) : endpoints.map((ep) => (
                            <div key={ep.id} className={clsx(
                                "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 shadow-sm transition-opacity",
                                !ep.enabled && "opacity-70"
                            )}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className={clsx("text-sm font-medium truncate", ep.enabled ? "text-primary" : "text-slate-400")}>
                                            {ep.url}
                                        </p>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {ep.events.includes("success") && (
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">Success</span>
                                            )}
                                            {ep.events.includes("failed") && (
                                                <span className="text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase">Failed</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4 shrink-0">
                                        <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-primary transition-colors">edit</span>
                                        <button
                                            onClick={() => toggleEndpoint(ep.id)}
                                            className={clsx(
                                                "w-10 h-6 rounded-full relative transition-colors duration-300",
                                                ep.enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300",
                                                ep.enabled ? "right-1 translate-x-0" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700/50 pt-3 mt-1">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">speed</span>
                                        {ep.latency > 0 ? `Avg Latency: ${ep.latency}ms` : "No data yet"}
                                    </span>
                                    <span>Created {ep.createdAgo}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Delivery Stats Sparkline */}
                <section>
                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                        <div className="p-3 bg-slate-800/50 flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-300">Traffic (Last 24h)</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                                {Math.round((logs.filter((l) => l.status === "success").length / logs.length) * 100)}% Success Rate
                            </span>
                        </div>
                        <div className="h-24 w-full bg-slate-900 flex items-end justify-between px-4 pb-2 pt-4 gap-1">
                            {SPARKLINE.map((h, i) => {
                                const isFail = h === 20; // represent a failure spike
                                return (
                                    <div
                                        key={i}
                                        className={clsx("flex-1 rounded-t-sm", isFail ? "bg-rose-500/60" : "bg-primary/60")}
                                        style={{ height: `${h}%` }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Recent Deliveries */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Deliveries</h2>
                        <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[16px]">filter_list</span>
                            Filter
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="p-4 text-sm text-slate-500">Loading logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500">No deliveries yet.</div>
                        ) : logs.map((log, i) => (
                            <div key={log.id} className={clsx(
                                "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                                i < logs.length - 1 && "border-b border-slate-100 dark:border-slate-800"
                            )}>
                                <div className="flex gap-3">
                                    <div className={clsx(
                                        "size-10 rounded-lg flex items-center justify-center shrink-0",
                                        log.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        <span className="material-symbols-outlined">{log.status === "success" ? "check_circle" : "error"}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-bold truncate">{log.event}</h3>
                                            <span className={clsx(
                                                "text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ml-2",
                                                log.status === "success"
                                                    ? "text-emerald-500 bg-emerald-500/10"
                                                    : "text-rose-500 bg-rose-500/10"
                                            )}>
                                                {log.httpCode} {log.status === "success" ? "OK" : "ERR"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate font-mono">
                                            ID: {log.payloadId}... {log.endpoint}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-[10px] text-slate-400">{log.timeAgo}</span>
                                            {log.status === "failed" ? (
                                                <button
                                                    onClick={() => handleRedeliver(log.id)}
                                                    disabled={redelivering === log.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors disabled:opacity-60"
                                                >
                                                    <span className={clsx("material-symbols-outlined text-[16px]", redelivering === log.id && "animate-spin")}>
                                                        {redelivering === log.id ? "progress_activity" : "refresh"}
                                                    </span>
                                                    {redelivering === log.id ? "Sending..." : "Redeliver"}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShowPayload(showPayload === log.id ? null : log.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                    Payload
                                                </button>
                                            )}
                                        </div>
                                        {/* Payload Preview */}
                                        {showPayload === log.id && (
                                            <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
                                                {`{ "event": "${log.event}", "id": "${log.payloadId}", "status": "SUCCESS", "amount": 89900 }`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm font-medium rounded-xl hover:border-primary/50 hover:text-primary transition-all">
                        View All Deliveries
                    </button>
                </section>
            </main>

            {/* Add Endpoint Sheet */}
            {showAddEndpoint && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddEndpoint(false)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl p-6 animate-slide-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">New Endpoint</h3>
                            <button onClick={() => setShowAddEndpoint(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">URL</label>
                                <input
                                    autoFocus
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="https://your-domain.com/webhooks"
                                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                onClick={handleAddEndpoint}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                            >
                                Add Endpoint
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
