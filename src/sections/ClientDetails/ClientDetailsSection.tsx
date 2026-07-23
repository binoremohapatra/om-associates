import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CLIENTS_DATA } from '../../lib/data';
import { formatCurrency, cn } from '../../lib/utils';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import { useToast } from '../../hooks/useToast';
import type { Client } from '../../types';

type SortField = keyof Client;
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<Client['status'], string> = {
  Compliant: 'badge-success',
  Pending: 'badge-warning',
  Overdue: 'badge-danger',
};

const PAGE_SIZE = 5;

export default function ClientDetailsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Client['status']>('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = CLIENTS_DATA
    .filter(c =>
      (statusFilter === 'All' || c.status === statusFilter) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.gstin.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="text-slate-300 dark:text-slate-600" />;
    return sortDir === 'asc' ? <ArrowUp size={13} className="" /> : <ArrowDown size={13} className="" />;
  };

  const COLS: { label: string; field: SortField; mono?: boolean }[] = [
    { label: 'Business', field: 'name' },
    { label: 'GSTIN', field: 'gstin', mono: true },
    { label: 'Industry', field: 'industry' },
    { label: 'Status', field: 'status' },
    { label: 'Outstanding', field: 'outstanding', mono: true },
    { label: 'Last Filing', field: 'lastFiling', mono: true },
    { label: 'Turnover', field: 'turnover', mono: true },
  ];

  return (
    <section id="clients" ref={ref} className="section" style={{ background: `#0D0D0F` }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge badge-neutral mb-4">Client Management</span>
          <h2 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: `#F5F5F7` }}>
            Your Client{' '}
            <span className="gradient-text">Portfolio</span>
          </h2>
          <p className=" text-lg max-w-2xl mx-auto">
            Track GST compliance, outstanding dues, and filing history for all your business clients.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="card overflow-hidden"
        >
          {/* Table toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, GSTIN, industry..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {(['All', 'Compliant', 'Pending', 'Overdue'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    statusFilter === s
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-600'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-navy-900/30">
                  {COLS.map(col => (
                    <th key={col.field} className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort(col.field)}
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider  hover:text-navy-900 dark:hover:text-white transition-colors"
                      >
                        {col.label}
                        <SortIcon field={col.field} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/3">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-navy-700 flex items-center justify-center">
                          <Search size={20} className="text-slate-400" />
                        </div>
                        <p className="font-medium text-navy-900 dark:text-white">No clients match your filters</p>
                        <p className="text-slate-400 text-xs">Try adjusting the search or status filter</p>
                      </div>
                    </td>
                  </tr>
                ) : paged.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors cursor-pointer group"
                    onClick={() => toast({ type: 'info', title: `Viewing ${client.name}`, message: `GSTIN: ${client.gstin}`, duration: 2000 })}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400/20 to-violet-400/20 flex items-center justify-center text-xs font-bold text-sky-600 dark: flex-shrink-0">
                          {client.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-navy-900 dark:text-white group-hover:text-sky-500 transition-colors">{client.name}</div>
                          <div className="text-xs text-slate-400">{client.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="data-value text-xs  tracking-wider">{client.gstin}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{client.industry}</td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${STATUS_CONFIG[client.status as Client['status']]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          client.status === 'Compliant' ? 'bg-emerald-500' : client.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`data-value text-sm font-semibold ${client.outstanding > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {client.outstanding > 0 ? formatCurrency(client.outstanding) : 'Nil'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="data-value text-xs ">{client.lastFiling}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="data-value text-xs text-slate-600 dark:text-slate-400">{formatCurrency(client.turnover)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clients
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    page === i + 1 ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

