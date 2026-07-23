import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calculator, FileText, Landmark, 
  Briefcase, Scale, Globe, Folder, Bot, Newspaper, 
  MessageSquare, Calendar, CreditCard, BarChart2, Settings,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const sidebarLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tax Calculator', path: '/tax-calculator', icon: Calculator },
  { name: 'GST', path: '/gst', icon: Landmark },
  { name: 'Income Tax', path: '/income-tax', icon: Briefcase },
  { name: 'Legal Services', path: '/legal', icon: Scale },
  { name: 'Import Export', path: '/import-export', icon: Globe },
  { name: 'News', path: '/news', icon: Newspaper },
  { name: 'Queries', path: '/queries', icon: MessageSquare },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="hidden md:flex flex-col border-r border-white/5 bg-[#0D0D0F]/95 backdrop-blur-xl z-40 h-screen sticky top-0 left-0 shrink-0"
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-3 py-6 relative z-10 group">
            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Om Associates"
                className="h-10 w-auto filter drop-shadow-[0_0_12px_rgba(201,169,75,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(201,169,75,0.6)]"
              />
            </div>
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("p-2 rounded-xl text-slate-400 hover:text-[#C9A94B] hover:bg-[#C9A94B]/10 transition-colors", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <nav className="flex flex-col gap-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => cn(
                "flex items-center rounded-xl transition-all duration-300 group relative",
                isCollapsed ? "w-11 h-11 justify-center p-0 mx-auto" : "gap-4 px-4 py-3 w-full justify-start",
                isActive 
                  ? "bg-[#C9A94B]/10 text-[#C9A94B] shadow-[inset_0_0_0_1px_rgba(201,169,75,0.2)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>

                  <link.icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-[#C9A94B]" : "group-hover:text-[#E8C96B]")} />
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap">{link.name}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
}
