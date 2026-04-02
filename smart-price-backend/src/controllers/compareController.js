import {
  scrapeAmazonProduct,
  scrapeFlipkartProduct,
} from "../services/scraperService.js";
import { searchAmazon, searchFlipkart } from "../services/searchService.js";
import { extractProductInfo } from "../utils/productExtractor.js";

export const processComparison = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query)
      return res
        .status(400)
        .json({ success: false, message: "Please provide a product URL." });

    let originalData = null;
    let comparisonData = null;

    // --- PATH A: User pasted an Amazon Link ---
    if (query.includes("amazon.") || query.includes("amzn.in")) {
      originalData = await scrapeAmazonProduct(query);

      if (originalData.success) {
        const extractedInfo = extractProductInfo(originalData.title);
        originalData.extractedInfo = extractedInfo;

        // Auto-search Flipkart
        const searchResult = await searchFlipkart(extractedInfo.searchQuery);
        if (searchResult.success) {
          comparisonData = await scrapeFlipkartProduct(searchResult.url);
        }
      }
    }
    // --- PATH B: User pasted a Flipkart Link ---
    else if (
      query.includes("flipkart.com") ||
      query.includes("fkrt.it") ||
      query.includes("dl.flipkart.com")
    ) {
      originalData = await scrapeFlipkartProduct(query);

      if (originalData.success) {
        // Extract the query from Flipkart's title
        const extractedInfo = extractProductInfo(originalData.title);
        originalData.extractedInfo = extractedInfo;
        // Auto-search Amazon
        const searchResult = await searchAmazon(extractedInfo.searchQuery);
        if (searchResult.success) {
          comparisonData = await scrapeAmazonProduct(searchResult.url);
        }
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported URL." });
    }

    // Return the ultimate price comparison package!
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
