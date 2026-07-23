import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Filter, Search, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { BentoCard } from '../../../components/ui/BentoCard';

export default function GstReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:4000/api/v1/gst/returns', {
          headers: { Authorization: `Bearer ${token}` }
        });
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
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-medium text-white">GST Returns</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <BentoCard title="All Returns" className="flex-1" noPadding>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading returns...</div>
        ) : returns.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400 mb-2">No returns found</p>
            <p className="text-sm">There are no GST returns filed for your clients yet.</p>
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
                {returns.map((ret) => (
                  <tr key={ret.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{ret.client?.name}</p>
                      <p className="text-xs text-slate-400">{ret.client?.gstin}</p>
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
                      <button className="text-[#C9A94B] hover:text-white transition-colors text-sm font-medium">
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
