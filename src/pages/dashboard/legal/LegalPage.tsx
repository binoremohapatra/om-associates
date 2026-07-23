import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Scale, Calendar, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '../../../lib/utils';

export default function LegalPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mcaNews, setMcaNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/legal/cases', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setCases(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch legal cases', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchMcaNews = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/news?department=mca&limit=8');
        const d = await res.json();
        if (d.success) setMcaNews(d.data || []);
      } catch {} finally { setNewsLoading(false); }
    };
    fetchMcaNews();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'CLOSED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'APPEALED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <MagicBentoGrid className="flex flex-col shrink-0 w-full p-4 sm:p-6 lg:p-8 pb-12 gap-4 md:gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 gap-4 w-full">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20 shrink-0">
            <Scale className="w-5 h-5 md:w-6 md:h-6 text-[#C9A94B]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-0.5 md:mb-1">Legal Services</h1>
            <p className="text-xs md:text-sm text-slate-500">Track litigations, notices, and upcoming hearings.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-[#C9A94B] text-black text-sm md:text-base font-medium rounded-xl hover:bg-[#E8C96B] transition-colors"
        >
          Add Case Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500">Loading active cases...</p>
        ) : cases.length === 0 ? (
          <p className="text-slate-500">No legal cases found.</p>
        ) : (
          cases.map(legalCase => (
            <BentoCard key={legalCase.id} className="group hover:border-[#C9A94B]/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#C9A94B]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{legalCase.title}</h3>
                    <p className="text-sm text-[#C9A94B]">{legalCase.caseNumber || 'Notice/Draft'}</p>
                  </div>
                </div>
                <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', getStatusColor(legalCase.status))}>
                  {legalCase.status}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-400 line-clamp-2">
                  {legalCase.description || 'No description provided.'}
                </p>
                {legalCase.court && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                    <FileText className="w-4 h-4 text-slate-500" />
                    {legalCase.court}
                  </div>
                )}
              </div>

              {legalCase.nextHearingDate && (
                <div className={cn(
                  "pt-4 border-t flex items-center justify-between",
                  isPast(new Date(legalCase.nextHearingDate)) && !isToday(new Date(legalCase.nextHearingDate)) 
                    ? "border-red-500/20" 
                    : "border-white/5"
                )}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-400">Next Hearing</span>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isPast(new Date(legalCase.nextHearingDate)) && !isToday(new Date(legalCase.nextHearingDate))
                      ? "text-red-400" 
                      : "text-white"
                  )}>
                    {format(new Date(legalCase.nextHearingDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </BentoCard>
          ))
        )}
      </div>

      {/* Latest MCA Circulars â€” Live from API */}
      <div className="mt-4 md:mt-8">
        <BentoCard title="Latest MCA Circulars & Notifications" description="Live updates from the Ministry of Corporate Affairs official portal." size="lg">
          <div className="mt-4 flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar">
            {newsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
            ) : mcaNews.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-slate-600 text-sm">Syncing MCA data...</p>
                <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:underline mt-2 inline-block">Visit mca.gov.in â†’</a>
              </div>
            ) : (
              mcaNews.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-purple-500/25 cursor-pointer transition-all group"
                  onClick={() => window.open(item.officialUrl, '_blank')}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-purple-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-purple-400 mb-0.5 block">{item.category}</span>
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
      </div>
      {/* Add Case Modal */}
      {isModalOpen && (
        <CaseModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCases();
          }} 
        />
      )}
    </MagicBentoGrid>
  );
}

function CaseModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    caseNumber: '',
    description: '',
    court: '',
    status: 'OPEN',
    nextHearingDate: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/v1/clients', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
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
      await axios.post('/api/v1/legal/cases', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create case', error);
      alert('Failed to add case record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl font-display font-medium text-white mb-6">Add Case Record</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Case Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Income Tax Notice Appeal"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Case/Notice Number</label>
            <input 
              type="text" 
              placeholder="e.g. IT/2025/1102"
              value={formData.caseNumber}
              onChange={e => setFormData({ ...formData, caseNumber: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Court / Authority</label>
            <input 
              type="text" 
              placeholder="e.g. High Court / ITAT"
              value={formData.court}
              onChange={e => setFormData({ ...formData, court: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea 
              rows={3}
              placeholder="Brief description of the case or notice..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              >
                <option value="OPEN">Open</option>
                <option value="APPEALED">Appealed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Next Hearing</label>
              <input 
                type="date" 
                value={formData.nextHearingDate}
                onChange={e => setFormData({ ...formData, nextHearingDate: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Case Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

