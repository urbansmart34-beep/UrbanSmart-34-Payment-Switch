// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const members = await prisma.teamMember.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({
            members: members.map(m => ({
                id: m.id,
                name: m.name,
                email: m.email,
                role: m.role,
                permissions: JSON.parse(m.permissions),
                initials: m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
                avatarColor: m.role === "Admin" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, email, role, permissions } = await req.json();

        const member = await prisma.teamMember.create({
            data: {
                name,
                email,
                role,
                permissions: JSON.stringify(permissions)
            }
        });

        return NextResponse.json({ member });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, role, permissions } = await req.json();

        const member = await prisma.teamMember.update({
            where: { id },
            data: {
                role,
                permissions: JSON.stringify(permissions)
            }
        });

        return NextResponse.json({ member });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
    }
}
