import { PriceSource } from '@/types';
import { chromium } from 'playwright';

const cache = new Map<string, { data: PriceSource[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export class ScraperService {
    async scrapeGoogleShopping(query: string): Promise<PriceSource[]> {
        // Check cache
        const cacheKey = query.toLowerCase();
        const cached = cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`Returning cached results for: ${query}`);
            return cached.data;
        }

        let browser;
        try {
            console.log(`Making request for: ${query}`);
            browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();

            // Navigate to Google Shopping
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop&gl=in&hl=en`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

            // Extract results
            const results = await page.$$eval('.sh-dgr__grid-result', (items) => {
                return items.slice(0, 5).map((item) => {
                    const title = item.querySelector('h3')?.textContent || 'Unknown Title';
                    const priceText = item.querySelector('.a8Pemb')?.textContent || '0';
                    const source = item.querySelector('.IuHnof')?.textContent || 'Unknown Source';
                    // const link = item.querySelector('a')?.href || '#'; // Often a redirect link
                    const image = item.querySelector('img')?.src || '';

                    // Clean price
                    const priceNumber = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

                    return {
                        title: title,
                        price: priceNumber,
                        source: source,
                        image: image,
                        // Generate a pseudo-ID
                        id: 'pw-' + Math.random().toString(36).substr(2, 9)
                    };
                });
            });

            // Map to PriceSource interface
            const formattedResults: PriceSource[] = results.map(r => ({
                id: r.id,
                source: r.source,
                price: r.price,
                currency: 'INR',
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`, // Direct back to search results as deep links are tricky
                logo: r.image
            }));

            if (formattedResults.length > 0) {
                // Update cache
                cache.set(cacheKey, { data: formattedResults, timestamp: Date.now() });
                return formattedResults;
            } else {
                console.log("Playwright found 0 results, falling back to mock data.");
            }

        } catch (error) {
            console.error("Playwright scraping failed:", error);
        } finally {
            if (browser) {
                await browser.close();
            }
        }

        // Fallback to mock data
        return this.generateMockPrices(query);
    }

    private generateMockPrices(query: string): PriceSource[] {
        // Approximate mock pricing in INR (assuming 1 unit ~ 50-500 INR for basic materials)
        const basePrice = (query.length * 100) + (Math.random() * 500);
        return [
            {
                id: `mock-${Math.random().toString(36).substr(2, 9)}`,
                source: "Local Hardware Store (Fallback)",
                price: Math.floor(basePrice * 1.05),
                currency: "INR",
                url: "#",
            },
            {
                id: `mock-${Math.random().toString(36).substr(2, 9)}`,
                source: "City Build Supplies (Fallback)",
                price: Math.floor(basePrice * 1.02),
                currency: "INR",
                url: "#",
            }
        ].sort((a, b) => a.price - b.price);
    }
}
