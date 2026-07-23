import React from 'react';
import { AlertTriangle, Download, Scale } from 'lucide-react';
import { BentoCard } from '../../../components/ui/BentoCard';

export default function GstNoticesPage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-1">GST Notices</h1>
          <p className="text-slate-500">Track and respond to departmental ASMT and DRC notices.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mt-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
          <Scale className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No active notices</h2>
        <p className="text-slate-400 text-sm">
          You currently have zero pending notices or demands from the GST department for any registered clients.
        </p>
      </div>
    </div>
  );
}
