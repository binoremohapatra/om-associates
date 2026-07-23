import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Trash2, RefreshCw, FileText, File, FileImage, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'application/pdf': FileText,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'default': File
};

function formatBytes(b: number) {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${s[i]}`;
}

export default function TrashPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    const res = await api.get('/documents?trash=true');
    if (res.data.success) setDocs(res.data.data);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleRestore = async (id: string) => {
    await api.patch(`/documents/${id}/restore`, {});
    fetchDocs();
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-1 flex items-center gap-3">
            <Trash2 className="w-7 h-7 text-red-400" />
            Trash
          </h1>
          <p className="text-slate-500">{docs.length} deleted items · Files are permanently deleted after 30 days</p>
        </div>
        {docs.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-red-400">Auto-delete in 30 days</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <Trash2 className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium text-slate-400 mb-2">Trash is Empty</p>
          <p className="text-sm">Documents you delete will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc, i) => {
            const Icon = FILE_ICONS[doc.fileType] || FILE_ICONS.default;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#111111] border border-white/[0.06] group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">
                    Deleted: {doc.deletedAt ? new Date(doc.deletedAt).toLocaleDateString() : 'Unknown'} · {formatBytes(doc.sizeBytes)}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(doc.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#C9A94B] bg-[#C9A94B]/10 border border-[#C9A94B]/20 hover:bg-[#C9A94B]/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
