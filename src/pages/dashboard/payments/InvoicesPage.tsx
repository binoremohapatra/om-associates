import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { format } from 'date-fns';
import { Download, CreditCard, Search, Filter } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/payments/invoices');
        if (response.data.success) {
          setInvoices(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handlePayNow = async (invoice: any) => {
    try {
      const response = await api.post('/payments/razorpay/order', {
        invoiceId: invoice.id,
        amountPaise: invoice.totalPaise
      });
      
      if (response.data.success) {
        // Here we would normally initialize Razorpay checkout
        alert(`Mock Razorpay Order Created: ${response.data.data.id}\nProceeding to mock verification...`);
        
        const verifyRes = await api.post('/payments/razorpay/verify', {
          razorpay_order_id: response.data.data.id,
          razorpay_payment_id: 'pay_mock_' + Math.floor(Math.random() * 1000000),
          razorpay_signature: 'mock_signature'
        });

        if (verifyRes.data.success) {
          alert('Payment Successful!');
          // Refresh data
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'OVERDUE': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search invoice number or client..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C9A94B]/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{inv.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {inv.client?.name || 'Unknown Client'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {formatCurrency(Number(inv.totalPaise) / 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', getStatusColor(inv.status))}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          title="Download PDF"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {inv.status !== 'PAID' && (
                          <button 
                            onClick={() => handlePayNow(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A94B] text-black text-xs font-medium hover:bg-[#E8C96B] transition-colors shadow-lg shadow-[#C9A94B]/20"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
