import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { rateLimiter } from "@/lib/rate-limiter";
import { validateImageBuffer } from "@/lib/image-validation";

function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0].trim() || "0.0.0.0";
}

function getAIClient() {
    const projectId = process.env.NEXT_VERTEX_PROJECT_ID;
    const privateKeyBase64 = process.env.GCP_PRIVATE_KEY_BASE64;

    if (!projectId || !privateKeyBase64) {
        throw new Error("Missing Vertex AI credentials (NEXT_VERTEX_PROJECT_ID or GCP_PRIVATE_KEY_BASE64)");
    }

    const credentialsData = JSON.parse(Buffer.from(privateKeyBase64, 'base64').toString('utf-8'));

    const ai = new GoogleGenAI({
        enterprise: true,
        project: projectId,
        location: 'us-central1',
        googleAuthOptions: {
            credentials: credentialsData
        }
    });

    return ai;
}

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIP(req);

        if (!rateLimiter.check(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Max 5 analyses per 10 minutes." },
                { status: 429 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const validation = validateImageBuffer(buffer);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 413 }
            );
        }

        const base64Image = buffer.toString("base64");

        const ai = getAIClient();

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

        let response;
        let attempt = 0;
        const maxRetries = 3;

        while (attempt < maxRetries) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: file.type,
                                        data: base64Image,
                                    },
                                },
                            ],
                        }
                    ],
                });
                break;
            } catch (e: any) {
                attempt++;
                if (attempt >= maxRetries || !e.message?.includes("503")) {
                    throw e;
                }
                console.warn(`Model overloaded, retrying attempt ${attempt}...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        if (!response) {
            throw new Error("Failed to generate content after retries");
        }

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
            console.error("Empty response from Gemini API");
            return NextResponse.json({ error: "Gemini API returned empty response" }, { status: 500 });
        }

        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(jsonString);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw response text:", text);
            console.error("Cleaned JSON string:", jsonString);
            return NextResponse.json({
                error: "Failed to parse AI response - invalid JSON format from model",
                details: parseError instanceof Error ? parseError.message : "Unknown error"
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Analysis Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
