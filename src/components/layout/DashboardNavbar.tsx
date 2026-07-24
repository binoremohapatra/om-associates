import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, User, LogOut, Settings, ChevronDown } from 'lucide-react';
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
    <header className="border-b border-white/5 bg-[#0D0D0F]/95 backdrop-blur-xl sticky top-0 z-30 px-3 sm:px-6 flex items-center gap-3" style={{ height: 'clamp(56px, 7vw, 80px)' }}>

      {/* Left: Company Logo (Mobile Only) */}
      <Link to="/dashboard" className="flex md:hidden items-center gap-2 shrink-0 group">
        <img
          src="/logo.png"
          alt="Om Associates"
          className="w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(201,169,75,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(201,169,75,0.7)]"
        />
      </Link>

      {/* Divider */}
      <div className="w-px h-7 bg-white/10 shrink-0 md:hidden" />

      {/* Center: Search Bar */}
      <div className="hidden sm:flex flex-1 min-w-0">
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

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-3">

        {/* Help icon — right side */}
        <button className="p-2.5 rounded-xl text-slate-400 hover:text-[#C9A94B] hover:bg-[#C9A94B]/10 transition-all">
          <HelpCircle size={20} />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-7 bg-white/10" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] p-[2px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}`.replace('/api/v1', '') + user.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User size={16} className="text-[#E8C96B]" />
                )}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-white leading-none mb-1">{user?.name || 'User'}</span>
              <span className="text-xs text-slate-400 leading-none">{user?.organization?.name || 'Om Associates'}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full mt-0 sm:mt-2 w-[calc(100vw-32px)] sm:w-56 max-w-[320px] rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden py-2 z-50 origin-top-right"
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

                <div className="h-px bg-white/5 my-2" />

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
