import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeInUp } from '../../lib/animations';
import { BentoCard } from '../../components/ui/BentoCard';
import { Tabs } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, Calculator, TrendingUp, Clock, ShieldCheck, 
  ArrowRight, Landmark, Briefcase, Download, Bot, 
  Newspaper, CreditCard, Calendar, Upload, Scale, MessageSquare
} from 'lucide-react';
import LuxuryBackground from '../../components/ui/LuxuryBackground';
import { cn } from '../../lib/utils';
import { MagicBentoGrid } from '../../components/ui/MagicBento';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || 'User';
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [govNews, setGovNews] = useState<Record<string, any[]>>({});
  const [govNewsLoading, setGovNewsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const response = await api.get('/dashboard/summary');
        if (response.data.success) setDashboardData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    const fetchGovNews = async () => {
      try {
        const response = await api.get('/news/latest?perDept=3');
        if (response.data.success) setGovNews(response.data.data || {});
      } catch {} finally { setGovNewsLoading(false); }
    };
    fetchGovNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]">
        <div className="w-12 h-12 border-4 border-[#C9A94B]/30 border-t-[#C9A94B] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback defaults in case API fails
  const data = dashboardData || {
    businessStatus: { gst: 'Active', pan: 'Verified', iec: 'Active', complianceScore: 98 },
    dueDates: [
      { title: 'GST Return (GSTR-3B)', status: 'Due Tomorrow', color: 'red' },
      { title: 'ROC Filing (AOC-4)', status: '5 Days Left', color: 'amber' },
      { title: 'ITR Filing', status: '12 Days Left', color: 'sky' }
    ],
    paymentSummary: { pendingBills: 15400, lastInvoice: 'INV-2026-042', lastInvoiceStatus: 'Paid' },
    recentActivity: [
      { title: 'GST Filed', date: '2 hours ago', type: 'gst' },
      { title: 'Payment Successful', date: 'Yesterday', type: 'payment' },
      { title: 'Appointment Booked', date: '3 days ago', type: 'appointment' },
      { title: 'Notice Uploaded', date: 'Last week', type: 'document' }
    ]
  };

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <LuxuryBackground className="w-full h-full" />
      </div>
      
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        {/* Header section (already done in layout/navbar but keeping a welcome message here) */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display font-bold text-white mb-1 sm:mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw + 0.3rem, 2rem)' }}>Welcome back, {userName}</h1>
          <p className="text-slate-400" style={{ fontSize: 'clamp(0.8rem, 1.2vw + 0.1rem, 0.95rem)' }}>Here's what's happening with your business compliance.</p>
        </div>

        <MagicBentoGrid 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 auto-rows-[minmax(160px,auto)]"
        >
          {/* 1. Business Summary */}
          <BentoCard size="xl" title="Business Health Summary" description="Overview of your current compliance standing." className="xl:col-span-4" icon={<ShieldCheck size={24} />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">GST Status</p>
                <p className="text-xl font-bold text-emerald-400">{data.businessStatus.gst}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">PAN Status</p>
                <p className="text-xl font-bold text-emerald-400">{data.businessStatus.pan}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">IEC Status</p>
                <p className="text-xl font-bold text-emerald-400">{data.businessStatus.iec}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C9A94B]/20 to-transparent border border-[#C9A94B]/30">
                <p className="text-[#E8C96B] text-sm mb-1">Compliance Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-display font-bold text-[#C9A94B]">{data.businessStatus.complianceScore}<span className="text-xl text-[#C9A94B]/50">%</span></span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 2. Upcoming Due Dates */}
          <BentoCard size="md" title="Upcoming Due Dates" description="Critical compliance deadlines." className="xl:col-span-2" icon={<Clock size={24} />}>
            <div className="space-y-3">
              {data.dueDates.map((due: any, i: number) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-xl bg-white/5 border border-${due.color}-500/20`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${due.color}-500`}></div>
                    <span className="font-medium text-white">{due.title}</span>
                  </div>
                  <span className={`text-sm font-bold text-${due.color}-400`}>{due.status}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 3. Quick Actions */}
          <BentoCard size="xl" title="Quick Actions" description="Frequently used services and actions." className="xl:col-span-6">

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'File GST', icon: Landmark, path: '/gst' },
                { name: 'File ITR', icon: Calculator, path: '/income-tax' },
                { name: 'Upload Docs', icon: Upload, path: '/documents' },
                { name: 'Book Consult', icon: MessageSquare, path: '/queries' },
                { name: 'Register Co.', icon: Briefcase, path: '/legal' },
                { name: 'Apply IEC', icon: Scale, path: '/import-export' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#C9A94B]/10 hover:border-[#C9A94B]/30 hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center border border-white/5 group-hover:border-[#C9A94B]/30 shadow-lg">
                    <action.icon size={20} className="text-[#E8C96B]" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">{action.name}</span>
                </button>
              ))}
            </div>
          </BentoCard>

          {/* 4. AI Assistant Panel */}
          <BentoCard size="lg" title="AI Tax & Legal Assistant" description="Ask our AI to explain notices or generate agreements." className="xl:col-span-4" icon={<Bot size={24} />}>
            <div className="flex flex-col h-full justify-between">
              <div className="flex flex-wrap gap-2 mb-6">
                {['Explain GST Notice', 'Explain IT Notice', 'Generate NDA', 'Tax Saving Advice'].map((prompt, i) => (
                  <button key={i} className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-[#C9A94B]/10 hover:text-[#C9A94B] hover:border-[#C9A94B]/30 transition-all">
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input type="text" placeholder="Type your legal or tax query here..." className="w-full bg-[#111111] border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A94B] transition-colors" />
                <button className="absolute right-2 top-2 p-2 bg-[#C9A94B] text-black rounded-lg hover:bg-[#E8C96B] transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </BentoCard>

          {/* 5. Live News Widget Ã¢â‚¬â€ fetched from API */}
          <BentoCard size="lg" title="Live Gov Updates" description="Official government notifications." className="xl:col-span-2" icon={<Newspaper size={24} />}>
            <div className="space-y-2 overflow-y-auto max-h-52 custom-scrollbar">
              {govNewsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
              ) : (
                Object.values(govNews).flat().sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/[0.07] cursor-pointer hover:border-[#C9A94B]/25 transition-all group"
                    onClick={() => window.open(item.officialUrl, '_blank')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${item.department?.logoColor || '#C9A94B'}20`, color: item.department?.logoColor || '#C9A94B' }}>
                        {item.department?.shortName || 'GOV'}
                      </span>
                      <span className="text-[9px] text-slate-600">{item.category}</span>
                    </div>
                    <h4 className="text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">{item.title}</h4>
                  </div>
                ))
              )}
              {!govNewsLoading && Object.keys(govNews).length === 0 && (
                <p className="text-xs text-slate-600 py-4 text-center">Sync running... check back shortly.</p>
              )}
            </div>
          </BentoCard>

          {/* 6. Document Center */}
          <BentoCard size="md" title="Document Center" description="Recent uploads." className="xl:col-span-2" icon={<FileText size={24} />}>
            <div className="space-y-3">
              {dashboardData?.recentDocuments && dashboardData.recentDocuments.length > 0 ? dashboardData.recentDocuments.map((doc: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-slate-400 group-hover:text-[#C9A94B]" />
                    <span className="text-sm text-slate-300 group-hover:text-white line-clamp-1">{doc.fileName}</span>
                  </div>
                  <Download size={14} className="text-slate-500 group-hover:text-white" />
                </div>
              )) : (
                <p className="text-slate-500 text-sm text-center py-4">No recent documents</p>
              )}
            </div>
          </BentoCard>

          {/* 7. Payment Summary */}
          <BentoCard size="md" title="Payment Summary" description="Billing & Invoices." className="xl:col-span-2" icon={<CreditCard size={24} />}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
                <div>
                  <p className="text-slate-400 text-xs">Pending Bills</p>
                  <p className="text-xl font-bold text-white">₹{dashboardData?.paymentSummary?.pendingBills?.toLocaleString() || '0'}</p>
                </div>
                <button className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/30 transition-colors">Pay Now</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Last Invoice: {dashboardData?.paymentSummary?.lastInvoice || '-'}</span>
                <span className="text-sm text-emerald-400">{dashboardData?.paymentSummary?.lastInvoiceStatus || '-'}</span>
              </div>
            </div>
          </BentoCard>

          {/* 8. Compliance Calendar */}
          <BentoCard size="md" title="Compliance Calendar" description="Upcoming deadlines." className="xl:col-span-2" icon={<Calendar size={24} />}>
            <div className="bg-[#111111] rounded-xl border border-white/10 p-4 h-full flex flex-col items-center justify-center">
               <div className="text-center space-y-2">
                 <p className="text-[#C9A94B] font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                 <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {dashboardData?.dueDates && dashboardData.dueDates.slice(0, 3).map((due: any, i: number) => (
                      <div key={i} className={`p-2 rounded border border-${due.color}-500/30 bg-${due.color}-500/10 text-center w-full`}>
                        <p className={`text-xs text-${due.color}-400 font-bold`}>{due.status}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{due.title}</p>
                      </div>
                    ))}
                    {(!dashboardData?.dueDates || dashboardData.dueDates.length === 0) && (
                      <p className="text-xs text-slate-500">No upcoming deadlines</p>
                    )}
                 </div>
               </div>
            </div>
          </BentoCard>

          {/* 9. Government Updates Center Ã¢â‚¬â€ live data */}
          <BentoCard size="xl" title="Government Updates Center" description="Latest official circulars and notifications from 5 departments." className="xl:col-span-6">
            <div className="h-[420px] w-full mt-4">
              <Tabs
                containerClassName="mb-4"
                activeTabClassName="bg-[#C9A94B]/20"
                tabClassName="hover:text-white"
                contentClassName="mt-4"
                tabs={[
                  {
                    title: 'GST Council',
                    value: 'gst-council',
                    content: (
                      <div className="w-full h-full rounded-2xl p-5 bg-[#0D0D0F] border border-white/10 overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-medium text-white mb-4">Latest GST Council Notifications</h3>
                        <div className="space-y-3">
                          {govNewsLoading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />) :
                            (govNews['gst-council'] || []).length === 0 ? <p className="text-slate-600 text-sm">Syncing data from GST Council...</p> :
                            (govNews['gst-council'] || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 rounded-xl bg-[#111111] border border-white/[0.07] cursor-pointer hover:border-[#C9A94B]/25 transition-all group"
                                onClick={() => window.open(item.officialUrl, '_blank')}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-slate-600">{item.category}</span>
                                  {item.notificationNo && <span className="text-[10px] font-mono text-slate-700">{item.notificationNo}</span>}
                                </div>
                                <h4 className="text-sm text-white group-hover:text-[#C9A94B] transition-colors line-clamp-2">{item.title}</h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'CBIC',
                    value: 'cbic',
                    content: (
                      <div className="w-full h-full rounded-2xl p-5 bg-[#0D0D0F] border border-white/10 overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-medium text-white mb-4">CBIC Circulars & Notifications</h3>
                        <div className="space-y-3">
                          {govNewsLoading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />) :
                            (govNews['cbic'] || []).length === 0 ? <p className="text-slate-600 text-sm">Syncing data from CBIC...</p> :
                            (govNews['cbic'] || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 rounded-xl bg-[#111111] border border-white/[0.07] cursor-pointer hover:border-[#0F9D58]/25 transition-all group"
                                onClick={() => window.open(item.officialUrl, '_blank')}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-slate-600">{item.category}</span>
                                </div>
                                <h4 className="text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-2">{item.title}</h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'Income Tax',
                    value: 'income-tax',
                    content: (
                      <div className="w-full h-full rounded-2xl p-5 bg-[#0D0D0F] border border-white/10 overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-medium text-white mb-4">CBDT Notifications & Updates</h3>
                        <div className="space-y-3">
                          {govNewsLoading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />) :
                            (govNews['income-tax'] || []).length === 0 ? <p className="text-slate-600 text-sm">Syncing data from Income Tax...</p> :
                            (govNews['income-tax'] || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 rounded-xl bg-[#111111] border border-white/[0.07] cursor-pointer hover:border-amber-500/25 transition-all group"
                                onClick={() => window.open(item.officialUrl, '_blank')}>
                                <h4 className="text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2">{item.title}</h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'DGFT',
                    value: 'dgft',
                    content: (
                      <div className="w-full h-full rounded-2xl p-5 bg-[#0D0D0F] border border-white/10 overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-medium text-white mb-4">DGFT Trade Notices</h3>
                        <div className="space-y-3">
                          {govNewsLoading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />) :
                            (govNews['dgft'] || []).length === 0 ? <p className="text-slate-600 text-sm">Syncing data from DGFT...</p> :
                            (govNews['dgft'] || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 rounded-xl bg-[#111111] border border-white/[0.07] cursor-pointer hover:border-red-500/25 transition-all group"
                                onClick={() => window.open(item.officialUrl, '_blank')}>
                                <h4 className="text-sm text-white group-hover:text-red-400 transition-colors line-clamp-2">{item.title}</h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'MCA',
                    value: 'mca',
                    content: (
                      <div className="w-full h-full rounded-2xl p-5 bg-[#0D0D0F] border border-white/10 overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-medium text-white mb-4">MCA Circulars & ROC Notifications</h3>
                        <div className="space-y-3">
                          {govNewsLoading ? Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />) :
                            (govNews['mca'] || []).length === 0 ? <p className="text-slate-600 text-sm">Syncing data from MCA...</p> :
                            (govNews['mca'] || []).map((item: any, i: number) => (
                              <div key={i} className="p-4 rounded-xl bg-[#111111] border border-white/[0.07] cursor-pointer hover:border-purple-500/25 transition-all group"
                                onClick={() => window.open(item.officialUrl, '_blank')}>
                                <h4 className="text-sm text-white group-hover:text-purple-400 transition-colors line-clamp-2">{item.title}</h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  },
                ]}
              />
            </div>
          </BentoCard>

          {/* 10. Recent Activity Timeline */}
          <BentoCard size="lg" title="Recent Activity" description="Your timeline." className="xl:col-span-2" icon={<Clock size={24} />}>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {data.recentActivity.map((activity: any, i: number) => {
                const getIcon = (type: string) => {
                  switch(type) {
                    case 'gst': return <Landmark size={14} className="text-emerald-400" />;
                    case 'payment': return <CreditCard size={14} className="text-sky-400" />;
                    case 'appointment': return <Calendar size={14} className="text-amber-400" />;
                    default: return <FileText size={14} className="text-slate-400" />;
                  }
                };
                return (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-[#111111] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">
                    <div className="w-2 h-2 rounded-full bg-[#C9A94B]"></div>
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#C9A94B]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(activity.type)}
                      <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                    </div>
                    <time className="text-xs text-slate-500">{activity.date}</time>
                  </div>
                </div>
              )})}
            </div>
          </BentoCard>
        </MagicBentoGrid>
      </motion.div>
      
      {/* Required for the scrolling news animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}} />
    </>
  );
}





