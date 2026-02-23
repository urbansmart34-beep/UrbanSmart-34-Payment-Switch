import clsx from "clsx";

interface SummaryCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: string;
}

export function SummaryCard({ title, value, trend, trendUp, icon }: SummaryCardProps) {
    return (
        <div className="flex min-w-[160px] flex-1 flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
            <p
                className={clsx(
                    "text-xs font-semibold flex items-center gap-1",
                    trendUp ? "text-[#0bda5e]" : "text-red-500"
                )}
            >
                <span className="material-symbols-outlined text-xs">
                    {trendUp ? "arrow_upward" : "arrow_downward"}
                </span>{" "}
                {trend}
            </p>
        </div>
    );
}
