import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react';
import { AI_SUGGESTED_QUESTIONS } from '../../lib/data';
import { staggerContainer, fadeInUp } from '../../lib/animations';
import type { ChatMessage } from '../../types';

const AI_RESPONSES: Record<string, string> = {
  default: "Great question! Based on your business profile and current FY 2025-26 tax laws, I'll analyze this for you. Please note that tax positions can vary based on your specific financial situation — I recommend confirming with a CA for complex matters.",
  liability: "Your estimated tax liability for FY 2025-26 is ₹12,40,000 (after standard deduction). Under the New Regime, your effective rate is 22.4%. Switching to Old Regime with your 80C (₹1.5L) and 80D (₹50K) deductions could save you approximately ₹87,500.",
  deductions: "Maximize your deductions with this strategy: 1️⃣ Max out 80C with ELSS + PPF (₹1.5L), 2️⃣ Claim 80D for family health insurance (₹75K for parents 60+), 3️⃣ Add NPS via 80CCD(1B) for extra ₹50K, 4️⃣ Claim HRA if paying rent. Total potential savings: ₹3.5L in deductions = ₹72,500 tax saving.",
  composition: "The GST Composition Scheme is ideal if your aggregate turnover is under ₹1.5 Crore (₹75L for special category states). You pay a flat rate: 1% for traders, 2% for manufacturers, 5% for restaurants. Key benefit: simpler compliance — just one quarterly return (CMP-08) instead of monthly GSTR-1 and GSTR-3B. You cannot claim ITC in this scheme.",
  itc: "Yes! You can claim ITC on purchases made before GST registration, but with conditions: 1) For goods: ITC available on inputs held in stock on registration date, 2) For capital goods: ITC on invoices issued within 1 year before registration, 3) File FORM GST REG-07 within 30 days of obtaining registration to avail this ITC.",
};

function getResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('liability') || q.includes('tax') && q.includes('estimate')) return AI_RESPONSES.liability;
  if (q.includes('deduct') || q.includes('80c') || q.includes('80d')) return AI_RESPONSES.deductions;
  if (q.includes('composition') || q.includes('scheme')) return AI_RESPONSES.composition;
  if (q.includes('itc') || q.includes('before gst')) return AI_RESPONSES.itc;
  return AI_RESPONSES.default;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-sky-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export default function AIAssistantSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hello! I'm TaxOS AI, your intelligent tax advisor. I can help you with GST queries, income tax planning, deduction strategies, and compliance questions. What would you like to know today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const response = getResponse(text);
    setIsTyping(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section id="ai-assistant" ref={ref} className="section" style={{ background: `#141418` }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-gold mb-4">
            <Sparkles size={12} />
            AI-Powered
          </span>
          <h2 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: `#F5F5F7` }}>
            Your Personal{' '}
            <span className="gradient-text">Tax Advisor</span>
          </h2>
          <p className=" text-lg max-w-2xl mx-auto">
            Ask any tax question in plain English. Powered by real Indian tax law knowledge — Income Tax Act, GST Act, and CBIC circulars.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat window */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 card flex flex-col"
            style={{ height: 520 }}
          >
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-navy-900 dark:text-white">TaxOS AI</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-400">Online · Responds instantly</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-sky-400 to-violet-500'
                        : 'bg-slate-200 dark:bg-navy-600'
                    }`}>
                      {msg.role === 'assistant'
                        ? <Bot size={14} className="text-white" />
                        : <User size={14} className="text-slate-600 dark:text-slate-300" />
                      }
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-slate-100 dark:bg-navy-900/80 text-navy-900 dark:text-slate-100 rounded-tl-sm'
                        : 'bg-sky-500 text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-slate-100 dark:bg-navy-900/80 rounded-2xl rounded-tl-sm">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 dark:border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about GST, income tax, deductions..."
                  className="input-field flex-1 text-sm"
                  disabled={isTyping}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <Send size={16} />
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Suggested questions */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="flex flex-col gap-3"
          >
            <div className="text-sm font-semibold  px-1">Suggested Questions</div>
            {AI_SUGGESTED_QUESTIONS.map((q, i) => (
              <motion.button
                key={i}
                variants={fadeInUp}
                onClick={() => sendMessage(q)}
                disabled={isTyping}
                className="card p-4 text-left text-sm text-navy-900 dark:text-slate-200 hover:border-sky-400/50 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all duration-200 group"
              >
                <span className=" font-bold mr-1.5">→</span>
                {q}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

