export const extractProductInfo = (rawTitle) => {
    let title = rawTitle.toLowerCase();

    // Strip marketing noise that muddies the search query (e.g. "buy online", "price in india")
    const stopWords = ['price in india', 'buy online', 'at flipkart.com', 'at amazon.in', 'display', 'bluetooth calling', 'smartwatch'];
    stopWords.forEach(word => title = title.replace(word, ''));

    // Remove numeric specs like "46.5mm", "128GB", "5000mAh" — they confuse cross-platform searches
    title = title.replace(/\d+(\.\d+)?(mm|gb|mah|v|w|hz)/gi, '');

    // Remove special characters but preserve hyphens (needed for brands like "Fire-Boltt")
    let cleanTitle = title.replace(/[^a-zA-Z0-9\- ]/g, ' ');
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

    const words = cleanTitle.split(' ');

    // Handle compound brand names — "fire boltt" should be treated as one token
    let brand = words[0];
    if (words[0] === 'fire' && words[1] === 'boltt') {
        brand = 'fire-boltt';
    }

    // Use the first 5 cleaned words as the cross-platform search query
    const searchQuery = words.slice(0, 5).join(' ');

    return {
        brand: brand.toUpperCase(),
        searchQuery: searchQuery.trim(),
        originalTitle: rawTitle
    };
};