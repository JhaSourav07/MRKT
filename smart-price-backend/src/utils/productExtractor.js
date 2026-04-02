export const extractProductInfo = (rawTitle) => {
    // 1. Convert to lowercase for easier matching
    let title = rawTitle.toLowerCase();

    // 2. Remove common "Junk" words that aren't part of the product identity
    const stopWords = ['price in india', 'buy online', 'at flipkart.com', 'at amazon.in', 'display', 'bluetooth calling', 'smartwatch'];
    stopWords.forEach(word => title = title.replace(word, ''));

    // 3. Clean up specific specs that confuse our model extractor (like 46.5mm)
    title = title.replace(/\d+(\.\d+)?(mm|gb|mah|v|w|hz)/gi, '');

    // 4. Clean special characters but KEEP hyphens (for brands like Fire-Boltt)
    let cleanTitle = title.replace(/[^a-zA-Z0-9\- ]/g, ' ');
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

    const words = cleanTitle.split(' ');

    // 5. Smarter Brand Extraction
    // If the first two words are "fire boltt", join them.
    let brand = words[0];
    if (words[0] === 'fire' && words[1] === 'boltt') {
        brand = 'fire-boltt';
    }

    // 6. Smarter Search Query
    // Take the first 3-4 significant words, skipping the brand if it's already there
    const searchQuery = words.slice(0, 5).join(' ');

    return {
        brand: brand.toUpperCase(),
        searchQuery: searchQuery.trim(),
        originalTitle: rawTitle
    };
};