import { NextResponse } from "next/server";

export async function GET() {
    // In a production app, verify admin session here before exposing secret keys
    return NextResponse.json({
        publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY || "pk_test_not_configured",
        secretKey: process.env.YOCO_SECRET_KEY || "sk_test_not_configured",
    });
}
