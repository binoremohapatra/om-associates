import React, { useState } from 'react';
import { Search, MessageSquare, HelpCircle, User, LogOut, FileText, CreditCard, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GooeyInput } from '../ui/GooeyInput';

export default function DashboardNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    setProfileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-20 border-b border-white/5 bg-[#0D0D0F]/95 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="flex items-center">
          <GooeyInput
            placeholder="Search documents, services, GST filings..."
            expandedWidth={350}
            classNames={{
              root: "justify-start",
              trigger: "bg-white/5 border-none ring-1 ring-white/10 text-white hover:bg-white/10 focus-visible:ring-[#C9A94B]/50 shadow-none",
              input: "text-white placeholder:text-slate-500 dark:placeholder:text-slate-500",
              bubbleSurface: "bg-white/10 ring-1 ring-white/10 text-[#C9A94B] shadow-none"
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2.5 rounded-xl text-slate-400 hover:text-[#C9A94B] hover:bg-[#C9A94B]/10 transition-all">
          <HelpCircle size={20} />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center">
                <User size={18} className="text-[#E8C96B]" />
              </div>
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-white leading-none mb-1">{user?.name || 'User'}</span>
              <span className="text-xs text-slate-400 leading-none">{user?.organization?.name || 'Om Associates'}</span>
            </div>
            <ChevronDown size={16} className="text-slate-400 ml-1" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || 'user@company.com'}</p>
                </div>
                
                <button onClick={() => handleNavigation('/profile')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => handleNavigation('/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                  <Settings size={16} /> Settings
                </button>
                
                <div className="h-px bg-white/5 my-2"></div>
                
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
