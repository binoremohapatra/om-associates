import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle, Clock, Calendar } from 'lucide-react';
import { GST_UPDATES, FILING_TIMELINE, GST_RATES } from '../../lib/data';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import { formatCurrency, cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

// GST Calculator
function GSTCalculator() {
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState(18);
  const [type, setType] = useState<'intra' | 'inter'>('intra');

  const base = parseFloat(amount) || 0;
  const gstAmount = (base * rate) / 100;
  const half = gstAmount / 2;

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy-900 dark:text-white">GST Calculator</h3>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-navy-900 rounded-lg">
          {(['intra', 'inter'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                type === t ? 'bg-white dark:bg-navy-700 shadow-sm text-navy-900 dark:text-white' : ''
              }`}
            >
              {t === 'intra' ? 'Intra-state' : 'Inter-state'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs  font-medium">Taxable Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input-field mt-1 text-sm"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label className="text-xs  font-medium">GST Rate</label>
          <select
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="input-field mt-1 text-sm"
          >
            {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {type === 'intra' ? (
          <>
            <div className="p-2 rounded-lg bg-white dark:bg-navy-800">
              <div className="text-xs text-slate-400 mb-1">CGST ({rate / 2}%)</div>
              <div className="data-value font-bold text-navy-900 dark:text-white">{formatCurrency(half)}</div>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-navy-800">
              <div className="text-xs text-slate-400 mb-1">SGST ({rate / 2}%)</div>
              <div className="data-value font-bold text-navy-900 dark:text-white">{formatCurrency(half)}</div>
            </div>
          </>
        ) : (
          <div className="col-span-2 p-2 rounded-lg bg-white dark:bg-navy-800">
            <div className="text-xs text-slate-400 mb-1">IGST ({rate}%)</div>
            <div className="data-value font-bold text-navy-900 dark:text-white">{formatCurrency(gstAmount)}</div>
          </div>
        )}
        <div className="col-span-2 p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20">
          <div className="text-xs text-slate-500 mb-1">Total Invoice Value</div>
          <div className="data-value font-bold text-sky-600 dark: text-base">{formatCurrency(base + gstAmount)}</div>
        </div>
      </div>
    </div>
  );
}

// Filing Timeline
function FilingTimeline() {
  const statusConfig = {
    filed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'Filed' },
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', label: 'Due Soon' },
    upcoming: { icon: Calendar, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-navy-700', label: 'Upcoming' },
    overdue: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', label: 'Overdue' },
  };

  return (
    <div className="card p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-navy-900 dark:text-white">Filing Timeline</h3>
      {FILING_TIMELINE.map(entry => {
        const cfg = statusConfig[entry.status];
        const StatusIcon = cfg.icon;
        return (
          <div key={entry.form} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-900/50 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <StatusIcon size={16} className={cfg.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="data-value text-sm font-bold text-navy-900 dark:text-white">{entry.form}</span>
                <span className="text-xs  truncate">{entry.description}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Due: {entry.dueDate} · {entry.frequency}</div>
            </div>
            <span className={`badge text-[10px] ${cfg.bg} ${cfg.color} border-0`}>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function GSTSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { toast } = useToast();

  const severityConfig = {
    high: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/8 border-red-200 dark:border-red-500/20' },
    medium: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/8 border-amber-200 dark:border-amber-500/20' },
    low: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/8 border-blue-200 dark:border-blue-500/20' },
  };

  return (
    <section id="gst" ref={ref} className="section" style={{ background: `#0D0D0F` }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge badge-warning mb-4">GST Management</span>
          <h2 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: `#F5F5F7` }}>
            Complete GST{' '}
            <span className="gradient-text">Command Centre</span>
          </h2>
          <p className=" text-lg max-w-2xl mx-auto">
            Latest updates, live calculator, filing deadlines, and compliance status — all in one place.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Updates */}
          <motion.div variants={fadeInUp} className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-navy-900 dark:text-white">Latest Updates</h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            {GST_UPDATES.map(update => {
              const cfg = severityConfig[update.severity];
              const SevIcon = cfg.icon;
              return (
                <div key={update.id} className={`p-3 rounded-xl border ${cfg.bg}`}>
                  <div className="flex items-start gap-2">
                    <SevIcon size={14} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className="text-xs font-semibold text-navy-900 dark:text-white leading-snug">{update.title}</p>
                      <p className="text-xs  mt-1 leading-relaxed">{update.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge badge-neutral text-[10px]">{update.category}</span>
                        <span className="text-[10px] text-slate-400">{update.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Notification bell */}
            <button
              onClick={() => toast({ type: 'success', title: 'Subscribed to GST updates', message: 'You\'ll receive real-time notifications' })}
              className="flex items-center gap-2 text-sm text-sky-500 hover: transition-colors font-medium mt-1"
            >
              <Bell size={14} />
              Subscribe to alerts
            </button>
          </motion.div>

          {/* Calculator */}
          <motion.div variants={fadeInUp}>
            <GSTCalculator />
          </motion.div>

          {/* Timeline */}
          <motion.div variants={fadeInUp}>
            <FilingTimeline />
          </motion.div>
        </motion.div>

        {/* Compliance Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-5 card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/10 dark:to-sky-900/10 border-emerald-200/50 dark:border-emerald-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-navy-900 dark:text-white">GST Compliance Status: <span className="text-emerald-500">Excellent</span></p>
              <p className="text-sm ">All returns filed on time · No pending notices · ITC reconciled</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="data-value text-2xl font-bold text-emerald-500">98.4%</div>
              <div className="text-xs text-slate-400">Compliance Score</div>
            </div>
            <button
              onClick={() => toast({ type: 'info', title: 'Generating compliance report...', duration: 2500 })}
              className="btn-primary text-sm"
            >
              Download Report
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

