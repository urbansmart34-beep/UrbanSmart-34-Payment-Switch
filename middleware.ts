import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Only enforce rules on the payment processing endpoint to avoid locking out the dashboard
    if (request.nextUrl.pathname.startsWith('/api/process-payment')) {
        try {
            // Fetch the API settings config from our own internal route
            const configRes = await fetch(new URL('/api/system/config?key=api_settings', request.url));
            if (configRes.ok) {
                const { value: config } = await configRes.json();

                if (config && config.toggles) {
                    const enforceHttps = config.toggles.find((t: any) => t.id === 'https')?.enabled;
                    const enforceIp = config.toggles.find((t: any) => t.id === 'ip')?.enabled;

                    // 1. Enforce HTTPS
                    if (enforceHttps && process.env.NODE_ENV === 'production') {
                        const proto = request.headers.get('x-forwarded-proto') || 'http';
                        if (proto !== 'https') {
                            return NextResponse.json(
                                { error: "HTTPS is strictly enforced by API security policy" },
                                { status: 403 }
                            );
                        }
                    }

                    // 2. IP Whitelisting
                    if (enforceIp && config.ips && config.ips.length > 0) {
                        const clientIp = (request as any).ip || request.headers.get('x-forwarded-for') || "127.0.0.1";
                        // Basic check across the comma-separated forwarded-for list if necessary
                        const ipList = clientIp.split(',').map((ip: string) => ip.trim());

                        const isAllowed = ipList.some((ip: string) => config.ips.includes(ip));

                        if (!isAllowed && clientIp !== "127.0.0.1" && clientIp !== "::1") {
                            return NextResponse.json(
                                { error: "IP address not authorized to call this API" },
                                { status: 403 }
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Middleware config fetch error:", error);
            // Non-blocking fail-open for internal config fetch errors
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/process-payment/:path*',
};
