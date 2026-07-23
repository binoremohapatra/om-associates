import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer } from '../../lib/animations';
import LuxuryBackground from '../../components/ui/LuxuryBackground';
import { BentoCard } from '../../components/ui/BentoCard';
import { User, Building, Shield, Bell, Key, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'business', label: 'Business Profile', icon: <Building size={18} /> },
    { id: 'billing', label: 'Billing & Plans', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <LuxuryBackground className="w-full h-full" />
      </div>
      
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account, business profile, and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#C9A94B]/10 text-[#C9A94B] border border-[#C9A94B]/30 font-medium'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <motion.div 
            className="flex-1"
            variants={staggerContainer}
            key={activeTab} // Forces re-animation on tab change
            initial="hidden"
            animate="visible"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <BentoCard size="md" title="Personal Information" description="Update your personal details here.">
                  <form className="space-y-4 mt-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">First Name</label>
                        <input type="text" defaultValue="John" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Last Name</label>
                        <input type="text" defaultValue="Doe" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Email Address</label>
                      <input type="email" defaultValue="john@techsolutions.com" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button className="px-6 py-2 bg-[#C9A94B] hover:bg-[#E8C96B] text-black font-semibold rounded-xl transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </BentoCard>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-6">
                <BentoCard size="md" title="Business Profile" description="Your company details for filings and invoices.">
                  <form className="space-y-4 mt-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Company Name</label>
                      <input type="text" defaultValue="Tech Solutions Inc." className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">GSTIN</label>
                        <input type="text" defaultValue="27AADCT4262E1Z2" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">PAN Number</label>
                        <input type="text" defaultValue="AADCT4262E" className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button className="px-6 py-2 bg-[#C9A94B] hover:bg-[#E8C96B] text-black font-semibold rounded-xl transition-colors">
                        Update Business
                      </button>
                    </div>
                  </form>
                </BentoCard>
              </div>
            )}

            {activeTab !== 'profile' && activeTab !== 'business' && (
              <BentoCard size="sm" title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`} description="This section is currently being integrated with the new backend.">
                <div className="flex flex-col items-center justify-center py-12">
                   <div className="w-16 h-16 rounded-full bg-[#C9A94B]/10 flex items-center justify-center mb-4">
                     <Key className="text-[#C9A94B]" size={24} />
                   </div>
                   <p className="text-slate-400 text-center">Module is active but awaiting backend schema validation.</p>
                </div>
              </BentoCard>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
