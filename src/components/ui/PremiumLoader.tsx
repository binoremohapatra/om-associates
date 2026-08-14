import React from 'react';
import { motion } from 'framer-motion';

export default function PremiumLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] w-full relative overflow-hidden" aria-label="Loading content...">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C9A94B]/5 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          {/* Outer rotating ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A94B] border-r-[#C9A94B]/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner rotating ring (reverse) */}
          <motion.div 
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#E8C96B] border-l-[#E8C96B]/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center glowing dot */}
          <motion.div 
            className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C9A94B] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: '0 0 12px rgba(201,169,75,0.8)' }}
          />
        </div>
        
        {/* Loading Text */}
        <motion.div 
          className="flex items-center gap-1 text-[#C9A94B] font-medium tracking-widest text-sm uppercase"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Loading
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}
          >.</motion.span>
        </motion.div>
      </div>
    </div>
  );
}
