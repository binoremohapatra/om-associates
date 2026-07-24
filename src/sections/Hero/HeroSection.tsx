import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, CheckCircle2, TrendingUp, Zap, FileText, Building2, Scale, Globe, HeartHandshake } from 'lucide-react';
import { useRef } from 'react';
import LineWaves from '../../components/ui/LineWaves';
import GoldDivider from '../../components/ui/GoldDivider';
import { Link } from 'react-router-dom';
import OrbitImages from '../../components/ui/OrbitImages';

const USP_CARDS = [
  { icon: Zap, title: 'GST Registration', desc: 'GST Registration in as little as 3 Hours*' },
  { icon: FileText, title: 'Income Tax', desc: 'Fast, Accurate & Hassle-Free ITR Filing' },
  { icon: Building2, title: 'Business Registration', desc: 'Company, LLP, Partnership & Proprietorship' },
  { icon: Scale, title: 'Legal Compliance', desc: 'Corporate Legal Advisory & Support' },
  { icon: Globe, title: 'Import Export', desc: 'IEC Registration & DGFT Consultation' },
  { icon: HeartHandshake, title: 'Trusted Support', desc: 'Dedicated Expert Assistance' },
];

const TRUST_BADGES = [
  { icon: Shield,   label: 'ISO 27001 Certified' },
  { icon: CheckCircle2, label: 'DPIIT Recognised' },
  { icon: TrendingUp,   label: 'GSTIN Verified' },
];

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y       = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#0D0D0F' }}>
      {/* LineWaves background */}
      <div className="absolute inset-0 z-0">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1}
          rotation={-45}
          edgeFadeWidth={0}
          colorCycleSpeed={1}
          brightness={0.2}
          color1="#D4AF37"
          color2="#E8C76A"
          color3="#F4E3A1"
          enableMouseInteraction
          mouseInfluence={2}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,169,75,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,75,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
        }}
      />

      <motion.div style={{ y, opacity }} className="relative z-10 w-full pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8">

          {/* Gold dot separator */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-48"
          >
            <GoldDivider />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <h1
              className="font-display"
              style={{
                color:       '#F5F5F7',
                lineHeight:  1.05,
                letterSpacing: '-0.02em',
                fontWeight:  700,
                fontSize:    'clamp(2rem, 6vw + 0.5rem, 5.5rem)',
              }}
            >
              Precision in Tax.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FAF4DC 0%, #E8C96B 40%, #C9A94B 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Authority
              </span>
              {' '}in Compliance.
            </h1>
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="leading-relaxed max-w-2xl text-center"
            style={{ color: '#9898AA', fontSize: 'clamp(0.95rem, 1.5vw + 0.3rem, 1.25rem)' }}
          >
            End-to-end GST filing, Income Tax advisory, TDS compliance, and AI-powered financial consulting — 
            delivered by India's most trusted tax professionals.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col xs:flex-row sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto"
          >
            <Link
              to="/login"
              aria-label="Book a tax consultation"
              title="Book a Consultation"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl font-semibold transition-all duration-300"
              style={{
                background:   'linear-gradient(135deg, #C9A94B 0%, #E8C96B 50%, #C9A94B 100%)',
                backgroundSize: '200% auto',
                color:        '#0D0D0F',
                boxShadow:    '0 8px 32px rgba(201,169,75,0.35)',
                letterSpacing:'0.03em',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 3vw, 2rem)',
                fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
              }}
            >
              Book a Consultation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform flex-shrink-0" aria-hidden="true" />
            </Link>

            <Link
              to="/login"
              aria-label="Explore the OM Associates platform"
              title="Explore Platform"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl font-semibold transition-all duration-300 hover:bg-white/5"
              style={{
                background:   'rgba(201,169,75,0.06)',
                border:       '1px solid rgba(201,169,75,0.25)',
                color:        '#E8C96B',
                backdropFilter: 'blur(12px)',
                letterSpacing: '0.03em',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 3vw, 2rem)',
                fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
              }}
            >
              Explore Platform
            </Link>
          </motion.div>


          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-[10px] uppercase tracking-wider"
            style={{ color: '#68687C' }}
          >
            *GST Registration in as little as 3 Hours is subject to complete documentation and government processing timelines.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4"
          >
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-medium"
                style={{
                  background:   'rgba(20,20,24,0.7)',
                  border:       '1px solid rgba(201,169,75,0.12)',
                  color:        '#9898AA',
                  backdropFilter: 'blur(8px)',
                  fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
                }}
              >
                <Icon size={12} style={{ color: '#C9A94B', flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
