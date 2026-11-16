import { api } from '@/lib/api';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Landmark, CheckCircle2, Clock, 
  ArrowRight, X, Sparkles, FileText, ShieldCheck, 
  ChevronRight, ExternalLink, Calculator, Send
} from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';
import { formatCurrency } from '../../../lib/utils';

export default function IncomeTaxDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itNews, setItNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/income-tax/analytics');
      if (response.data.success) setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch income tax analytics', error);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    const fetchItNews = async () => {
      try {
        const response = await api.get('/news?department=income-tax&limit=10');
        if (response.data.success) setItNews(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch income tax news', error);
      } finally { 
        setNewsLoading(false); 
      }
    };
    fetchItNews();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[500px]">
        <div className="w-10 h-10 border-2 border-[#C9A94B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {isFilingModalOpen && (
        <StartFilingModal 
          onClose={() => setIsFilingModalOpen(false)}
          onSuccess={() => {
            fetchAnalytics();
          }}
        />
      )}

      <MagicBentoGrid className="flex flex-col shrink-0 w-full p-4 sm:p-6 lg:p-8 pb-12 gap-6">
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <BentoCard>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-slate-400 font-medium text-sm">Total Tax Liability</p>
              </div>
              <h2 className="text-3xl font-display font-medium text-white mb-2">{formatCurrency(data.totalTaxLiability)}</h2>
              <p className="text-sm text-slate-500">Across all clients (FY 2024-25)</p>
            </BentoCard>

            <BentoCard>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-slate-400 font-medium text-sm">Advance Tax Paid</p>
              </div>
              <h2 className="text-3xl font-display font-medium text-white mb-2">{formatCurrency(data.advanceTaxPaid)}</h2>
              <p className="text-sm text-slate-500">Successfully deposited</p>
            </BentoCard>

            <BentoCard>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-slate-400 font-medium text-sm">Pending ITRs</p>
              </div>
              <h2 className="text-3xl font-display font-medium text-white mb-2">{data.pendingReturns}</h2>
              <p className="text-sm text-slate-500">Awaiting client approval</p>
            </BentoCard>

            {/* Quick Action: Start Filing Card */}
            <BentoCard className="bg-gradient-to-br from-[#C9A94B]/20 via-[#C9A94B]/10 to-transparent border-[#C9A94B]/40 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/20 flex items-center justify-center text-[#E8C96B]">
                  <Briefcase className="w-5 h-5 text-[#C9A94B]" />
                </div>
                <p className="text-[#C9A94B] font-semibold text-sm tracking-wide uppercase">Quick Action</p>
              </div>
              <h2 className="text-xl font-bold text-white mb-4">File New ITR</h2>
              <button 
                onClick={() => setIsFilingModalOpen(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#C9A94B] to-[#997B2E] text-black font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#C9A94B]/20 flex items-center justify-center gap-2"
              >
                <span>Start Filing</span>
                <ArrowRight size={16} />
              </button>
            </BentoCard>
          </div>
        )}

        {/* Latest CBDT Notifications & DIY ITR Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BentoCard title="Latest CBDT Notifications & Updates" description="Live updates from the Income Tax Department official portal." size="lg">
            <div className="mt-4 flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
              {newsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
              ) : itNews.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-600 text-sm">Syncing Income Tax data...</p>
                  <a href="https://www.incometaxindia.gov.in/Pages/press-releases.aspx" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#C9A94B] hover:underline mt-2 inline-block">Visit incometaxindia.gov.in →</a>
                </div>
              ) : (
                itNews.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/25 cursor-pointer transition-all group"
                    onClick={() => window.open(item.officialUrl, '_blank')}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-400" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-amber-400 mb-0.5 block">{item.category}</span>
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

          {/* DIY ITR Section */}
          <BentoCard title="Do It Yourself (DIY) ITR" description="File your own Income Tax Return with our guided steps." size="lg">
            <div className="mt-4 flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A94B]"></div>
                <h3 className="text-white font-medium mb-2">Step 1: Gather Documents</h3>
                <p className="text-sm text-slate-400">Collect your Form 16, PAN card, Aadhaar card, bank statements, and investment proofs (80C, 80D, etc.).</p>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A94B]"></div>
                <h3 className="text-white font-medium mb-2">Step 2: Choose ITR Form</h3>
                <p className="text-sm text-slate-400">Select ITR-1 for salaried individuals up to 50 Lakhs, or ITR-4 if you have presumptive business income.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A94B]"></div>
                <h3 className="text-white font-medium mb-2">Step 3: Fill & E-Verify</h3>
                <p className="text-sm text-slate-400">Enter your income details, claim deductions, pay any remaining tax, and e-verify your return using Aadhaar OTP.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button 
                  onClick={() => navigate('/diy-itr')}
                  className="flex-1 py-3 px-4 bg-[#C9A94B] text-black font-bold rounded-xl hover:bg-[#E8C96B] transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-lg shadow-[#C9A94B]/20"
                >
                  <Sparkles size={16} />
                  <span>Launch Guided DIY Wizard</span>
                </button>
                <button 
                  onClick={() => window.open('https://eportal.incometax.gov.in/iec/foservices/#/login', '_blank')}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Official Portal</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </BentoCard>
        </div>
      </MagicBentoGrid>
    </>
  );
}

// -------------------------------------------------------------
// Interactive Start Filing Modal
// -------------------------------------------------------------
function StartFilingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'options' | 'directForm'>('options');
  const [clients, setClients] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    financialYear: '2024-25',
    regime: 'NEW',
    grossIncome: '',
    deductions: '',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        if (response.data.success && response.data.data.length > 0) {
          setClients(response.data.data);
          setFormData(prev => ({ ...prev, clientId: response.data.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    };
    fetchClients();
  }, []);

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const grossPaise = Math.round(Number(formData.grossIncome) * 100);
      const deductionsPaise = formData.deductions ? Math.round(Number(formData.deductions) * 100) : 0;

      const payload = {
        clientId: formData.clientId || (clients[0]?.id || ''),
        financialYear: formData.financialYear,
        regime: formData.regime,
        grossIncome: grossPaise,
        deductions: deductionsPaise
      };

      const res = await api.post('/tax/filings', payload);
      if (res.data.success) {
        setSuccessMsg(`ITR filed successfully for ${formData.financialYear}!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit filing. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#111115] border border-[#C9A94B]/30 rounded-3xl w-full max-w-xl p-6 sm:p-7 relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors text-2xl font-bold w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
        >
          &times;
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8C96B] bg-[#C9A94B]/15 px-2.5 py-0.5 rounded-full border border-[#C9A94B]/30">
              Income Tax e-Filing Portal
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white">Start Income Tax Filing</h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your preferred method to prepare and submit your ITR return for <strong>FY 2024-25 (AY 2025-26)</strong>.
          </p>
        </div>

        {successMsg ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">{successMsg}</h3>
            <p className="text-xs text-slate-400">Updating your dashboard analytics and tax records...</p>
          </div>
        ) : activeTab === 'options' ? (
          <div className="space-y-4">
            
            {/* Pathway 1: Guided In-App DIY Wizard */}
            <div 
              onClick={() => {
                onClose();
                navigate('/diy-itr');
              }}
              className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-500/15 transition-all cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-sky-400" />
                  <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    Interactive DIY ITR Wizard
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Guided 4-step wizard with automatic tax computation, salary breakdown, Section 80C/80D deductions, and e-verification.
                </p>
              </div>
              <ChevronRight size={20} className="text-sky-400 group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
            </div>

            {/* Pathway 2: Fast Direct Form Filing */}
            <div 
              onClick={() => setActiveTab('directForm')}
              className="p-5 rounded-2xl bg-gradient-to-r from-[#C9A94B]/10 via-[#C9A94B]/5 to-transparent border border-[#C9A94B]/20 hover:border-[#C9A94B]/50 hover:bg-[#C9A94B]/15 transition-all cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#C9A94B]" />
                  <h4 className="text-base font-bold text-white group-hover:text-[#E8C96B] transition-colors">
                    Fast Direct E-File Form
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C9A94B]/20 text-[#E8C96B]">
                    Instant DB Record
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your gross income, select your regime (New/Old), and submit your ITR directly into the database in 30 seconds.
                </p>
              </div>
              <ChevronRight size={20} className="text-[#C9A94B] group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
            </div>

            {/* Pathway 3: Assisted Filing with Advocate */}
            <div 
              onClick={() => {
                onClose();
                navigate('/appointments');
              }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Assisted CA Filing & Consultation
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Schedule a 1-on-1 strategy session with Advocate Om Prakash Tripathi for corporate tax and scrutiny audit.
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

          </div>
        ) : (
          /* Direct Fast E-Filing Form */
          <form onSubmit={handleDirectSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold text-[#E8C96B] flex items-center gap-1.5">
                <FileText size={14} /> Direct Filing Form
              </span>
              <button 
                type="button"
                onClick={() => setActiveTab('options')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                ← Back to Options
              </button>
            </div>

            {/* Client selector */}
            {clients.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Client Entity</label>
                <select
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A94B] transition-colors"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.pan ? `(${c.pan})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Financial Year</label>
                <select
                  value={formData.financialYear}
                  onChange={e => setFormData({ ...formData, financialYear: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A94B] transition-colors"
                >
                  <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                  <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tax Regime</label>
                <select
                  value={formData.regime}
                  onChange={e => setFormData({ ...formData, regime: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A94B] transition-colors"
                >
                  <option value="NEW">New Regime (Sec 115BAC)</option>
                  <option value="OLD">Old Regime (With Deductions)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gross Annual Income (₹)</label>
              <input
                required
                type="number"
                min="0"
                placeholder="e.g. 1500000"
                value={formData.grossIncome}
                onChange={e => setFormData({ ...formData, grossIncome: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A94B] transition-colors"
              />
            </div>

            {formData.regime === 'OLD' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Deductions 80C/80D (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 150000"
                  value={formData.deductions}
                  onChange={e => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A94B] transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-[#C9A94B] to-[#997B2E] text-black font-bold text-xs rounded-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#C9A94B]/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Tax Filing Now</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
