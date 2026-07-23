import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import LuxuryBackground from '../components/ui/LuxuryBackground';
import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.replace('/', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <LuxuryBackground className="w-full h-full" />
      </div>
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10 flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C9A94B]/20 to-transparent flex items-center justify-center border border-[#C9A94B]/30 mb-8 animate-pulse">
          <div className="w-10 h-10 rounded-full border-4 border-[#C9A94B]/50 border-t-[#C9A94B] animate-spin"></div>
        </div>
        <h1 className="text-4xl font-display font-bold text-white mb-4">{pageName}</h1>
        <p className="text-slate-400 text-lg max-w-md text-center">
          This module is currently under active development. Our engineering team is integrating enterprise-grade features for this section.
        </p>
      </motion.div>
    </>
  );
}
