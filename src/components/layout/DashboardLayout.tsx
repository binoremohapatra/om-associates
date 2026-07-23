import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import { FloatingDock } from '../ui/floating-dock';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Landmark, Briefcase, Settings, Scale, MessageCircle, Newspaper
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-full h-full" /> },
  { title: 'GST', path: '/gst', icon: <Landmark className="w-full h-full" /> },
  { title: 'Income Tax', path: '/income-tax', icon: <Briefcase className="w-full h-full" /> },
  { title: 'Legal', path: '/legal', icon: <Scale className="w-full h-full" /> },
  { title: 'News', path: '/news', icon: <Newspaper className="w-full h-full" /> },
  { title: 'Chat Support', path: '/queries', icon: <MessageCircle className="w-full h-full" /> },
  { title: 'Settings', path: '/settings', icon: <Settings className="w-full h-full" /> },
];

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0 w-full">
        <DashboardNavbar />
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar relative pb-32" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' }}>
          <Outlet />
        </main>
      </div>
      
      {/* Universal Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-[100] md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto">
        <FloatingDock 
          items={navItems.map(i => ({ title: i.title, href: i.path, icon: i.icon }))}
        />
      </div>
    </div>
  );
}
