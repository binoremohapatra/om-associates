import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Sector,
} from 'recharts';
import axios from 'axios';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { CheckCircle, AlertTriangle, AlertCircle, Info, Activity, BarChart2 } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';

// Interfaces for fetched data
interface AnalyticsData {
  compliance: { score: number; returnsFiled: string; onTimeRate: string; activeNotices: number; itcUtilised: string };
  revenueTrends: { month: string; revenue: number; tax: number; savings: number }[];
  taxBreakdown: { name: string; value: number; amount: number; color: string }[];
  recentActivity: { id: string; type: string; action: string; time: string; amount: number | null }[];
}

const ACTIVITY_ICONS = {
  success: { Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
  warning: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/20' },
  danger: { Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10 border border-red-500/20' },
  info: { Icon: Info, color: 'text-sky-500', bg: 'bg-sky-500/10 border border-sky-500/20' },
} as const;

function ComplianceRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const dash = circumference * (score / 100);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r="52" fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A94B" />
            <stop offset="100%" stopColor="#E8C96B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-white font-display">{score}%</div>
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
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-display font-bold text-sm" style={{ fontSize: 13 }}>
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

export default function AnalyticsDashboardPage() {
  const [activePie, setActivePie] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:4000/api/v1/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tooltipStyle = {
    contentStyle: {
      background: 'rgba(13,13,15,0.9)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      fontSize: 12,
    },
    itemStyle: { color: '#94a3b8' },
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#C9A94B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-white">Failed to load analytics data.</div>;
  }

  const { compliance, revenueTrends, taxBreakdown, recentActivity } = data;

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 sm:p-6 lg:p-8 pb-12 w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20">
              <BarChart2 className="w-6 h-6 text-[#C9A94B]" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-medium text-white mb-1">Analytics Dashboard</h1>
              <p className="text-slate-500">Your tax intelligence hub, revenue trends, and compliance scores.</p>
            </div>
          </div>
        </div>

        <MagicBentoGrid className="flex flex-col shrink-0 w-full gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Line Chart */}
            <BentoCard className="lg:col-span-3 p-0" noPadding>
              <div className="p-8 pb-0">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white mb-1">Revenue vs Tax Liability</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Last 6 months · FY 2025-26</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-sky-400 inline-block" />Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-violet-400 inline-block" />Tax</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-emerald-400 inline-block" />Savings</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrends}>
                    <defs>
                      <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
              </div>
            </BentoCard>

            {/* Tax Breakdown Pie */}
            <BentoCard className="lg:col-span-1" noPadding>
              <div className="p-8 pb-0">
                <h3 className="font-display font-bold text-xl text-white mb-1">Tax Breakdown</h3>
                <p className="text-sm text-slate-400">Current FY distribution</p>
              </div>
              <div className="px-8 mt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={taxBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      dataKey="value"
                      activeIndex={activePie}
                      // @ts-expect-error recharts type mismatch
                      activeShape={ActiveShape}
                      onMouseEnter={(_, i) => setActivePie(i)}
                    >
                      {taxBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pb-8">
                  {taxBreakdown.map(item => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <div>
                        <div className="text-[11px] text-slate-400 leading-none mb-1">{item.name}</div>
                        <div className="font-display font-bold text-sm text-white">{formatCurrency(item.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Compliance Score Ring */}
            <BentoCard className="lg:col-span-1" noPadding>
              <div className="p-8 pb-4 text-center">
                <h3 className="font-display font-bold text-xl text-white mb-1">Compliance Score</h3>
                <p className="text-sm text-slate-400">Based on filing accuracy & timeliness</p>
              </div>
              <div className="px-8 pb-8 flex flex-col items-center justify-center gap-6">
                <ComplianceRing score={compliance.score} />
                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: 'Returns Filed', val: compliance.returnsFiled },
                    { label: 'On-Time Rate', val: compliance.onTimeRate },
                    { label: 'Notices', val: `${compliance.activeNotices} Active` },
                    { label: 'ITC Utilised', val: compliance.itcUtilised },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="font-display text-lg font-bold text-white">{item.val}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Activity Feed */}
            <BentoCard className="lg:col-span-1" noPadding>
              <div className="p-8 pb-6">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-[#C9A94B]" />
                  <h3 className="font-display font-bold text-xl text-white">Recent Activity</h3>
                </div>
              </div>
              <div className="px-8 pb-8 flex flex-col gap-5">
                {recentActivity.map((item, i) => {
                  const cfg = ACTIVITY_ICONS[item.type as keyof typeof ACTIVITY_ICONS] || ACTIVITY_ICONS.info;
                  const Icon = cfg.Icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-4"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-snug">{item.action}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-400">{item.time}</span>
                          {item.amount && (
                            <span className="font-display text-xs font-semibold text-[#C9A94B]">
                              {formatCurrency(item.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </BentoCard>

          </div>
        </MagicBentoGrid>
      </div>
    </div>
  );
}
