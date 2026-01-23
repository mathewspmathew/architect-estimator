import { NextRequest, NextResponse } from "next/server";
import { ScraperService } from "@/lib/scraper";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const scraper = new ScraperService();
        const prices = await scraper.scrapeGoogleShopping(query);

        return NextResponse.json({ prices });

    } catch (error) {
        console.error("Price Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
    }
}
