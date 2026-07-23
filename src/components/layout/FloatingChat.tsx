import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, PhoneCall, Bot, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-4 flex flex-col gap-3"
          >
            <a href="#whatsapp" className="flex items-center gap-3 bg-[#25D366] text-white p-3 pr-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">WhatsApp Us</span>
            </a>
            <a href="#call" className="flex items-center gap-3 bg-sky-500 text-white p-3 pr-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <PhoneCall size={20} />
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">Call Support</span>
            </a>
            <a href="/ai-assistant" className="flex items-center gap-3 bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] text-black p-3 pr-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">Ask AI Consultant</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(201,169,75,0.3)] hover:shadow-[0_8px_32px_rgba(201,169,75,0.5)] transition-all duration-300",
          isOpen ? "bg-[#111111] text-white border border-white/10" : "bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] text-black hover:scale-105"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  );
}
