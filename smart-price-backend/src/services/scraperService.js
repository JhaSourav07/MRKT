import { chromium } from "playwright";

export const scrapeAmazonProduct = async (url) => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Amazon sometimes pops up a "Continue Shopping" modal — dismiss it if it appears
    const continueButton = page
      .getByRole("button", { name: /continue shopping/i })
      .first();
    try {
      await continueButton.waitFor({ state: "visible", timeout: 2000 });
      console.log("Pop-up detected! Clicking it away...");
      await continueButton.click();
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log("No pop-up detected. Moving on...");
    }

    // Using .first() here prevents Playwright strict-mode violations when multiple matches exist
    const titleLocator = page.locator("#productTitle").first();
    const rawTitle = await titleLocator.textContent();
    const title = rawTitle ? rawTitle.trim() : "Title not found";

    const priceLocator = page.locator(".a-price-whole").first();
    let price = await priceLocator.textContent();

    if (price) {
      // Strip currency symbols and commas — keep only digits and decimals
      price = price.replace(/[^0-9.]/g, "");
    } else {
      price = "Price not found";
    }

    // Grab the main product image — #landingImage is the most reliable selector
    let image = null;
    try {
      image = await page.locator("#landingImage").first().getAttribute("src");
      if (!image) {
        // Fallback: try the og:image meta tag
        image = await page
          .locator('meta[property="og:image"]')
          .getAttribute("content", { timeout: 2000 });
      }
    } catch (e) {
      console.log("Could not scrape Amazon image:", e.message);
    }

    return {
      success: true,
      platform: "Amazon",
      title,
      price,
      image: image || null,
      url,
    };
  } catch (error) {
    console.error("Scraping failed:", error.message);
    return {
      success: false,
      message: "Failed to scrape product data.",
      errorDetails: error.message,
    };
  } finally {
    // Always close the browser, even if something above crashed
    await browser.close();
  }
};

export const scrapeFlipkartProduct = async (url) => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log("Waiting for product title to render...");
    await page.waitForSelector("h1", { timeout: 10000 });

    let title = "Title not found";

    try {
      // The og:title meta tag often has the full, untruncated product name
      console.log("Looking for full title in SEO meta tags...");
      const metaTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute("content", { timeout: 2000 });

      if (metaTitle) {
        // SEO titles sometimes include " | Flipkart" — strip everything after the pipe
        title = metaTitle.split("|")[0].trim();
        console.log("Success! Grabbed full title from background data.");
      }
    } catch (e) {
      console.log("Meta tag not found, falling back to UI...");
    }

    if (title === "Title not found") {
      const titleLocator = page.locator("h1").first();
      let rawTitle = await titleLocator.innerText();
      title = rawTitle ? rawTitle.trim() : "Title not found";
      // Flipkart sometimes appends "...more" or just "more" to truncated titles
      title = title.replace(/\.\.\.more/gi, "").trim();
      title = title.replace(/more$/i, "").trim();
    }

    const priceLocator = page
      .locator('div[class*="v1zwn21k v1zwn20 _1psv1zeb9 _1psv1ze0"]')
      .first();
    let price = await priceLocator.textContent();

    if (price) {
      price = price.replace(/[^0-9.]/g, "");
    } else {
      price = "Price not found";
    }

    // og:image is the most reliable and hotlink-friendly image source on Flipkart
    let image = null;
    try {
      image = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content", { timeout: 2000 });

      if (!image) {
        // Fallback: grab the first visible product image on the page
        image = await page
          .locator('img[class*="DByuf4"], img._2r_T1I, img._396cs4')
          .first()
          .getAttribute("src", { timeout: 2000 });
      }
    } catch (e) {
      console.log("Could not scrape Flipkart image:", e.message);
    }

    return {
      success: true,
      platform: "Flipkart",
      title,
      price,
      image: image || null,
      url,
    };
  } catch (error) {
    console.error("Flipkart Scraping failed:", error.message);
    return {
      success: false,
      message: "Failed to scrape Flipkart product data.",
      errorDetails: error.message,
    };
  } finally {
    await browser.close();
  }
};
