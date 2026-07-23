import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { Landmark, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { cn, formatCurrency } from '../../../lib/utils';

export default function DeductionsPage() {
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDeductions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/income-tax/deductions');
      if (response.data.success) {
        setDeductions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch deductions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Tax Deductions Ledger</h2>
          <p className="text-sm text-slate-400">Track 80C, 80D, and other eligible exemptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#111111] border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/5 transition-colors"
        >
          Add Deduction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : deductions.length === 0 ? (
          <p className="text-slate-500">No deductions recorded.</p>
        ) : (
          deductions.map((deduction) => (
            <BentoCard key={deduction.id} className="group hover:border-[#C9A94B]/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/10 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-[#C9A94B]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{deduction.client?.name || 'Unknown Client'}</h3>
                    <p className="text-sm text-[#C9A94B]">Sec {deduction.section}</p>
                  </div>
                </div>
                {deduction.isEligible ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Eligible
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Rejected
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-display font-medium text-white">
                    {formatCurrency(Number(deduction.amountPaise) / 100)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{deduction.description}</p>
              </div>

              {!deduction.isEligible && deduction.rejectionReason && (
                <div className="pt-4 border-t border-red-500/10 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{deduction.rejectionReason}</p>
                </div>
              )}
            </BentoCard>
          ))
        )}
      </div>
      
      {/* Add Deduction Modal */}
      {isModalOpen && (
        <AddDeductionModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchDeductions();
          }} 
        />
      )}
    </div>
  );
}

function AddDeductionModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    financialYear: '2024-25',
    section: '80C',
    description: '',
    amount: ''
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
    if (!formData.clientId) return alert('No client selected');
    
    setLoading(true);
    try {
      const payload = {
        financialYear: formData.financialYear,
        section: formData.section,
        description: formData.description,
        amountPaise: Number(formData.amount) * 100 // convert rupees to paise
      };

      await api.post(`/tax/clients/${formData.clientId}/deductions`, payload);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to add deduction', error);
      alert(error.response?.data?.error || 'Failed to add deduction');
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

        <h2 className="text-xl font-display font-medium text-white mb-6">Add New Deduction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {clients.length > 1 && (
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
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Financial Year</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 2024-25"
              value={formData.financialYear}
              onChange={e => setFormData({ ...formData, financialYear: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Section</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 80C, 80D"
              value={formData.section}
              onChange={e => setFormData({ ...formData, section: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <input 
              required
              type="text" 
              placeholder="e.g. LIC Premium, Health Insurance"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹)</label>
            <input 
              required
              type="number" 
              min="0"
              placeholder="Total amount in Rupees"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Deduction'}
          </button>
        </form>
      </div>
    </div>
  );
}
