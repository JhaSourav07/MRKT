import { chromium } from 'playwright';

export const scrapeAmazonProduct = async (url) => {
    // Launch browser. 
    // Tip: Change to { headless: false } if you ever need to visually debug a crash.
    const browser = await chromium.launch({ headless: false });
    
    // Use a realistic User-Agent to avoid basic bot detection
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();

    try {
        console.log(`Navigating to: ${url}`);
        // Wait until the basic DOM is loaded, max timeout of 30 seconds
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // --- DEFENSIVE CODING: Handle Potential Pop-ups ---
        const continueButton = page.getByRole('button', { name: /continue shopping/i }).first();
        try {
            // Wait up to 2 seconds to see if the pop-up appears
            await continueButton.waitFor({ state: 'visible', timeout: 2000 });
            console.log("Pop-up detected! Clicking it away...");
            await continueButton.click();
            await page.waitForTimeout(1000); // Give the modal a second to disappear
        } catch (e) {
            console.log("No pop-up detected. Moving on...");
        }

        // --- DATA EXTRACTION ---
        // 1. Title (Using .first() to prevent Playwright Strict Mode Violations)
        const titleLocator = page.locator('#productTitle').first();
        const rawTitle = await titleLocator.textContent();
        const title = rawTitle ? rawTitle.trim() : 'Title not found';

        // 2. Price
        const priceLocator = page.locator('.a-price-whole').first();
        let price = await priceLocator.textContent();
        
        if (price) {
            // Clean up string: keep only numbers and decimals
            price = price.replace(/[^0-9.]/g, '');
        } else {
            price = 'Price not found';
        }

        return {
            success: true,
            platform: 'Amazon',
            title,
            price
        };

    } catch (error) {
        console.error("Scraping failed:", error.message);
        return {
            success: false,
            message: "Failed to scrape product data.",
            errorDetails: error.message
        };
    } finally {
        // ALWAYS clean up memory, even if the scraper crashes
        await browser.close();
    }
};
