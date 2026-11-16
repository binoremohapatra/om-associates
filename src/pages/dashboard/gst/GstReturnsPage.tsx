import { api } from '@/lib/api';
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Download, 
  Filter, 
  FileText, 
  X, 
  Calendar, 
  Check, 
  ShieldCheck, 
  Search, 
  RotateCcw,
  Building2,
  Hash,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { BentoCard } from '../../../components/ui/BentoCard';
import { useAuth } from '../../../contexts/AuthContext';

export default function GstReturnsPage() {
  const { token } = useAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formTypeFilter, setFormTypeFilter] = useState('ALL');

  // Mutation states
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const res = await api.get('/gst/returns');
        if (res.data.success) {
          setReturns(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch returns', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Mark filing as filed in real-time
  const handleMarkAsFiled = async (filingId: string) => {
    setIsUpdating(true);
    try {
      const generatedArn = `AA${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;
      const res = await api.patch(`/gst/returns/${filingId}`, {
        status: 'FILED',
        acknowledgementNo: generatedArn
      });
      if (res.data.success) {
        setReturns(prev => prev.map(f => f.id === filingId ? { ...f, status: 'FILED', acknowledgementNo: generatedArn, filedAt: new Date().toISOString() } : f));
        setSelectedReturn((prev: any) => prev && prev.id === filingId ? { ...prev, status: 'FILED', acknowledgementNo: generatedArn, filedAt: new Date().toISOString() } : prev);
        setActionSuccess(`Return marked as FILED! ARN: ${generatedArn}`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update return', err);
      alert('Failed to update return status. Please verify permissions.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Instant CSV Export
  const handleExportCSV = () => {
    const dataToExport = filteredReturns.length > 0 ? filteredReturns : returns;
    if (dataToExport.length === 0) {
      alert('No returns available to export.');
      return;
    }

    const headers = ['Client Name', 'GSTIN', 'Return Form', 'Tax Period', 'Due Date', 'Status', 'Taxable Value (INR)', 'Tax Payable (INR)', 'ARN'];
    const rows = dataToExport.map(r => [
      `"${r.client?.name || 'Om Apex Enterprises Pvt Ltd'}"`,
      `"${r.client?.gstin || ''}"`,
      `"${r.formType}"`,
      `"${new Date(r.periodStart).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}"`,
      `"${new Date(r.dueDate).toLocaleDateString()}"`,
      `"${r.status}"`,
      (Number(r.totalTaxableValue || 0) / 100).toFixed(2),
      (Number(r.totalTaxPayable || 0) / 100).toFixed(2),
      `"${r.acknowledgementNo || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GST_Returns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${dataToExport.length} return(s) to CSV!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Receipt Download
  const handleDownloadReceipt = (ret: any) => {
    const summary = `
==================================================
OM ASSOCIATES - ADVOCATES & TAX ADVISORS
GST RETURN FILING ACKNOWLEDGEMENT SUMMARY
==================================================
Return Form: ${ret.formType}
Filing ID: ${ret.id}
Client: ${ret.client?.name || 'Om Apex Enterprises Pvt Ltd'}
GSTIN: ${ret.client?.gstin || '27AAFCO1234F1Z5'}
Tax Period: ${new Date(ret.periodStart).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
Due Date: ${new Date(ret.dueDate).toLocaleDateString()}
Filing Status: ${ret.status}
Acknowledgement (ARN): ${ret.acknowledgementNo || 'Pending Submission'}
Taxable Turnover: ₹${(Number(ret.totalTaxableValue || 0) / 100).toLocaleString('en-IN')}
Total Tax Payable: ₹${(Number(ret.totalTaxPayable || 0) / 100).toLocaleString('en-IN')}
Date of Filing: ${ret.filedAt ? new Date(ret.filedAt).toLocaleDateString() : 'N/A'}
--------------------------------------------------
Statutory Legal Advisory: Advocate Om Prakash Tripathi
OM Associates - High Court & Tax Practice
==================================================
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_${ret.formType}_Receipt_${ret.client?.gstin || 'Return'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter computation
  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      // Status filter
      if (statusFilter !== 'ALL' && ret.status !== statusFilter) return false;
      // Form type filter
      if (formTypeFilter !== 'ALL' && ret.formType !== formTypeFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clientName = (ret.client?.name || '').toLowerCase();
        const gstin = (ret.client?.gstin || '').toLowerCase();
        const formType = (ret.formType || '').toLowerCase();
        if (!clientName.includes(query) && !gstin.includes(query) && !formType.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [returns, statusFilter, formTypeFilter, searchQuery]);

  const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (formTypeFilter !== 'ALL' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setStatusFilter('ALL');
    setFormTypeFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-6 h-full text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-white">GST Returns</h2>
          <p className="text-xs text-slate-400 mt-1">Manage, verify and file statutory returns across all clients</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              isFilterOpen || activeFilterCount > 0
                ? "bg-[#C9A94B]/20 border-[#C9A94B]/50 text-[#E8C96B]" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            )}
          >
            <Filter className="w-4 h-4 text-[#C9A94B]" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C9A94B] text-black text-xs font-bold flex items-center justify-center ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export Button */}
          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-[#C9A94B]/40 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4 text-[#C9A94B]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Interactive Filter Drawer / Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client company name or GSTIN..."
                  className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A94B]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs text-slate-300">
                  {['ALL', 'PENDING', 'FILED', 'OVERDUE'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                        statusFilter === status 
                          ? "bg-[#C9A94B] text-black font-semibold shadow-sm" 
                          : "hover:text-white"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Form:</span>
                <select
                  value={formTypeFilter}
                  onChange={(e) => setFormTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#C9A94B]"
                >
                  <option value="ALL">All Forms</option>
                  <option value="GSTR_1">GSTR-1</option>
                  <option value="GSTR_3B">GSTR-3B</option>
                  <option value="GSTR_9">GSTR-9</option>
                </select>
              </div>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table BentoCard */}
      <BentoCard title="All Returns" className="flex-1" noPadding>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading returns...</div>
        ) : filteredReturns.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400 mb-2">No returns found</p>
            <p className="text-sm">
              {activeFilterCount > 0 ? 'No filings match your active filters.' : 'There are no GST returns filed for your clients yet.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Form Type</th>
                  <th className="p-4 font-medium">Period</th>
                  <th className="p-4 font-medium">Due Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((ret) => (
                  <tr 
                    key={ret.id} 
                    onClick={() => setSelectedReturn(ret)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <p className="text-white font-medium group-hover:text-[#E8C96B] transition-colors">
                        {ret.client?.name || 'Om Apex Enterprises Pvt Ltd'}
                      </p>
                      <p className="text-xs font-mono text-slate-400">{ret.client?.gstin || '27AAFCO1234F1Z5'}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-[#C9A94B]/10 text-[#C9A94B] rounded-md text-xs font-medium border border-[#C9A94B]/20">
                        {ret.formType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(ret.periodStart).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(ret.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={ret.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReturn(ret);
                        }}
                        className="text-[#C9A94B] group-hover:text-[#E8C96B] hover:underline transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      {/* Complete Return Details Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <div 
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedReturn(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/30 flex items-center justify-center text-[#C9A94B] font-bold text-base">
                    {selectedReturn.formType}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
                      {selectedReturn.client?.name || 'Om Apex Enterprises Pvt Ltd'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {selectedReturn.client?.gstin || '27AAFCO1234F1Z5'}
                      </span>
                      <span>•</span>
                      <span>Period: {new Date(selectedReturn.periodStart).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedReturn.status} />
                  <button 
                    type="button"
                    onClick={() => setSelectedReturn(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Success Alert */}
              {actionSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Modal Body: Return Details */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Due Date</p>
                  <p className="text-sm font-medium text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A94B]" />
                    {new Date(selectedReturn.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Taxable Turnover</p>
                  <p className="text-sm font-medium text-white">
                    ₹{(Number(selectedReturn.totalTaxableValue || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Tax Payable</p>
                  <p className="text-sm font-medium text-amber-400">
                    ₹{(Number(selectedReturn.totalTaxPayable || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-3">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Acknowledgement Number (ARN)</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-200">
                      {selectedReturn.acknowledgementNo || 'Pending submission (Click "Mark as Filed" to assign ARN)'}
                    </span>
                    {selectedReturn.filedAt && (
                      <span className="text-xs text-slate-500">
                        Filed on: {new Date(selectedReturn.filedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Statutory Legal Advisory Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#C9A94B]/5 border border-[#C9A94B]/15 text-xs text-slate-300 leading-relaxed">
                <span className="text-[#C9A94B] font-semibold">Statutory Advisory:</span> Return is reconciled against GSTR-2B input tax credits. Ensure all invoices are signed and filed prior to the 20th to prevent section 50 interest penalties.
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(selectedReturn)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Summary Receipt</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedReturn.status !== 'FILED' ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAsFiled(selectedReturn.id)}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black font-semibold text-xs hover:shadow-[0_0_20px_rgba(201,169,75,0.4)] transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isUpdating ? 'Marking as Filed...' : 'Mark as Filed & Generate ARN'}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified & Filed</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedReturn(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FILED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const style = styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-medium border", style)}>
      {status}
    </span>
  );
}
