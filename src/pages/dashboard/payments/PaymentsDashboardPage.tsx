import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';
import { formatCurrency } from '../../../lib/utils';

export default function PaymentsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/payments/analytics');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#C9A94B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <MagicBentoGrid className="flex flex-col shrink-0 w-full p-4 sm:p-6 lg:p-8 pb-12 gap-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <BentoCard>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-slate-400 font-medium text-sm">Total Revenue</p>
          </div>
          <h2 className="text-3xl font-display font-medium text-white mb-2">
            {formatCurrency(data.totalRevenue)}
          </h2>
          <p className="text-sm text-green-400 flex items-center gap-1">
            <span>+12.5%</span> from last month
          </p>
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-slate-400 font-medium text-sm">Pending Bills</p>
          </div>
          <h2 className="text-3xl font-display font-medium text-white mb-2">
            {formatCurrency(data.pendingBills)}
          </h2>
          <p className="text-sm text-orange-400 flex items-center gap-1">
            <span>{data.overdueInvoices} overdue</span>
          </p>
        </BentoCard>

        <BentoCard>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-slate-400 font-medium text-sm">Active Subscriptions</p>
          </div>
          <h2 className="text-3xl font-display font-medium text-white mb-2">
            {data.activeSubscriptions}
          </h2>
          <p className="text-sm text-slate-500">
            Generating recurring revenue
          </p>
        </BentoCard>

        <BentoCard className="bg-gradient-to-br from-[#C9A94B]/20 to-transparent border-[#C9A94B]/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#C9A94B]" />
            </div>
            <p className="text-[#C9A94B] font-medium text-sm">Quick Action</p>
          </div>
          <h2 className="text-xl font-medium text-white mb-4">
            Create Invoice
          </h2>
          <button 
            onClick={() => setIsInvoiceModalOpen(true)}
            className="w-full py-2 bg-[#C9A94B] text-black font-medium rounded-lg hover:bg-[#E8C96B] transition-colors"
          >
            Generate Now
          </button>
        </BentoCard>
      </div>

      {/* Revenue Chart */}
      <BentoCard className="mb-8" title="Revenue Overview" description="Monthly collected revenue vs pending.">
        <div className="h-[400px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A94B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A94B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `â‚¹${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#C9A94B' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#C9A94B" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BentoCard>

      {isInvoiceModalOpen && (
        <CreateInvoiceModal 
          onClose={() => setIsInvoiceModalOpen(false)}
          onSuccess={() => {
            setIsInvoiceModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </MagicBentoGrid>
  );
}

function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        if (response.data.success) {
          setClients(response.data.data);
          if (response.data.data.length > 0) {
            setFormData(prev => ({ ...prev, clientId: response.data.data[0].id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments/invoices', formData);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create invoice', error);
      alert(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold">&times;</button>
        <h2 className="text-xl font-display font-medium text-white mb-6">Generate New Invoice</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Client</label>
            <select 
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹)</label>
            <input 
              required
              type="number" 
              min="1"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              placeholder="e.g. 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              placeholder="e.g. Retainer fee for July 2026"
              rows={3}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Invoice'}
          </button>
        </form>
      </div>
    </div>
  );
}

