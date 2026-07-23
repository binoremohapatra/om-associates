import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText, FileImage, File } from 'lucide-react';

interface FileViewerModalProps {
  doc: any;
  onClose: () => void;
}

export default function FileViewerModal({ doc, onClose }: FileViewerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isImage = doc.fileType?.startsWith('image/');
  const isPdf = doc.fileType === 'application/pdf';

  // Close on outside click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A94B]/10 flex items-center justify-center">
                {isImage ? <FileImage className="w-5 h-5 text-[#C9A94B]" /> :
                  isPdf ? <FileText className="w-5 h-5 text-[#C9A94B]" /> :
                  <File className="w-5 h-5 text-[#C9A94B]" />}
              </div>
              <div>
                <h3 className="text-white font-medium text-sm leading-tight">{doc.fileName}</h3>
                <p className="text-xs text-slate-500">{doc.client?.name || 'General'} · {doc.category || 'No Category'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewer */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-[#0D0D0F] p-6">
            {isImage && (
              <img
                src={doc.fileUrl}
                alt={doc.fileName}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            )}
            {isPdf && (
              <iframe
                src={doc.fileUrl}
                title={doc.fileName}
                className="w-full h-full rounded-xl border border-white/10"
                style={{ minHeight: '500px' }}
              />
            )}
            {!isImage && !isPdf && (
              <div className="flex flex-col items-center justify-center text-slate-500 py-20">
                <File className="w-16 h-16 mb-4 text-slate-600" />
                <p className="text-lg font-medium text-slate-400 mb-2">Preview Not Available</p>
                <p className="text-sm mb-6">This file type cannot be previewed in the browser.</p>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#E8C96B] to-[#C9A94B] text-black font-semibold rounded-xl text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open File
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center gap-6 text-xs text-slate-500">
            <span>Uploaded: {new Date(doc.createdAt).toLocaleString()}</span>
            <span>Modified: {new Date(doc.updatedAt).toLocaleString()}</span>
            {doc.aiSummary && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[#C9A94B]">✦ AI Summary:</span>
                <span className="text-slate-400 truncate max-w-xs">{doc.aiSummary}</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
