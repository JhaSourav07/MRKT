import { chromium } from "playwright";

//Searches Flipkart and returns the URL of the best match
export const searchFlipkart = async (searchQuery) => {
  // Keep headless true so it's fast. We only need the URL!
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    // We use JS to encode the search query (e.g., "iPhone 15" becomes "iPhone%2015")
    // This is how Flipkart's search bar naturally formats URLs
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`;

    console.log(`Searching Flipkart for: "${searchQuery}"`);
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for Flipkart's search results grid to load.
    // Flipkart wraps almost every product card in a div with a 'data-id' attribute.
    await page.waitForSelector("div[data-id]", { timeout: 10000 });

    // Grab the very first product card
    const firstResult = page.locator("div[data-id]").first();

    // Find the main link inside that product card
    const linkLocator = firstResult.locator("a").first();
    const relativeUrl = await linkLocator.getAttribute("href");

    if (!relativeUrl) {
      return {
        success: false,
        message: "Could not find a product link in search results.",
      };
    }

    // Combine the relative URL with the base domain
    const fullUrl = `https://www.flipkart.com${relativeUrl}`;
    console.log(`Found Match! Link: ${fullUrl}`);

    return { success: true, url: fullUrl };
  } catch (error) {
    console.error("Flipkart Search failed:", error.message);
    return { success: false, message: "Failed to search Flipkart." };
  } finally {
    await browser.close();
  }
};

//Searches Amazon and returns the URL of the best match
export const searchAmazon = async (searchQuery) => {
  const browser = await chromium.launch({ headless: false }); // Keep false to watch
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`;
    console.log(`Searching Amazon for: "${searchQuery}"`);

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // 1. Wait for the search results grid to appear
    await page.waitForSelector('div[data-component-type="s-search-result"]', {
      timeout: 10000,
    });

    // 2. Grab ALL the results on the page
    const searchResults = page.locator(
      'div[data-component-type="s-search-result"]',
    );
    const count = await searchResults.count();
    let relativeUrl = null;

    console.log(`Found ${count} search results. Hunting for a valid link...`);

    for (let i = 0; i < Math.min(count, 4); i++) {
      try {
        // CSS Comma means OR. Look for organic (/dp/) OR sponsored (/sspa/ or /slredirect/)
        const linkLocator = searchResults
          .nth(i)
          .locator(
            'a[href*="/dp/"], a[href*="/sspa/"], a[href*="/slredirect/"]',
          )
          .first();

        // Fast timeout so we don't get stuck waiting for a bad result
        const href = await linkLocator.getAttribute("href", { timeout: 2000 });

        if (href) {
          relativeUrl = href;
          console.log(`Success! Found product link in result #${i + 1}`);
          break; // We found a link! Break out of the loop immediately.
        }
      } catch (e) {
        console.log(
          `Result #${i + 1} skipped: No standard product link found.`,
        );
      }
    }

    if (!relativeUrl) {
      throw new Error(
        "Could not find a valid product link in the top results.",
      );
    }

    // Clean the URL of Amazon tracking tags
    const cleanRelativeUrl = relativeUrl.split("/ref=")[0];

    // Sometimes sponsored links provide full URLs, organic links provide relative URLs. Handle both:
    const fullUrl = cleanRelativeUrl.startsWith("http")
      ? cleanRelativeUrl
      : `https://www.amazon.in${cleanRelativeUrl}`;

    console.log(`✅ Found Amazon Match! Link: ${fullUrl}`);
    return { success: true, url: fullUrl };
  } catch (error) {
    console.error("Amazon Search failed:", error.message);
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
};
