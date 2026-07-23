import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import {
  LayoutGrid, List, Search, Upload, SlidersHorizontal,
  FileText, FileImage, File, Star, MoreVertical, Download,
  Trash2, Eye, Copy, FolderOpen, RefreshCw
} from 'lucide-react';
import DocumentContextMenu from '../../../components/documents/DocumentContextMenu';
import FileViewerModal from '../../../components/documents/FileViewerModal';

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'application/pdf': FileText,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'image/webp': FileImage,
  'default': File
};

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DocumentDashboard() {
  const { selectedCategory } = useOutletContext<{ selectedCategory: string | null }>();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [contextDoc, setContextDoc] = useState<{ doc: any; x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;

      const res = await axios.get('http://localhost:4000/api/v1/documents', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      if (res.data.success) setDocuments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    const token = localStorage.getItem('token');
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderName', 'General');
      formData.append('category', selectedCategory || '');
      // Requires clientId - for now use first client
      // In production, a picker would be shown
      formData.append('clientId', 'default');
      try {
        await axios.post('http://localhost:4000/api/v1/documents/upload', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } catch (e) { /* silently fail for now */ }
    }
    fetchDocuments();
  };

  const handleStar = async (doc: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:4000/api/v1/documents/${doc.id}/star`,
        { isStarred: !doc.isStarred },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDocuments();
    } catch (e) {}
  };

  const handleTrash = async (doc: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/v1/documents/${doc.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDocuments();
      setContextDoc(null);
    } catch (e) {}
  };

  const handleContextMenu = (e: React.MouseEvent, doc: any) => {
    e.preventDefault();
    setContextDoc({ doc, x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="flex flex-col h-full p-8 relative"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag-and-drop overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-4 z-50 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#C9A94B] bg-[#C9A94B]/5 backdrop-blur-sm pointer-events-none"
          >
            <Upload className="w-16 h-16 text-[#C9A94B] mb-4 animate-bounce" />
            <p className="text-2xl font-display font-bold text-[#C9A94B]">Drop Files to Upload</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-1">
            {selectedCategory || 'All Documents'}
          </h1>
          <p className="text-slate-500">{documents.length} items</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A94B] w-56 transition-colors"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-[#C9A94B]/20 text-[#C9A94B]' : 'text-slate-500 hover:text-white')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-[#C9A94B]/20 text-[#C9A94B]' : 'text-slate-500 hover:text-white')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Upload */}
          <input ref={fileInputRef} type="file" multiple hidden onChange={e => uploadFiles(Array.from(e.target.files || []))} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black text-sm font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(201,169,75,0.3)] transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={cn('flex-1', viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-3')}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={cn('animate-pulse bg-white/5 rounded-2xl', viewMode === 'grid' ? 'h-48' : 'h-16')} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 cursor-pointer group transition-colors hover:border-[#C9A94B]/40"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-full bg-[#C9A94B]/10 flex items-center justify-center mb-6 group-hover:bg-[#C9A94B]/20 transition-colors">
            <FolderOpen className="w-10 h-10 text-[#C9A94B]/60 group-hover:text-[#C9A94B]" />
          </div>
          <h3 className="text-xl font-display text-white mb-2">No Documents Yet</h3>
          <p className="text-slate-500 mb-6">Drag and drop files here, or click to browse</p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black font-semibold rounded-xl text-sm">
            Upload First Document
          </button>
        </div>
      )}

      {/* Grid View */}
      {!loading && documents.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 flex-1 content-start">
          {documents.map((doc, i) => {
            const IconComp = FILE_ICONS[doc.fileType] || FILE_ICONS.default;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onContextMenu={(e) => handleContextMenu(e, doc)}
                onClick={() => setSelectedDoc(doc)}
                className="group relative bg-[#111111] border border-white/[0.08] rounded-2xl p-5 cursor-pointer hover:border-[#C9A94B]/30 hover:shadow-[0_4px_20px_rgba(201,169,75,0.1)] transition-all duration-300 flex flex-col gap-4"
              >
                {/* File Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#C9A94B]/10 flex items-center justify-center group-hover:bg-[#C9A94B]/20 transition-colors">
                  <IconComp className="w-6 h-6 text-[#C9A94B]" />
                </div>

                {/* Star + Menu */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStar(doc); }}
                    className={cn('p-1.5 rounded-lg hover:bg-white/10 transition-colors', doc.isStarred ? 'text-[#C9A94B]' : 'text-slate-500')}
                  >
                    <Star className="w-3.5 h-3.5" fill={doc.isStarred ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, doc); }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm leading-tight truncate mb-1">{doc.fileName}</p>
                  <p className="text-xs text-slate-500 truncate">{doc.client?.name || 'General'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-600">{formatBytes(doc.sizeBytes)}</span>
                    {doc.category && (
                      <span className="text-xs px-2 py-0.5 bg-[#C9A94B]/10 text-[#C9A94B] rounded-md border border-[#C9A94B]/20">
                        {doc.category}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && documents.length > 0 && viewMode === 'list' && (
        <div className="flex flex-col gap-2 flex-1">
          {/* List Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
            <span>Name</span>
            <span>Category</span>
            <span>Size</span>
            <span>Modified</span>
            <span />
          </div>
          {documents.map((doc, i) => {
            const IconComp = FILE_ICONS[doc.fileType] || FILE_ICONS.default;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onContextMenu={(e) => handleContextMenu(e, doc)}
                onClick={() => setSelectedDoc(doc)}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 items-center px-4 py-3 rounded-xl bg-[#111111] border border-white/[0.06] cursor-pointer hover:border-[#C9A94B]/20 hover:bg-[#1a1a1a] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#C9A94B]/10 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4 text-[#C9A94B]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{doc.fileName}</p>
                    <p className="text-xs text-slate-600 truncate">{doc.client?.name}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{doc.category || '—'}</span>
                <span className="text-xs text-slate-400">{formatBytes(doc.sizeBytes)}</span>
                <span className="text-xs text-slate-400">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStar(doc); }}
                    className={cn('p-1.5 rounded-lg hover:bg-white/10', doc.isStarred ? 'text-[#C9A94B]' : 'text-slate-500')}
                  >
                    <Star className="w-3.5 h-3.5" fill={doc.isStarred ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, doc); }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* File Viewer Modal */}
      {selectedDoc && (
        <FileViewerModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      {/* Context Menu */}
      {contextDoc && (
        <DocumentContextMenu
          doc={contextDoc.doc}
          x={contextDoc.x}
          y={contextDoc.y}
          onClose={() => setContextDoc(null)}
          onStar={() => handleStar(contextDoc.doc)}
          onTrash={() => handleTrash(contextDoc.doc)}
          onPreview={() => { setSelectedDoc(contextDoc.doc); setContextDoc(null); }}
        />
      )}
    </div>
  );
}
