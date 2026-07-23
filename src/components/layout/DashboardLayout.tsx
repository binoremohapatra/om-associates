import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import FloatingChat from './FloatingChat';
import { FloatingDock } from '../ui/floating-dock';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Landmark, Briefcase, Bot, Settings, FileText, Scale
} from 'lucide-react';

const mobileNavItems = [
  { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-full h-full" /> },
  { title: 'GST', path: '/gst', icon: <Landmark className="w-full h-full" /> },
  { title: 'Income Tax', path: '/income-tax', icon: <Briefcase className="w-full h-full" /> },
  { title: 'Legal', path: '/legal', icon: <Scale className="w-full h-full" /> },
  { title: 'Settings', path: '/settings', icon: <Settings className="w-full h-full" /> },
];

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <DashboardNavbar />
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar relative pb-24 md:pb-0" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
          <Outlet />
        </main>
      </div>
      <FloatingChat />
      
      {/* Mobile Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden flex items-center justify-center">
        <FloatingDock 
          items={mobileNavItems.map(i => ({ title: i.title, href: i.path, icon: i.icon }))}
        />
      </div>
    </div>
  );
}
