import React, { useState, useEffect } from 'react';
import { Settings, User, Building2, Shield, CreditCard, Bell, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';

const TABS = [
  { id: 'general', label: 'General', icon: User, description: 'Profile and organization details' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Passwords and authentication' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push preferences' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription and payment methods' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setTimeout(() => {
      const activeElement = document.getElementById(`setting-tab-${activeTab}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  }, [activeTab]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-medium text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`setting-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left whitespace-nowrap lg:whitespace-normal",
                      isActive 
                        ? "bg-[#C9A94B]/10 text-[#C9A94B]" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={18} className={isActive ? "text-[#C9A94B]" : "text-slate-500"} />
                    <div>
                      <div className="font-medium text-sm">{tab.label}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'notifications' && <NotificationSettings />}
                {activeTab === 'billing' && <BillingSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Tab Components --

function GeneralSettings() {
  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Personal Information</h3>
          <p className="text-sm text-slate-400 mt-1">Update your personal profile details.</p>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C9A94B] to-[#E8C96B] p-[2px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center">
                <User size={32} className="text-[#E8C96B]" />
              </div>
            </div>
            <div className="text-center sm:text-left mt-2 sm:mt-0">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
                Change Avatar
              </button>
              <p className="text-xs text-slate-500 mt-3">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
              <input type="text" defaultValue="CA Admin" className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
              <input type="email" defaultValue="admin@omassociates.com" disabled className="w-full bg-[#0D0D0F]/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6 py-4 bg-white/[0.02] border-t border-white/10 flex justify-end">
          <button className="px-5 py-2.5 bg-[#C9A94B] hover:bg-[#E8C96B] text-[#0D0D0F] text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
            Save Changes
          </button>
        </div>
      </section>

      {/* Organization Section */}
      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Organization Details</h3>
          <p className="text-sm text-slate-400 mt-1">Manage your firm's details and GSTIN.</p>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Firm Name</label>
              <input type="text" defaultValue="Om Associates" className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">GSTIN</label>
              <input type="text" defaultValue="27AADCD1234E1Z5" className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors uppercase" />
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6 py-4 bg-white/[0.02] border-t border-white/10 flex justify-end">
          <button className="px-5 py-2.5 bg-[#C9A94B] hover:bg-[#E8C96B] text-[#0D0D0F] text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-8">
      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Change Password</h3>
          <p className="text-sm text-slate-400 mt-1">Update your password associated with your account.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
          </div>
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
          </div>
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0D0D0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A94B]/50 transition-colors" />
          </div>
        </div>
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex justify-end">
          <button className="px-5 py-2.5 bg-[#C9A94B] hover:bg-[#E8C96B] text-[#0D0D0F] text-sm font-semibold rounded-xl transition-colors">
            Update Password
          </button>
        </div>
      </section>

      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
          <p className="text-sm text-slate-400 mt-1">Add an extra layer of security to your account.</p>
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <Key size={24} className="text-slate-400" />
            </div>
            <div>
              <p className="text-white font-medium">Authenticator App</p>
              <p className="text-sm text-slate-400">Use an app like Google Authenticator or Authy.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 whitespace-nowrap self-start sm:self-auto">
            Enable 2FA
          </button>
        </div>
      </section>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    tax: true,
    gst: true,
    marketing: false,
  });

  return (
    <div className="space-y-8">
      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Email Notifications</h3>
          <p className="text-sm text-slate-400 mt-1">Choose what we can send to your inbox.</p>
        </div>
        <div className="divide-y divide-white/10">
          {[
            { id: 'tax', title: 'Tax Filing Updates', desc: 'Get notified when your tax filings are processed.', active: prefs.tax },
            { id: 'gst', title: 'GST Due Dates', desc: 'Reminders about upcoming GST filing deadlines.', active: prefs.gst },
            { id: 'marketing', title: 'Marketing Communications', desc: 'News and feature updates from Om Associates.', active: prefs.marketing },
          ].map((item) => (
            <div key={item.id} className="p-6 flex items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-medium mb-1">{item.title}</p>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
              <button 
                onClick={() => setPrefs({...prefs, [item.id]: !item.active})}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative shrink-0", 
                  item.active ? "bg-[#C9A94B]" : "bg-white/10 border border-white/10"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                  item.active ? "left-[22px]" : "left-0.5 bg-slate-400"
                )}></span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-8">
      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Current Plan</h3>
          <p className="text-sm text-slate-400 mt-1">Manage your subscription and billing details.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-xl border border-[#C9A94B]/30 bg-[#C9A94B]/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A94B]/0 via-[#C9A94B]/5 to-[#C9A94B]/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-xl font-semibold text-white">Pro Plan</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#C9A94B] text-[#0D0D0F]">Active</span>
              </div>
              <p className="text-sm text-slate-400">Billed annually. Next billing date is Oct 12, 2026.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-white">₹12,000<span className="text-sm text-slate-400 font-normal">/yr</span></p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button className="text-sm text-slate-400 hover:text-white transition-colors">Cancel Subscription</button>
          <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/10 w-full sm:w-auto">
            Upgrade Plan
          </button>
        </div>
      </section>

      <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Payment Method</h3>
          <p className="text-sm text-slate-400 mt-1">Update your billing information and payment methods.</p>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#0D0D0F]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-white/10 flex items-center justify-center border border-white/5">
                <CreditCard size={18} className="text-slate-300" />
              </div>
              <div>
                <p className="text-white font-medium tracking-wide">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-400">Expires 12/28</p>
              </div>
            </div>
            <button className="text-sm text-[#C9A94B] hover:text-[#E8C96B] font-medium transition-colors px-2 py-1">Edit</button>
          </div>
          <button className="text-sm font-medium text-white border border-dashed border-white/20 rounded-xl p-4 hover:border-[#C9A94B]/50 hover:bg-[#C9A94B]/5 transition-colors flex items-center justify-center gap-2">
            + Add Payment Method
          </button>
        </div>
      </section>
    </div>
  );
}
