import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service: 'General Consultation',
    date: '',
    time: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(2); // Success step
    }, 1500);
  };

  const resetAndClose = () => {
    setTimeout(() => {
      setStep(1);
      setFormData({ service: 'General Consultation', date: '', time: '', message: '' });
    }, 300);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0D0D0F] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#111111]">
              <h3 className="text-lg font-medium text-white font-display">Book an Appointment</h3>
              <button onClick={resetAndClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Service Category</label>
                    <select 
                      value={formData.service}
                      onChange={e => setFormData({...formData, service: e.target.value})}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B] appearance-none"
                      required
                    >
                      <option className="bg-[#1A1A1A]">General Consultation</option>
                      <option className="bg-[#1A1A1A]">GST Filing & Queries</option>
                      <option className="bg-[#1A1A1A]">Income Tax Return</option>
                      <option className="bg-[#1A1A1A]">Company Registration</option>
                      <option className="bg-[#1A1A1A]">Notice Reply</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Preferred Date</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Preferred Time</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="time"
                          value={formData.time}
                          onChange={e => setFormData({...formData, time: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Brief Description</label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-3 top-4 text-slate-500" />
                      <textarea 
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        placeholder="What do you want to discuss?"
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A94B] resize-none"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3.5 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(201,169,75,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      'Request Appointment'
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-medium text-white font-display">Booking Requested!</h4>
                  <p className="text-sm text-slate-400 max-w-[280px]">
                    We have received your appointment request. Our team will contact you shortly to confirm the timing.
                  </p>
                  <button 
                    onClick={resetAndClose}
                    className="mt-6 px-8 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
