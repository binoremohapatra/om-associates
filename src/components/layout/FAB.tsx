import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calculator, FileText, HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

const QUICK_ACTIONS = [
  { icon: Calculator, label: 'Tax Calculator', href: '#gst-calculator' },
  { icon: FileText, label: 'File GST Return', href: '#features' },
  { icon: HelpCircle, label: 'Ask AI', href: '#ai-assistant' },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = (label: string, href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    toast({ type: 'info', title: `Navigating to ${label}`, duration: 2000 });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <>
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.8 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleAction(action.label, action.href)}
                className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full shadow-xl transition-all duration-200 group border"
                style={{
                  background: 'rgba(20,20,24,0.85)',
                  borderColor: 'rgba(201,169,75,0.15)',
                  backdropFilter: 'blur(16px)',
                  color: '#F5F5F7'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,75,0.4)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(201,169,75,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,75,0.15)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C9A94B, #E8C96B)' }}
                >
                  <action.icon size={14} style={{ color: '#0D0D0F' }} />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="w-13 h-13 rounded-full flex items-center justify-center border-none cursor-pointer"
        style={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, #C9A94B 0%, #E8C96B 50%, #C9A94B 100%)',
          backgroundSize: '200% auto',
          color: '#0D0D0F',
          boxShadow: '0 8px 32px rgba(201,169,75,0.35)'
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.backgroundPosition = 'right center';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(201,169,75,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.backgroundPosition = 'left center';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(201,169,75,0.35)';
        }}
        aria-label="Quick actions"
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? <X size={22} /> : <Plus size={22} />}
        </motion.div>
      </motion.button>
    </div>
  );
}
