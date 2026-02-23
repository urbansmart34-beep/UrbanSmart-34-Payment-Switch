import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { PageTransition } from "./PageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-screen">
                {/* Dynamic Island / Spacer for Mobile handled directly via header padding */}

                <main className="flex-1 overflow-y-auto hide-scrollbar pb-24 md:pb-0 md:p-8">
                    <div className="md:max-w-7xl md:mx-auto w-full md:h-full">
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
