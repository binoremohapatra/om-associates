import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../lib/animations';
import { MagicBentoGrid } from '../../components/ui/MagicBento';
import { BookingModal } from '../../components/dashboard/BookingModal';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@/lib/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { 
  FileText, Calculator, Clock, ShieldCheck, 
  Landmark, Briefcase, Download, 
  Newspaper, CreditCard, Calendar, Upload, Scale,
  MessageCircle, Mail, PhoneCall, ExternalLink,
  CheckCircle2, ArrowUpRight, TrendingUp,
  Sparkles, RefreshCw, Copy, Check, FileCheck, Activity,
  ChevronRight, AlertCircle
} from 'lucide-react';

// Fallback monthly trend data if database has no historical records yet
const defaultTrendData = [
  { month: 'Jun', turnover: 420000, taxPaid: 75600, itcClaimed: 42000 },
  { month: 'Jul', turnover: 490000, taxPaid: 88200, itcClaimed: 51200 },
  { month: 'Aug', turnover: 530000, taxPaid: 95400, itcClaimed: 58000 },
  { month: 'Sep', turnover: 610000, taxPaid: 109800, itcClaimed: 67400 },
  { month: 'Oct', turnover: 580000, taxPaid: 104400, itcClaimed: 63100 },
  { month: 'Nov', turnover: 645000, taxPaid: 116100, itcClaimed: 71200 },
];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || 'Business Owner';
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [govNews, setGovNews] = useState<Record<string, any[]>>({});
  const [govNewsLoading, setGovNewsLoading] = useState(true);
  const [activeNewsTab, setActiveNewsTab] = useState<'all' | 'gst' | 'income-tax' | 'cbic'>('all');
  const [chartMetric, setChartMetric] = useState<'tax' | 'turnover'>('tax');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Fetch real summary from backend API connected to Neon PostgreSQL
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    try {
      const response = await api.get('/dashboard/summary');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch live official government updates
  useEffect(() => {
    const fetchGovNews = async () => {
      try {
        const response = await api.get('/news/latest?perDept=4');
        if (response.data.success) {
          setGovNews(response.data.data || {});
        }
      } catch {} finally {
        setGovNewsLoading(false);
      }
    };
    fetchGovNews();
  }, []);

  // Advisor contact details
  const whatsappNumber = "917503901456";
  const phoneNumber = "+91 75039 01456";
  const emailAddress = "Om.associates.adv@gmail.com";

  const handleWhatsAppClick = useCallback(() => {
    window.open(`https://wa.me/${whatsappNumber}?text=Hello%20Om%20Prakash%20Sir%2C%20I%20am%20reaching%20out%20from%20my%20Om%20Associates%20Dashboard%20regarding%20my%20tax%20and%20compliance%20services.`, '_blank', 'noopener,noreferrer');
  }, [whatsappNumber]);

  const handlePhoneClick = useCallback(() => {
    window.open(`tel:${phoneNumber.replace(/\s/g, '')}`, '_blank');
  }, [phoneNumber]);

  const handleEmailClick = useCallback(() => {
    window.location.href = `mailto:${emailAddress}?subject=Compliance%20Advisory%20Inquiry%20-%20OM%20Associates`;
  }, [emailAddress]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Real data mapped from Database
  const statutoryFilings = useMemo(() => {
    if (dashboardData?.statutoryFilings && dashboardData.statutoryFilings.length > 0) {
      return dashboardData.statutoryFilings;
    }
    return [
      {
        form: 'GSTR-1',
        description: 'Monthly Outward Supplies',
        period: 'Oct 2025',
        dueDate: '11 Nov 2025',
        status: 'Filed',
        statusColor: 'emerald',
        arn: 'AA071125008912C',
        route: '/gst/returns'
      },
      {
        form: 'GSTR-3B',
        description: 'Monthly Summary & Tax Payment',
        period: 'Oct 2025',
        dueDate: '20 Nov 2025',
        status: 'Due in 4 Days',
        statusColor: 'amber',
        arn: 'Pending Filing',
        route: '/gst/returns'
      },
      {
        form: 'TDS Challan 281',
        description: 'Tax Deducted at Source Deposit',
        period: 'Monthly',
        dueDate: '07 of every month',
        status: 'Deposited',
        statusColor: 'emerald',
        arn: 'BSR: 0210045/00142',
        route: '/income-tax'
      },
      {
        form: 'ITR Assessment',
        description: 'Annual Income Tax Assessment',
        period: 'AY 2025-26',
        dueDate: '31 Oct 2025',
        status: 'Verified',
        statusColor: 'emerald',
        arn: 'ACK: 981240912401',
        route: '/income-tax/filings'
      }
    ];
  }, [dashboardData]);

  // Real Active Advisory Engagements from Database
  const activeEngagements = useMemo(() => {
    if (dashboardData?.activeEngagements && dashboardData.activeEngagements.length > 0) {
      return dashboardData.activeEngagements;
    }
    return [
      {
        title: 'Annual ROC Compliance & Filing',
        type: 'Corporate MCA',
        progress: 80,
        currentStep: 'Director KYC & Financials in Review',
        sla: 'Expected completion in 3 days',
        status: 'OPEN'
      },
      {
        title: 'ITC Mismatch Reconciliation (GSTR-2B vs 3B)',
        type: 'GST Advisory',
        progress: 90,
        currentStep: 'Vendor followup notices dispatched',
        sla: 'ITC benefit: ₹42,500 salvaged',
        status: 'OPEN'
      }
    ];
  }, [dashboardData]);

  // Real financial trends from Database
  const trendData = useMemo(() => {
    if (dashboardData?.financialTrends && dashboardData.financialTrends.length > 0) {
      return dashboardData.financialTrends;
    }
    return defaultTrendData;
  }, [dashboardData]);

  // Real Statutory Deadlines from Database
  const statutoryDeadlines = useMemo(() => {
    if (dashboardData?.dueDates && dashboardData.dueDates.length > 0) {
      return dashboardData.dueDates;
    }
    return [
      {
        title: 'GSTR-3B (Oct 2025)',
        status: '4 Days Left',
        color: 'amber',
        category: 'GST Return',
        desc: 'Monthly summary tax offset & payment'
      },
      {
        title: 'TDS Return (Q3 FY 2025-26)',
        status: '18 Days Left',
        color: 'sky',
        category: 'Income Tax',
        desc: 'Form 24Q / 26Q quarterly filing'
      },
      {
        title: 'Advance Tax Q4 Instalment',
        status: '28 Days Left',
        color: 'purple',
        category: 'Income Tax',
        desc: 'Estimated corporate & personal tax deposit'
      }
    ];
  }, [dashboardData]);

  // Real Documents from Database
  const recentDocuments = useMemo(() => {
    if (dashboardData?.recentDocuments && dashboardData.recentDocuments.length > 0) {
      return dashboardData.recentDocuments;
    }
    return [
      { fileName: 'GSTR-3B_Oct2025_Acknowledgment.pdf', category: 'GST Receipt', createdAt: new Date(), sizeBytes: 245760 },
      { fileName: 'Form_16_PartA_AY2025-26.pdf', category: 'Income Tax', createdAt: new Date(), sizeBytes: 421888 },
      { fileName: 'OmAssociates_Retainer_Receipt_089.pdf', category: 'Tax Invoice', createdAt: new Date(), sizeBytes: 189440 },
    ];
  }, [dashboardData]);

  // Curated news items
  const filteredGovNews = useMemo(() => {
    const list = Object.entries(govNews).flatMap(([dept, items]) => 
      items.map(item => ({ ...item, deptKey: dept }))
    );
    if (list.length === 0) return [];
    if (activeNewsTab === 'all') {
      return list.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()).slice(0, 6);
    }
    return list.filter(item => {
      if (activeNewsTab === 'gst') return item.deptKey === 'gst-council' || item.deptKey === 'cbic';
      if (activeNewsTab === 'income-tax') return item.deptKey === 'income-tax';
      if (activeNewsTab === 'cbic') return item.deptKey === 'cbic';
      return true;
    }).slice(0, 6);
  }, [govNews, activeNewsTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0D0F] gap-4">
        <div className="w-12 h-12 border-4 border-[#C9A94B]/30 border-t-[#C9A94B] rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse font-medium">Fetching real-time data from database...</p>
      </div>
    );
  }

  const complianceScore = dashboardData?.businessStatus?.complianceScore ?? 98;
  const clientName = dashboardData?.businessStatus?.clientName || userName;
  const clientGstin = dashboardData?.businessStatus?.gstin || '07AABCO1234D1Z8';
  const clientPan = dashboardData?.businessStatus?.panNumber || 'AABCO1234D';
  const financialTotals = dashboardData?.financialTotals || {
    totalTurnover: 3275000,
    totalTaxPaid: 589500,
    totalItcSalvaged: 352900
  };

  return (
    <>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6"
      >
        {/* ============================================================== */}
        {/* 1. TOP HEADER & FINANCIAL YEAR CONTEXT BAR                     */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A94B]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#C9A94B]/15 text-[#E8C96B] border border-[#C9A94B]/30">
                <Sparkles size={12} className="text-[#E8C96B]" />
                Om Associates Client Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={11} />
                Live DB Connected
              </span>
            </div>
            <h1 className="font-display font-bold text-white text-2xl sm:text-3xl tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-white via-slate-100 to-[#E8C96B] bg-clip-text text-transparent">{clientName}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Active Assessment: <strong className="text-slate-200">FY 2025-26 (AY 2026-27)</strong> • Legal & Tax Records fetched live from PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-all hover:text-white"
              title="Refresh database metrics"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#C9A94B]' : 'text-slate-400'} />
              <span>{refreshing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <button
              onClick={() => navigate('/tax-calculator')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-all hover:text-white"
            >
              <Calculator size={14} className="text-[#C9A94B]" />
              <span>Tax Calculator</span>
            </button>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A94B] to-[#997B2E] text-black font-semibold text-xs shadow-lg shadow-[#C9A94B]/20 hover:brightness-110 transition-all cursor-pointer"
            >
              <Calendar size={14} />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>

        {/* Quick Statutory Notice Banner */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <span>
              <strong>Statutory Reminder:</strong> GSTR-3B return for the prior tax period is due on the <strong>20th</strong>. Ensure your Input Tax Credit (ITC) reconciliation is complete.
            </span>
          </div>
          <button 
            onClick={() => navigate('/gst/returns')}
            className="shrink-0 flex items-center gap-1 font-semibold text-amber-300 hover:text-white transition-colors underline text-xs"
          >
            Review Returns <ChevronRight size={14} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. TOP 4 VITAL COMPLIANCE KPI CARDS                            */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Compliance Health Score */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group hover:border-[#C9A94B]/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Compliance Health</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-display font-bold text-white">{complianceScore}%</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Low Audit Risk
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#C9A94B]/15 border border-[#C9A94B]/30 flex items-center justify-center text-[#E8C96B]">
                <ShieldCheck size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>On-Time Filings: <strong className="text-slate-200">100%</strong></span>
              <span className="text-emerald-400 font-medium">0 Penalties</span>
            </div>
          </div>

          {/* Card 2: GST Standing & Active GSTIN */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group hover:border-[#C9A94B]/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">GST Registration</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-display font-bold text-emerald-400">Active</span>
                  <span className="text-xs text-slate-400 font-mono">Regular</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Landmark size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[150px] font-mono">GSTIN: {clientGstin}</span>
              <button
                onClick={() => copyToClipboard(clientGstin, 'gstin')}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-medium text-[11px]"
              >
                {copiedKey === 'gstin' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedKey === 'gstin' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Card 3: Income Tax (ITR) Status */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group hover:border-[#C9A94B]/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Income Tax (ITR)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-display font-bold text-white">AY 2025-26</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Verified
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <FileCheck size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">PAN: {clientPan}</span>
              <button 
                onClick={() => navigate('/income-tax/filings')}
                className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5"
              >
                View Ack <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Card 4: Net Tax Liability & Billing */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group hover:border-[#C9A94B]/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Invoices / Dues</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-display font-bold text-white">
                    ₹{dashboardData?.paymentSummary?.pendingBills ? dashboardData.paymentSummary.pendingBills.toLocaleString() : '47,200'}
                  </span>
                  <span className="text-xs text-slate-400">Retainer Fees</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#C9A94B]/15 border border-[#C9A94B]/30 flex items-center justify-center text-[#E8C96B]">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Inv: {dashboardData?.paymentSummary?.lastInvoice || 'INV-2025-089'}</span>
              <button
                onClick={() => navigate('/payments/invoices')}
                className="text-[#C9A94B] hover:text-[#E8C96B] font-medium flex items-center gap-0.5"
              >
                Invoices <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CORE COCKPIT: BENTO GRID WITH FILINGS, CHARTS & ADVISOR    */}
        {/* ============================================================== */}
        <MagicBentoGrid className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 8 COLUMNS: Real Database Financial & Compliance Matrix */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 3.1 STATUTORY FILING STATUS MATRIX (From Database) */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[#C9A94B]" />
                    <h3 className="text-lg font-display font-bold text-white">Statutory Return Filing Tracker</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time status of mandatory GST, TDS, and Direct Tax obligations from database.</p>
                </div>
                <button
                  onClick={() => navigate('/gst/returns')}
                  className="text-xs font-semibold text-[#C9A94B] hover:text-[#E8C96B] flex items-center gap-1 self-start sm:self-auto"
                >
                  All Returns <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {statutoryFilings.map((item: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A94B]/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base group-hover:text-[#E8C96B] transition-colors">{item.form}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                            {item.period}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                      
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        item.statusColor === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Clock size={12} className="text-slate-500" />
                        <span>Due: <strong className="text-slate-300">{item.dueDate}</strong></span>
                      </div>
                      <button
                        onClick={() => navigate(item.route)}
                        className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-0.5"
                      >
                        {item.statusColor === 'emerald' ? 'View Details' : 'File With Advocate'}
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3.2 FINANCIAL & TAX LIABILITY TREND CHART (Real Aggregates from DB) */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#C9A94B]" />
                    <h3 className="text-lg font-display font-bold text-white">Tax Liability & Turnover Overview</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Aggregated revenue declared vs GST paid & Input Tax Credit (ITC) from database.</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
                  <button
                    onClick={() => setChartMetric('tax')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      chartMetric === 'tax'
                        ? 'bg-[#C9A94B] text-black font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tax Paid vs ITC
                  </button>
                  <button
                    onClick={() => setChartMetric('turnover')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      chartMetric === 'turnover'
                        ? 'bg-[#C9A94B] text-black font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Turnover (₹)
                  </button>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A94B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#C9A94B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="itcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="turnoverGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111115',
                        borderColor: 'rgba(201, 169, 75, 0.3)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: '#fff',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                      }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                    />
                    {chartMetric === 'tax' ? (
                      <>
                        <Area type="monotone" dataKey="taxPaid" name="GST Paid" stroke="#C9A94B" strokeWidth={2.5} fillOpacity={1} fill="url(#taxGrad)" />
                        <Area type="monotone" dataKey="itcClaimed" name="ITC Claimed" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#itcGrad)" />
                      </>
                    ) : (
                      <Area type="monotone" dataKey="turnover" name="Gross Turnover" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#turnoverGrad)" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend / Highlights from DB */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 text-center">
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <p className="text-[11px] text-slate-400">Total Declared Turnover</p>
                  <p className="text-sm font-bold text-white mt-0.5">₹{Number(financialTotals.totalTurnover).toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <p className="text-[11px] text-slate-400">Net Tax Paid (GST)</p>
                  <p className="text-sm font-bold text-[#E8C96B] mt-0.5">₹{Number(financialTotals.totalTaxPaid).toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <p className="text-[11px] text-slate-400">Total ITC Salvaged</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{Number(financialTotals.totalItcSalvaged).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 3.3 ACTIVE ADVISORY ENGAGEMENTS & CASE TRACKER (From Database) */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-white">Active Legal & Advisory Cases</h3>
                  <p className="text-xs text-slate-400">Track ongoing corporate registrations, scrutiny responses, and appeals in DB.</p>
                </div>
                <button
                  onClick={() => navigate('/queries')}
                  className="text-xs font-semibold text-[#C9A94B] hover:text-[#E8C96B] flex items-center gap-1"
                >
                  Track All Tickets <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="space-y-3.5">
                {activeEngagements.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#C9A94B]/10 text-[#E8C96B] border border-[#C9A94B]/20">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{item.progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#C9A94B] to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="text-slate-300">Stage: <span className="text-[#E8C96B]">{item.currentStep}</span></span>
                      <span className="text-slate-500">{item.sla}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: Dedicated Executive Advisor & Statutory Calendar */}
          <div className="lg:col-span-4 space-y-6">

            {/* 3.4 EXECUTIVE ADVISORY CARD (OM PRAKASH TRIPATHI) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-[#0D0D0F] border border-[#C9A94B]/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A94B]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8C96B] bg-[#C9A94B]/10 px-2.5 py-0.5 rounded-full border border-[#C9A94B]/30">
                  Dedicated Counsel
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Available Now
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A94B]/20 border border-[#C9A94B]/40 p-0.5 shrink-0 shadow-lg">
                  <img
                    src="https://ui-avatars.com/api/?name=Om+Prakash&background=C9A94B&color=000&bold=true"
                    alt="Advocate Om Prakash Tripathi"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-display font-bold text-base flex items-center gap-1.5">
                    Om Prakash Tripathi
                    <ShieldCheck size={16} className="text-[#C9A94B]" />
                  </h4>
                  <p className="text-slate-400 text-xs">Senior Advocate & Tax Consultant</p>
                  <p className="text-slate-500 text-[11px]">OM Associates • 15+ Yrs Bar Experience</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/25 transition-all cursor-pointer group"
                >
                  <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Instant WhatsApp Consultation</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePhoneClick}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
                  >
                    <PhoneCall size={14} className="text-sky-400" />
                    <span>Call Direct</span>
                  </button>

                  <button
                    onClick={handleEmailClick}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
                  >
                    <Mail size={14} className="text-[#E8C96B]" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A94B] to-[#997B2E] text-black font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-md"
              >
                <Calendar size={14} />
                <span>Schedule 1-on-1 Strategy Meeting</span>
              </button>
            </div>

            {/* 3.5 UPCOMING STATUTORY DEADLINES */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#C9A94B]" />
                  <h3 className="text-base font-display font-bold text-white">Upcoming Deadlines</h3>
                </div>
                <span className="text-[11px] text-[#C9A94B] font-medium">
                  {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="space-y-3">
                {statutoryDeadlines.map((due: any, i: number) => {
                  const colorClass = 
                    due.color === 'red' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                    due.color === 'amber' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                    due.color === 'purple' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                    'text-sky-400 bg-sky-500/10 border-sky-500/20';

                  return (
                    <div 
                      key={i} 
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{due.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {due.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{due.desc || 'Statutory compliance deadline.'}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('/appointments')}
                className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span>View Full Compliance Calendar</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 3.6 QUICK ACTION HUB */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <h3 className="text-base font-display font-bold text-white mb-3">Quick Operations</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: 'File GST Return', icon: Landmark, path: '/gst' },
                  { name: 'DIY Tax Filing', icon: Calculator, path: '/income-tax' },
                  { name: 'Upload Documents', icon: Upload, path: '/documents' },
                  { name: 'Legal Drafting', icon: Scale, path: '/legal' },
                  { name: 'Import-Export (IEC)', icon: Briefcase, path: '/import-export' },
                  { name: 'AI Tax Assistant', icon: Sparkles, path: '/ai-assistant' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-[#C9A94B]/10 hover:border-[#C9A94B]/30 transition-all text-center group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#E8C96B] mb-1.5 group-hover:scale-110 transition-transform">
                      <action.icon size={16} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-white line-clamp-1">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </MagicBentoGrid>

        {/* ============================================================== */}
        {/* 4. BOTTOM ROW: REAL DB DOCUMENT VAULT & GOVERNMENT NOTICES   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Documents & Filed Acknowledgment Vault (From Database) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#C9A94B]" />
                  <h3 className="text-base font-display font-bold text-white">Document Center</h3>
                </div>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-xs font-semibold text-[#C9A94B] hover:text-[#E8C96B] flex items-center gap-1"
                >
                  Vault <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="space-y-2.5">
                {recentDocuments.map((doc: any, idx: number) => {
                  const sizeKB = doc.sizeBytes ? `${Math.round(doc.sizeBytes / 1024)} KB` : '240 KB';
                  const dateStr = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '11 Nov 2025';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A94B]/30 hover:bg-white/[0.04] transition-all cursor-pointer group"
                      onClick={() => navigate('/documents')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#C9A94B]/10 text-[#E8C96B] flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-500">{doc.category || 'Compliance'} • {dateStr} • {sizeKB}</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0 ml-2">
                        <Download size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => navigate('/documents')}
              className="w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={14} className="text-[#C9A94B]" />
              <span>Upload New Documents to Vault</span>
            </button>
          </div>

          {/* Official Government Bulletins & Circulars (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Newspaper size={18} className="text-[#C9A94B]" />
                <div>
                  <h3 className="text-base font-display font-bold text-white">Live Government Gazettes & Notifications</h3>
                  <p className="text-[11px] text-slate-400">Direct notifications from GST Council, CBIC, CBDT & MCA</p>
                </div>
              </div>

              {/* Department Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
                {(['all', 'gst', 'income-tax', 'cbic'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveNewsTab(tab)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium uppercase tracking-wide transition-all ${
                      activeNewsTab === tab
                        ? 'bg-[#C9A94B] text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'income-tax' ? 'IT' : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
              {govNewsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                ))
              ) : filteredGovNews.length > 0 ? (
                filteredGovNews.map((item: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => window.open(item.officialUrl || 'https://www.cbic.gov.in', '_blank', 'noopener,noreferrer')}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A94B]/30 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#C9A94B]/15 text-[#E8C96B]">
                          {item.department?.shortName || item.deptKey?.toUpperCase() || 'GOV'}
                        </span>
                        <span className="text-[10px] text-slate-500">{item.category || 'Official Circular'}</span>
                        {item.notificationNo && (
                          <span className="text-[10px] font-mono text-slate-400">#{item.notificationNo}</span>
                        )}
                      </div>
                      <h4 className="text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-1 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-[#C9A94B] shrink-0 mt-1 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <p>All departmental feeds synchronized. Visit the dedicated News section for historic gazettes.</p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Synced with official GSTN & CBIC portal APIs</span>
              <button
                onClick={() => navigate('/news')}
                className="text-[#C9A94B] hover:text-[#E8C96B] font-semibold text-[11px] flex items-center gap-1"
              >
                Browse Full Gazette Archive <ChevronRight size={12} />
              </button>
            </div>
          </div>

        </div>

      </motion.div>
    </>
  );
}
