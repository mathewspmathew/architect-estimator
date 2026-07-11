import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 20,
              backgroundColor: "#3b82f6",
              fontSize: 48,
            }}
          >
            🔨
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#fafafa" }}>
            ArchEstimator
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#a1a1aa", textAlign: "center" }}>
          From Sketch to Cost. In Seconds.
        </div>
      </div>
    ),
    { ...size }
  )
}
