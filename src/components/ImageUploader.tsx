"use client"

import { useState, useRef } from "react"
import { Upload, X, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { validateImageFile, MAX_FILE_SIZE_MB } from "@/lib/image-validation"

interface ImageUploaderProps {
    onImageSelect: (file: File | null) => void
    className?: string
}

export function ImageUploader({ onImageSelect, className }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = (file: File) => {
        const validation = validateImageFile(file)

        if (!validation.valid) {
            setError(validation.error || "Invalid file")
            onImageSelect(null)
            return
        }

        setError(null)

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            onImageSelect(file)
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0])
        }
    }

    const removeImage = () => {
        setPreview(null)
        setError(null)
        onImageSelect(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className={cn("w-full max-w-xl mx-auto", className)}>
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}
            <Card className={cn(
                "border-2 border-dashed transition-all duration-300",
                isDragging ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/25 hover:border-primary/50",
                preview ? "border-none bg-background/0" : ""
            )}>
                <CardContent className="p-0">
                    {preview ? (
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" /> Add Another
                                </Button>
                            </div>
                            <div className="relative rounded-lg overflow-hidden border border-border shadow-2xl group">
                                <img src={preview} alt="Upload preview" className="w-full h-auto max-h-[500px] object-contain bg-black/5 dark:bg-white/5" />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="icon" onClick={removeImage} className="h-8 w-8 rounded-full shadow-lg">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end p-4">
                                    <p className="text-white text-sm font-medium">Click "Analyze" to proceed</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center p-12 text-center cursor-pointer min-h-[300px]"
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                                <Upload className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Upload Architectural Drawing</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                                Drag and drop your 2D drawing or image here, or click to browse
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">JPG</span>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">PNG</span>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">WEBP</span>
                            </div>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={onFileInputChange}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
