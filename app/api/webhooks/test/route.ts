import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
        }

        // Generate a mock Yoco charge.succeeded payload
        const payload = {
            id: "evt_ping_" + Math.random().toString(36).substring(7),
            type: "ping",
            createdDate: new Date().toISOString(),
            payload: {
                message: "Test connection successful from UrbanSmart-34 Payment Switch",
                timestamp: Date.now()
            }
        };

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "UrbanSmart-Webhook-Dispatcher/1.0",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Endpoint responded with status: ${res.status}` },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: true, message: "Ping delivered successfully" });
    } catch (error: any) {
        console.error("Webhook Live Ping Error:", error.message);
        return NextResponse.json(
            { error: `Failed to reach endpoint: ${error.message}` },
            { status: 500 }
        );
    }
}
