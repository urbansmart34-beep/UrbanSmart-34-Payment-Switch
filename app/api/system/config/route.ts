// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");

        if (key) {
            const config = await prisma.systemConfig.findUnique({ where: { key } });
            return NextResponse.json({ value: config ? JSON.parse(config.value) : null });
        }

        const configs = await prisma.systemConfig.findMany();
        const result: Record<string, any> = {};
        configs.forEach(c => {
            try { result[c.key] = JSON.parse(c.value); } catch (_) { result[c.key] = c.value; }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("GET /api/system/config error:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { key, value } = await req.json();
        if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { key, value: JSON.stringify(value) }
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error("POST /api/system/config error:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
