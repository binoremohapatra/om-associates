import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Calculator, Building2, Globe, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/animations';

const SERVICES = [
  {
    id: 'taxation',
    title: 'Taxation',
    icon: Calculator,
    items: [
      'Income Tax Return (ITR)',
      'Tax Planning',
      'Tax Saving Advisory',
      'Income Tax Notices'
    ]
  },
  {
    id: 'gst',
    title: 'GST Services',
    icon: FileText,
    items: [
      'GST Registration',
      'GST Return Filing',
      'GST Notices & Audit',
      'GST Cancellation & Amendment'
    ]
  },
  {
    id: 'business',
    title: 'Business Registration',
    icon: Building2,
    items: [
      'Private Limited Company & OPC',
      'LLP & Partnership Firm',
      'MSME/Udyam Registration',
      'Startup Registration'
    ]
  },
  {
    id: 'import',
    title: 'Import Export',
    icon: Globe,
    items: [
      'IEC Registration',
      'DGFT Services',
      'Import Export Consultancy'
    ]
  },
  {
    id: 'compliance',
    title: 'Corporate Compliance',
    icon: ShieldCheck,
    items: [
      'ROC Filing & Annual Compliance',
      'Director KYC',
      'Board Resolution Support',
      'Corporate Advisory'
    ]
  },
  {
    id: 'legal',
    title: 'Legal Documentation',
    icon: Scale,
    items: [
      'Legal Consultancy',
      'Business Agreements',
      'Legal Notices',
      'Corporate Documentation'
    ]
  }
];

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="services" ref={ref} className="section" style={{ background: '#0D0D0F' }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-4" style={{ background: 'rgba(201,169,75,0.08)', border: '1px solid rgba(201,169,75,0.2)', color: '#E8C96B' }}>Our Expertise</span>
          <h2 className="font-display mb-4" style={{ color: '#F5F5F7', fontSize: 'clamp(1.75rem, 4vw + 0.3rem, 3.5rem)' }}>
            Comprehensive{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Service Portfolio</span>
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#9898AA', fontSize: 'clamp(0.9rem, 1.5vw + 0.2rem, 1.1rem)' }}>
            From lighting-fast GST registrations to complex corporate legal matters, Om Associates brings precision and authority to every engagement.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto"
        >
          {SERVICES.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                variants={fadeInUp}
                className="group flex flex-col rounded-3xl transition-all duration-300"
                style={{
                  background: 'rgba(20,20,24,0.6)',
                  border: '1px solid rgba(201,169,75,0.1)',
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,75,0.3)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,75,0.1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(201,169,75,0.1)', width: 'clamp(40px,5vw,48px)', height: 'clamp(40px,5vw,48px)' }}
                  >
                    <Icon style={{ color: '#E8C96B', width: 'clamp(18px,3vw,22px)', height: 'clamp(18px,3vw,22px)' }} />
                  </div>
                  <h3 className="font-display font-bold" style={{ color: '#F5F5F7', fontSize: 'clamp(1.1rem, 2vw + 0.2rem, 1.5rem)' }}>
                    {category.title}
                  </h3>
                </div>

                <ul className="flex flex-col gap-3 flex-1">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 style={{ color: '#C9A94B', flexShrink: 0, marginTop: '3px', width: 'clamp(14px,2vw,16px)', height: 'clamp(14px,2vw,16px)' }} />
                      <span style={{ color: '#9898AA', fontSize: 'clamp(0.8rem, 1.3vw + 0.1rem, 0.9375rem)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
