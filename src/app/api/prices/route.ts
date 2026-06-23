import { NextRequest, NextResponse } from "next/server";
import { PriceSource } from "@/types";

const mockPrices: { [key: string]: PriceSource[] } = {
    "teak wood": [
        { id: "1", source: "HomeDepot", price: 450, currency: "INR", url: "https://homedepot.com", logo: "🏢" },
        { id: "2", source: "Amazon", price: 480, currency: "INR", url: "https://amazon.com", logo: "📦" },
    ],
    "steel": [
        { id: "3", source: "IndiaMART", price: 280, currency: "INR", url: "https://indiamart.com", logo: "🏭" },
        { id: "4", source: "Flipkart", price: 320, currency: "INR", url: "https://flipkart.com", logo: "🛒" },
    ],
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Return mock prices based on query
        const key = query.toLowerCase();
        let prices = mockPrices[key];

        if (!prices) {
            // Generate random mock prices for unknown materials
            prices = [
                {
                    id: "1",
                    source: "Online Marketplace",
                    price: Math.floor(Math.random() * 500) + 100,
                    currency: "INR",
                    url: "https://example.com",
                    logo: "🛍️"
                },
                {
                    id: "2",
                    source: "Local Supplier",
                    price: Math.floor(Math.random() * 500) + 100,
                    currency: "INR",
                    url: "https://example.com",
                    logo: "🏪"
                }
            ];
        }

        return NextResponse.json({ prices });

    } catch (error) {
        console.error("Price Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
    }
}
