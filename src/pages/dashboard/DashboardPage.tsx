import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck, Clock, FileText, CreditCard, Calendar,
  Landmark, Calculator, Briefcase, Scale, ChevronRight,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || 'User';
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const response = await api.get('/dashboard/summary');
        if (response.data.success) setDashboardData(response.data.data);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]">
        <div className="w-8 h-8 border-2 border-[#C9A94B]/30 border-t-[#C9A94B] rounded-full animate-spin"></div>
      </div>
    );
  }

  const quickActions = [
    { name: 'File GST', icon: Landmark, path: '/gst', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'File ITR', icon: Calculator, path: '/income-tax', color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { name: 'Consult', icon: Briefcase, path: '/queries', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Legal', icon: Scale, path: '/legal', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Welcome back, {userName}</h1>
        <p className="text-slate-400 text-sm">Here's an overview of your business compliance</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Compliance Score"
          value={`${dashboardData?.businessStatus?.complianceScore || 0}%`}
          icon={ShieldCheck}
          color="text-[#C9A94B]"
          trend="+5%"
        />
        <MetricCard
          label="Pending Tasks"
          value={dashboardData?.dueDates?.length || 0}
          icon={Clock}
          color="text-amber-400"
          trend="2 urgent"
        />
        <MetricCard
          label="Documents"
          value={dashboardData?.recentDocuments?.length || 0}
          icon={FileText}
          color="text-sky-400"
          trend="recent"
        />
        <MetricCard
          label="Pending Bills"
          value={`₹${(dashboardData?.paymentSummary?.pendingBills || 0).toLocaleString()}`}
          icon={CreditCard}
          color="text-red-400"
          trend="due soon"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#141418] border border-white/5 hover:border-[#C9A94B]/20 hover:bg-[#1C1C22] transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center`}>
                  <action.icon size={20} className={action.color} />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white">{action.name}</span>
              </button>
            ))}
            <button
              onClick={() => navigate('/appointments')}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#141418] border border-white/5 hover:border-[#C9A94B]/20 hover:bg-[#1C1C22] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/10 flex items-center justify-center">
                <Calendar size={20} className="text-[#C9A94B]" />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white">Book Appt</span>
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div>
          <SectionHeader title="Compliance Status" />
          <div className="bg-[#141418] border border-white/5 rounded-xl p-4 space-y-3">
            <StatusItem label="GST Status" value={dashboardData?.businessStatus?.gst || 'N/A'} status="active" />
            <StatusItem label="PAN Status" value={dashboardData?.businessStatus?.pan || 'N/A'} status="active" />
            <StatusItem label="IEC Status" value={dashboardData?.businessStatus?.iec || 'N/A'} status="inactive" />
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mt-6">
        <SectionHeader title="Upcoming Deadlines" action="View All" onAction={() => navigate('/calendar')} />
        <div className="bg-[#141418] border border-white/5 rounded-xl overflow-hidden">
          {dashboardData?.dueDates && dashboardData.dueDates.length > 0 ? (
            dashboardData.dueDates.map((due: any, i: number) => (
              <DeadlineItem key={i} due={due} />
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No upcoming deadlines</div>
          )}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="mt-6">
        <SectionHeader title="Recent Documents" action="View All" onAction={() => navigate('/documents')} />
        <div className="bg-[#141418] border border-white/5 rounded-xl overflow-hidden">
          {dashboardData?.recentDocuments && dashboardData.recentDocuments.length > 0 ? (
            dashboardData.recentDocuments.slice(0, 5).map((doc: any, i: number) => (
              <DocumentItem key={i} doc={doc} />
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No recent documents</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function MetricCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-[#141418] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-slate-500">{trend}</span>
      </div>
      <p className="text-2xl font-semibold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function SectionHeader({ title, action, onAction }: any) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-medium text-white">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-xs text-[#C9A94B] hover:text-[#E8C96B] flex items-center gap-1">
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function StatusItem({ label, value, status }: any) {
  const Icon = status === 'active' ? CheckCircle : AlertCircle;
  const color = status === 'active' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">{value}</span>
        <Icon size={14} className={color} />
      </div>
    </div>
  );
}

function DeadlineItem({ due }: any) {
  const Icon = due.color === 'red' ? AlertCircle : Clock;
  const color = due.color === 'red' ? 'text-red-400' : due.color === 'amber' ? 'text-amber-400' : 'text-emerald-400';
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3">
        <Icon size={16} className={color} />
        <span className="text-sm text-white">{due.title}</span>
      </div>
      <span className={`text-xs font-medium ${color}`}>{due.status}</span>
    </div>
  );
}

function DocumentItem({ doc }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <FileText size={16} className="text-slate-400" />
        <span className="text-sm text-slate-300">{doc.fileName}</span>
      </div>
      <ChevronRight size={14} className="text-slate-500" />
    </div>
  );
}
