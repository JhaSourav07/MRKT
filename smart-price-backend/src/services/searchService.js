import { chromium } from "playwright";

// Searches Flipkart for the given query and returns the URL of the top result
export const searchFlipkart = async (searchQuery) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`;

    console.log(`Searching Flipkart for: "${searchQuery}"`);
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Flipkart wraps each product card in a div with a data-id attribute
    await page.waitForSelector("div[data-id]", { timeout: 10000 });

    const firstResult = page.locator("div[data-id]").first();
    const linkLocator = firstResult.locator("a").first();
    const relativeUrl = await linkLocator.getAttribute("href");

    if (!relativeUrl) {
      return {
        success: false,
        message: "Could not find a product link in search results.",
      };
    }

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

// Searches Amazon for the given query and returns the URL of the top result
export const searchAmazon = async (searchQuery) => {
  const browser = await chromium.launch({ headless: true });
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

    await page.waitForSelector('div[data-component-type="s-search-result"]', {
      timeout: 10000,
    });

    const searchResults = page.locator(
      'div[data-component-type="s-search-result"]',
    );
    const count = await searchResults.count();
    let relativeUrl = null;

    console.log(`Found ${count} search results. Hunting for a valid link...`);

    // Check the first 4 results — some may be ads without standard product links
    for (let i = 0; i < Math.min(count, 4); i++) {
      try {
        // Match organic (/dp/) and sponsored (/sspa/, /slredirect/) link patterns
        const linkLocator = searchResults
          .nth(i)
          .locator(
            'a[href*="/dp/"], a[href*="/sspa/"], a[href*="/slredirect/"]',
          )
          .first();

        const href = await linkLocator.getAttribute("href", { timeout: 2000 });

        if (href) {
          relativeUrl = href;
          console.log(`Success! Found product link in result #${i + 1}`);
          break;
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

    // Drop Amazon tracking tags from the URL
    const cleanRelativeUrl = relativeUrl.split("/ref=")[0];

    // Sponsored links sometimes return absolute URLs; organic ones are relative
    const fullUrl = cleanRelativeUrl.startsWith("http")
      ? cleanRelativeUrl
      : `https://www.amazon.in${cleanRelativeUrl}`;

    console.log(`Found Amazon match. Link: ${fullUrl}`);
    return { success: true, url: fullUrl };
  } catch (error) {
    console.error("Amazon Search failed:", error.message);
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
};
