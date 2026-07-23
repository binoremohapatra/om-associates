import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { TAX_SLABS_NEW, TAX_SLABS_OLD } from '../../lib/data';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import { formatCurrency } from '../../lib/utils';

type Regime = 'new' | 'old';

function SlabBar({ slab, maxRate, delay }: { slab: typeof TAX_SLABS_NEW[0]; maxRate: number; delay: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex items-center gap-4 group"
    >
      <div className="w-20 sm:w-28 text-xs font-mono text-slate-500 dark:text-slate-400 text-right flex-shrink-0">{slab.range}</div>
      <div className="flex-1 relative h-9 flex items-center">
        <div className="absolute inset-y-0 left-0 right-0 rounded-lg" style={{ background: 'rgba(46,46,58,0.6)' }} />
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(slab.rate / maxRate) * 100}%` }}
          viewport={{ once: true }}
          transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-1 left-1 rounded-md"
          style={{ background: 'linear-gradient(90deg, #A68B30, #E8C96B)', minWidth: slab.rate > 0 ? 40 : 0 }}
        />
        {slab.rate === 0 ? (
          <span className="relative z-10 ml-3 text-xs font-semibold text-slate-400">Exempt</span>
        ) : (
          <span className="relative z-10 ml-3 text-xs font-bold text-white">{slab.label}</span>
        )}
      </div>
      <div className="w-12 data-value text-sm font-semibold text-navy-900 dark:text-white text-right">{slab.label}</div>
    </motion.div>
  );
}

function TaxCalculator({ regime }: { regime: Regime }) {
  const [income, setIncome] = useState(1500000);
  const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;

  const computeTax = (inc: number) => {
    let tax = 0;
    const brackets = regime === 'new'
      ? [0, 300000, 700000, 1000000, 1200000, 1500000]
      : [0, 250000, 500000, 1000000];
    const rates = regime === 'new' ? [0, 0.05, 0.10, 0.15, 0.20, 0.30] : [0, 0.05, 0.20, 0.30];

    for (let i = 1; i < brackets.length; i++) {
      if (inc > brackets[i - 1]) {
        const taxable = Math.min(inc, brackets[i] ?? inc) - brackets[i - 1];
        tax += taxable * rates[i - 1];
      }
    }
    if (inc > (brackets[brackets.length - 1] ?? 0)) {
      const taxable = inc - (brackets[brackets.length - 1] ?? 0);
      tax += taxable * rates[rates.length - 1];
    }
    return Math.max(0, tax);
  };

  const tax = computeTax(income);
  const cess = tax * 0.04;
  const total = tax + cess;
  const effective = income > 0 ? (total / income) * 100 : 0;

  return (
    <div className="mt-6 p-5 rounded-2xl" style={{ background: 'rgba(13,13,15,0.6)', border: '1px solid rgba(201,169,75,0.1)' }}>
      <div className="mb-4">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C9A94B' }}>Annual Income</label>
        <input
          type="range"
          min={0}
          max={10000000}
          step={50000}
          value={income}
          onChange={e => setIncome(Number(e.target.value))}
          className="w-full mt-2"
          style={{ accentColor: '#C9A94B' }}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs" style={{ color: '#68687C' }}>₹0</span>
          <span className="data-value text-lg font-bold" style={{ color: '#E8C96B' }}>{formatCurrency(income)}</span>
          <span className="text-xs" style={{ color: '#68687C' }}>₹1 Cr</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Base Tax', value: formatCurrency(tax) },
          { label: 'Health & Ed. Cess (4%)', value: formatCurrency(cess) },
          { label: 'Total Tax Liability', value: formatCurrency(total), highlight: true },
          { label: 'Effective Tax Rate', value: `${effective.toFixed(1)}%`, mono: true },
        ].map(item => (
          <div key={item.label} className="p-3 rounded-xl" style={item.highlight ? { background: 'rgba(201,169,75,0.08)', border: '1px solid rgba(201,169,75,0.2)' } : { background: 'rgba(20,20,24,0.7)', border: '1px solid rgba(201,169,75,0.06)' }}>
            <div className="text-xs" style={{ color: '#68687C' }}>{item.label}</div>
            <div className="data-value text-sm font-bold mt-0.5" style={{ color: item.highlight ? '#E8C96B' : '#F5F5F7' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TaxSlabsSection() {
  const [regime, setRegime] = useState<Regime>('new');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;
  const maxRate = Math.max(...slabs.map(s => s.rate));

  return (
    <section id="tax-slabs" ref={ref} className="section" style={{ background: '#141418' }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 flex flex-col items-center gap-4"
        >
          <span className="badge-gold">FY 2025-26</span>
          <h2 className="font-display" style={{ color: '#F5F5F7', fontSize: 'clamp(1.75rem, 4vw + 0.3rem, 3.5rem)' }}>
            Compare Tax Regimes
          </h2>
          <p className="max-w-xl" style={{ color: '#9898AA', fontSize: 'clamp(0.9rem, 1.5vw + 0.2rem, 1.1rem)' }}>
            Understand how the New and Old tax regimes differ and find which one saves you more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          {/* Left: Slab bars */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-6"
            style={{ background: 'rgba(20,20,24,0.7)', border: '1px solid rgba(201,169,75,0.1)', backdropFilter: 'blur(16px)' }}
          >
            {/* Regime toggle */}
            <div className="flex items-center gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(13,13,15,0.6)', border: '1px solid rgba(201,169,75,0.1)' }}>
              {(['new', 'old'] as Regime[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRegime(r)}
                  className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ color: regime === r ? '#0D0D0F' : '#9898AA', cursor: 'pointer', border: 'none', background: 'transparent' }}
                >
                  {regime === r && (
                    <motion.div
                      layoutId="regime-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #C9A94B, #E8C96B)' }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{r} Regime</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={regime}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                {slabs.map((slab, i) => (
                  <SlabBar key={slab.range} slab={slab} maxRate={maxRate} delay={i * 0.06} />
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(201,169,75,0.06)', border: '1px solid rgba(201,169,75,0.15)' }}>
              <Info size={14} style={{ color: '#C9A94B', marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: '#9898AA' }}>
                {regime === 'new'
                  ? 'New regime has lower rates but allows limited deductions. Standard deduction of ₹75,000 is available.'
                  : 'Old regime allows full deductions under 80C, 80D, HRA, etc. Best for those with significant investments.'}
              </p>
            </div>
          </motion.div>

          {/* Right: Interactive calculator */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl p-6"
            style={{ background: 'rgba(20,20,24,0.7)', border: '1px solid rgba(201,169,75,0.1)', backdropFilter: 'blur(16px)' }}
          >
            <h3 className="font-display font-semibold text-lg mb-1" style={{ color: '#F5F5F7' }}>
              Live Tax Calculator
            </h3>
            <p className="text-sm" style={{ color: '#9898AA' }}>
              Drag the slider to compute your tax under the <span className="font-medium capitalize" style={{ color: '#C9A94B' }}>{regime}</span> regime.
            </p>
            <TaxCalculator regime={regime} />

            {/* Comparison note */}
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(201,169,75,0.06)', border: '1px solid rgba(201,169,75,0.15)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#C9A94B' }}>💡 Pro Tip</p>
              <p className="text-xs" style={{ color: '#9898AA' }}>
                Switch to the Old Regime and subtract your 80C (₹1.5L), 80D (₹25K), and HRA deductions before comparing. Our AI can run this analysis automatically for you.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
