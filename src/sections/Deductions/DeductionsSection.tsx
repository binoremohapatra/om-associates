import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Briefcase, TrendingUp, Lightbulb, Rocket, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DEDUCTION_CATEGORIES } from '../../lib/data';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

const ICON_MAP: Record<string, any> = { Briefcase, TrendingUp, Lightbulb, Rocket };

const ALL_FILTER = 'All';

export default function DeductionsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filtered = DEDUCTION_CATEGORIES
    .filter(c => activeCategory === ALL_FILTER || c.id === activeCategory)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.section.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0);

  const chartData = DEDUCTION_CATEGORIES.map(c => ({
    name: c.label.split(' ')[0],
    savings: Math.round(c.totalSavings / 1000),
    color: c.color,
  }));

  return (
    <section id="deductions" ref={ref} className="section" style={{ background: `#141418` }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge badge-success mb-4">Save More Tax</span>
          <h2 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: `#F5F5F7` }}>
            Tax Deduction{' '}
            <span className="gradient-text">Analyzer</span>
          </h2>
          <p className=" text-lg max-w-2xl mx-auto">
            Explore every eligible deduction for your business. Know what you can claim, under which section, and how much you can save.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar: search + filter + chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search deductions, sections..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            {/* Category Filters */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={14} className="text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider ">Categories</span>
              </div>
              <div className="flex flex-col gap-1">
                {[ALL_FILTER, ...DEDUCTION_CATEGORIES.map(c => c.id)].map(id => {
                  const cat = DEDUCTION_CATEGORIES.find(c => c.id === id);
                  const Icon = cat ? ICON_MAP[cat.icon] : null;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveCategory(id)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150',
                        activeCategory === id
                          ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      )}
                    >
                      {Icon && <Icon size={15} />}
                      {id === ALL_FILTER ? 'All Categories' : cat?.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Savings Chart */}
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider  mb-4">Savings by Category (₹K)</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`₹${Number(v)}K`, 'Savings']}
                  />
                  <Bar dataKey="savings" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right: Deduction cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {filtered.length === 0 ? (
              <motion.div variants={fadeInUp} className="card p-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-navy-700 flex items-center justify-center">
                  <Search size={24} className="text-slate-400" />
                </div>
                <p className="font-semibold text-navy-900 dark:text-white">No deductions match your search</p>
                <p className="text-sm ">Try searching by section number (e.g., "80C") or deduction name</p>
                <button onClick={() => { setSearch(''); setActiveCategory(ALL_FILTER); }} className="btn-secondary text-sm mt-1">
                  Clear filters
                </button>
              </motion.div>
            ) : (
              filtered.map(cat => {
                const Icon = ICON_MAP[cat.icon];
                return (
                  <motion.div key={cat.id} variants={fadeInUp} className="card overflow-hidden">
                    {/* Category header */}
                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}18` }}>
                          <Icon size={18} style={{ color: cat.color }} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-navy-900 dark:text-white">{cat.label}</div>
                          <div className="text-xs ">{cat.items.length} deductions available</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-bold text-emerald-500">{formatCurrency(cat.totalSavings)}</div>
                        <div className="text-xs text-slate-400">Potential savings</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {cat.items.map(item => {
                        const key = `${cat.id}-${item.name}`;
                        const isExpanded = expandedItem === key;
                        return (
                          <div key={key}>
                            <button
                              onClick={() => setExpandedItem(isExpanded ? null : key)}
                              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/2 transition-colors text-left"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-navy-900 dark:text-white">{item.name}</span>
                                  <span className="badge-gold text-[10px] py-0.5">Sec {item.section}</span>
                                </div>
                                <div className="text-xs  mt-0.5">Max: {item.maxAmount}</div>
                              </div>
                              {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 pb-4 pt-1 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-navy-900/40">
                                    {item.description}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

