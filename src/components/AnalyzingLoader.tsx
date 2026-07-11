"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

const CAPTIONS = [
  "Reticulating trusses...",
  "Consulting the blueprints...",
  "Measuring twice, cutting once...",
  "Estimating rebar tonnage...",
  "Cross-referencing lumber grades...",
  "Checking load-bearing walls...",
  "Calculating cubic meters of concrete...",
  "Sourcing teak and mahogany prices...",
  "Verifying joinery specifications...",
  "Running structural sanity checks...",
  "Auditing the bill of quantities...",
  "Double-checking your dimensions...",
]

// Analysis can take up to 3 minutes; ease the bar toward 92% so it never
// falsely claims completion before the response actually comes back.
const DURATION_MS = 180000
const MAX_SIMULATED_PROGRESS = 92

export function AnalyzingLoader() {
  const [progress, setProgress] = useState(0)
  const [captionIndex, setCaptionIndex] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const eased = MAX_SIMULATED_PROGRESS * (1 - Math.exp(-elapsed / (DURATION_MS / 3)))
      setProgress(Math.min(eased, MAX_SIMULATED_PROGRESS))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((i) => (i + 1) % CAPTIONS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8 text-center">
      <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />

      <div className="w-full max-w-sm mx-auto h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p
        key={captionIndex}
        className="mt-4 text-sm text-muted-foreground animate-in fade-in duration-500"
      >
        {CAPTIONS[captionIndex]}
      </p>
    </div>
  )
}
