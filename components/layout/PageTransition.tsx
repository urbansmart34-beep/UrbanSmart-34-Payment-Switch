"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * PageTransition
 * Wraps page content and re-triggers the CSS `page-enter` animation
 * on every pathname change by swapping a `key` on the inner div.
 *
 * The animation itself is purely CSS (defined in globals.css), so there
 * are no JS dependencies and it degrades gracefully.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Remove the class instantly to reset the animation, then re-add
        el.classList.remove("page-enter");
        // Force reflow so the browser registers the class removal
        void el.offsetHeight;
        el.classList.add("page-enter");
    }, [pathname]);

    return (
        <div ref={ref} className="page-enter h-full">
            {children}
        </div>
    );
}
