import { api } from '@/lib/api';
import React, { useState, useEffect, useRef } from 'react';

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Landmark, FileCheck, Scale, Search, Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

const gstNavItems = [
  { name: 'Overview', path: '/gst', icon: LayoutDashboard },
  { name: 'Returns', path: '/gst/returns', icon: FileText },
  { name: 'Challans', path: '/gst/challans', icon: Landmark },
  { name: 'Notices', path: '/gst/notices', icon: Scale },
  { name: 'Registration', path: '/gst/registration', icon: FileCheck },
];

export default function GstLayout() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="flex flex-col shrink-0 min-h-0 w-full">
      {/* Module Header & Subnav */}
      <div className="shrink-0 pt-4 px-4 md:pt-6 md:px-8 border-b border-white/5 bg-[#0D0D0F]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-1">GST Command Centre</h1>
            <p className="text-xs md:text-sm text-slate-400">Manage returns, challans, and compliance across all clients.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search GSTIN or Client..."
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B] w-full sm:w-64 transition-colors text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black text-sm font-medium rounded-xl hover:shadow-[0_0_20px_rgba(201,169,75,0.3)] transition-all text-center"
              >
                New Filing
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {gstNavItems.map((item) => {
            // Exact match for overview, partial for others
            const isActive = item.path === '/gst' 
              ? location.pathname === '/gst'
              : location.pathname.startsWith(item.path);

            return (
              <GstNavItem key={item.path} item={item} isActive={isActive} />
            );
          })}
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 w-full bg-[#09090b] p-4 md:p-8 pb-12">
        <Outlet />
      </div>

      {/* New Filing Modal */}
      {isModalOpen && (
        <NewFilingModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            window.location.reload(); // Quick refresh since layout wraps multiple pages
          }} 
        />
      )}

      {/* Upload GST Modal */}
      {isUploadModalOpen && (
        <UploadGstModal 
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function GstNavItem({ item, isActive }: { item: any, isActive: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      const timeout = setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  return (
    <NavLink
      ref={ref}
      to={item.path}
      className={cn(
        "flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0",
        isActive ? "text-[#C9A94B]" : "text-slate-400 hover:text-white"
      )}
    >
      <item.icon className="w-4 h-4" />
      {item.name}
      {isActive && (
        <motion.div 
          layoutId="gst-subnav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A94B]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </NavLink>
  );
}

import { useAuth } from '../../../contexts/AuthContext';

function UploadGstModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      await api.post('/gst/parse-return', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to parse GST document', err);
      alert(err.response?.data?.error || 'Failed to parse GST document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold">&times;</button>
        <h2 className="text-xl font-display font-medium text-white mb-2">Upload GST Return</h2>
        <p className="text-sm text-slate-400 mb-6">Drop a GSTR-3B or GSTR-1 acknowledgement PDF to auto-parse and save data.</p>
        
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragging ? "border-[#C9A94B] bg-[#C9A94B]/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
          )}
        >
          <Upload className={cn("w-10 h-10 mb-4", isDragging ? "text-[#C9A94B]" : "text-slate-500")} />
          {file ? (
            <p className="text-white font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-white font-medium mb-1">Click or drag PDF here</p>
              <p className="text-xs text-slate-500">Supports standard GST return PDFs</p>
            </>
          )}
          <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Parsing...' : 'Upload & Parse'}
        </button>
      </div>
    </div>
  );
}

function NewFilingModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    formType: 'GSTR_3B',
    periodStart: '',
    periodEnd: '',
    dueDate: '',
    status: 'PENDING',
    totalTaxableValue: '',
    totalTaxPayable: ''
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
      const payload = {
        ...formData,
        totalTaxableValue: formData.totalTaxableValue ? Number(formData.totalTaxableValue) : 0,
        totalTaxPayable: formData.totalTaxPayable ? Number(formData.totalTaxPayable) : 0
      };

      await api.post('/gst/returns', payload);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create GST return', error);
      alert(error.response?.data?.error || 'Failed to add GST return');
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

        <h2 className="text-xl font-display font-medium text-white mb-6">Record New GST Filing</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Client</label>
            <select 
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.gstin || 'No GSTIN'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Form Type</label>
              <select 
                value={formData.formType}
                onChange={e => setFormData({ ...formData, formType: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              >
                <option value="GSTR_1">GSTR-1</option>
                <option value="GSTR_3B">GSTR-3B</option>
                <option value="GSTR_9">GSTR-9</option>
                <option value="GSTR_9C">GSTR-9C</option>
                <option value="GSTR_2B">GSTR-2B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              >
                <option value="PENDING">Pending</option>
                <option value="FILED">Filed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Period Start</label>
              <input 
                required
                type="date" 
                value={formData.periodStart}
                onChange={e => setFormData({ ...formData, periodStart: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Period End</label>
              <input 
                required
                type="date" 
                value={formData.periodEnd}
                onChange={e => setFormData({ ...formData, periodEnd: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
            <input 
              required
              type="date" 
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Taxable Val (₹)</label>
              <input 
                type="number" 
                min="0"
                placeholder="Optional"
                value={formData.totalTaxableValue}
                onChange={e => setFormData({ ...formData, totalTaxableValue: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Tax Payable (₹)</label>
              <input 
                type="number" 
                min="0"
                placeholder="Optional"
                value={formData.totalTaxPayable}
                onChange={e => setFormData({ ...formData, totalTaxPayable: e.target.value })}
                className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C9A94B] text-black font-medium hover:bg-[#E8C96B] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save GST Return'}
          </button>
        </form>
      </div>
    </div>
  );
}
