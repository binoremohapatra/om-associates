import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, ShieldCheck, FileCheck2, IndianRupee, HeartHandshake, TrendingUp } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/animations';

const REASONS = [
  {
    icon: Zap,
    title: 'Fast Turnaround',
    desc: 'GST Registration in as little as 3 Hours* for eligible applications.'
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Professionals',
    desc: 'Experienced Legal & Tax Consultants for individuals and businesses.'
  },
  {
    icon: FileCheck2,
    title: 'End-to-End Compliance',
    desc: 'From registration to annual filings, we handle everything.'
  },
  {
    icon: IndianRupee,
    title: 'Transparent Pricing',
    desc: 'Clear pricing with no hidden charges or last-minute surprises.'
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated Support',
    desc: 'Quick responses and personalized guidance for every client.'
  },
  {
    icon: TrendingUp,
    title: 'Business Growth Partner',
    desc: 'We help startups, MSMEs, freelancers and established businesses stay compliant.'
  }
];

export default function WhyChooseUsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="why-us" ref={ref} className="section py-24" style={{ background: '#0D0D0F' }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 flex flex-col items-center gap-4"
        >
          <span className="badge-gold" style={{ background: 'rgba(201,169,75,0.08)', border: '1px solid rgba(201,169,75,0.2)', color: '#E8C96B' }}>The Om Associates Advantage</span>
          <h2 className="font-display" style={{ color: '#F5F5F7', fontSize: 'clamp(1.75rem, 4vw + 0.3rem, 3.5rem)' }}>
            Why Choose{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>OM Associates</span>
          </h2>
          <p className="max-w-2xl text-center" style={{ color: '#9898AA', fontSize: 'clamp(0.9rem, 1.5vw + 0.2rem, 1.1rem)' }}>
            We don't just file your returns; we partner with you to ensure long-term compliance, financial health, and legal security.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto"
        >
          {REASONS.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group relative rounded-3xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(20,20,24,0.8)',
                  border: '1px solid rgba(201,169,75,0.1)',
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(25,25,30,0.95)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,75,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(20,20,24,0.8)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,75,0.1)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Subtle glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at top right, rgba(201,169,75,0.08), transparent 70%)' }}
                />

                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div
                    className="rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background: 'rgba(201,169,75,0.1)',
                      border: '1px solid rgba(201,169,75,0.15)',
                      boxShadow: 'inset 0 1px 0 rgba(232,201,107,0.1)',
                      width: 'clamp(52px, 6vw, 64px)',
                      height: 'clamp(52px, 6vw, 64px)',
                    }}
                  >
                    <Icon style={{ color: '#E8C96B', width: 'clamp(22px, 3vw, 28px)', height: 'clamp(22px, 3vw, 28px)' }} />
                  </div>
                  
                  <h3 className="font-display font-bold mt-2" style={{ color: '#F5F5F7', fontSize: 'clamp(1rem, 1.8vw + 0.2rem, 1.3rem)' }}>
                    {reason.title}
                  </h3>
                  
                  <p style={{ color: '#9898AA', fontSize: 'clamp(0.8rem, 1.3vw + 0.1rem, 0.9375rem)', lineHeight: '1.6' }}>
                    {reason.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
