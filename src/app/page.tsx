"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { ImageUploader } from "@/components/ImageUploader"
import { MaterialList } from "@/components/MaterialList"
import { Material } from "@/types"
import { Button } from "@/components/ui/button"
import { Calculator, Hammer, ArrowRight, AlertCircle, RefreshCw } from "lucide-react"

const PENDING_IMAGE_KEY = "archestimator:pendingImage"

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}

export default function Home() {
  const { data: session, status } = useSession()
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)

  const refreshCredits = useCallback(async () => {
    if (status !== "authenticated") return
    const res = await fetch("/api/credits")
    if (res.ok) {
      const data = await res.json()
      setCredits(data.credits)
    }
  }, [status])

  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  // Restore the image that was selected right before a Google sign-in
  // redirect wiped React state (a File can't survive a full navigation).
  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_IMAGE_KEY)
    if (!pending) return
    sessionStorage.removeItem(PENDING_IMAGE_KEY)
    dataUrlToFile(pending, "drawing.png").then(setSelectedImage).catch(() => {})
  }, [])

  const handleSignInWithImage = async () => {
    if (selectedImage) {
      try {
        const dataUrl = await fileToDataUrl(selectedImage)
        sessionStorage.setItem(PENDING_IMAGE_KEY, dataUrl)
      } catch {
        // Image too large for sessionStorage or read failed — proceed without persisting it.
      }
    }
    signIn("google")
  }

  const handleImageSelect = async (file: File | null) => {
    setSelectedImage(file)
    if (file) {
      // Auto-analyze or wait for user?
      // "Click 'Analyze' to proceed" text in Uploader suggests manual trigger, but I'll make it seamless eventually.
      // For now, let's have a button if not auto.
      // Actually, ImageUploader purely selects. We can have a "Analyze" button below it or inside it.
      // The current ImageUploader draft has a hover overlay saying "Click 'Analyze'". 
      // I'll add the Analyze button in the main page flow between the two components.
    } else {
      setMaterials([])
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage || status !== "authenticated") return
    setIsAnalyzing(true)

    // TODO: reliable formData send to API
    // For MVP User verification, I'll simulate a delay then set mock data if API fails or isn't built yet.
    // I will replace this with real fetch in the next step.

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes for image analysis

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId))

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data.materials)) {
          setMaterials(data.materials)
          setError(null)
        } else {
          console.error("Unexpected analyze response shape:", data)
          setMaterials([])
          setError("Couldn't read the analysis result. Please try again.")
          setTimeout(() => setError(null), 5000)
        }
      } else {
        const errorData = await response.json();
        console.error("Analysis failed:", errorData.error);

        if (response.status === 429) {
          setError("Too many requests. Please wait 10 minutes before trying again.")
          setTimeout(() => setError(null), 10000)
        } else if (response.status === 402) {
          setError("You're out of free credits.")
        } else {
          setError(errorData.error || "Analysis failed. Please try again.")
          setTimeout(() => setError(null), 5000)
        }
      }
      refreshCredits()
    } catch (e) {
      console.error(e)
      if (e instanceof Error && e.name === 'AbortError') {
        setError("Request timeout. Image analysis took too long. Please try again.")
        setTimeout(() => setError(null), 5000)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Hammer className="h-5 w-5" />
            </div>
            <span>ArchEstimator</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
          </nav>
          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              {credits !== null && (
                <span className="text-sm text-muted-foreground">
                  {credits} credit{credits === 1 ? "" : "s"} left
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => signIn("google")}>
              Sign In with Google
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            From Sketch to Cost.<br />In Seconds.
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your architectural drawings and let AI identify materials, quantity, and real-time market prices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Upload */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <ImageUploader onImageSelect={handleImageSelect} className="relative" />
            </div>

            {selectedImage && (
              <div className="flex justify-center animate-in fade-in slide-in-from-top-2">
                {status === "authenticated" ? (
                  <Button
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || credits === 0}
                    className="w-full max-w-xs text-lg h-12 shadow-xl shadow-primary/20"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : credits === 0 ? (
                      "Out of credits"
                    ) : (
                      <>
                        Analyze Drawing <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleSignInWithImage}
                    className="w-full max-w-xs text-lg h-12 shadow-xl shadow-primary/20"
                  >
                    Sign In with Google to Analyze
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="min-h-[400px]">
            {materials.length > 0 || isAnalyzing ? (
              <MaterialList
                materials={materials}
                onUpdate={setMaterials}
                isLoading={isAnalyzing}
              />
            ) : (
              <div className="h-full rounded-xl border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-8 text-muted-foreground text-sm">
                <Calculator className="h-12 w-12 mb-4 opacity-20" />
                <p>Analysis results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <p>
          got feedback or an idea?{" "}
          <a
            href="https://www.linkedin.com/in/mathewspmathew"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            PING ME
          </a>
        </p>
      </footer>
    </div>
  )
}
