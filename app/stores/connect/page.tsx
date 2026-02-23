"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

type Step = 1 | 2 | 3;

export default function StoreConnectionWizard() {
    const [step, setStep] = useState<Step>(1);
    const [integrationMethod, setIntegrationMethod] = useState<"inline" | "popup" | null>(null);

    return (
        <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display pb-32">
            {/* Header / Top App Bar */}
            <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : window.history.back()}
                        className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Connect Store</h1>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>

                {/* Progress Indicator */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col items-center gap-2">
                            <div className={clsx("h-2 w-12 rounded-full", step >= 1 ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}></div>
                            <span className={clsx("text-[10px] font-bold uppercase tracking-wider", step >= 1 ? "text-primary" : "text-slate-400")}>Details</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={clsx("h-2 w-12 rounded-full", step >= 2 ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}></div>
                            <span className={clsx("text-[10px] font-bold uppercase tracking-wider", step >= 2 ? "text-primary" : "text-slate-400")}>Method</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={clsx("h-2 w-12 rounded-full", step >= 3 ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}></div>
                            <span className={clsx("text-[10px] font-bold uppercase tracking-wider", step >= 3 ? "text-primary" : "text-slate-400")}>Connect</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 px-4 py-6 flex flex-col gap-8">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {/* Step 1 Title & Description */}
                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Store Details</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Provide your store information to route transactions to Yoco via the payment switch.</p>
                        </section>

                        {/* Form Fields */}
                        <div className="flex flex-col gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Store Name</label>
                                <div className="relative group">
                                    <input
                                        className="w-full h-14 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-base"
                                        placeholder="e.g. Acme Coffee Roasters"
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Store URL</label>
                                <div className="relative group flex items-center">
                                    <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                                        <span className="material-symbols-outlined text-xl">language</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-base"
                                        placeholder="https://myshopify.com"
                                        type="url"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Merchant Store ID</label>
                                <div className="relative group flex items-center">
                                    <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                                        <span className="material-symbols-outlined text-xl">fingerprint</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-base"
                                        placeholder="ST-8329-XP"
                                        type="text"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 ml-1 leading-relaxed italic">
                                    The internal identifier used for transaction mapping in your database.
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full"></div>

                        {/* Secondary Step Sneak-Peak */}
                        <section className="opacity-60 grayscale pointer-events-none scale-[0.98]">
                            <h3 className="text-lg font-bold mb-4">Select Integration Method</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 flex flex-col gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                                    <div>
                                        <p className="font-bold text-sm">Inline SDK</p>
                                        <p className="text-[10px] text-slate-400">Embedded Form</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-3xl">open_in_new</span>
                                    <div>
                                        <p className="font-bold text-sm">Popup Mode</p>
                                        <p className="text-[10px] text-slate-400">Hosted Overlay</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Integration Method</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Choose how you want to present the Yoco payment form to your customers.</p>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIntegrationMethod("inline")}
                                className={clsx(
                                    "p-5 rounded-xl border-2 flex flex-col items-center text-center gap-3 transition-all",
                                    integrationMethod === "inline"
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50"
                                )}
                            >
                                <span className={clsx("material-symbols-outlined text-4xl", integrationMethod === "inline" ? "text-primary" : "text-slate-400")}>terminal</span>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Inline SDK</p>
                                    <p className="text-xs text-slate-500 mt-1">Embedded directly in your checkout flow.</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setIntegrationMethod("popup")}
                                className={clsx(
                                    "p-5 rounded-xl border-2 flex flex-col items-center text-center gap-3 transition-all",
                                    integrationMethod === "popup"
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50"
                                )}
                            >
                                <span className={clsx("material-symbols-outlined text-4xl", integrationMethod === "popup" ? "text-primary" : "text-slate-400")}>open_in_new</span>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Popup Mode</p>
                                    <p className="text-xs text-slate-500 mt-1">Managed overlay hosted by the gateway.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in zoom-in-95 duration-500 space-y-8 text-center mt-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                        </div>
                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Store Connected!</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm px-4">Your store is now authorized to route transactions through the Switch.</p>
                        </section>

                        <div className="text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Publishable Key</span>
                                <span className="material-symbols-outlined text-sm text-slate-400 cursor-pointer hover:text-primary transition-colors">content_copy</span>
                            </div>
                            <code className="text-xs font-mono text-primary break-all bg-primary/5 p-2 rounded block">pk_test_ed3c54a6gO...</code>
                        </div>

                        {/* SDK Snippet Mock */}
                        <div className="text-left bg-slate-950 p-4 rounded-xl overflow-hidden mt-4 border border-slate-800 shadow-inner">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <pre className="text-[11px] text-slate-300 font-mono leading-loose overflow-x-auto hide-scrollbar">
                                <span className="text-blue-400">&lt;script&gt;</span>{'\n'}
                                {'  '}<span className="text-purple-400">const</span> yoco = <span className="text-amber-400">new</span> <span className="text-emerald-400">YocoSDK</span>({'{'}{'\n'}
                                {'    '}publicKey: <span className="text-orange-400">'pk_test_...'</span>,{'\n'}
                                {'    '}storeId: <span className="text-orange-400">'ST-8329-XP'</span>{'\n'}
                                {'  '}{'}'});{'\n'}
                                <span className="text-blue-400">&lt;/script&gt;</span>
                            </pre>
                        </div>
                    </div>
                )}
            </main>

            {/* Fixed Footer Action Area */}
            <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50">
                {step < 3 ? (
                    <button
                        onClick={() => setStep((s) => (s + 1) as Step)}
                        disabled={step === 2 && !integrationMethod}
                        className="w-full h-14 bg-primary disabled:bg-slate-300 disabled:dark:bg-slate-800 disabled:text-slate-500 border border-transparent disabled:dark:border-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:shadow-none"
                    >
                        {step === 1 ? "Continue to Method" : "Complete Setup"}
                        <span className="material-symbols-outlined">{step === 1 ? "arrow_forward" : "done"}</span>
                    </button>
                ) : (
                    <Link
                        href="/stores"
                        className="w-full h-14 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        Return to Stores
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                )}

                {/* Helper link */}
                <div className="mt-4 text-center">
                    <a className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">
                        Need help setting up your store? View docs
                    </a>
                </div>
            </div>
        </div>
    );
}
