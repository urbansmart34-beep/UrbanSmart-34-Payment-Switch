"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navGroups = [
    {
        title: "Core Dashboard",
        items: [
            { name: "Overview", href: "/", icon: "grid_view" },
            { name: "Transactions", href: "/transactions", icon: "receipt_long" },
            { name: "Ledger & Export", href: "/ledger", icon: "account_balance_wallet" },
        ]
    },
    {
        title: "Store Management",
        items: [
            { name: "Connected Stores", href: "/stores", icon: "storefront" },
            { name: "Performance", href: "/analytics", icon: "monitoring" },
        ]
    },
    {
        title: "Operations",
        items: [
            { name: "Refunds", href: "/refunds", icon: "replay" },
            { name: "Fraud Detection", href: "/fraud", icon: "security" },
            { name: "Reconciliation", href: "/reconciliation", icon: "fact_check" },
        ]
    },
    {
        title: "System",
        items: [
            { name: "System Health", href: "/system/health", icon: "vital_signs" },
            { name: "Circuit Breakers", href: "/system/circuit-breakers", icon: "toggle_on" },
        ]
    },
    {
        title: "Settings",
        items: [
            { name: "Settings", href: "/settings", icon: "settings", exact: true },
            { name: "API Config", href: "/settings/api", icon: "api" },
            { name: "Team", href: "/settings/team", icon: "group" },
            { name: "Webhooks", href: "/settings/webhooks", icon: "webhook" },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 overflow-y-auto">
            <div className="p-6 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent leading-none">
                            URBANSMART-34
                        </h1>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Payment SWITCH</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 pb-6 space-y-6">
                {navGroups.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="px-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = (item as { exact?: boolean }).exact
                                    ? pathname === item.href
                                    : pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                        )}
                                    >
                                        <span className={clsx("material-symbols-outlined text-[20px]", isActive ? "fill-1" : "")}>
                                            {item.icon}
                                        </span>
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="font-semibold text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
