import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Download, Search, FileText, Upload } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';

export default function TaxFilingsPage() {
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchFilings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/income-tax/filings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setFilings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch filings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'FILED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-4 md:mb-6 shrink-0 justify-between w-full">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by PAN or Client Name..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-[#111111] border border-[#C9A94B]/30 text-[#C9A94B] text-sm md:text-base font-medium rounded-xl hover:bg-[#C9A94B]/10 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Upload</span> ITR-V
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-[#C9A94B] text-black text-sm md:text-base font-medium rounded-xl hover:bg-[#E8C96B] transition-colors whitespace-nowrap text-center"
          >
            Record Filing
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">PAN</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">FY</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Net Tax Payable</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading tax filings...</td>
                </tr>
              ) : filings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No filings found.</td>
                </tr>
              ) : (
                filings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{filing.client?.name || 'Unknown Client'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 uppercase">
                      {filing.client?.pan || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {filing.financialYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {formatCurrency(Number(filing.netTaxPayable) / 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', getStatusColor(filing.status))}>
                        {filing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          title="View Details"
                          className="p-2 rounded-lg text-slate-400 hover:text-[#C9A94B] hover:bg-[#C9A94B]/10 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          title="Download Ack"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Filing Modal */}
      {isModalOpen && (
        <AddFilingModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchFilings();
          }} 
        />
      )}

      {/* Upload ITR-V Modal */}
      {isUploadModalOpen && (
        <UploadItrModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchFilings();
          }}
        />
      )}
    </div>
  );
}

function AddFilingModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    financialYear: '2024-25',
    regime: 'NEW',
    grossIncome: '',
    deductions: ''
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
      const payload = {
        ...formData,
        grossIncome: Number(formData.grossIncome) * 100, // convert rupees to paise
        deductions: formData.deductions ? Number(formData.deductions) * 100 : 0
      };

      await axios.post('/api/v1/tax/filings', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create tax filing', error);
      alert(error.response?.data?.error || 'Failed to add tax filing');
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

        <h2 className="text-xl font-display font-medium text-white mb-6">Record Tax Filing</h2>

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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tax Regime</label>
            <select 
              value={formData.regime}
              onChange={e => setFormData({ ...formData, regime: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              <option value="NEW">New Tax Regime</option>
              <option value="OLD">Old Tax Regime</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Gross Income (₹)</label>
            <input 
              required
              type="number" 
              min="0"
              placeholder="Total Income in Rupees"
              value={formData.grossIncome}
              onChange={e => setFormData({ ...formData, grossIncome: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          {formData.regime === 'OLD' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Total Deductions (₹)</label>
              <input 
                type="number" 
                min="0"
                placeholder="Deductions in Rupees"
                value={formData.deductions}
                onChange={e => setFormData({ ...formData, deductions: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Filing Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

function UploadItrModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a PDF file');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('itrvPdf', file);

      await axios.post('/api/v1/tax/parse-itrv', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Failed to parse ITR-V', error);
      alert(error.response?.data?.error || 'Failed to process ITR-V document. Please ensure it is a valid, unlocked PDF.');
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
      
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#C9A94B]/10 mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-[#C9A94B]" />
          </div>
          <h2 className="text-xl font-display font-medium text-white">Upload ITR-V</h2>
          <p className="text-sm text-slate-400 mt-1">
            Auto-extract PAN, income, deductions, and tax payable from an ITR-V Acknowledgement PDF.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#C9A94B]/30 transition-colors">
            <input 
              type="file" 
              accept="application/pdf"
              className="hidden"
              id="itrv-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label 
              htmlFor="itrv-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <FileText className="w-8 h-8 text-slate-500 mb-3" />
              <span className="text-sm font-medium text-white mb-1">
                {file ? file.name : 'Click to select PDF'}
              </span>
              <span className="text-xs text-slate-500">
                {file ? 'File ready to upload' : 'Unlocked ITR-V Acknowledgement (PDF)'}
              </span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing PDF...
              </>
            ) : (
              'Parse and Record'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
