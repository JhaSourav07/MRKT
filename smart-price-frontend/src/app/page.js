'use client';

import { useState } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import SkeletonCard from './components/SkeletonCard';
import ProductCard from './components/ProductCard';

// The VS divider between side-by-side result cards
const VsDivider = () => (
  <div className="hidden md:flex flex-col items-center justify-center relative px-2 select-none" aria-hidden="true">
    <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    <div
      className="
        relative z-10 w-11 h-11 rounded-full
        glass-card border border-white/10
        flex items-center justify-center
        text-zinc-500 font-black text-xs tracking-widest
      "
    >
      VS
    </div>
  </div>
);

// Inline error banner displayed below the search bar
const ErrorBanner = ({ message }) => (
  <div
    role="alert"
    className="
      mt-6 w-full max-w-2xl mx-auto
      flex items-start gap-3 px-5 py-4 rounded-2xl
      bg-red-500/10 border border-red-500/20 text-red-400
      text-sm animate-fade-in-up
    "
  >
    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <p>{message}</p>
  </div>
);

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);  // holds { sourceProduct, competitorProduct }
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Reset to a clean slate before each new comparison
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
        setError(data.message || 'The comparison failed. Please try a different URL.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Can't reach the backend — make sure your Node server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // Derive the current UI state from the three state variables
  const showFeatures = !loading && !results;
  const showSkeletons = loading;
  const showResults = !loading && results;

  return (
    <div className="relative min-h-screen bg-[#030303] text-white overflow-hidden">

      {/* ── Ambient background mesh orbs ────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Indigo orb — top-left */}
        <div
          className="animate-float absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full
            bg-indigo-600/30 blur-[150px] opacity-60"
          style={{ animationDuration: '7s' }}
        />
        {/* Fuchsia orb — top-right */}
        <div
          className="animate-float-alt absolute -top-16 -right-24 w-[500px] h-[500px] rounded-full
            bg-fuchsia-600/25 blur-[150px] opacity-50"
        />
        {/* Violet orb — bottom-center */}
        <div
          className="animate-float-tertiary absolute -bottom-40 left-1/2 -translate-x-1/2
            w-[700px] h-[400px] rounded-full bg-violet-700/20 blur-[150px] opacity-40"
        />
      </div>

      {/* ── Page content ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Hero is always visible, regardless of state */}
        <Hero
          url={url}
          onUrlChange={setUrl}
          onSubmit={handleSearch}
          loading={loading}
        />

        {/* Error banner */}
        {error && <ErrorBanner message={error} />}

        {/* ── State 1: Default — show the Features bento grid ── */}
        {showFeatures && <Features />}

        {/* ── State 2: Loading — show two SkeletonCards side-by-side ── */}
        {showSkeletons && (
          <section
            id="skeleton-section"
            className="w-full max-w-5xl px-4 pb-24 mt-10"
            aria-label="Loading price comparison"
          >
            <p className="text-center text-zinc-600 text-sm mb-8 tracking-wide animate-pulse">
              Scraping live prices across platforms…
            </p>
            <div className="flex flex-col md:flex-row gap-5">
              <SkeletonCard label="Loading source product" />
              <VsDivider />
              <SkeletonCard label="Loading competitor product" />
            </div>
          </section>
        )}

        {/* ── State 3: Results — show two ProductCards side-by-side ── */}
        {showResults && (
          <section
            id="results-section"
            className="w-full max-w-5xl px-4 pb-24 mt-10"
            aria-label="Price comparison results"
          >
            {/* Results header */}
            <div className="text-center mb-8">
              <p className="text-zinc-500 text-sm font-semibold tracking-widest uppercase mb-1">
                Comparison Complete
              </p>
              <h2 className="text-white text-xl font-bold tracking-tight">
                Here&apos;s what we found
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <ProductCard
                cardTitle="Source Product"
                product={results.sourceProduct}
                animationClass="animate-fade-in-up"
              />
              <VsDivider />
              <ProductCard
                cardTitle="Competitor Product"
                product={results.competitorProduct}
                animationClass="animate-fade-in-up-delay"
              />
            </div>

            {/* Savings summary when both products have prices */}
            {results.sourceProduct?.success && results.competitorProduct?.success &&
              results.sourceProduct?.price != null && results.competitorProduct?.price != null && (
              <SavingsSummary
                sourcePrice={Number(results.sourceProduct.price)}
                competitorPrice={Number(results.competitorProduct.price)}
                sourcePlatform={results.sourceProduct.platform}
                competitorPlatform={results.competitorProduct.platform}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// Derived savings banner — shown beneath the result cards when both prices exist
function SavingsSummary({ sourcePrice, competitorPrice, sourcePlatform, competitorPlatform }) {
  const diff = sourcePrice - competitorPrice;
  const cheaper = diff > 0 ? competitorPlatform : sourcePlatform;
  const savingsAmt = Math.abs(diff).toLocaleString('en-IN');
  const savingsPct = ((Math.abs(diff) / Math.max(sourcePrice, competitorPrice)) * 100).toFixed(1);

  if (diff === 0) {
    return (
      <div className="mt-6 glass-card rounded-2xl px-6 py-4 text-center animate-fade-in-up-delay">
        <p className="text-zinc-400 text-sm">Both platforms have the <span className="text-white font-semibold">same price</span>.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 glass-card rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up-delay">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Best Deal</p>
          <p className="text-white font-bold text-sm">{cheaper} is cheaper</p>
        </div>
      </div>
      <div className="text-center sm:text-right">
        <p className="text-emerald-400 text-2xl font-black tracking-tighter">Save ₹{savingsAmt}</p>
        <p className="text-zinc-600 text-xs mt-0.5">{savingsPct}% less than the other platform</p>
      </div>
    </div>
  );
}