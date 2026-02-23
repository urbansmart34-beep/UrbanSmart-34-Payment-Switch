"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

interface Store {
    id: string;
    name: string;
    apiKey: string;
    isActive: boolean;
    totalSales: number;
    transactionCount: number;
}

const STORE_ICONS = ["shopping_bag", "fastfood", "fitness_center", "local_cafe", "storefront", "local_pharmacy", "computer", "restaurant"];

function getStoreIcon(name: string) {
    // Deterministic icon from store name
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return STORE_ICONS[Math.abs(hash) % STORE_ICONS.length];
}

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/stores")
            .then((r) => r.json())
            .then((data) => {
                setStores(data.stores || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedKey(id);
            setTimeout(() => setCopiedKey(null), 2000);
        });
    };

    const maskedKey = (key: string) => `••••••••••••${key.slice(-4)}`;

    const filtered = stores.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = stores.filter((s) => s.isActive).length;
    const totalVolume = stores.reduce((sum, s) => sum + s.totalSales, 0);

    return (
        <div className="flex flex-col min-h-full pb-32">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-1 -ml-1">
                        <span className="material-symbols-outlined text-primary">arrow_back_ios</span>
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">Client Stores</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowSearch(!showSearch)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">search</span>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">tune</span>
                    </button>
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Client Stores</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage connected merchant stores</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="Search stores..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link href="/stores/connect" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Add New Store
                    </Link>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="md:hidden px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            autoFocus
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Search stores..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Summary Metrics */}
            <div className="flex gap-4 p-4 overflow-x-auto hide-scrollbar md:px-0">
                <div className="flex min-w-[160px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Active Stores</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold leading-none">{loading ? "—" : activeCount}</p>
                        <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            +{Math.max(0, activeCount - 1)}
                        </span>
                    </div>
                </div>
                <div className="flex min-w-[160px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Volume</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold leading-none">
                            {loading ? "—" : `R ${(totalVolume / 100 / 1000).toFixed(1)}k`}
                        </p>
                        <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">15%</span>
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className="px-4 py-2 flex items-center justify-between md:px-0">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {searchQuery ? `Results (${filtered.length})` : "Integrated Merchants"}
                </h3>
                {!searchQuery && (
                    <span className="flex items-center gap-1 text-primary text-xs font-bold">
                        View All <span className="material-symbols-outlined text-xs">chevron_right</span>
                    </span>
                )}
            </div>

            {/* Store List */}
            <div className="flex flex-col gap-3 px-4 py-2 md:px-0">
                {loading ? (
                    // Skeleton loaders
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="flex gap-3 mb-4">
                                <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-3" />
                            <div className="flex flex-col gap-2">
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                            </div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block">storefront</span>
                        <p className="font-medium">{searchQuery ? "No stores match your search" : "No stores connected yet"}</p>
                        <p className="text-sm mt-1">Add your first merchant store to get started</p>
                    </div>
                ) : (
                    filtered.map((store) => (
                        <Link
                            href={`/analytics/store/${store.id}`}
                            key={store.id}
                            className="flex flex-col gap-4 rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-[0.98] hover:shadow-md cursor-pointer hover:border-primary/30"
                        >
                            {/* Store Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className={clsx(
                                        "size-12 rounded-lg flex items-center justify-center overflow-hidden",
                                        store.isActive ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    )}>
                                        <span className="material-symbols-outlined text-[28px]">{getStoreIcon(store.name)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-base font-bold group-hover:text-primary transition-colors">{store.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {store.id.substring(0, 12).toUpperCase()}</p>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <div className={clsx(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                    store.isActive
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-slate-500/10 text-slate-500"
                                )}>
                                    <span className={clsx("size-1.5 rounded-full", store.isActive ? "bg-emerald-500" : "bg-slate-500")} />
                                    {store.isActive ? "Active" : "Inactive"}
                                </div>
                            </div>

                            {/* Store Details */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">API Key</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                            {maskedKey(store.apiKey)}
                                        </code>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                copyToClipboard(store.apiKey, store.id);
                                            }}
                                            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Copy API Key"
                                        >
                                            <span className="material-symbols-outlined text-sm text-primary">
                                                {copiedKey === store.id ? "check" : "content_copy"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Routing</span>
                                    {store.isActive ? (
                                        <span className="text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                            Yoco Switch
                                            <span className="material-symbols-outlined text-[14px] text-blue-500">verified</span>
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold text-slate-400 italic">Disabled</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Volume</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        R {(store.totalSales / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Mobile FAB: Add New Store */}
            <div className="fixed bottom-24 left-0 right-0 px-4 z-40 pointer-events-none md:hidden">
                <Link href="/stores/connect" className="pointer-events-auto flex w-full h-14 items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">add_circle</span>
                    Add New Store
                </Link>
            </div>
        </div>
    );
}
