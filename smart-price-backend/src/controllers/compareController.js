import {
  scrapeAmazonProduct,
  scrapeFlipkartProduct,
} from "../services/scraperService.js";
import { searchFlipkart, searchAmazon } from "../services/searchService.js";
import { extractProductInfo } from "../utils/productExtractor.js";
import { Product } from "../models/Product.js";

export const processComparison = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query)
      return res
        .status(400)
        .json({ success: false, message: "Please provide a product URL." });

    let originalData = null;
    let comparisonData = null;
    let cachedProduct = await Product.findOne({ originalUrl: query });
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const isFresh =
      cachedProduct &&
      Date.now() - new Date(cachedProduct.lastScraped).getTime() < ONE_DAY;

    if (isFresh) {
      // We have a recent scrape — skip the browser entirely and serve from cache
      console.log("Cache hit. Loading source product from the database.");
      originalData = {
        success: true,
        platform: cachedProduct.platform,
        title: cachedProduct.title,
        price: cachedProduct.price,
        image: cachedProduct.image || null,
        url: query,
        extractedInfo: { searchQuery: cachedProduct.searchQuery },
      };

      // If we already found the competitor price yesterday, reuse that too
      if (cachedProduct.competitor && cachedProduct.competitor.price) {
        console.log("Competitor cache hit. Skipping cross-platform search.");
        comparisonData = {
          success: true,
          platform: cachedProduct.competitor.platform,
          title: cachedProduct.competitor.title,
          price: cachedProduct.competitor.price,
          image: cachedProduct.competitor.image || null,
          url: cachedProduct.competitor.url,
        };
      }
    } else {
      console.log("Cache miss. Firing up the scraper.");

      // User pasted an Amazon link
      if (query.includes("amazon.") || query.includes("amzn.in")) {
        originalData = await scrapeAmazonProduct(query);
        if (originalData.success) {
          originalData.extractedInfo = extractProductInfo(originalData.title);

          // Persist the result so we don't have to scrape this URL again tomorrow
          await Product.findOneAndUpdate(
            { originalUrl: query },
            {
              $set: {
                title: originalData.title,
                price: originalData.price,
                platform: "Amazon",
                image: originalData.image,
                searchQuery: originalData.extractedInfo.searchQuery,
                lastScraped: Date.now(),
              },
              $push: {
                priceHistory: { price: originalData.price, date: Date.now() },
              },
            },
            { upsert: true, new: true },
          );
        }
      }
      // User pasted a Flipkart link
      else if (
        query.includes("flipkart.com") ||
        query.includes("fkrt.it") ||
        query.includes("dl.flipkart.com")
      ) {
        originalData = await scrapeFlipkartProduct(query);
        if (originalData.success) {
          originalData.extractedInfo = extractProductInfo(originalData.title);

          await Product.findOneAndUpdate(
            { originalUrl: query },
            {
              $set: {
                title: originalData.title,
                price: originalData.price,
                platform: "Flipkart",
                image: originalData.image,
                searchQuery: originalData.extractedInfo.searchQuery,
                lastScraped: Date.now(),
              },
              $push: {
                priceHistory: { price: originalData.price, date: Date.now() },
              },
            },
            { upsert: true, new: true },
          );
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Unsupported URL." });
      }
    }

    // We have the source product — now find what the competitor charges for the same item
    if (originalData && originalData.success && !comparisonData) {
      console.log(
        "No competitor found in cache. Starting cross-platform search.",
      );
      const searchQ = originalData.extractedInfo.searchQuery;
      let competitorUrl = "";

      if (originalData.platform === "Amazon") {
        const searchResult = await searchFlipkart(searchQ);
        if (searchResult.success) {
          competitorUrl = searchResult.url;
          comparisonData = await scrapeFlipkartProduct(competitorUrl);
        }
      } else {
        const searchResult = await searchAmazon(searchQ);
        if (searchResult.success) {
          competitorUrl = searchResult.url;
          comparisonData = await scrapeAmazonProduct(competitorUrl);
        }
      }

      // Cache the competitor result so we skip the search next time
      if (comparisonData && comparisonData.success) {
        await Product.findOneAndUpdate(
          { originalUrl: query },
          {
            competitor: {
              url: competitorUrl,
              title: comparisonData.title,
              price: comparisonData.price,
              platform: comparisonData.platform,
              image: comparisonData.image,
            },
          },
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        sourceProduct: originalData,
        competitorProduct: comparisonData,
      },
    });
  } catch (error) {
    console.error("Error in processComparison:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
