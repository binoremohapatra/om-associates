import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import {
  Folder, Star, Clock, Trash2, Upload, 
  FileText, FileImage, FileSpreadsheet, File,
  ChevronRight, LayoutGrid, List, Search, Plus
} from 'lucide-react';

const folders = [
  { name: 'All Documents', path: '/documents', icon: Folder },
  { name: 'Recent', path: '/documents/recent', icon: Clock },
  { name: 'Starred', path: '/documents/starred', icon: Star },
  { name: 'Trash', path: '/documents/trash', icon: Trash2 },
];

const categories = ['GST', 'Income Tax', 'Legal', 'Invoices', 'Agreements', 'Certificates'];

export default function DocumentVaultLayout() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[#0D0D0F] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-display font-bold text-white mb-1">Document Vault</h2>
          <p className="text-xs text-slate-500">Secure & Organised</p>
        </div>

        {/* Upload Button */}
        <div className="p-4">
          <NavLink
            to="/documents/upload"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(201,169,75,0.3)] transition-all text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {folders.map(item => {
            const isActive = item.path === '/documents'
              ? location.pathname === '/documents'
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#C9A94B]/15 text-[#C9A94B]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}

          {/* Folders Section */}
          <div className="mt-6 mb-3 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 uppercase tracking-widest">Categories</span>
              <button className="text-slate-500 hover:text-[#C9A94B] transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl mb-1 text-sm w-full text-left transition-colors',
                selectedCategory === cat
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              )}
            >
              <div className="w-2 h-2 rounded-full bg-[#C9A94B]/60" />
              {cat}
            </button>
          ))}
        </nav>

        {/* Storage Usage */}
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-slate-500 mb-2">Storage</p>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full w-1/5 bg-gradient-to-r from-[#C9A94B] to-[#E8C96B] rounded-full" />
          </div>
          <p className="text-xs text-slate-400">2.1 GB <span className="text-slate-600">of 10 GB used</span></p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#09090b]">
        <Outlet context={{ selectedCategory }} />
      </main>
    </div>
  );
}
