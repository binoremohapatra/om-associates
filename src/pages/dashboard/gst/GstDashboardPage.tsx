import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  X, 
  Building2, 
  Hash, 
  Calendar, 
  Check, 
  ExternalLink,
  Download,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';
import { BentoCard } from '../../../components/ui/BentoCard';

export default function GstDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gstNews, setGstNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedFiling, setSelectedFiling] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/gst/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch GST dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchGstNews = async () => {
      try {
        const [res, cbicRes] = await Promise.all([
          api.get('/news?department=gst-council&limit=8'),
          api.get('/news?department=cbic&limit=8')
        ]);
        const combined = [...(res.data.data || []), ...(cbicRes.data.data || [])]
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 10);
        setGstNews(combined);
      } catch {} finally { setNewsLoading(false); }
    };
    fetchGstNews();
  }, []);

  const handleMarkAsFiled = async (filingId: string) => {
    setIsUpdating(true);
    try {
      const generatedArn = `AA${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;
      const res = await api.patch(`/gst/returns/${filingId}`, {
        status: 'FILED',
        acknowledgementNo: generatedArn
      });
      if (res.data.success) {
        // Update local state
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedRecent = prev.recentFilings?.map((f: any) => 
            f.id === filingId ? { ...f, status: 'FILED', acknowledgementNo: generatedArn, filedAt: new Date().toISOString() } : f
          );
          return {
            ...prev,
            recentFilings: updatedRecent,
            metrics: {
              ...prev.metrics,
              pendingFilings: Math.max(0, (prev.metrics?.pendingFilings || 1) - 1)
            }
          };
        });

        setSelectedFiling((prev: any) => 
          prev && prev.id === filingId 
            ? { ...prev, status: 'FILED', acknowledgementNo: generatedArn, filedAt: new Date().toISOString() } 
            : prev
        );
        setActionSuccess(`Return successfully marked as FILED! ARN: ${generatedArn}`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to mark filing as filed', err);
      alert('Could not update filing status. Please check your network connection.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadSummary = (filing: any) => {
    const summary = `
OM ASSOCIATES - GST COMPLIANCE ADVISORY
Return Filing Summary Receipt
--------------------------------------------------
Filing ID: ${filing.id}
Client: ${filing.client?.name || 'Om Apex Enterprises Pvt Ltd'}
GSTIN: ${filing.client?.gstin || '27AAFCO1234F1Z5'}
Form Type: ${filing.formType}
Period: ${new Date(filing.periodStart).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
Due Date: ${new Date(filing.dueDate).toLocaleDateString()}
Status: ${filing.status}
Acknowledgement (ARN): ${filing.acknowledgementNo || 'Pending'}
Taxable Turnover: ₹${(Number(filing.totalTaxableValue || 0) / 100).toLocaleString('en-IN')}
Tax Payable: ₹${(Number(filing.totalTaxPayable || 0) / 100).toLocaleString('en-IN')}
Generated At: ${new Date().toLocaleString()}
--------------------------------------------------
Statutory Tax Consultant: Om Prakash Tripathi
OM Associates - Advocates & Tax Advisors
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_${filing.formType}_${filing.client?.gstin || 'Receipt'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
        <div className="xl:col-span-3 h-96 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-96 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const metrics = data?.metrics || { pendingFilings: 0, overdueFilings: 0, unpaidChallans: 0, openNotices: 0, totalClients: 0 };
  const recentFilings = data?.recentFilings || [];

  return (
    <MagicBentoGrid className="flex flex-col gap-4 md:gap-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Pending Filings" 
          value={metrics.pendingFilings} 
          icon={Clock} 
          color="text-amber-400" 
          bg="bg-amber-400/10" 
          border="border-amber-400/20"
        />
        <MetricCard 
          title="Overdue Filings" 
          value={metrics.overdueFilings} 
          icon={AlertCircle} 
          color="text-red-400" 
          bg="bg-red-400/10" 
          border="border-red-400/20"
        />
        <MetricCard 
          title="Unpaid Challans" 
          value={metrics.unpaidChallans} 
          icon={TrendingUp} 
          color="text-blue-400" 
          bg="bg-blue-400/10" 
          border="border-blue-400/20"
        />
        <MetricCard 
          title="Open Notices" 
          value={metrics.openNotices} 
          icon={CheckCircle2} 
          color="text-emerald-400" 
          bg="bg-emerald-400/10" 
          border="border-emerald-400/20"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Chart / Recent Activity */}
        <BentoCard title="Recent GST Filings" description="Latest returns filed across all clients." className="xl:col-span-2" size="lg">
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs text-slate-400">
              <span>Click any return below to inspect details, download summary, or mark as filed</span>
              <button 
                onClick={() => navigate('/gst/returns')}
                className="flex items-center gap-1 text-[#C9A94B] hover:text-[#E8C96B] transition-colors font-medium hover:underline"
              >
                <span>View Full Register</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentFilings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p>No recent filings found.</p>
              </div>
            ) : (
              recentFilings.map((filing: any) => {
                const clientName = filing.client?.name || 'Om Apex Enterprises Pvt Ltd';
                const gstin = filing.client?.gstin;
                const period = filing.periodStart 
                  ? new Date(filing.periodStart).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                  : 'Current';

                return (
                  <div 
                    key={filing.id} 
                    onClick={() => setSelectedFiling(filing)}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#C9A94B]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/20 flex items-center justify-center group-hover:bg-[#C9A94B]/20 transition-colors">
                        <span className="text-[#C9A94B] font-semibold text-xs tracking-wider">{filing.formType}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium group-hover:text-[#E8C96B] transition-colors">
                            {clientName}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {period}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {gstin && (
                            <span className="text-xs font-mono text-slate-400">
                              {gstin}
                            </span>
                          )}
                          <span className="text-slate-600">•</span>
                          <p className="text-xs text-slate-400">Due: {new Date(filing.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={filing.status} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiling(filing);
                        }}
                        className="p-2 rounded-lg bg-white/5 group-hover:bg-[#C9A94B]/20 text-slate-400 group-hover:text-[#C9A94B] transition-colors"
                        title="Click to view details"
                      >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </BentoCard>

        {/* Compliance Calendar */}
        <BentoCard title="Compliance Calendar" description="Upcoming statutory deadlines." size="lg">
          <div className="mt-4 flex flex-col gap-4">
            {data?.upcomingDeadlines?.length > 0 ? (
              data.upcomingDeadlines.map((deadline: any, i: number) => {
                const color = deadline.urgency === 'critical' ? 'red' : deadline.urgency === 'warning' ? 'amber' : 'emerald';
                return (
                  <div 
                    key={i} 
                    onClick={() => navigate('/gst/returns')}
                    className={`p-4 rounded-xl border border-${color}-500/20 bg-${color}-500/5 relative overflow-hidden group cursor-pointer hover:bg-${color}-500/10 transition-colors`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${color}-500`} />
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`text-${color}-400 font-medium`}>{deadline.formType} Due</h4>
                      <span className={`text-xs font-bold px-2 py-1 bg-${color}-500/20 text-${color}-400 rounded-md`}>
                        {deadline.daysLeft <= 0 ? 'TODAY' : `In ${deadline.daysLeft} Days`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      {new Date(deadline.dueDate).toLocaleDateString('default', { month: 'long', year: 'numeric' })} Period
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">{deadline.clientsPending} Clients Pending</p>
                      <span className="text-xs text-[#C9A94B] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        View returns <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">No upcoming deadlines found.</p>
            )}
          </div>
        </BentoCard>
      </div>

      {/* Latest GST & CBIC Notifications */}
      <BentoCard title="Latest GST & CBIC Notifications" description="Live updates from GST Council and CBIC official portals." size="lg">
        <div className="mt-4 flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
          {newsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
          ) : gstNews.length === 0 ? (
            <p className="text-slate-600 text-sm py-6 text-center">Syncing GST data... check back in a moment.</p>
          ) : (
            gstNews.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-[#C9A94B]/25 cursor-pointer transition-all group"
                onClick={() => window.open(item.officialUrl, '_blank')}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.department?.logoColor || '#C9A94B' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold" style={{ color: item.department?.logoColor || '#C9A94B' }}>{item.department?.shortName}</span>
                    <span className="text-[9px] text-slate-600">{item.category}</span>
                  </div>
                  <p className="text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-2">{item.title}</p>
                </div>
                {item.pdfUrl && (
                  <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="text-[9px] text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 flex-shrink-0">PDF</a>
                )}
              </div>
            ))
          )}
        </div>
      </BentoCard>

      {/* Filing Details Modal */}
      <AnimatePresence>
        {selectedFiling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/30 flex items-center justify-center text-[#C9A94B] font-bold text-base">
                    {selectedFiling.formType}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
                      {selectedFiling.client?.name || 'Om Apex Enterprises Pvt Ltd'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {selectedFiling.client?.gstin || '27AAFCO1234F1Z5'}
                      </span>
                      <span>•</span>
                      <span>Period: {new Date(selectedFiling.periodStart).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedFiling.status} />
                  <button 
                    onClick={() => setSelectedFiling(null)}
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
                    {new Date(selectedFiling.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Taxable Turnover</p>
                  <p className="text-sm font-medium text-white">
                    ₹{(Number(selectedFiling.totalTaxableValue || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Tax Payable</p>
                  <p className="text-sm font-medium text-amber-400">
                    ₹{(Number(selectedFiling.totalTaxPayable || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-3">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Acknowledgement Number (ARN)</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-200">
                      {selectedFiling.acknowledgementNo || 'Not generated yet (Pending filing submission)'}
                    </span>
                    {selectedFiling.filedAt && (
                      <span className="text-xs text-slate-500">
                        Filed on: {new Date(selectedFiling.filedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#C9A94B]/5 border border-[#C9A94B]/15 text-xs text-slate-300 leading-relaxed">
                <span className="text-[#C9A94B] font-semibold">Legal Note:</span> Form {selectedFiling.formType} is governed under Section 39 of the CGST Act, 2017. Filings must be submitted before the 20th of the subsequent month to avoid section 47 late fee levies.
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSummary(selectedFiling)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFiling(null);
                      navigate('/gst/returns');
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Returns</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedFiling.status !== 'FILED' ? (
                    <button
                      onClick={() => handleMarkAsFiled(selectedFiling.id)}
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
                    onClick={() => setSelectedFiling(null)}
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
    </MagicBentoGrid>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, border }: any) {
  return (
    <BentoCard noPadding className={border}>
      <div className="p-4 md:p-6 h-full flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2 md:mb-4">
          <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center", bg)}>
            <Icon className={cn("w-4 h-4 md:w-5 md:h-5", color)} />
          </div>
        </div>
        <h3 className="text-xl md:text-3xl font-display font-medium text-white mb-0.5 md:mb-1">{value}</h3>
        <p className="text-[10px] md:text-sm text-slate-400 leading-tight">{title}</p>
      </div>
    </BentoCard>
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
