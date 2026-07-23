import React from 'react';
import { BarChart2, Download, FileText, PieChart } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';
import { cn } from '../../../lib/utils';

export default function ReportsPage() {
  const reports = [
    { title: 'Monthly GST Summary', desc: 'Consolidated GSTR-1 and GSTR-3B filed data.', type: 'PDF' },
    { title: 'Revenue Analytics', desc: 'Invoice generation and collection metrics.', type: 'CSV' },
    { title: 'Client Compliance Report', desc: 'Pending vs filed return status across all clients.', type: 'PDF' },
    { title: 'Tax Deductions Ledger', desc: 'Summary of 80C and other deductions claimed.', type: 'XLSX' }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20">
            <BarChart2 className="w-6 h-6 text-[#C9A94B]" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-medium text-white mb-1">Reports</h1>
            <p className="text-slate-500">Generate and download consolidated MIS reports.</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-[#C9A94B] text-black font-medium rounded-xl hover:bg-[#E8C96B] transition-colors">
          Custom Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, idx) => (
          <BentoCard key={idx} className="group hover:border-[#C9A94B]/30 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#C9A94B] group-hover:text-black transition-colors text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{report.title}</h3>
            <p className="text-sm text-slate-400 mb-6 line-clamp-2">{report.desc}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className={cn(
                "px-2 py-1 text-xs font-bold rounded",
                report.type === 'PDF' ? "bg-red-500/10 text-red-400" :
                report.type === 'CSV' ? "bg-blue-500/10 text-blue-400" :
                "bg-green-500/10 text-green-400"
              )}>
                {report.type}
              </span>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-[#C9A94B] transition-colors" />
            </div>
          </BentoCard>
        ))}
      </div>
    </div>
  );
}
