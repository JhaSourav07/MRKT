'use client';

// A single pulsing ghost element — reusable for different block sizes
const Pulse = ({ className }) => (
  <div className={`skeleton-shimmer rounded-lg bg-white/5 ${className}`} />
);

export default function SkeletonCard({ label = 'Loading…' }) {
  return (
    <article
      className="flex-1 glass-card rounded-3xl p-7 flex flex-col gap-5 min-w-0"
      aria-busy="true"
      aria-label={label}
    >
      {/* Platform badge ghost */}
      <Pulse className="h-6 w-24 rounded-full" />

      {/* Image ghost */}
      <Pulse className="w-full h-48 rounded-2xl" />

      {/* Title lines */}
      <div className="flex flex-col gap-2 mt-1">
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-4/5" />
        <Pulse className="h-4 w-3/5" />
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 pt-5 mt-auto">
        {/* Price label */}
        <Pulse className="h-3 w-20 mb-3" />
        {/* Price value */}
        <Pulse className="h-10 w-32" />
      </div>
    </article>
  );
}
