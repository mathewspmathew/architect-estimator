# ArchEstimator

A web application that analyzes architectural drawings to automatically identify materials, quantities, and real-time pricing.

## What It Does

Upload a photo of a furniture or architectural element, and ArchEstimator will:
1. **Analyze** the image using AI (Google Gemini) to identify materials
2. **Fetch pricing** data to show estimated market prices
3. **Display results** with materials, quantities, units, and price sources

## How to Use

1. **Upload an Image**
   - Drag and drop an image onto the page, or click to select a file
   - Supports furniture, construction elements, architectural components

2. **Analyze**
   - Click the "Analyze" button to extract materials from the image
   - The app uses AI to identify what materials are visible

3. **View Results**
   - See a list of identified materials with estimated quantities
   - Browse available price sources and vendors
   - Prices are fetched from real-time Google Shopping results

## Tech Stack

- **Framework**: Next.js 16.1.1 (React 19, TypeScript 5)
- **UI**: Tailwind CSS 4 + shadcn/ui components
- **AI**: Google Generative AI (Gemini models)
- **Icons**: lucide-react

## Getting Started

### Prerequisites
- Node.js (v18+)
- `GOOGLE_API_KEY` environment variable (optional; app works with mock data if not set)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

- **`GOOGLE_API_KEY`** — Your Google Cloud API key for Gemini image analysis. If not set, the app uses mock data for testing.

## How It Works

### Input
- An image file (JPG, PNG, etc.) of a furniture or architectural element

### Processing
- Image is sent to Google Gemini API
- AI identifies materials, quantities, and units
- Material list is used to query Google Shopping for current prices

### Output
- **Materials**: Name, quantity, unit, and confidence score
- **Price Sources**: Vendor name, current price, currency, and link to product
- **Editable**: Quantities and prices can be adjusted in the UI

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checks |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page (upload + results)
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── analyze/route.ts  # Image analysis endpoint
│       └── prices/route.ts   # Price data endpoint
├── components/
│   ├── ImageUploader.tsx     # Drag-drop upload component
│   ├── MaterialList.tsx      # Display & edit materials
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── utils.ts             # Helper utilities
└── types/
    └── index.ts             # TypeScript interfaces
```

## Notes

- The app uses mock pricing data by default for demonstration
- API keys for Google Generative AI are optional (app uses fallback mock data if missing)
- Future versions can integrate real pricing APIs
