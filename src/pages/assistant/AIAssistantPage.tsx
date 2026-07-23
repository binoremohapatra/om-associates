import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, fadeInUp } from '../../lib/animations';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Send, Bot, User, Sparkles, Paperclip, Mic } from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm TaxOS, your AI tax consultant. How can I help you today? You can ask me about GST filing, income tax slabs, or business compliance." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    // Simulate AI typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm analyzing your query based on the latest Indian tax regulations. This is a premium AI feature currently in demo mode." }]);
    }, 1500);
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] flex items-center justify-center shadow-[0_0_15px_rgba(201,169,75,0.3)]">
          <Sparkles className="text-black" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">AI Tax Assistant</h1>
          <p className="text-slate-400 text-sm">Powered by OMM Associates Intelligence</p>
        </div>
      </div>

      <GlassCard className="flex-grow flex flex-col mb-2 overflow-hidden bg-[#111111]/90 p-0 md:p-0 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#C9A94B]' : 'bg-[#111] border border-[#C9A94B]/30 text-[#C9A94B]'}`}>
                {msg.role === 'user' ? <User size={16} className="text-black" /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#C9A94B] text-black rounded-tr-none font-medium' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {/* Typing Indicator */}
          {messages[messages.length - 1].role === 'user' && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="flex gap-4 max-w-[85%]"
             >
               <div className="w-8 h-8 rounded-full bg-[#111] border border-[#C9A94B]/30 text-[#C9A94B] flex items-center justify-center flex-shrink-0">
                 <Bot size={16} />
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                 <span className="w-2 h-2 bg-[#C9A94B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <span className="w-2 h-2 bg-[#C9A94B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <span className="w-2 h-2 bg-[#C9A94B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-white/10 bg-[#161618] shrink-0">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            {['What are the new GST slabs?', 'How do I claim section 80C?', 'Explain capital gains tax'].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setInput(suggestion)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-[#C9A94B]/30 bg-[#C9A94B]/10 text-[#E8C96B] text-xs font-medium hover:bg-[#C9A94B]/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 bg-[#0a0a0c] border border-white/10 rounded-2xl p-2 focus-within:border-[#C9A94B]/50 transition-colors shadow-inner">
            <button className="p-3 text-slate-400 hover:text-[#C9A94B] transition-colors rounded-xl hover:bg-white/5 shrink-0">
              <Paperclip size={20} />
            </button>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about taxes..."
              className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 resize-none max-h-32 py-3 px-2"
              rows={1}
            />
            <button className="p-3 text-slate-400 hover:text-[#C9A94B] transition-colors rounded-xl hover:bg-white/5 shrink-0">
              <Mic size={20} />
            </button>
            <button 
              onClick={handleSend}
              className="p-3 w-12 h-12 rounded-xl flex items-center justify-center bg-[#C9A94B] text-black hover:bg-[#E8C96B] transition-colors shrink-0"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
