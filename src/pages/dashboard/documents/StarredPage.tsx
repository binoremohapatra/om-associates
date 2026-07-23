import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, FileText, FileImage, File } from 'lucide-react';

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

export default function StarredPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/v1/documents?starred=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDocs(res.data.data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-medium text-white mb-1 flex items-center gap-3">
          <Star className="w-7 h-7 text-[#C9A94B]" fill="currentColor" />
          Starred Documents
        </h1>
        <p className="text-slate-500">{docs.length} starred items</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <Star className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium text-slate-400 mb-2">No Starred Documents</p>
          <p className="text-sm">Star important documents to find them quickly here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {docs.map((doc, i) => {
            const Icon = FILE_ICONS[doc.fileType] || FILE_ICONS.default;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#111111] border border-[#C9A94B]/20 rounded-2xl p-5 cursor-pointer hover:shadow-[0_4px_20px_rgba(201,169,75,0.1)] transition-all flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C9A94B]/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#C9A94B]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm truncate mb-1">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">{formatBytes(doc.sizeBytes)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
