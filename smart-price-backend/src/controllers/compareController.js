import { scrapeAmazonProduct, scrapeFlipkartProduct } from '../services/scraperService.js';

export const processComparison = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: "Please provide a product URL." });
        }

        console.log(`Received request to process: ${query}`);
        let scrapedData = null;

        // 🟢 ROUTING LOGIC: Check which website the URL belongs to
        if (query.includes('amazon.') || query.includes('amzn.in')) {
            scrapedData = await scrapeAmazonProduct(query);
            
        } 
        // We look for flipkart.com, fkrt.it (shortlinks), or dl.flipkart (deep links)
        else if (query.includes('flipkart.com') || query.includes('fkrt.it') || query.includes('dl.flipkart.com')) {
            scrapedData = await scrapeFlipkartProduct(query);
            
        } else {
            // This is the error you just hit!
            return res.status(400).json({
                success: false,
                message: "Currently, only Amazon and Flipkart URLs are supported."
            });
        }

        if (scrapedData.success) {
            return res.status(200).json({ success: true, data: scrapedData });
        } else {
            return res.status(500).json({ success: false, message: scrapedData.message });
        }

    } catch (error) {
        console.error("Error in processComparison:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};