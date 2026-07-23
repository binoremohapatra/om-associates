import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, fadeInUp } from '../../lib/animations';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Check, ChevronRight, Save, User, Building, Landmark, CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Income Sources', icon: Building },
  { id: 3, title: 'Deductions', icon: Landmark },
  { id: 4, title: 'Review & File', icon: CheckCircle },
];

export default function DIYITRPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden" className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">PAN Number</label>
                <input type="text" className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-sky-500/50 focus:outline-none uppercase" placeholder="ABCDE1234F" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Aadhaar Number</label>
                <input type="text" className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-sky-500/50 focus:outline-none" placeholder="1234 5678 9012" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Full Name (as per PAN)</label>
                <input type="text" className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-sky-500/50 focus:outline-none" placeholder="John Doe" />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden" className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Income Details</h3>
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Income from Salary</h4>
                  <p className="text-sm text-slate-400">Upload Form 16 to auto-fill</p>
                </div>
                <Button variant="secondary" size="sm">Upload Form 16</Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Business/Profession Income</label>
                <input type="text" className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-sky-500/50 focus:outline-none" placeholder="₹ 0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Income from Capital Gains</label>
                <input type="text" className="w-full bg-navy-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-sky-500/50 focus:outline-none" placeholder="₹ 0" />
              </div>
            </div>
          </motion.div>
        );
      case 3:
      case 4:
        return (
          <motion.div key="step-other" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden" className="space-y-6 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-sky-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white">Feature in Development</h3>
            <p className="text-slate-400 max-w-sm">This section of the premium wizard is currently being built. Stay tuned for updates!</p>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24"
    >
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-display font-bold text-white mb-4">DIY ITR Filing</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">File your income tax returns in minutes with our AI-guided premium wizard.</p>
      </div>

      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-sky-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 
                    isCurrent ? 'bg-navy-800 border-2 border-sky-400 text-sky-400' : 
                    'bg-navy-900 border border-white/10 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${isCurrent || isCompleted ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <GlassCard className="min-h-[400px] flex flex-col">
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
        
        <div className="pt-8 mt-8 border-t border-white/10 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="hidden sm:flex">
              <Save size={16} />
              Save Draft
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
            >
              {currentStep === STEPS.length ? 'File Return' : 'Continue'}
              {currentStep !== STEPS.length && <ChevronRight size={18} />}
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
