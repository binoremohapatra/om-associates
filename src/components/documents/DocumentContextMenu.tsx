import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, Star, Download, Copy, FolderInput, Trash2 } from 'lucide-react';

interface DocumentContextMenuProps {
  doc: any;
  x: number;
  y: number;
  onClose: () => void;
  onStar: () => void;
  onTrash: () => void;
  onPreview: () => void;
}

export default function DocumentContextMenu({
  doc, x, y, onClose, onStar, onTrash, onPreview
}: DocumentContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position so it doesn't go off-screen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const MenuItem = ({
    icon: Icon, label, onClick, danger = false
  }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; danger?: boolean }) => {
    const cls = danger
      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
      : 'text-slate-300 hover:bg-white/10 hover:text-white';
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors text-left ${cls}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12 }}
      style={{ position: 'fixed', top: adjustedY, left: adjustedX, zIndex: 1000 }}
      className="w-52 bg-[#1A1A1D] border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl"
    >
      {/* File name header */}
      <div className="px-3 py-2 border-b border-white/5 mb-1">
        <p className="text-xs text-slate-400 font-medium truncate">{doc.fileName}</p>
      </div>

      <MenuItem icon={Eye} label="Preview" onClick={() => { onPreview(); }} />
      <MenuItem
        icon={Star}
        label={doc.isStarred ? 'Remove from Starred' : 'Add to Starred'}
        onClick={() => { onStar(); onClose(); }}
      />
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noreferrer"
        download
        className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
      </a>
      <MenuItem icon={Copy} label="Duplicate" onClick={onClose} />
      <MenuItem icon={FolderInput} label="Move to Folder" onClick={onClose} />

      <div className="my-1 border-t border-white/5" />

      <MenuItem icon={Trash2} label="Move to Trash" onClick={() => { onTrash(); }} danger />
    </motion.div>
  );
}
