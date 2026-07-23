import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, UserCircle, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { BentoCard } from '../../../components/ui/BentoCard';

const STEPS = [
  { id: 1, title: 'Business Details', icon: Building2 },
  { id: 2, title: 'Promoter Info', icon: UserCircle },
  { id: 3, title: 'Documents', icon: FileText },
];

export default function GstRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-display font-medium text-white mb-2">New GST Registration</h2>
        <p className="text-slate-400">Complete the application below to generate an ARN.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-4">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step) => {
          const isActive = currentStep >= step.id;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-[#09090b] px-4">
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  isActive 
                    ? "bg-[#C9A94B]/10 border-[#C9A94B] text-[#C9A94B] shadow-[0_0_15px_rgba(201,169,75,0.3)]" 
                    : "bg-white/5 border-white/10 text-slate-500"
                )}
              >
                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-slate-500")}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <BentoCard title={STEPS[currentStep - 1].title} className="flex-1">
        <div className="mt-6">
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Legal Name of Business (As per PAN)</label>
                  <input type="text" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B]" placeholder="Enter legal name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Permanent Account Number (PAN)</label>
                  <input type="text" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B] uppercase" placeholder="ABCDE1234F" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Constitution of Business</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B] appearance-none">
                  <option className="bg-[#111111]">Proprietorship</option>
                  <option className="bg-[#111111]">Partnership</option>
                  <option className="bg-[#111111]">Private Limited Company</option>
                  <option className="bg-[#111111]">LLP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Principal Place of Business</label>
                <textarea rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B]" placeholder="Complete address..." />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="py-20 text-center text-slate-400">
              Promoter details form will be rendered here.
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="py-20 text-center text-slate-400">
              Document upload dropzone will be rendered here.
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/5">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2.5 rounded-xl text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            Back
          </button>
          
          <button 
            onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
            className="px-8 py-2.5 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black font-medium rounded-xl hover:shadow-[0_0_20px_rgba(201,169,75,0.3)] transition-all"
          >
            {currentStep === STEPS.length ? 'Submit Application' : 'Save & Continue'}
          </button>
        </div>
      </BentoCard>
    </div>
  );
}
