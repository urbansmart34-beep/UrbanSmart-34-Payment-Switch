export function PerformanceChart() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const heights = ['h-1/2', 'h-3/4', 'h-2/5', 'h-full', 'h-2/3', 'h-1/4', 'h-1/3'];
    const containerHeights = ['h-12', 'h-28', 'h-16', 'h-32', 'h-24', 'h-8', 'h-10'];

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-white text-base font-bold">Weekly Performance</h3>
                <p className="text-primary text-xs font-semibold">Last 7 Days</p>
            </div>
            <div className="flex items-end justify-between h-40 px-2 gap-2 mt-auto">
                {days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <div
                            className={`w-full bg-slate-100 dark:bg-slate-700 rounded-full relative overflow-hidden ${containerHeights[i]} transition-all group-hover:bg-primary/20`}
                        >
                            <div
                                className={`absolute bottom-0 w-full bg-primary${['S', 'S'].includes(day) && i > 4 ? '/30' : i === 0 ? '/40' : ''
                                    } rounded-full ${heights[i]}`}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
