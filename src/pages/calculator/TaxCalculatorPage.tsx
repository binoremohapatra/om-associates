import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../lib/animations';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Calculator, Download, PieChart, IndianRupee, Percent } from 'lucide-react';

export default function TaxCalculatorPage() {
  const [calculatorType, setCalculatorType] = useState<'income' | 'gst'>('income');
  
  // Income Tax State
  const [income, setIncome] = useState<string>('');
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  // GST State
  const [gstAmount, setGstAmount] = useState<string>('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstMode, setGstMode] = useState<'add' | 'remove'>('add');

  const calculateIncomeTax = () => {
    const val = parseInt(income.replace(/,/g, '') || '0');
    if (val <= 700000 && regime === 'new') return 0;
    return Math.floor(val * 0.15); // Mock calculation
  };

  const calculateGST = () => {
    const val = parseFloat(gstAmount.replace(/,/g, '') || '0');
    if (val === 0) return { base: 0, gst: 0, total: 0, cgst: 0, sgst: 0 };

    let base = 0;
    let gst = 0;
    let total = 0;

    if (gstMode === 'add') {
      base = val;
      gst = (val * gstRate) / 100;
      total = base + gst;
    } else {
      total = val;
      base = val / (1 + gstRate / 100);
      gst = total - base;
    }

    return {
      base: Math.round(base),
      gst: Math.round(gst),
      cgst: Math.round(gst / 2),
      sgst: Math.round(gst / 2),
      total: Math.round(total)
    };
  };

  const incomeTax = calculateIncomeTax();
  const gstResult = calculateGST();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Calculators</h1>
          <p className="text-slate-400">Estimate your tax liability instantly.</p>
        </div>
        
        {/* Calculator Toggle */}
        <div className="flex bg-[#111111]/80 rounded-xl p-1 border border-white/10 relative w-full md:w-auto overflow-hidden">
          <button 
            onClick={() => setCalculatorType('income')}
            className={`flex-1 md:px-6 py-2.5 text-sm font-medium rounded-lg transition-all z-10 ${calculatorType === 'income' ? 'text-black' : 'text-slate-400 hover:text-slate-300'}`}
          >
            Income Tax
          </button>
          <button 
            onClick={() => setCalculatorType('gst')}
            className={`flex-1 md:px-6 py-2.5 text-sm font-medium rounded-lg transition-all z-10 ${calculatorType === 'gst' ? 'text-black' : 'text-slate-400 hover:text-slate-300'}`}
          >
            GST Calculator
          </button>
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] rounded-lg transition-transform duration-300 ease-in-out z-0`}
            style={{ transform: `translateX(${calculatorType === 'gst' ? '100%' : '0'})` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {calculatorType === 'income' ? (
          <motion.div 
            key="income-calc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Income Tax Form */}
            <div className="w-full lg:w-1/2">
              <GlassCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calculator className="text-[#C9A94B]" />
                  Enter Income Details
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
                    <div className="flex bg-[#111111]/50 rounded-xl p-1 border border-white/10 relative overflow-hidden">
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

            {/* Income Tax Results */}
            <div className="w-full lg:w-1/2">
              <GlassCard className="bg-[#111111]/80 border-white/5">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                  <PieChart className="text-[#C9A94B]" />
                  Tax Breakdown
                </h2>

                <motion.div 
                  key={incomeTax}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 mb-8 relative"
                >
                  <div className="absolute inset-0 bg-[#C9A94B]/10 blur-[40px] rounded-full" />
                  <p className="text-slate-400 font-medium mb-2 relative z-10">Total Estimated Tax</p>
                  <h3 className="text-6xl font-display font-bold text-white relative z-10 flex items-center justify-center">
                    <IndianRupee className="text-[#C9A94B] mr-2" size={48} />
                    {incomeTax.toLocaleString('en-IN')}
                  </h3>
                </motion.div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                    <span className="text-slate-300">Gross Tax</span>
                    <span className="text-white font-medium">₹{incomeTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                    <span className="text-slate-300">Health & Edu Cess (4%)</span>
                    <span className="text-white font-medium">₹{Math.floor(incomeTax * 0.04).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/20">
                    <span className="text-[#C9A94B] font-bold">Net Tax Payable</span>
                    <span className="text-[#C9A94B] font-bold text-xl">₹{Math.floor(incomeTax * 1.04).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button variant="primary" className="w-full py-4">
                  <Download size={18} />
                  Download Detailed PDF Report
                </Button>
              </GlassCard>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="gst-calc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* GST Form */}
            <div className="w-full lg:w-1/2">
              <GlassCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Percent className="text-[#C9A94B]" />
                  Enter Goods & Services Details
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Calculation Mode</label>
                    <div className="flex bg-[#111111]/50 rounded-xl p-1 border border-white/10 relative overflow-hidden">
                      <button 
                        onClick={() => setGstMode('add')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all z-10 ${gstMode === 'add' ? 'text-black' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                        Add GST (Exclusive)
                      </button>
                      <button 
                        onClick={() => setGstMode('remove')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all z-10 ${gstMode === 'remove' ? 'text-black' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                        Remove GST (Inclusive)
                      </button>
                      <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] rounded-lg transition-transform duration-300 ease-in-out z-0`}
                        style={{ transform: `translateX(${gstMode === 'remove' ? '100%' : '0'})` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={gstAmount}
                        onChange={(e) => setGstAmount(e.target.value)}
                        className="w-full bg-[#111111]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-[#C9A94B]/50 focus:outline-none transition-colors text-lg font-mono"
                        placeholder="10,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">GST Rate (%)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 12, 18, 28].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setGstRate(rate)}
                          className={`py-3 rounded-xl border font-medium transition-colors ${
                            gstRate === rate 
                              ? 'bg-[#C9A94B]/20 border-[#C9A94B] text-[#C9A94B]' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* GST Results */}
            <div className="w-full lg:w-1/2">
              <GlassCard className="bg-[#111111]/80 border-white/5">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                  <PieChart className="text-[#C9A94B]" />
                  GST Breakdown
                </h2>

                <motion.div 
                  key={gstResult.total}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-6 mb-6 relative"
                >
                  <div className="absolute inset-0 bg-[#C9A94B]/10 blur-[40px] rounded-full" />
                  <p className="text-slate-400 font-medium mb-2 relative z-10">Total Amount</p>
                  <h3 className="text-5xl font-display font-bold text-white relative z-10 flex items-center justify-center">
                    <IndianRupee className="text-[#C9A94B] mr-1" size={40} />
                    {gstResult.total.toLocaleString('en-IN')}
                  </h3>
                </motion.div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/5">
                    <span className="text-slate-300">Base Amount</span>
                    <span className="text-white font-medium">₹{gstResult.base.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/5">
                    <span className="text-slate-300">CGST ({(gstRate/2).toFixed(1)}%)</span>
                    <span className="text-white font-medium">₹{gstResult.cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/5">
                    <span className="text-slate-300">SGST ({(gstRate/2).toFixed(1)}%)</span>
                    <span className="text-white font-medium">₹{gstResult.sgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/20">
                    <span className="text-[#C9A94B] font-bold">Total GST ({gstRate}%)</span>
                    <span className="text-[#C9A94B] font-bold text-lg">₹{gstResult.gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button variant="glass" className="w-full py-3.5 border-white/10 hover:bg-white/5 text-slate-300">
                  <Download size={18} />
                  Download Receipt Summary
                </Button>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
