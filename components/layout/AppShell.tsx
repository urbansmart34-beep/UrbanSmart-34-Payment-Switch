import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopHeader } from "./TopHeader";
import { PageTransition } from "./PageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden">
            <TopHeader />
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar pb-24 md:pb-0">
                    <div className="w-full h-full">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <BottomNav />
            </div>
        </div>
    );
}
