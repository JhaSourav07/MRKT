'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/v1/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: url }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || "Something went wrong during the comparison.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not connect to the backend. Make sure your Node server is running on port 5000!");
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ title, product }) => {
    if (!product || !product.success) {
      return (
        <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="text-gray-400 font-medium mb-2">{title}</h3>
          <p className="text-red-500 text-sm">{product?.message || "Product not found"}</p>
        </div>
      );
    }

    const isAmazon = product.platform === 'Amazon';
    const badgeBg = isAmazon ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200';

    return (
      <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badgeBg}`}>
            {product.platform}
          </span>
          <h3 className="mt-4 text-gray-800 font-semibold text-lg leading-snug line-clamp-3" title={product.title}>
            {product.title}
          </h3>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-50 flex items-end justify-between">
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Current Price</p>
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              ₹{product.price}
            </span>
          </div>
          {isAmazon && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Auto-Matched</span>}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-24 px-4 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <div className="text-center max-w-2xl w-full mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Smart Price <span className="text-blue-600">Engine</span>
        </h1>
        <p className="text-xl text-gray-500 font-light">
          Drop a product link below to instantly verify you're getting the best deal.
        </p>
      </div>

      {/* Search Form */}
      <div className="w-full max-w-2xl relative z-10">
        <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-center bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
          <div className="absolute left-6 hidden sm:flex items-center pointer-events-none">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="url"
            placeholder="Paste Amazon or Flipkart link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full sm:pl-16 pr-4 py-4 text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 text-lg rounded-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto mt-2 sm:mt-0 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:bg-blue-300 transition-all shadow-md flex items-center justify-center whitespace-nowrap"
          >
            {loading ? 'Scanning Stores...' : 'Compare Prices'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-8 bg-red-50 text-red-600 px-6 py-4 rounded-2xl max-w-2xl w-full border border-red-100 flex items-center gap-3 shadow-sm">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {results && (
         <div className="mt-16 w-full max-w-5xl flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <ProductCard title="Source Product" product={results.sourceProduct} />
            
            {/* Minimal VS Divider */}
            <div className="hidden md:flex flex-col items-center justify-center opacity-40">
               <div className="h-full w-px bg-gray-300 absolute"></div>
               <div className="bg-gray-100 text-gray-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm relative z-10 border-4 border-[#f8fafc]">
                 VS
               </div>
            </div>

            <ProductCard title="Competitor Product" product={results.competitorProduct} />
         </div>
      )}
    </main>
  );
}