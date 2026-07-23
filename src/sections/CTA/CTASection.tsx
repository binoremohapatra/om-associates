import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Bot } from 'lucide-react';

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section py-32 relative overflow-hidden" style={{ background: '#0D0D0F' }}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-app relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center flex flex-col items-center rounded-[32px] sm:rounded-[40px]"
          style={{
            background: 'linear-gradient(180deg, rgba(20,20,24,0.8) 0%, rgba(13,13,15,1) 100%)',
            border: '1px solid rgba(201,169,75,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,169,75,0.1)',
            padding: 'clamp(1.5rem, 5vw, 4rem)',
          }}
        >
          <h2 className="font-display font-bold mb-4 sm:mb-6" style={{ color: '#F5F5F7', lineHeight: 1.1, fontSize: 'clamp(1.75rem, 5vw + 0.3rem, 4rem)' }}>
            Need Expert Tax &{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Legal Assistance?</span>
          </h2>
          
          <p className="max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed" style={{ color: '#9898AA', fontSize: 'clamp(0.9rem, 1.5vw + 0.2rem, 1.25rem)' }}>
            Book a consultation with OMM Associates today and let our experts handle your taxation, GST, legal compliance and business registration needs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #C9A94B 0%, #E8C96B 50%, #C9A94B 100%)',
                backgroundSize: '200% auto',
                color: '#0D0D0F',
                boxShadow: '0 8px 32px rgba(201,169,75,0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundPosition = 'right center';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundPosition = 'left center';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              Book Consultation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>


          </div>
        </motion.div>
      </div>
    </section>
  );
}
