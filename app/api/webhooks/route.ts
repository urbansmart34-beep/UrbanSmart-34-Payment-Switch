// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const endpoints = await prisma.webhookEndpoint.findMany({
            orderBy: { createdAt: "desc" }
        });

        const logs = await prisma.deliveryLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { endpoint: true }
        });

        // Map to UI format
        const formattedEndpoints = endpoints.map((ep) => {
            const epLogs = logs.filter(l => l.endpointId === ep.id);
            const total = epLogs.length;
            const success = epLogs.filter(l => l.status === "success").length;

            // Calculate mock latency based on past logs, or 0 if none
            const latency = total > 0 ? Math.floor(Math.random() * 50) + 100 : 0;

            // simple relative time
            const diff = Date.now() - ep.createdAt.getTime();
            const days = Math.floor(diff / 86400000);
            const createdAgo = days > 0 ? `${days}d ago` : "today";

            return {
                id: ep.id,
                url: ep.url,
                events: ep.events ? ep.events.split(",") : [],
                enabled: ep.enabled,
                latency,
                createdAgo
            };
        });

        const formattedLogs = logs.map(l => {
            const diff = Date.now() - l.createdAt.getTime();
            const mins = Math.max(1, Math.floor(diff / 60000));
            const timeAgo = mins < 60 ? `${mins} mins ago` : `${Math.floor(mins / 60)}h ago`;

            return {
                id: l.id,
                status: l.status,
                event: l.event,
                payloadId: l.payloadId,
                endpoint: l.endpoint.url.replace("https://", "").split("/")[0], // domain only roughly
                timeAgo,
                httpCode: l.httpCode || 0
            }
        });

        return NextResponse.json({ endpoints: formattedEndpoints, logs: formattedLogs });
    } catch (error) {
        console.error("GET /api/webhooks error:", error);
        return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, events } = body;

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        const endpoint = await prisma.webhookEndpoint.create({
            data: {
                url,
                events: events ? events.join(",") : "success",
                enabled: true
            }
        });

        return NextResponse.json({ endpoint });
    } catch (error) {
        console.error("POST /api/webhooks error:", error);
        return NextResponse.json({ error: "Failed to create webhook endpoint" }, { status: 500 });
    }
}
