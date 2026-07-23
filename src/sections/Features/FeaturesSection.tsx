import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calculator, TrendingDown, Receipt, Bot, Users, BarChart2, FileText, ShieldCheck,
} from 'lucide-react';
import { useRef } from 'react';
import { FEATURES_DATA } from '../../lib/data';
import GoldDivider from '../../components/ui/GoldDivider';
import ScrollStack, { ScrollStackItem } from '../../components/ui/ScrollStack';

const ICON_MAP: Record<string, any> = {
  Calculator, TrendingDown, Receipt, Bot, Users, BarChart2, FileText, ShieldCheck,
};

// Map old accent colors to gold-charcoal palette accents
const GOLD_ACCENT = '#C9A94B';
const ICON_COLORS = ['#C9A94B', '#E8C96B', '#A68B30', '#C9A94B', '#E8C96B', '#A68B30', '#C9A94B', '#E8C96B'];

interface FeatureCardProps {
  feature: typeof FEATURES_DATA[0];
  index: number;
}

function FeatureStackedCard({ feature, index }: FeatureCardProps) {
  const Icon = ICON_MAP[feature.icon];
  const iconColor = ICON_COLORS[index % ICON_COLORS.length];

  return (
    <div
      className="group relative flex flex-col md:flex-row items-center gap-8 p-10 md:p-14 rounded-3xl overflow-hidden w-full max-w-4xl mx-auto"
      style={{
        background:   'rgba(20,20,24,0.95)',
        border:       '1px solid rgba(201,169,75,0.15)',
        boxShadow:    '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Radial glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(201,169,75,0.08), transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div
        className="relative w-24 h-24 rounded-3xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110"
        style={{
          background: `rgba(201,169,75,0.1)`,
          border:     `1px solid rgba(201,169,75,0.15)`,
          boxShadow:  'inset 0 1px 0 rgba(232,201,107,0.1)',
        }}
      >
        {Icon && <Icon size={48} style={{ color: iconColor }} strokeWidth={1.5} />}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
        <h3
          className="font-display text-3xl font-bold transition-colors duration-200"
          style={{ color: '#F5F5F7' }}
        >
          {feature.title}
        </h3>
        <p className="text-lg leading-relaxed" style={{ color: '#9898AA' }}>
          {feature.desc}
        </p>
      </div>

      {/* Learn more button */}
      <div className="flex-shrink-0 hidden md:block z-10 relative">
        <Link 
          to="/login"
          className="px-6 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 hover:bg-white/5 cursor-pointer"
          style={{ borderColor: 'rgba(201,169,75,0.3)', color: '#E8C96B' }}
        >
          <span>Explore Tool</span>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="#E8C96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="features"
      ref={ref}
      className="section"
      style={{ background: '#0D0D0F', paddingBottom: '120px' }}
    >
      <div className="container-app">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-24 flex flex-col items-center gap-5"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'rgba(201,169,75,0.08)',
              border:     '1px solid rgba(201,169,75,0.2)',
              color:      '#E8C96B',
            }}
          >
            Platform Capabilities
          </span>

          <h2
            className="font-display text-4xl sm:text-5xl lg:text-6xl max-w-3xl"
            style={{ color: '#F5F5F7' }}
          >
            Everything your business{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              needs to comply
            </span>
          </h2>

          <div className="w-32">
            <GoldDivider />
          </div>

          <p className="text-lg max-w-xl leading-relaxed" style={{ color: '#9898AA' }}>
            Log in to our Client Portal to access our complete suite of digital tax tools, 
            from live GST calculators to AI-powered advisory.
          </p>
        </motion.div>

        {/* Scroll Stack Presentation */}
        <div className="mt-10 px-4">
          <ScrollStack 
            useWindowScroll={true} 
            itemStackDistance={35} 
            itemScale={0.04} 
            baseScale={0.88}
            itemDistance={120}
          >
            {FEATURES_DATA.map((feature, i) => (
              <ScrollStackItem key={feature.id}>
                <FeatureStackedCard feature={feature} index={i} />
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}
