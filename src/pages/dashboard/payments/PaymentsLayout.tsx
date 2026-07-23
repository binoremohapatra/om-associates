import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { CreditCard, FileText, Repeat, Activity, Receipt } from 'lucide-react';

const tabs = [
  { name: 'Overview', path: '/payments', icon: Activity, exact: true },
  { name: 'Invoices', path: '/payments/invoices', icon: FileText, exact: false },
];

export default function PaymentsLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col shrink-0 min-h-0 w-full bg-[#09090b] p-4 sm:p-8">
      {/* Module Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20">
            <CreditCard className="w-6 h-6 text-[#C9A94B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-white mb-1">Billing & Payments</h1>
            <p className="text-slate-500 text-sm sm:text-base">Manage invoices and view pending dues.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-px shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors rounded-t-xl flex items-center gap-2",
                isActive ? "text-[#C9A94B]" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {isActive && (
                <motion.div
                  layoutId="payment-nav-active"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A94B] to-[#E8C96B]"
                />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
