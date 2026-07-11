"use client"

import { useState } from "react"
import { Material } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input" removed unused import
import { Trash2, Plus, RefreshCw, Calculator, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalyzingLoader } from "@/components/AnalyzingLoader"

// Simple Input component since I didn't create ui/input.tsx yet
const SimpleInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    />
)

interface MaterialListProps {
    materials: Material[]
    onUpdate: (materials: Material[]) => void
    isLoading?: boolean
}

export function MaterialList({ materials, onUpdate, isLoading }: MaterialListProps) {
    const handleEdit = (id: string, field: keyof Material, value: string | number) => {
        const updated = materials.map(m => {
            if (m.id === id) {
                return { ...m, [field]: value }
            }
            return m
        })
        onUpdate(updated)
    }

    const handleDelete = (id: string) => {
        onUpdate(materials.filter(m => m.id !== id))
    }

    const handleAdd = () => {
        const newMaterial: Material = {
            id: crypto.randomUUID(),
            name: "New Material",
            quantity: 1,
            unit: "pcs",
            price: 0,
            availableSources: []
        }
        onUpdate([...materials, newMaterial])
    }

    const [isFindingPrices, setIsFindingPrices] = useState(false)

    const handleFindPrices = async () => {
        setIsFindingPrices(true)
        const updatedMaterials = [...materials]

        // Fetch prices for all materials in parallel (or sequential to be nice to "server")
        await Promise.all(updatedMaterials.map(async (material, index) => {
            try {
                const res = await fetch("/api/prices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: material.name })
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.prices && data.prices.length > 0) {
                        const bestPrice = data.prices[0] // API returns sorted
                        updatedMaterials[index] = {
                            ...material,
                            price: bestPrice.price,
                            selectedSource: bestPrice,
                            availableSources: data.prices
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch price for", material.name)
            }
        }))

        onUpdate(updatedMaterials)
        setIsFindingPrices(false)
    }

    const totalCost = materials.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)

    const escapeCsv = (value: string | number) => {
        const str = String(value)
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
    }

    const handleExport = () => {
        const header = ["Item Name", "Quantity", "Unit", "Est. Unit Price (INR)", "Total (INR)"]
        const rows = materials.map(m => [
            m.name,
            m.quantity,
            m.unit,
            m.price,
            (m.price * m.quantity).toFixed(2),
        ])
        rows.push(["", "", "", "Total", totalCost.toFixed(2)])

        const csv = [header, ...rows]
            .map(row => row.map(escapeCsv).join(","))
            .join("\n")

        // Prefix with a UTF-8 BOM so Excel renders the ₹ symbol correctly.
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "material-estimate.csv"
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Card className="w-full glass-card animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Material Estimator
                </CardTitle>
                <div className="text-right">
                    <span className="text-muted-foreground mr-4">Total Estimated Cost:</span>
                    <span className="text-2xl font-bold">₹ {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-border overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                        <div className="col-span-4">Item Name</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-3">Est. Unit Price</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <AnalyzingLoader />
                        ) : materials.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No materials identified yet. Upload a drawing to start.
                            </div>
                        ) : (
                            materials.map((material) => (
                                <div key={material.id} className="grid grid-cols-2 gap-3 p-4 md:grid-cols-12 md:gap-4 md:items-center hover:bg-muted/30 transition-colors group">
                                    <div className="col-span-2 md:col-span-4">
                                        <label className="text-xs text-muted-foreground md:hidden">Item Name</label>
                                        <SimpleInput
                                            value={material.name}
                                            onChange={(e) => handleEdit(material.id, "name", e.target.value)}
                                            className="font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-muted-foreground md:hidden">Quantity</label>
                                        <SimpleInput
                                            type="number"
                                            value={material.quantity}
                                            onChange={(e) => handleEdit(material.id, "quantity", parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-muted-foreground md:hidden">Unit</label>
                                        <SimpleInput
                                            value={material.unit}
                                            onChange={(e) => handleEdit(material.id, "unit", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-3">
                                        <label className="text-xs text-muted-foreground md:hidden">Est. Unit Price</label>
                                        <div className="relative">
                                            <SimpleInput
                                                type="number"
                                                value={material.price}
                                                onChange={(e) => handleEdit(material.id, "price", parseFloat(e.target.value) || 0)}
                                                className="font-medium"
                                            />
                                            {material.selectedSource && (
                                                <div className="absolute top-full left-0 mt-1 text-[10px] text-green-600 font-medium truncate w-full flex items-center gap-1">
                                                    {material.selectedSource.url ? (
                                                        <a
                                                            href={material.selectedSource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <span>✓ {material.selectedSource.source}</span>
                                                        </a>
                                                    ) : (
                                                        <span>✓ {material.selectedSource.source}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(material.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="md:hidden">Remove</span>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleAdd} className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" /> Add Item
                    </Button>

                    <div className="flex flex-wrap gap-3 w-full sm:w-auto sm:ml-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={materials.length === 0}
                            className="gap-2 w-full sm:w-auto"
                        >
                            <Download className="h-4 w-4" /> Export as Excel
                        </Button>

                        <Button
                            variant="default"
                            onClick={handleFindPrices}
                            disabled={materials.length === 0 || isLoading || isFindingPrices}
                            className="w-full sm:w-auto"
                        >
                            {isFindingPrices ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Finding Prices...
                                </>
                            ) : (
                                "Find Best Prices"
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
