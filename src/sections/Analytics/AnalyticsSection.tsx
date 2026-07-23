import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Sector,
} from 'recharts';
import { ANALYTICS_REVENUE, TAX_BREAKDOWN, RECENT_ACTIVITY } from '../../lib/data';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { CheckCircle, AlertTriangle, AlertCircle, Info, Activity } from 'lucide-react';
import { useState } from 'react';

const ACTIVITY_ICONS = {
  success: { Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  warning: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  danger: { Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  info: { Icon: Info, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
} as const;

function ComplianceRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const dash = circumference * (score / 100);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-navy-700" />
        <motion.circle
          cx="60" cy="60" r="52" fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference - dash }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="data-value text-3xl font-bold text-navy-900 dark:text-white">{score}%</div>
        <div className="text-xs text-slate-400 mt-0.5">Score</div>
      </div>
    </div>
  );
}

function ActiveShape(props: Record<string, unknown>) {
  const cx = props.cx as number;
  const cy = props.cy as number;
  const innerRadius = props.innerRadius as number;
  const outerRadius = props.outerRadius as number;
  const startAngle = props.startAngle as number;
  const endAngle = props.endAngle as number;
  const fill = props.fill as string;
  const payload = props.payload as { name: string };
  const value = props.value as number;


  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-display font-bold text-sm" style={{ fontSize: 13, fontFamily: 'JetBrains Mono' }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 11 }}>
        {value}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
}

export default function AnalyticsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activePie, setActivePie] = useState(0);

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace',
    },
    itemStyle: { color: '#94a3b8' },
  };

  return (
    <section id="analytics" ref={ref} className="section" style={{ background: `#0D0D0F` }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-gold mb-4">Analytics Dashboard</span>
          <h2 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: `#F5F5F7` }}>
            Your Tax{' '}
            <span className="gradient-text">Intelligence Hub</span>
          </h2>
          <p className=" text-lg max-w-2xl mx-auto">
            Revenue trends, tax liability breakdown, compliance scores, and real-time activity — in one beautiful dashboard.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Revenue Line Chart — full width */}
          <motion.div variants={fadeInUp} className="lg:col-span-3 card p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-navy-900 dark:text-white">Revenue vs Tax Liability</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 months · FY 2025-26</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-sky-400 inline-block" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-violet-400 inline-block" />Tax</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-emerald-400 inline-block" />Savings</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ANALYTICS_REVENUE}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${formatNumber(v)}`} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v) => [formatCurrency(Number(v))]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#38BDF8" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#38BDF8' }} />
                <Line type="monotone" dataKey="tax" stroke="#818CF8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#818CF8' }} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="savings" stroke="#34D399" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#34D399' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tax Breakdown Pie */}
          <motion.div variants={fadeInUp} className="lg:col-span-1 card p-5">
            <h3 className="font-semibold text-navy-900 dark:text-white mb-1">Tax Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Current FY distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={TAX_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  activeIndex={activePie}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error activeShape accepts component
                  activeShape={ActiveShape}
                  onMouseEnter={(_, i) => setActivePie(i)}
                >
                  {TAX_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {TAX_BREAKDOWN.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div>
                    <div className="text-[10px] text-slate-400 leading-none">{item.name}</div>
                    <div className="data-value text-xs font-semibold text-navy-900 dark:text-white">{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Compliance Score Ring */}
          <motion.div variants={fadeInUp} className="lg:col-span-1 card p-5 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-navy-900 dark:text-white">Compliance Score</h3>
              <p className="text-xs text-slate-400 mt-0.5">Based on filing accuracy & timeliness</p>
            </div>
            <ComplianceRing score={98} />
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
              {[
                { label: 'Returns Filed', val: '47/48' },
                { label: 'On-Time Rate', val: '97.9%' },
                { label: 'Notices', val: '0 Active' },
                { label: 'ITC Utilised', val: '₹28.4L' },
              ].map(item => (
                <div key={item.label} className="p-2 rounded-xl bg-slate-50 dark:bg-navy-900/60">
                  <div className="data-value text-sm font-bold text-navy-900 dark:text-white">{item.val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={fadeInUp} className="lg:col-span-1 card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="" />
              <h3 className="font-semibold text-navy-900 dark:text-white">Recent Activity</h3>
            </div>
            {RECENT_ACTIVITY.map((item, i) => {
              const cfg = ACTIVITY_ICONS[item.type as keyof typeof ACTIVITY_ICONS];
              const Icon = cfg.Icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={14} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy-900 dark:text-white leading-snug">{item.action}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                      {item.amount && (
                        <span className="data-value text-[10px] font-semibold ">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

