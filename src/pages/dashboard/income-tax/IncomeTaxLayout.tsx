import React, { useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Briefcase, Activity, FileText, Landmark, Calculator } from 'lucide-react';

const tabs = [
  { name: 'Overview', path: '/income-tax', icon: Activity, exact: true },
  { name: 'Tax Filings', path: '/income-tax/filings', icon: FileText, exact: false },
  { name: 'Deductions (80C)', path: '/income-tax/deductions', icon: Landmark, exact: false },
  { name: 'Tax Calculator', path: '/income-tax/calculator', icon: Calculator, exact: false },
];

export default function IncomeTaxLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col shrink-0 min-h-0 w-full bg-[#09090b] p-4 md:p-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20 shrink-0">
            <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-[#C9A94B]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white mb-0.5 md:mb-1">Income Tax</h1>
            <p className="text-xs md:text-sm text-slate-500">Manage ITR filings, advance tax, and deductions.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-4 md:mb-8 border-b border-white/5 pb-px shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);

          return <IncomeTaxNavItem key={tab.path} tab={tab} isActive={isActive} />;
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function IncomeTaxNavItem({ tab, isActive }: { tab: any, isActive: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      const timeout = setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  return (
    <NavLink
      ref={ref}
      to={tab.path}
      className={cn(
        "relative px-4 py-2 md:py-3 text-sm font-medium transition-colors rounded-t-xl flex items-center gap-2 whitespace-nowrap shrink-0",
        isActive ? "text-[#C9A94B]" : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <tab.icon className="w-4 h-4" />
      {tab.name}
      {isActive && (
        <motion.div
          layoutId="incometax-nav-active"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A94B] to-[#E8C96B]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </NavLink>
  );
}
