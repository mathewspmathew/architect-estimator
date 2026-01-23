import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.warn("No Google API Key found. Returning mock data.");
            // Fallback for demo if no key
            return NextResponse.json({
                materials: [
                    { id: "mock1", name: "Solid Oak Wood (Mock)", quantity: 2, unit: "planks", price: 0, availableSources: [] },
                    { id: "mock2", name: "Stainless Steel Screws", quantity: 12, unit: "pcs", price: 0, availableSources: [] }
                ]
            });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64Image = buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert architectural estimator. Analyze this image of a furniture or architectural element.
      Identify every single raw material required to build it.
      For each material estimate the quantity and unit (e.g., "4 legs", "2 sq meters", "1 liter").
      
      Return ONLY valid JSON with this structure:
      {
        "materials": [
          {
            "id": "generate_unique_string_id",
            "name": "Material Name (e.g. Teak Wood, Glass)",
            "quantity": number,
            "unit": "string (e.g. pcs, m2, kg)",
            "price": 0,
            "availableSources": []
          }
        ]
      }
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

        let result;
        let attempt = 0;
        const maxRetries = 3;

        while (attempt < maxRetries) {
            try {
                result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: file.type,
                        },
                    },
                ]);
                break; // Success
            } catch (e: any) {
                attempt++;
                if (attempt >= maxRetries || !e.message?.includes("503")) {
                    throw e; // Rethrow if max retries reached or different error
                }
                console.warn(`Model overloaded, retrying attempt ${attempt}...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        if (!result) {
            throw new Error("Failed to generate content after retries");
        }

        const response = await result.response;
        const text = response.text();

        // basic cleanup if model adds markdown
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(jsonString);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw text:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

    } catch (error) {
        console.error("Analysis Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
