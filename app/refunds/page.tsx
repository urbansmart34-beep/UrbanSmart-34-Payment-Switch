"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

type RefundStatus = "ALL" | "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";

interface RefundItem {
    id: string;
    txId: string;
    storeName: string;
    storeIcon: string;
    amount: number;
    status: RefundStatus;
    yocoRefundId: string | null;
    errorReason: string | null;
    createdAt: string;
}

const STATUS_FILTERS: RefundStatus[] = ["ALL", "REQUESTED", "PROCESSING", "COMPLETED", "FAILED"];

const STORE_ICONS = ["storefront", "shopping_bag", "local_mall", "coffee", "fastfood", "fitness_center", "local_cafe"];

function getStoreIcon(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return STORE_ICONS[Math.abs(hash) % STORE_ICONS.length];
}

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function statusStyle(status: RefundStatus) {
    switch (status) {
        case "COMPLETED": return "bg-emerald-500/10 text-emerald-500";
        case "PROCESSING": return "bg-amber-500/10 text-amber-500";
        case "REQUESTED": return "bg-blue-500/10 text-blue-500";
        case "FAILED": return "bg-red-500 text-white";
        default: return "bg-slate-100 text-slate-500";
    }
}

export default function RefundsPage() {
    const [refunds, setRefunds] = useState<RefundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RefundStatus>("ALL");
    const [search, setSearch] = useState("");
    const [retrying, setRetrying] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRefundTxId, setNewRefundTxId] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetch("/api/refunds")
            .then((r) => r.json())
            .then((d) => { setRefunds(d.refunds || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleRetry = async (refundId: string) => {
        setRetrying(refundId);
        await new Promise((r) => setTimeout(r, 1500)); // Simulate retry
        setRefunds((prev) => prev.map((r) => r.id === refundId ? { ...r, status: "PROCESSING" } : r));
        setRetrying(null);
    };

    const handleCreateRefund = () => {
        setShowCreateModal(true);
    };

    const submitCreateRefund = async () => {
        if (!newRefundTxId.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/refunds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionId: newRefundTxId.trim() })
            });
            if (res.ok) {
                const refreshed = await fetch("/api/refunds").then((r) => r.json());
                setRefunds(refreshed.refunds || []);
                setShowCreateModal(false);
                setNewRefundTxId("");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create refund");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setCreating(false);
        }
    };

    const filtered = refunds.filter((r) => {
        const matchFilter = filter === "ALL" || r.status === filter;
        const matchSearch = !search ||
            r.txId.toLowerCase().includes(search.toLowerCase()) ||
            r.storeName.toLowerCase().includes(search.toLowerCase()) ||
            (r.yocoRefundId?.toLowerCase().includes(search.toLowerCase()) ?? false);
        return matchFilter && matchSearch;
    });

    const formatAmt = (cents: number) =>
        `R ${(cents / 100).toFixed(2)}`;

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden flex-col bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                {/* Title Row */}
                <div className="flex items-center justify-between px-4 pt-8 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">payments</span>
                        <h1 className="text-lg font-bold tracking-tight">Refund Ledger</h1>
                    </div>
                    <button onClick={handleCreateRefund} className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Create Refund</span>
                    </button>
                </div>
                {/* Search */}
                <div className="px-4 pb-3">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary text-[20px] transition-colors">search</span>
                        <input
                            className="w-full bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none placeholder-slate-500"
                            placeholder="Search Transaction or Yoco ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                {/* Filter Chips */}
                <div className="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={clsx(
                                "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                                filter === f
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
                            )}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Refund Ledger</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage refund requests</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Desktop search */}
                    <div className="relative group w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary text-[20px] transition-colors">search</span>
                        <input
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-400"
                            placeholder="Search TXN or Yoco ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={handleCreateRefund} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create Refund
                    </button>
                </div>
            </div>

            {/* Desktop Filter Chips */}
            <div className="hidden md:flex gap-2 mb-6">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                            filter === f
                                ? "bg-primary text-white shadow shadow-primary/20"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                        )}
                    >
                        {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between px-4 md:px-0 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Requests</h3>
                <span className="text-xs text-primary font-medium">{loading ? "—" : `${filtered.length} results`}</span>
            </div>

            {/* Refund Cards */}
            <div className="flex flex-col gap-3 px-4 md:px-0">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                            <div className="flex gap-3">
                                <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                            <div className="flex justify-between">
                                <div className="space-y-1">
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                                </div>
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                            </div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-3 block">replay</span>
                        <p className="font-semibold">No refunds found</p>
                        <p className="text-sm mt-1">{search ? "Try a different search term." : "No refunds match this filter."}</p>
                    </div>
                ) : (
                    filtered.map((refund) => (
                        <div
                            key={refund.id}
                            className={clsx(
                                "bg-white dark:bg-slate-900/50 border rounded-xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md",
                                refund.status === "FAILED"
                                    ? "border-slate-200 dark:border-slate-800"
                                    : "border-slate-200 dark:border-slate-800 hover:border-primary/40"
                            )}
                        >
                            {/* Red left border indicator for failed */}
                            {refund.status === "FAILED" && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />
                            )}

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        refund.status === "FAILED" ? "bg-red-500/10" : "bg-primary/10"
                                    )}>
                                        <span className={clsx("material-symbols-outlined", refund.status === "FAILED" ? "text-red-500" : "text-primary")}>
                                            {refund.status === "FAILED" ? "error" : getStoreIcon(refund.storeName)}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{refund.storeName}</h4>
                                        <p className="text-[11px] text-slate-500 font-mono tracking-tight uppercase">
                                            TXN-{refund.txId.substring(0, 5).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", statusStyle(refund.status))}>
                                        {refund.status === "PROCESSING" && (
                                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        )}
                                        {refund.status === "COMPLETED" && (
                                            <span className="size-1.5 rounded-full bg-emerald-500" />
                                        )}
                                        {refund.status.charAt(0) + refund.status.slice(1).toLowerCase()}
                                    </span>
                                    <p className="text-[10px] text-slate-500">{relativeTime(refund.createdAt)}</p>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-3">
                                <div>
                                    {refund.status === "FAILED" ? (
                                        <>
                                            <p className="text-[10px] text-red-400 uppercase font-semibold mb-0.5">
                                                {refund.errorReason || "Refund Failed"}
                                            </p>
                                            <button
                                                onClick={() => handleRetry(refund.id)}
                                                disabled={retrying === refund.id}
                                                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-60"
                                            >
                                                <span className={clsx("material-symbols-outlined text-[14px]", retrying === refund.id && "animate-spin")}>
                                                    {retrying === refund.id ? "progress_activity" : "refresh"}
                                                </span>
                                                {retrying === refund.id ? "Retrying..." : "Retry Request"}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Yoco Refund ID</p>
                                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
                                                {refund.status === "PROCESSING"
                                                    ? <span className="italic text-slate-400">Syncing...</span>
                                                    : refund.status === "REQUESTED"
                                                        ? "Pending Assignment"
                                                        : refund.yocoRefundId ?? "—"}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Refund Amount</p>
                                    <p className="text-lg font-bold">{formatAmt(refund.amount)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB - Manual Override */}
            <div className="fixed bottom-24 right-6 z-40 md:hidden">
                <button className="bg-primary shadow-xl shadow-primary/30 w-14 h-14 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">published_with_changes</span>
                </button>
            </div>
            {/* Create Refund Modal */}
            {showCreateModal && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="fixed bottom-0 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t md:border border-slate-200 dark:border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:w-full md:max-w-md animate-slide-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Create Refund</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Transaction ID</label>
                                <input
                                    autoFocus
                                    value={newRefundTxId}
                                    onChange={(e) => setNewRefundTxId(e.target.value)}
                                    placeholder="Enter ID from the Ledger"
                                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                    disabled={creating}
                                />
                            </div>
                            <button
                                onClick={submitCreateRefund}
                                disabled={creating || !newRefundTxId.trim()}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {creating ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                        Processing...
                                    </>
                                ) : (
                                    "Issue Refund"
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
