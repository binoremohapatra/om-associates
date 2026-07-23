import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs } from '../ui/tabs';

export default function TopNavbar() {
  const tabs = [
    { title: 'Dashboard', value: 'dashboard', path: '/dashboard' },
    { title: 'Tax Calculator', value: 'tax-calculator', path: '/tax-calculator' },
    { title: 'GST', value: 'gst', path: '/gst' },
    { title: 'Income Tax', value: 'income-tax', path: '/income-tax' },
    { title: 'Legal', value: 'legal', path: '/legal' },
    { title: 'Import Export', value: 'import-export', path: '/import-export' },
    { title: 'News', value: 'news', path: '/news' },
    { title: 'Queries', value: 'queries', path: '/queries' },
    { title: 'Appointments', value: 'appointments', path: '/appointments' },

    { title: 'Reports', value: 'reports', path: '/reports' },
    { title: 'Settings', value: 'settings', path: '/settings' },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0D0D0F]/95 backdrop-blur-xl border-b border-white/5">
      <div className="flex flex-col md:flex-row items-center gap-4 px-6 py-4">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/logo.png"
            alt="Om Associates"
            className="h-10 w-auto filter drop-shadow-[0_0_12px_rgba(201,169,75,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(201,169,75,0.6)]"
          />
        </Link>
        
        {/* Animated Tabs */}
        <div className="flex-1 w-full overflow-hidden">
          <Tabs tabs={tabs} containerClassName="gap-2" />
        </div>
      </div>
    </div>
  );
}
