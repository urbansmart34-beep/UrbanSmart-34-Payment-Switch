import Link from "next/link";

interface SettingsSection {
    href: string;
    icon: string;
    iconBg: string;
    title: string;
    description: string;
    badge?: string;
    badgeColor?: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
    {
        href: "/settings/api",
        icon: "key",
        iconBg: "bg-primary/10 text-primary",
        title: "API & Security",
        description: "Manage API credentials, webhook URLs, IP whitelisting, and enforce security policies.",
        badge: "Production",
        badgeColor: "bg-emerald-500/10 text-emerald-500",
    },
    {
        href: "/settings/team",
        icon: "group",
        iconBg: "bg-violet-500/10 text-violet-500",
        title: "Team & Access",
        description: "Invite members, assign roles, and control who has access to the payment switch.",
    },
    {
        href: "/settings/webhooks",
        icon: "webhook",
        iconBg: "bg-amber-500/10 text-amber-500",
        title: "Webhooks",
        description: "Configure and test event-driven endpoints for payment notifications and alerts.",
    },
];

const QUICK_LINKS = [
    { label: "View API Docs", icon: "description", href: "/settings/api" },
    { label: "Regenerate Keys", icon: "autorenew", href: "/settings/api" },
    { label: "Invite Member", icon: "person_add", href: "/settings/team" },
];

export default function SettingsIndexPage() {
    return (
        <div className="flex flex-col min-h-full">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex md:hidden items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-8 pb-4">
                <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:block mb-8">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Configuration</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your payment switch configuration, credentials, and team access.</p>
            </div>

            <main className="flex-1 pb-24 md:pb-8 space-y-8">

                {/* Main Settings Cards */}
                <section>
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-0">Configuration Areas</p>
                    <p className="md:hidden text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-4">Configuration Areas</p>

                    <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 md:divide-none md:gap-3">
                        {SETTINGS_SECTIONS.map((section) => (
                            <Link
                                key={section.href}
                                href={section.href}
                                className="group flex items-center gap-4 px-4 md:px-5 py-4 md:py-5 bg-white dark:bg-slate-900/50 md:border md:border-slate-200 dark:md:border-slate-800 md:rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-md transition-all"
                            >
                                {/* Icon */}
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${section.iconBg} transition-transform group-hover:scale-105`}>
                                    <span className="material-symbols-outlined text-[24px]">{section.icon}</span>
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</p>
                                        {section.badge && (
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-tighter ${section.badgeColor}`}>
                                                {section.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{section.description}</p>
                                </div>

                                {/* Arrow */}
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0">
                                    chevron_right
                                </span>
                            </Link>
                        ))}
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
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">URBANSMART-34 Payment SWITCH</p>
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
