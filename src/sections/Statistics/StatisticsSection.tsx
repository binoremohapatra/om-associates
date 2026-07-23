import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import CountUp from '../../components/ui/CountUp';

const STATS = [
  { label: 'Happy Clients', value: 5000, suffix: '+', prefix: '' },
  { label: 'Years of Experience', value: 10, suffix: '+', prefix: '' },
  { label: 'Returns Filed', value: 10000, suffix: '+', prefix: '' },
  { label: 'GST Registrations', value: 1000, suffix: '+', prefix: '' },
  { label: 'Client Satisfaction', value: 99, suffix: '%', prefix: '' },
  { label: 'Expert Support', value: 24, suffix: '/7', prefix: '' },
];

export default function StatisticsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section py-20" style={{ background: '#121217', borderTop: '1px solid rgba(201,169,75,0.1)' }}>
      <div className="container-app">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="font-display text-4xl sm:text-5xl font-bold flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #E8C96B, #C9A94B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.prefix}
                <CountUp
                  to={stat.value}
                  direction="up"
                  duration={2.5}
                />
                {stat.suffix}
              </div>
              <p className="text-sm font-medium uppercase tracking-wider" style={{ color: '#9898AA' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
