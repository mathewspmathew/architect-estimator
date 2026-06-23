import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Pricing service is not yet available. Please integrate a real pricing API to enable this feature." },
            { status: 503 }
        );

    } catch (error) {
        console.error("Price Fetch Error:", error);
        return NextResponse.json({ error: "Failed to process pricing request" }, { status: 500 });
    }
}
