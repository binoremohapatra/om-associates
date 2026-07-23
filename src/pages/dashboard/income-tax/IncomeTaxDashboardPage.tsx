import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, Landmark, CheckCircle2, Clock } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { MagicBentoGrid } from '../../../components/ui/MagicBento';
import { formatCurrency } from '../../../lib/utils';

export default function IncomeTaxDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itNews, setItNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/v1/income-tax/analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch income tax analytics', error);
      } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchItNews = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/news?department=income-tax&limit=10');
        const d = await res.json();
        if (d.success) setItNews(d.data || []);
      } catch {} finally { setNewsLoading(false); }
    };
    fetchItNews();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#C9A94B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MagicBentoGrid className="flex flex-col shrink-0 w-full p-4 sm:p-6 lg:p-8 pb-12 gap-6">
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <BentoCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-slate-400 font-medium text-sm">Total Tax Liability</p>
            </div>
            <h2 className="text-3xl font-display font-medium text-white mb-2">{formatCurrency(data.totalTaxLiability)}</h2>
            <p className="text-sm text-slate-500">Across all clients (FY 2024-25)</p>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-slate-400 font-medium text-sm">Advance Tax Paid</p>
            </div>
            <h2 className="text-3xl font-display font-medium text-white mb-2">{formatCurrency(data.advanceTaxPaid)}</h2>
            <p className="text-sm text-slate-500">Successfully deposited</p>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-slate-400 font-medium text-sm">Pending ITRs</p>
            </div>
            <h2 className="text-3xl font-display font-medium text-white mb-2">{data.pendingReturns}</h2>
            <p className="text-sm text-slate-500">Awaiting client approval</p>
          </BentoCard>
          <BentoCard className="bg-gradient-to-br from-[#C9A94B]/20 to-transparent border-[#C9A94B]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#C9A94B]/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#C9A94B]" />
              </div>
              <p className="text-[#C9A94B] font-medium text-sm">Quick Action</p>
            </div>
            <h2 className="text-xl font-medium text-white mb-4">File New ITR</h2>
            <button className="w-full py-2 bg-[#C9A94B] text-black font-medium rounded-lg hover:bg-[#E8C96B] transition-colors">Start Filing</button>
          </BentoCard>
        </div>
      )}

      {/* Latest CBDT Notifications & DIY ITR Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BentoCard title="Latest CBDT Notifications & Updates" description="Live updates from the Income Tax Department official portal." size="lg">
          <div className="mt-4 flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
            {newsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
            ) : itNews.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-600 text-sm">Syncing Income Tax data...</p>
                <a href="https://www.incometaxindia.gov.in/Pages/press-releases.aspx" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#C9A94B] hover:underline mt-2 inline-block">Visit incometaxindia.gov.in →</a>
              </div>
            ) : (
              itNews.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/25 cursor-pointer transition-all group"
                  onClick={() => window.open(item.officialUrl, '_blank')}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-amber-400 mb-0.5 block">{item.category}</span>
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

        {/* DIY ITR Section */}
        <BentoCard title="Do It Yourself (DIY) ITR" description="File your own Income Tax Return with our guided steps." size="lg">
          <div className="mt-4 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A94B]"></div>
              <h3 className="text-white font-medium mb-2">Step 1: Gather Documents</h3>
              <p className="text-sm text-slate-400">Collect your Form 16, PAN card, Aadhaar card, bank statements, and investment proofs (80C, 80D, etc.).</p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A94B]"></div>
              <h3 className="text-white font-medium mb-2">Step 2: Choose ITR Form</h3>
              <p className="text-sm text-slate-400">Select ITR-1 for salaried individuals up to 50 Lakhs, or ITR-4 if you have presumptive business income.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A94B]"></div>
              <h3 className="text-white font-medium mb-2">Step 3: Fill & E-Verify</h3>
              <p className="text-sm text-slate-400">Enter your income details, claim deductions, pay any remaining tax, and e-verify your return using Aadhaar OTP.</p>
            </div>

            <button 
              onClick={() => window.open('https://eportal.incometax.gov.in/iec/foservices/#/login', '_blank')}
              className="w-full mt-2 py-3 bg-[#C9A94B] text-black font-semibold rounded-xl hover:bg-[#E8C96B] transition-colors"
            >
              Start DIY ITR Filing Now
            </button>
          </div>
        </BentoCard>
      </div>
    </MagicBentoGrid>
  );
}

