import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, fadeInUp } from '../../lib/animations';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Calculator, Download, PieChart, IndianRupee } from 'lucide-react';

export default function TaxCalculatorPage() {
  const [income, setIncome] = useState<string>('');
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  const calculateTax = () => {
    const val = parseInt(income.replace(/,/g, '') || '0');
    if (val <= 700000 && regime === 'new') return 0;
    return Math.floor(val * 0.15); // Mock calculation
  };

  const tax = calculateTax();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Income Tax Calculator</h1>
          <p className="text-slate-400">Calculate your tax liability instantly under the New and Old regimes.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Calculator Form */}
        <div className="w-full lg:w-1/2">
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calculator className="text-[#C9A94B]" />
              Enter Details
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Financial Year</label>
                <select className="w-full bg-[#111111]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#C9A94B]/50 focus:outline-none transition-colors appearance-none">
                  <option>FY 2025-2026</option>
                  <option>FY 2024-2025</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Total Income</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full bg-[#111111]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-[#C9A94B]/50 focus:outline-none transition-colors text-lg font-mono"
                    placeholder="15,00,000"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-slate-300">Tax Regime</label>
                <div className="flex bg-[#111111]/50 rounded-xl p-1 border border-white/10 relative">
                  <button 
                    onClick={() => setRegime('new')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all z-10 ${regime === 'new' ? 'text-black' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    New Regime
                  </button>
                  <button 
                    onClick={() => setRegime('old')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all z-10 ${regime === 'old' ? 'text-black' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    Old Regime
                  </button>
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] rounded-lg transition-transform duration-300 ease-in-out z-0`}
                    style={{ transform: `translateX(${regime === 'old' ? '100%' : '0'})` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Results */}
        <div className="w-full lg:w-1/2">
          <GlassCard className="bg-[#111111]/80 border-white/5">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <PieChart className="text-[#C9A94B]" />
              Tax Breakdown
            </h2>

            <motion.div 
              key={tax}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 mb-8 relative"
            >
              <div className="absolute inset-0 bg-[#C9A94B]/10 blur-[40px] rounded-full" />
              <p className="text-slate-400 font-medium mb-2 relative z-10">Total Estimated Tax</p>
              <h3 className="text-6xl font-display font-bold text-white relative z-10 flex items-center justify-center">
                <IndianRupee className="text-[#C9A94B] mr-2" size={48} />
                {tax.toLocaleString('en-IN')}
              </h3>
            </motion.div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                <span className="text-slate-300">Gross Tax</span>
                <span className="text-white font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                <span className="text-slate-300">Health & Edu Cess (4%)</span>
                <span className="text-white font-medium">₹{Math.floor(tax * 0.04).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/20">
                <span className="text-[#C9A94B] font-bold">Net Tax Payable</span>
                <span className="text-[#C9A94B] font-bold text-xl">₹{Math.floor(tax * 1.04).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button variant="primary" className="w-full py-4">
              <Download size={18} />
              Download Detailed PDF Report
            </Button>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
