"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
    { name: "Home", href: "/", icon: "grid_view", fill: true },
    { name: "Ledger", href: "/ledger", icon: "account_balance_wallet", fill: false },
    { name: "Refunds", href: "/refunds", icon: "replay", fill: false },
    { name: "Stores", href: "/stores", icon: "storefront", fill: false },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 pb-6 pt-2">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 group transition-colors",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <div
                                className={clsx(
                                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                                    isActive ? "bg-primary/10" : "bg-transparent"
                                )}
                            >
                                <span className={clsx("material-symbols-outlined", item.fill && isActive ? "fill-1" : "")}>
                                    {item.icon}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold">{item.name}</p>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
