export interface PriceSource {
    id: string
    source: string
    price: number
    currency: string
    url: string
    logo?: string
}

export interface Material {
    id: string
    name: string
    quantity: number
    unit: string
    price: number
    selectedSource?: PriceSource
    availableSources: PriceSource[]
    confidence?: number // from AI
}

export interface AnalysisMockResponse {
    materials: Material[]
}
