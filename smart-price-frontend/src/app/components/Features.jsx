'use client';

// Each feature has a different float delay so the cards drift independently
const features = [
  {
    id: 'real-time-scraping',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-indigo-500/20 to-indigo-500/0',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
    tag: 'Engine',
    title: 'Real-Time Scraping',
    description:
      'Our headless browser fleet crawls Amazon and Flipkart product pages on demand, bypassing throttles to pull live pricing data in seconds.',
    stat: '< 4s',
    statLabel: 'avg. response',
    delay: '0s',
  },
  {
    id: 'ai-matching',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: 'from-fuchsia-500/20 to-fuchsia-500/0',
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-400',
    tag: 'AI',
    title: 'AI Semantic Match',
    description:
      'A fine-tuned embedding model cross-references product titles and specs across platforms, finding the closest competitor SKU automatically.',
    stat: '97%',
    statLabel: 'match accuracy',
    delay: '0.4s',
  },
  {
    id: 'smart-cache',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    gradient: 'from-emerald-500/20 to-emerald-500/0',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    tag: 'Performance',
    title: 'Intelligent Cache',
    description:
      'Popular products are cached with a 15-minute TTL, giving the vast majority of queries sub-100ms responses and reducing redundant scrapes.',
    stat: '< 100ms',
    statLabel: 'cached queries',
    delay: '0.8s',
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="w-full max-w-5xl mx-auto px-4 pb-24"
      aria-labelledby="features-heading"
    >
      {/* Section label */}
      <div className="text-center mb-12">
        <p id="features-heading" className="text-zinc-500 text-sm font-semibold tracking-widest uppercase">
          How It Works
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f) => (
          <article
            key={f.id}
            id={`feature-${f.id}`}
            className="glass-card rounded-3xl p-7 flex flex-col gap-5 animate-float"
            style={{ animationDelay: f.delay, animationDuration: '6s' }}
          >
            {/* Icon + tag row */}
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                {f.icon}
              </div>
              <span className="text-zinc-600 text-xs font-semibold tracking-widest uppercase">
                {f.tag}
              </span>
            </div>

            {/* Title & description */}
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
            </div>

            {/* Stat pill */}
            <div className="mt-auto pt-5 border-t border-white/5 flex items-end gap-2">
              <span className="text-2xl font-black tracking-tighter text-white">{f.stat}</span>
              <span className="text-zinc-600 text-xs mb-0.5">{f.statLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
