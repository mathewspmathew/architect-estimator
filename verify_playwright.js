
const { chromium } = require('playwright');

async function verify() {
    console.log("Starting verification...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.google.com/search?q=plywood+price+in+india&tbm=shop');
        const title = await page.title();
        console.log("Page Title:", title);

        // Simple selector check
        const results = await page.$$eval('.sh-dgr__grid-result', items => {
            return items.map(item => {
                const title = item.querySelector('h3')?.textContent;
                const price = item.querySelector('.a8Pemb')?.textContent;
                return { title, price };
            });
        });

        console.log("Found results:", results.length);
        if (results.length > 0) {
            console.log("Sample:", results[0]);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
}

verify();
