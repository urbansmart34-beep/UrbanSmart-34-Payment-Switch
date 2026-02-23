import Link from "next/link";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { PerformanceChart } from "@/components/ui/PerformanceChart";
import { TransactionList } from "@/components/ui/TransactionList";
import { getDashboardStats } from "@/app/actions";

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      {/* Header (Mobile Only) */}
      <header className="flex md:hidden items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight dark:text-white">Platform Overview</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold">Payment Switch Active</p>
            </div>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
        </button>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, Administrator</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span>Last 7 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Quick Actions (Mobile + Desktop) */}
      <section className="flex gap-3">
        <Link href="/settings/api" className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-[20px]">key</span>
          Generate API Key
        </Link>
        <Link href="/analytics" className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
          View Reports
        </Link>
      </section>

      {/* Summary Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Sales"
          value={(stats.totalSales / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" })}
          trend="+12.5%"
          trendUp={true}
          icon="trending_up"
        />
        <SummaryCard
          title="Transactions"
          value={stats.transactionCount.toLocaleString()}
          trend="+5.2%"
          trendUp={true}
          icon="swap_horiz"
        />
        <SummaryCard
          title="Active Stores"
          value={stats.activeStores.toString()}
          trend="+0"
          trendUp={true}
          icon="storefront"
        />
        <SummaryCard
          title="Refund Rate"
          value={`${stats.refundRate.toFixed(1)}%`}
          trend="-0.3%"
          trendUp={false}
          icon="assignment_return"
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Section - 2 cols on desktop */}
        <div className="md:col-span-2 min-h-[280px]">
          <PerformanceChart />
        </div>

        {/* Recent Transactions - 1 col on desktop */}
        <div className="md:col-span-1 min-h-[280px]">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white text-base font-bold">Recent Transactions</h3>
              <Link href="/transactions" className="text-primary text-sm font-bold hover:underline">View All</Link>
            </div>
            <TransactionList transactions={stats.recentTransactions} />
          </div>
        </div>
      </section>
    </div>
  );
}

