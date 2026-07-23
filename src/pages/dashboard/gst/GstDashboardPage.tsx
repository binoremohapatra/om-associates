import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';
import { BentoCard } from '../../../components/ui/BentoCard';

export default function GstDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gstNews, setGstNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

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
            {recentFilings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p>No recent filings found.</p>
              </div>
            ) : (
              recentFilings.map((filing: any) => (
                <div key={filing.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/10 flex items-center justify-center">
                      <span className="text-[#C9A94B] font-medium">{filing.formType}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{filing.clientId}</h4>
                      <p className="text-xs text-slate-400">Due: {new Date(filing.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={filing.status} />
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))
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
                  <div key={i} className={`p-4 rounded-xl border border-${color}-500/20 bg-${color}-500/5 relative overflow-hidden group cursor-pointer`}>
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
                    <p className="text-xs text-slate-500">{deadline.clientsPending} Clients Pending</p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">No upcoming deadlines found.</p>
            )}
          </div>
        </BentoCard>
      </div>

      {/* Latest GST & CBIC Notifications Ã¢â‚¬â€ Live from API */}
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

// Dummy icon for empty state
function FileText(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}


