"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopHeader() {
    const pathname = usePathname();

    return (
        <header className="flex items-stretch justify-between whitespace-nowrap border-b border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark shrink-0 z-30 sticky top-0 h-16">
            <div className="hidden md:flex items-center w-64 border-r border-[#1e293b] dark:border-border-dark bg-[#0f172a] dark:bg-card-dark px-6 py-4 shrink-0">
                <div className="h-8 w-40 flex items-center justify-start shrink-0">
                    <img src="/logo.png" alt="UrbanSmart Logo" className="w-full h-full object-contain object-left" />
                </div>
            </div>

            <div className="flex flex-1 items-center justify-between px-6 py-3">
                <div className="md:hidden flex items-center gap-3 text-slate-900 dark:text-white">
                    <div className="h-8 w-32 shrink-0 flex items-center justify-center">
                        <img src="/logo.png" alt="UrbanSmart Logo" className="w-full h-full object-contain object-left" />
                    </div>
                </div>

                {/* Spacer to push everything to the right */}
                <div className="flex-1 hidden md:block"></div>

                <div className="flex items-center gap-4 lg:gap-6">
                    <label className="hidden md:flex flex-col !h-8 w-48 lg:w-64">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-card-dark overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
                            <div className="text-text-secondary flex items-center justify-center pl-3">
                                <span className="material-symbols-outlined text-[18px]">search</span>
                            </div>
                            <input className="w-full bg-transparent border-none focus:ring-0 text-xs px-2 text-slate-900 dark:text-white placeholder:text-text-secondary h-full focus:outline-none" placeholder="Search..." />
                            <div className="flex items-center pr-2">
                                <kbd className="hidden lg:inline-flex items-center rounded border border-slate-300 dark:border-border-dark bg-slate-100 dark:bg-[#252b3b] px-1.5 font-mono text-[10px] font-medium text-text-secondary">⌘K</kbd>
                            </div>
                        </div>
                    </label>

                    <nav className="hidden lg:flex items-center gap-6">
                        <Link href="/" className={clsx("transition-colors text-sm font-medium leading-normal", pathname === "/" ? "text-primary" : "text-text-secondary hover:text-primary")}>Dashboard</Link>
                        <Link href="/transactions" className={clsx("transition-colors text-sm font-medium leading-normal", pathname === "/transactions" ? "text-primary" : "text-text-secondary hover:text-primary")}>Transactions</Link>
                        <Link href="/routing" className={clsx("transition-colors text-sm font-medium leading-normal", pathname === "/routing" ? "text-primary" : "text-text-secondary hover:text-primary")}>Routing</Link>
                        <Link href="/docs" className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium leading-normal border", pathname === "/docs" ? "text-white bg-card-dark border-border-dark" : "text-text-secondary border-transparent hover:text-primary")}>Developers</Link>
                    </nav>
                    <div className="h-6 w-px bg-slate-200 dark:bg-border-dark hidden lg:block"></div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button className="relative text-text-secondary hover:text-slate-900 dark:hover:text-white">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border border-border-dark" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDt6g7j5cOTAFHQdSodaXoj4Cjs8m3wg1oYsSNIoKdxkiSTdbU1BJZTqDeDtcsckQ7mgfiNYcodVW9yS3KP-f83q0fsfDGsseMnsSXlt6peMoag2rjmeGxjqVG5p8jG2Wi6F5r5k2Ft0PqaYe9UAVox6Ejf9qF88LuH0DZw8DLGgKscdeX1DXBqVzBZbrUopUtTKb6Ld2kc2LC9DhfxLnnU0EJeRCy1WBJLwKx7mV83e_CGSOrC6S3q5tzL7Sxq_WQ__jn6ZZrwTdM")' }}></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
