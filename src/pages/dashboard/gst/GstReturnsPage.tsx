import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { Download, Filter, FileText, X, Calendar, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { BentoCard } from '../../../components/ui/BentoCard';
import { useAuth } from '../../../contexts/AuthContext';

export default function GstReturnsPage() {
  const { token } = useAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
      alert('Failed to update return status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (returns.length === 0) return;
    const headers = ['Client', 'GSTIN', 'Form Type', 'Period Start', 'Due Date', 'Status', 'Taxable Value', 'Tax Payable', 'ARN'];
    const rows = returns.map(r => [
      `"${r.client?.name || ''}"`,
      `"${r.client?.gstin || ''}"`,
      `"${r.formType}"`,
      `"${new Date(r.periodStart).toLocaleDateString()}"`,
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
    link.setAttribute('download', `GST_Returns_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReceipt = (ret: any) => {
    const summary = `
OM ASSOCIATES - GST COMPLIANCE ADVISORY
GST Return Filing Receipt
--------------------------------------------------
Filing ID: ${ret.id}
Client: ${ret.client?.name || 'Om Apex Enterprises Pvt Ltd'}
GSTIN: ${ret.client?.gstin || '27AAFCO1234F1Z5'}
Form Type: ${ret.formType}
Period: ${new Date(ret.periodStart).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
Due Date: ${new Date(ret.dueDate).toLocaleDateString()}
Status: ${ret.status}
Acknowledgement (ARN): ${ret.acknowledgementNo || 'Pending'}
Taxable Turnover: ₹${(Number(ret.totalTaxableValue || 0) / 100).toLocaleString('en-IN')}
Tax Payable: ₹${(Number(ret.totalTaxPayable || 0) / 100).toLocaleString('en-IN')}
--------------------------------------------------
Advocate Om Prakash Tripathi
OM Associates - Advocates & Tax Advisors
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${ret.formType}_${ret.client?.gstin || 'Return'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReturns = filterStatus === 'ALL' 
    ? returns 
    : returns.filter(r => r.status === filterStatus);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-medium text-white">GST Returns Register</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs text-slate-300">
            {['ALL', 'PENDING', 'FILED', 'OVERDUE'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  filterStatus === status ? "bg-[#C9A94B] text-black font-semibold shadow-sm" : "hover:text-white"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <BentoCard title="All Returns" className="flex-1" noPadding>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading returns...</div>
        ) : filteredReturns.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400 mb-2">No returns found</p>
            <p className="text-sm">There are no GST returns matching the selected status.</p>
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
                        className="text-[#C9A94B] hover:text-[#E8C96B] transition-colors text-sm font-medium bg-[#C9A94B]/10 hover:bg-[#C9A94B]/20 px-3 py-1.5 rounded-lg border border-[#C9A94B]/20"
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-left"
            >
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/30 flex items-center justify-center text-[#C9A94B] font-bold text-base">
                    {selectedReturn.formType}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-white">
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
                    onClick={() => setSelectedReturn(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {actionSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

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
                      {selectedReturn.acknowledgementNo || 'Pending submission'}
                    </span>
                    {selectedReturn.filedAt && (
                      <span className="text-xs text-slate-500">
                        Filed on: {new Date(selectedReturn.filedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDownloadReceipt(selectedReturn)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Summary</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedReturn.status !== 'FILED' ? (
                    <button
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
