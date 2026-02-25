export default function RoutingEnginePage() {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Smart Routing Engine</h2>
                        <div className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                            System Active
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">history</span>
                            Audit Log
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20 text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Rule
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-white dark:bg-[#161920] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                            </div>
                            <span className="flex items-center text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">+0.5%</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Global Success Rate</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">98.4%</h3>
                    </div>
                    {/* Stat Card 2 */}
                    <div className="bg-white dark:bg-[#161920] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-blue-500">leaderboard</span>
                            </div>
                            <span className="flex items-center text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full">Top Vol</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Top Provider</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">North</h3>
                    </div>
                    {/* Stat Card 3 */}
                    <div className="bg-white dark:bg-[#161920] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-purple-500">bolt</span>
                            </div>
                            <span className="flex items-center text-purple-500 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded-full">+12ms</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Avg. Latency</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">142ms</h3>
                    </div>
                    {/* Stat Card 4 */}
                    <div className="bg-white dark:bg-[#161920] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-orange-500">sync_problem</span>
                            </div>
                            <span className="flex items-center text-orange-500 text-xs font-bold bg-orange-500/10 px-2 py-1 rounded-full">-0.1%</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Failed Failovers</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0.2%</h3>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Rules Section (Left) */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Routing Rules</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Sort by:</span>
                                <select className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer">
                                    <option>Priority</option>
                                    <option>Name</option>
                                    <option>Created Date</option>
                                </select>
                            </div>
                        </div>

                        {/* Rule Card 1 */}
                        <div className="group bg-white dark:bg-[#161920] rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-primary/50 transition-all shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <span className="material-symbols-outlined">drag_indicator</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">High Value Visa Transactions</h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">High Priority</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Rule ID: #RT-2941 • Updated 2h ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">pause</span>
                                    </button>
                                </div>
                            </div>
                            {/* Logic Builder Visualization */}
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-100 dark:border-slate-800/50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">IF</span>
                                <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Card Type is <span className="text-primary">Visa</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">AND</span>
                                <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Amount &gt; <span className="text-primary">5,000 ZAR</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">THEN</span>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded border border-primary/20 text-sm font-medium text-primary">
                                    <span>Route to</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                                        Yoco
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rule Card 2 */}
                        <div className="group bg-white dark:bg-[#161920] rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-primary/50 transition-all shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <span className="material-symbols-outlined">drag_indicator</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">International Amex Routing</h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Medium Priority</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Rule ID: #RT-8821 • Updated 1d ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">pause</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-100 dark:border-slate-800/50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">IF</span>
                                <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Card Type is <span className="text-primary">Amex</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">AND</span>
                                <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Region is <span className="text-primary">Non-ZA</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">THEN</span>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded border border-primary/20 text-sm font-medium text-primary">
                                    <span>Route to</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">public</span>
                                        Stripe
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rule Card 3 */}
                        <div className="group bg-white dark:bg-[#161920] rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-primary/50 transition-all shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <span className="material-symbols-outlined">drag_indicator</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Micro-Transaction Optimization</h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">Optimization</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Rule ID: #RT-1102 • Updated 3d ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">pause</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-100 dark:border-slate-800/50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">IF</span>
                                <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Amount &lt; <span className="text-primary">100 ZAR</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">THEN</span>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded border border-primary/20 text-sm font-medium text-primary">
                                    <span>Route to</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">account_balance</span>
                                        North
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Failover Sidebar (Right) */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white dark:bg-[#161920] p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-fit sticky top-0">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Default Failover Logic</h3>
                                <button className="text-xs text-primary font-semibold hover:underline">Edit</button>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">If no rules match, transactions will attempt gateways in this order:</p>

                            <div className="relative pl-4 border-l-2 border-dashed border-slate-300 dark:border-slate-700 space-y-6">
                                {/* Step 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-[#161920]"></div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-600">
                                                N
                                            </div>
                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">North</span>
                                        </div>
                                        <span className="text-xs text-slate-400">Primary</span>
                                    </div>
                                </div>
                                {/* Step 2 */}
                                <div className="relative">
                                    <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-[#161920]"></div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-600">
                                                Y
                                            </div>
                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">Yoco</span>
                                        </div>
                                        <span className="text-xs text-slate-400">Retry 1</span>
                                    </div>
                                </div>
                                {/* Step 3 */}
                                <div className="relative">
                                    <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-[#161920]"></div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-600">
                                                S
                                            </div>
                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">Stripe</span>
                                        </div>
                                        <span className="text-xs text-slate-400">Retry 2</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Gateway Health</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            North
                                        </div>
                                        <span className="font-mono text-slate-900 dark:text-slate-200">100%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Yoco
                                        </div>
                                        <span className="font-mono text-slate-900 dark:text-slate-200">99.8%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            Stripe
                                        </div>
                                        <span className="font-mono text-slate-900 dark:text-slate-200">94.2%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="w-full h-32 rounded-lg bg-slate-800 overflow-hidden relative" style={{ backgroundImage: "linear-gradient(to bottom right, #1e293b, #0f172a)" }}>
                                    {/* Decorative graph bars simulating volume */}
                                    <div className="absolute bottom-0 left-2 w-2 h-10 bg-primary/40 rounded-t"></div>
                                    <div className="absolute bottom-0 left-6 w-2 h-16 bg-primary/60 rounded-t"></div>
                                    <div className="absolute bottom-0 left-10 w-2 h-8 bg-primary/30 rounded-t"></div>
                                    <div className="absolute bottom-0 left-14 w-2 h-20 bg-primary/80 rounded-t"></div>
                                    <div className="absolute bottom-0 left-18 w-2 h-12 bg-primary/50 rounded-t"></div>
                                    <div className="absolute bottom-0 left-22 w-2 h-24 bg-primary rounded-t"></div>
                                    <div className="absolute bottom-0 left-26 w-2 h-14 bg-primary/60 rounded-t"></div>
                                    <div className="absolute bottom-0 left-30 w-2 h-6 bg-primary/20 rounded-t"></div>
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-slate-300">Live Traffic Volume</p>
                                        <p className="text-lg font-bold text-white">2.4k <span className="text-xs font-normal text-slate-400">/min</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
