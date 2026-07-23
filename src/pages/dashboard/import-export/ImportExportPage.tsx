import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { Globe2, FileText, Anchor, Search, Download, Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function ImportExportPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dgftNews, setDgftNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/import-export/records');
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch EXIM records', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    const fetchDgftNews = async () => {
      try {
        const res = await fetch('/news?department=dgft&limit=10');
        const d = await res.json();
        if (d.success) setDgftNews(d.data || []);
      } catch {} finally { setNewsLoading(false); }
    };
    fetchDgftNews();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getRecordIcon = (type: string) => {
    switch(type) {
      case 'IEC': return <Globe2 className="w-4 h-4 text-[#C9A94B]" />;
      case 'SHIPPING_BILL': return <Anchor className="w-4 h-4 text-blue-400" />;
      case 'BILL_OF_ENTRY': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'LUT': return <FileText className="w-4 h-4 text-green-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 shrink-0 gap-4 w-full">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20 shrink-0">
            <Globe2 className="w-5 h-5 md:w-6 md:h-6 text-[#C9A94B]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-0.5 md:mb-1">Import / Export</h1>
            <p className="text-xs md:text-sm text-slate-500">Manage IEC Registrations, LUTs, and Shipping Bills.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full sm:w-auto px-3 py-2 md:px-4 md:py-2 bg-[#111111] border border-[#C9A94B]/30 text-[#C9A94B] text-sm md:text-base font-medium rounded-xl hover:bg-[#C9A94B]/10 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" /> <span className="inline">Upload Document</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-3 py-2 md:px-4 md:py-2 bg-[#C9A94B] text-black text-sm md:text-base font-medium rounded-xl hover:bg-[#E8C96B] transition-colors whitespace-nowrap text-center"
          >
            File New Record
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 md:mb-6 shrink-0 w-full">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by Document Number or Port Code..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Document No.</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Port Code</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading EXIM records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRecordIcon(record.recordType)}
                        <span className="font-medium text-white">{record.recordType.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">
                      {record.documentNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {record.client?.name || 'Unknown Client'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {record.portCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', getStatusColor(record.status))}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
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

      {/* Latest DGFT Trade Notices — Live from API */}
      <div className="mt-4 md:mt-8 md:px-6 pb-4 md:pb-12">
        <div className="p-4 md:p-5 rounded-2xl bg-[#111111] border border-white/[0.07]">
          <h3 className="text-sm font-medium text-white mb-1">Latest DGFT Trade Notices</h3>
          <p className="text-xs text-slate-600 mb-4">Live updates from the Directorate General of Foreign Trade official portal.</p>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar">
            {newsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
            ) : dgftNews.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-slate-600 text-sm">Syncing DGFT data...</p>
                <a href="https://www.dgft.gov.in" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-red-400 hover:underline mt-2 inline-block">Visit dgft.gov.in →</a>
              </div>
            ) : (
              dgftNews.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-red-500/25 cursor-pointer transition-all group"
                  onClick={() => window.open(item.officialUrl, '_blank')}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-red-400 mb-0.5 block">{item.category}</span>
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
        </div>
      </div>
      
      {/* EXIM Modal */}
      {isModalOpen && (
        <EximModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRecords();
          }} 
        />
      )}

      {/* Upload EXIM Modal */}
      {isUploadModalOpen && (
        <UploadEximModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}

function EximModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    recordType: 'IEC',
    documentNumber: '',
    portCode: '',
    status: 'PENDING',
    filedAt: ''
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
      await api.post('/import-export/records', formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create EXIM record', error);
      alert('Failed to add EXIM record');
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

        <h2 className="text-xl font-display font-medium text-white mb-6">File New EXIM Record</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Record Type</label>
            <select 
              value={formData.recordType}
              onChange={e => setFormData({ ...formData, recordType: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              <option value="IEC">IEC Registration</option>
              <option value="SHIPPING_BILL">Shipping Bill</option>
              <option value="BILL_OF_ENTRY">Bill of Entry</option>
              <option value="LUT">Letter of Undertaking (LUT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Number</label>
            <input 
              required
              type="text" 
              placeholder="e.g. IEC123456789"
              value={formData.documentNumber}
              onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Port Code (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. INBOM1"
              value={formData.portCode}
              onChange={e => setFormData({ ...formData, portCode: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Filed Date</label>
              <input 
                type="date" 
                value={formData.filedAt}
                onChange={e => setFormData({ ...formData, filedAt: e.target.value })}
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
            {loading ? 'Saving...' : 'Save EXIM Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

function UploadEximModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        if (response.data.success) {
          setClients(response.data.data);
          if (response.data.data.length > 0) {
            setClientId(response.data.data[0].id);
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
    if (!file) return alert('Please select a PDF file');
    if (!clientId) return alert('Please select a client');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('eximPdf', file);
      formData.append('clientId', clientId);

      await api.post('/import-export/parse-document', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Failed to parse EXIM doc', error);
      alert(error.response?.data?.error || 'Failed to process EXIM document.');
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
          <h2 className="text-xl font-display font-medium text-white">Upload EXIM Doc</h2>
          <p className="text-sm text-slate-400 mt-1">
            Auto-extract IEC, Shipping Bills, LUTs, and Port Codes from a PDF.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Client</label>
            <select 
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#C9A94B]/30 transition-colors mt-4">
            <input 
              type="file" 
              accept="application/pdf"
              className="hidden"
              id="exim-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label 
              htmlFor="exim-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <FileText className="w-8 h-8 text-slate-500 mb-3" />
              <span className="text-sm font-medium text-white mb-1">
                {file ? file.name : 'Click to select PDF'}
              </span>
              <span className="text-xs text-slate-500">
                {file ? 'File ready to upload' : 'IEC, BoE, Shipping Bill (PDF)'}
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
