import { scrapeAmazonProduct } from '../services/scraperService.js';

export const processComparison = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide a product URL." 
            });
        }

        console.log(`Received request to process: ${query}`);

        // For this MVP step, we assume the query is an Amazon URL
        if (query.includes('amzn.in') || query.includes('amazon.in') || query.includes('amazon.com')) {
            const scrapedData = await scrapeAmazonProduct(query);
            
            if (scrapedData.success) {
                return res.status(200).json({
                    success: true,
                    data: scrapedData
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: scrapedData.message
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Currently, only Amazon URLs are supported for testing."
            });
        }

    } catch (error) {
        console.error("Error in processComparison:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};