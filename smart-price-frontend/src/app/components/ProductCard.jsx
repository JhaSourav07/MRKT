'use client';

import { useState } from 'react';

const PLATFORM_CONFIG = {
  Amazon: {
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    accentClass: 'text-orange-400',
    label: '🛍 Amazon',
  },
  Flipkart: {
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    accentClass: 'text-blue-400',
    label: '🏪 Flipkart',
  },
};

const DEFAULT_CONFIG = {
  badgeClass: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  accentClass: 'text-zinc-400',
  label: '🌐 Unknown',
};

const ImagePlaceholder = () => (
  <div className="w-full h-48 rounded-2xl bg-white/[0.03] flex flex-col items-center justify-center gap-2 border border-white/5">
    <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <span className="text-zinc-700 text-xs">No image available</span>
  </div>
);

const ErrorState = ({ title, message }) => (
  <article className="flex-1 glass-card rounded-3xl p-7 flex flex-col items-center justify-center text-center gap-3 min-h-[280px]">
    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <p className="text-zinc-500 text-xs font-semibold tracking-widest uppercase">{title}</p>
    <p className="text-red-400/80 text-sm leading-relaxed max-w-xs">{message || 'Product not found.'}</p>
  </article>
);

// External link icon for the card header
const ExternalLinkIcon = () => (
  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export default function ProductCard({ cardTitle, product, animationClass = 'animate-fade-in-up' }) {
  const [imgError, setImgError] = useState(false);

  if (!product || !product.success) {
    return <ErrorState title={cardTitle} message={product?.message} />;
  }

  const config = PLATFORM_CONFIG[product.platform] ?? DEFAULT_CONFIG;

  const formattedPrice =
    product.price != null
      ? Number(product.price).toLocaleString('en-IN')
      : '—';

  const cardContent = (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${config.badgeClass}`}>
          {config.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600 text-xs font-semibold tracking-widest uppercase">
            {cardTitle}
          </span>
          {product.url && <ExternalLinkIcon />}
        </div>
      </div>

      {/* Product image — referrerPolicy prevents Amazon/Flipkart CDN hotlink blocking */}
      {product.image && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-contain rounded-2xl bg-white/[0.03] p-2"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <ImagePlaceholder />
      )}

      {/* Title */}
      <h3
        className="text-white font-semibold text-base leading-snug line-clamp-3 tracking-tight"
        title={product.title}
      >
        {product.title}
      </h3>

      {/* Price section */}
      <div className="mt-auto pt-5 border-t border-white/5 flex items-end justify-between">
        <div>
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest mb-1">
            Current Price
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-zinc-400 text-lg font-light">₹</span>
            <span className={`text-3xl font-black tracking-tighter ${config.accentClass}`}>
              {formattedPrice}
            </span>
          </div>
        </div>

        {cardTitle?.toLowerCase().includes('competitor') && (
          <span className="text-zinc-600 text-xs bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg">
            AI Matched
          </span>
        )}
      </div>

      {/* Click-to-visit hint — visible on hover */}
      {product.url && (
        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/0 group-hover:border-white/10 group-hover:bg-white/[0.03] transition-all duration-200">
          <span className="text-zinc-600 group-hover:text-zinc-400 text-xs font-medium transition-colors duration-200">
            View on {product.platform}
          </span>
          <svg className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </>
  );

  // Wrap in an anchor if we have a URL — entire card becomes clickable
  if (product.url) {
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex-1 glass-card rounded-3xl p-7 flex flex-col gap-5 min-w-0 cursor-pointer no-underline ${animationClass}`}
        aria-label={`View ${product.title} on ${product.platform}`}
      >
        {cardContent}
      </a>
    );
  }

  // Fallback non-clickable card when no URL is available
  return (
    <article className={`flex-1 glass-card rounded-3xl p-7 flex flex-col gap-5 min-w-0 ${animationClass}`}>
      {cardContent}
    </article>
  );
}
