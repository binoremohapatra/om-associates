import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { Download, Filter, Search, Landmark } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { BentoCard } from '../../../components/ui/BentoCard';
import { useAuth } from '../../../contexts/AuthContext';

export default function GstChallansPage() {
  const { token } = useAuth();
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallans = async () => {
      if (!token) return;
      try {
        const res = await api.get('/gst/challans');
        if (res.data.success) {
          setChallans(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch challans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallans();
  }, [token]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-medium text-white">GST Challans</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E8C96B]/10 border border-[#C9A94B]/30 rounded-xl text-[#C9A94B] hover:bg-[#E8C96B]/20 transition-colors">
            Generate Challan
          </button>
        </div>
      </div>

      <BentoCard title="Payment Records" className="flex-1" noPadding>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading challans...</div>
        ) : challans.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <Landmark className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400 mb-2">No challans generated</p>
            <p className="text-sm">There are no GST payment records for your clients yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">CPIN</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Generated On</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((challan) => (
                  <tr key={challan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{challan.client?.name}</p>
                      <p className="text-xs text-slate-400">{challan.client?.gstin}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-slate-300">{challan.cpin}</span>
                    </td>
                    <td className="p-4 font-medium text-white">
                      ₹{(Number(challan.amountPaise) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(challan.generationDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={challan.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 ml-auto">
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    EXPIRED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  const style = styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-medium border", style)}>
      {status}
    </span>
  );
}
