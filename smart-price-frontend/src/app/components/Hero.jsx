'use client';

import { useState } from 'react';

// The magnifying glass SVG icon for the search bar
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-zinc-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Spinning icon shown on the button while the fetch is in progress
const SpinnerIcon = () => (
  <svg
    className="animate-spin-smooth w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export default function Hero({ url, onUrlChange, onSubmit, loading }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="w-full flex flex-col items-center text-center px-4 pt-28 pb-12">
      {/* Pill badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-8 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" />
        AI-Powered · Real-Time · Cross-Platform
      </div>

      {/* Main headline */}
      <h1 className="gradient-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] max-w-4xl mb-6">
        The Smartest Way<br />to Shop Online.
      </h1>

      {/* Sub-headline */}
      <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mb-12 leading-relaxed font-light">
        Paste any product link and our engine scrapes Amazon & Flipkart in real time,
        then surfaces the best deal — instantly.
      </p>

      {/* Search bar */}
      <div className="w-full max-w-2xl">
        <form
          id="compare-form"
          onSubmit={onSubmit}
          className={`
            search-glow relative flex items-center
            glass-card rounded-2xl p-2
            transition-all duration-300 ease-in-out
            ${isFocused ? 'border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.12)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]'}
          `}
        >
          {/* Icon */}
          <div className="absolute left-5 pointer-events-none">
            <SearchIcon />
          </div>

          {/* Input */}
          <input
            id="product-url-input"
            type="url"
            placeholder="Paste an Amazon or Flipkart product URL…"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required
            className="
              flex-1 pl-12 pr-4 py-4
              bg-transparent text-white placeholder-zinc-600
              text-sm sm:text-base
              focus:outline-none caret-indigo-400
            "
            aria-label="Product URL input"
          />

          {/* Submit button */}
          <button
            id="compare-submit-btn"
            type="submit"
            disabled={loading}
            className="
              flex items-center gap-2.5 px-6 py-3.5
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              disabled:from-indigo-800 disabled:to-violet-800 disabled:cursor-not-allowed
              text-white font-semibold text-sm rounded-xl
              transition-all duration-300 ease-in-out
              shadow-[0_4px_20px_rgba(99,102,241,0.35)]
              hover:shadow-[0_4px_28px_rgba(99,102,241,0.55)]
              hover:-translate-y-0.5
              whitespace-nowrap
              select-none
            "
            aria-label={loading ? 'Comparing prices…' : 'Compare Prices'}
          >
            {loading ? (
              <>
                <SpinnerIcon />
                <span>Scanning…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Compare Prices</span>
              </>
            )}
          </button>
        </form>

        {/* Helper text */}
        <p className="text-zinc-600 text-xs mt-3 tracking-wide">
          Supports Amazon.in · Flipkart.com · More platforms coming soon
        </p>
      </div>
    </section>
  );
}
