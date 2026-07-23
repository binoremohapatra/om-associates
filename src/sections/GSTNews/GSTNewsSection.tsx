import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Tag, TrendingUp, ExternalLink } from 'lucide-react';
import { GST_NEWS } from '../../lib/data';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import { cn } from '../../lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  'Policy Reform': 'badge-danger',
  'Compliance': 'badge-warning',
  'Budget': 'badge-info',
  'E-Invoicing': 'badge-neutral',
  'Technology': 'badge-success',
  'Filing Deadline': 'badge-warning',
};

export default function GSTNewsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIdx, setActiveIdx] = useState(0);
  
  const featured = GST_NEWS.find(n => n.featured) || GST_NEWS[0];
  const others = GST_NEWS.filter(n => n.id !== featured.id);

  const CAROUSEL_ITEMS = others;
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < Math.max(0, CAROUSEL_ITEMS.length - 2);

  return (
    <section id="gst-news" ref={ref} className="section" style={{ background: `#0D0D0F` }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="badge-gold mb-3" style={{ background: 'rgba(201,169,75,0.08)', border: '1px solid rgba(201,169,75,0.2)', color: '#E8C96B' }}>Curated Updates</span>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: `#F5F5F7` }}>
              Stay{' '}
              <span style={{
                background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Informed</span>
            </h2>
            <p className="mt-4 text-sm max-w-lg" style={{ color: '#9898AA' }}>
              Preview our real-time news aggregation feature available in the Client Portal. We keep you updated on all critical GST, Income Tax, and MCA announcements.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              disabled={!canPrev}
              onClick={() => setActiveIdx(i => i - 1)}
              className="p-2 rounded-xl border disabled:opacity-30 transition-all"
              style={{ borderColor: 'rgba(201,169,75,0.2)', color: '#E8C96B' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={!canNext}
              onClick={() => setActiveIdx(i => i + 1)}
              className="p-2 rounded-xl border disabled:opacity-30 transition-all"
              style={{ borderColor: 'rgba(201,169,75,0.2)', color: '#E8C96B' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Featured story */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 card p-6 flex flex-col gap-5 relative overflow-hidden group cursor-pointer"
            style={{
              background: 'rgba(20,20,24,0.95)',
              border: '1px solid rgba(201,169,75,0.15)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none" 
                 style={{ background: 'rgba(201,169,75,0.05)' }} />

            <div className="flex items-center gap-2 relative">
              <span className="badge text-[10px]" style={{ background: 'rgba(201,169,75,0.1)', color: '#E8C96B' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse mr-1 inline-block" />
                Featured Analysis
              </span>
              {featured.trending && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} />
                  Trending
                </span>
              )}
            </div>

            <div className="relative flex-1">
              <h3 className="font-display text-xl mb-3 leading-snug transition-colors group-hover:text-amber-400" style={{ color: `#F5F5F7` }}>
                {featured.title}
              </h3>
              <p className="text-sm leading-relaxed line-clamp-4" style={{ color: '#9898AA' }}>
                {featured.excerpt}
              </p>
            </div>

            <div className="relative flex flex-col gap-3 mt-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {featured.tags?.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,169,75,0.08)', color: '#C9A94B' }}>
                    <Tag size={8} />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs" style={{ color: '#9898AA' }}>
                  <span className="badge text-[10px]" style={{ background: 'rgba(201,169,75,0.1)', color: '#E8C96B' }}>
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1"><Clock size={11} />{featured.readTime}</span>
                  <span>{featured.date}</span>
                </div>
                <button className="p-1.5 rounded-lg transition-all" style={{ color: '#E8C96B' }}>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-4"
          >
            <AnimatePresence mode="wait">
              {CAROUSEL_ITEMS.slice(activeIdx, activeIdx + 3).map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="card p-5 flex gap-4 group cursor-pointer transition-all duration-200"
                  style={{
                    background: 'rgba(20,20,24,0.6)',
                    border: '1px solid rgba(201,169,75,0.1)',
                  }}
                >
                  <div className="w-1 rounded-full flex-shrink-0" style={{
                    background: article.trending
                      ? 'linear-gradient(to bottom, #E8C96B, #C9A94B)'
                      : 'rgba(201,169,75,0.2)'
                  }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge text-[10px]" style={{ background: 'rgba(201,169,75,0.1)', color: '#E8C96B' }}>
                        {article.category}
                      </span>
                      {article.trending && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
                          <TrendingUp size={9} /> Trending
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-1.5 leading-snug transition-colors group-hover:text-amber-400" style={{ color: '#F5F5F7' }}>
                      {article.title}
                    </h4>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#9898AA' }}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: '#9898AA' }}>
                      <span className="flex items-center gap-1"><Clock size={11} />{article.readTime}</span>
                      <span>{article.date}</span>
                    </div>
                  </div>

                  <button className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#E8C96B' }}>
                    <ExternalLink size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Dots */}
            {CAROUSEL_ITEMS.length > 3 && (
              <div className="flex items-center gap-1.5 justify-center mt-2">
                {CAROUSEL_ITEMS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(Math.max(0, Math.min(i, CAROUSEL_ITEMS.length - 3)))}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      activeIdx <= i && i < activeIdx + 3 ? 'w-4' : 'w-1.5'
                    )}
                    style={{
                      background: activeIdx <= i && i < activeIdx + 3 ? '#E8C96B' : 'rgba(201,169,75,0.2)'
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
