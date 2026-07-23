import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Newspaper, Clock, ArrowUpRight, RefreshCw, AlertCircle, ExternalLink,
  Search, Bookmark, BookmarkCheck, Share2, FileText, Grid, List, Timeline,
  Filter, ChevronDown, TrendingUp, BarChart2, Zap, Bell
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE = 'http://localhost:4000/api/v1';

interface Department {
  name: string;
  shortName: string;
  logoColor: string;
  website?: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  category: string;
  notificationNo?: string;
  officialUrl: string;
  pdfUrl?: string;
  sourceWebsite: string;
  tags: string[];
  priority: string;
  publishedAt: string;
  readTimeMinutes: number;
  department: Department;
}

interface Stats {
  totalCount: number;
  deptStats: Array<{ slug: string; name: string; shortName: string; logoColor: string; count: number }>;
  lastSync?: string;
  recentCount: number;
}

const DEPT_FILTERS = [
  { slug: 'all', label: 'All Sources', icon: '🏛️' },
  { slug: 'gst-council', label: 'GST Council', icon: '📋' },
  { slug: 'cbic', label: 'CBIC', icon: '💼' },
  { slug: 'income-tax', label: 'Income Tax', icon: '💰' },
  { slug: 'dgft', label: 'DGFT', icon: '🌐' },
  { slug: 'mca', label: 'MCA', icon: '🏢' },
];

const CATEGORY_FILTERS = ['All', 'Notification', 'Circular', 'Press Release', 'Trade Notice', 'Public Notice', 'Rate'];

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
  NORMAL: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  LOW: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const DEPT_ICONS: Record<string, string> = {
  'gst-council': '📋', cbic: '💼', 'income-tax': '💰', dgft: '🌐', mca: '🏢',
};

type ViewMode = 'grid' | 'list' | 'timeline';

function DeptBadge({ dept, color }: { dept: Department; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
      {dept.shortName}
    </span>
  );
}

function NewsCard({ item, view, bookmarked, onBookmark, token }:
  { item: NewsItem; view: ViewMode; bookmarked: boolean; onBookmark: (id: string, bm: boolean) => void; token?: string }) {
  const [bm, setBm] = useState(bookmarked);
  const color = item.department?.logoColor || '#C9A94B';

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      if (bm) {
        await fetch(`${API_BASE}/news/bookmark/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      } else {
        await fetch(`${API_BASE}/news/bookmark`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ newsId: item.id }) });
      }
      setBm(!bm);
      onBookmark(item.id, !bm);
    } catch {}
  };

  const share = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: item.title, url: item.officialUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(item.officialUrl).catch(() => {});
    }
  };

  if (view === 'list') {
    return (
      <div className="group flex items-center gap-4 p-4 rounded-2xl bg-[#111111]/80 border border-white/[0.07] hover:border-[#C9A94B]/30 hover:bg-[#111111] transition-all duration-200 cursor-pointer"
        onClick={() => window.open(item.officialUrl, '_blank')}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}>
          {DEPT_ICONS[item.category?.toLowerCase()] || '📄'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge dept={item.department} color={color} />
            <span className="text-[10px] text-slate-600">{item.category}</span>
            {item.notificationNo && <span className="text-[10px] text-slate-600 font-mono">{item.notificationNo}</span>}
          </div>
          <h3 className="text-sm font-medium text-slate-200 group-hover:text-[#C9A94B] transition-colors truncate">{item.title}</h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-600 hidden md:block">{format(new Date(item.publishedAt), 'dd MMM yyyy')}</span>
          {item.pdfUrl && <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-red-400 hover:text-red-300 text-xs font-medium">PDF</a>}
          <button onClick={toggleBookmark} className="text-slate-500 hover:text-[#C9A94B] transition-colors">
            {bm ? <BookmarkCheck className="w-4 h-4 text-[#C9A94B]" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'timeline') {
    return (
      <div className="relative pl-8 pb-6">
        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-[#C9A94B]/60 bg-[#0D0D0F]" style={{ boxShadow: `0 0 8px ${color}60` }} />
        <div className="absolute left-1.5 top-4 bottom-0 w-px bg-white/5" />
        <div className="group p-4 rounded-2xl bg-[#111111]/80 border border-white/[0.07] hover:border-[#C9A94B]/25 transition-all cursor-pointer"
          onClick={() => window.open(item.officialUrl, '_blank')}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DeptBadge dept={item.department} color={color} />
              <span className="text-[10px] text-slate-600">{item.category}</span>
            </div>
            <time className="text-[10px] text-slate-600">{format(new Date(item.publishedAt), 'dd MMM yyyy')}</time>
          </div>
          <h3 className="text-sm font-medium text-slate-200 group-hover:text-[#C9A94B] transition-colors line-clamp-2">{item.title}</h3>
          {item.notificationNo && <p className="text-[10px] text-slate-600 mt-1 font-mono">{item.notificationNo}</p>}
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group cursor-pointer rounded-[20px] bg-[#111111]/80 border border-white/[0.07] p-5 hover:border-[#C9A94B]/30 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(201,169,75,0.12)] transition-all duration-300 flex flex-col"
      onClick={() => window.open(item.officialUrl, '_blank')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}>
            {DEPT_ICONS[item.category?.toLowerCase()] || '📄'}
          </div>
          <div>
            <DeptBadge dept={item.department} color={color} />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {item.priority === 'HIGH' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25">HOT</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-white mb-2 group-hover:text-[#C9A94B] transition-colors line-clamp-3 leading-snug flex-1">
        {item.title}
      </h3>

      {item.notificationNo && (
        <p className="text-[10px] text-slate-600 font-mono mb-2 truncate">{item.notificationNo}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 border border-white/[0.06]">{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
        </div>
        <div className="flex items-center gap-2">
          {item.pdfUrl && (
            <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="text-[9px] font-bold text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 transition-colors">
              PDF
            </a>
          )}
          <button onClick={toggleBookmark} className="text-slate-600 hover:text-[#C9A94B] transition-colors">
            {bm ? <BookmarkCheck className="w-3.5 h-3.5 text-[#C9A94B]" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
          <button onClick={share} className="text-slate-600 hover:text-slate-300 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C9A94B] transition-colors">
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { token } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const searchTimeout = useRef<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch(`${API_BASE}/news/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        if (data.data.lastSync) setLastSync(data.data.lastSync);
      }
    } catch {} finally { setStatsLoading(false); }
  }, []);

  const fetchNews = useCallback(async (params: {
    dept?: string; category?: string; search?: string; page?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams();
      if (params.dept && params.dept !== 'all') qp.set('department', params.dept);
      if (params.category && params.category !== 'All') qp.set('category', params.category);
      if (params.search) qp.set('search', params.search);
      qp.set('page', String(params.page || 1));
      qp.set('limit', '24');

      const endpoint = params.search ? `${API_BASE}/news/search?q=${encodeURIComponent(params.search)}&${qp}` : `${API_BASE}/news?${qp}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setNews(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      } else {
        setError('Failed to load government updates.');
      }
    } catch (err: any) {
      setError('Unable to connect to server. Please ensure the backend is running.');
    } finally { setLoading(false); }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/news/bookmarks/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBookmarkedIds(new Set(data.data.map((b: any) => b.newsId)));
    } catch {}
  }, [token]);

  useEffect(() => { fetchStats(); fetchBookmarks(); }, [fetchStats, fetchBookmarks]);

  useEffect(() => {
    fetchNews({ dept: deptFilter, category: categoryFilter, search, page });
  }, [deptFilter, categoryFilter, page, fetchNews]);

  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById(`dept-filter-${deptFilter}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  }, [deptFilter]);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchNews({ dept: deptFilter, category: categoryFilter, search: val, page: 1 });
    }, 500);
  };

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      await fetch(`${API_BASE}/news/sync`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setTimeout(() => { fetchNews({ dept: deptFilter, category: categoryFilter, search, page }); fetchStats(); setSyncing(false); }, 3000);
    } catch { setSyncing(false); }
  };

  const handleBookmarkToggle = (id: string, bm: boolean) => {
    setBookmarkedIds(prev => { const s = new Set(prev); bm ? s.add(id) : s.delete(id); return s; });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0D0D0F] via-[#111119] to-[#0D0D0F] border-b border-white/[0.05] px-4 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A94B]/3 via-transparent to-blue-500/3 pointer-events-none" />
        <div className="relative max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-4 w-full">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#C9A94B]/10 flex items-center justify-center border border-[#C9A94B]/20 shrink-0">
                <Newspaper className="w-5 h-5 md:w-6 md:h-6 text-[#C9A94B]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Government Updates</h1>
                <p className="text-slate-500 text-[10px] md:text-sm mt-0.5">Live feed from GST Council · CBIC · Income Tax · DGFT · MCA</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 md:gap-3 w-full sm:w-auto">
              {lastSync && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 mr-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
                </div>
              )}
              <button onClick={handleSync} disabled={syncing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-[#C9A94B]/10 hover:bg-[#C9A94B]/20 border border-[#C9A94B]/20 text-[#C9A94B] text-[11px] md:text-xs font-medium transition-all disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button onClick={() => setShowBookmarks(!showBookmarks)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl border text-[11px] md:text-xs font-medium transition-all ${showBookmarks ? 'bg-[#C9A94B]/20 border-[#C9A94B]/40 text-[#C9A94B]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                <Bookmark className="w-3.5 h-3.5" />
                Bookmarks ({bookmarkedIds.size})
              </button>
            </div>
          </div>

          {/* Stats Row */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-slate-600 mb-1">Total Notifications</p>
                <p className="text-xl font-bold text-white">{stats.totalCount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-xs text-slate-600 mb-1">This Week</p>
                <p className="text-xl font-bold text-emerald-400">{stats.recentCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <p className="text-xs text-slate-600 mb-1">Departments</p>
                <p className="text-xl font-bold text-blue-400">{stats.deptStats.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#C9A94B]/5 border border-[#C9A94B]/15">
                <p className="text-xs text-slate-600 mb-1">Bookmarked</p>
                <p className="text-xl font-bold text-[#C9A94B]">{bookmarkedIds.size}</p>
              </div>
            </div>
          )}

          {/* Dept stat chips */}
          {stats && (
            <div className="flex gap-2 flex-wrap">
              {stats.deptStats.map(d => (
                <button key={d.slug} onClick={() => { setDeptFilter(d.slug); setPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all"
                  style={deptFilter === d.slug
                    ? { backgroundColor: `${d.logoColor}25`, color: d.logoColor, border: `1px solid ${d.logoColor}50` }
                    : { backgroundColor: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={deptFilter === d.slug ? { color: d.logoColor } : { color: '#64748b' }}>{d.shortName}</span>
                  <span className="opacity-60">{d.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-20 bg-[#0D0D0F]/95 backdrop-blur border-b border-white/[0.05] px-4 md:px-8 py-3">
        <div className="flex items-center gap-3 flex-wrap w-full">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:flex-1 min-w-[200px] max-w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search notifications..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#C9A94B]/40 transition-colors" />
          </div>

          {/* Dept Filter */}
          <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 w-[calc(100%+2rem)] sm:w-auto shrink-0">
            {DEPT_FILTERS.map(d => (
              <button key={d.slug} id={`dept-filter-${d.slug}`} onClick={() => { setDeptFilter(d.slug); setPage(1); }}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${deptFilter === d.slug ? 'bg-[#C9A94B]/20 text-[#C9A94B] border border-[#C9A94B]/30' : 'bg-white/[0.04] text-slate-500 border border-white/[0.07] hover:text-white'}`}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-[#C9A94B]/40">
            {CATEGORY_FILTERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-xl border border-white/[0.07] p-0.5 ml-auto">
            {(['grid', 'list', 'timeline'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`p-1.5 rounded-lg transition-all ${viewMode === v ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}>
                {v === 'grid' ? <Grid className="w-3.5 h-3.5" /> : v === 'list' ? <List className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {!loading && <span className="text-[11px] text-slate-600">{totalCount.toLocaleString()} results</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8">
        {loading ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-3'}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-[20px] bg-white/[0.04] border border-white/[0.06] animate-pulse h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-400/50 mb-4" />
            <p className="text-slate-400 mb-2">{error}</p>
            <p className="text-slate-600 text-sm mb-4">The backend sync will populate data on first run.</p>
            <button onClick={() => fetchNews({ dept: deptFilter, category: categoryFilter, search, page })}
              className="px-4 py-2 rounded-xl bg-[#C9A94B]/10 border border-[#C9A94B]/20 text-[#C9A94B] text-sm hover:bg-[#C9A94B]/20 transition-colors">
              Try Again
            </button>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 mb-2">No notifications found</p>
            <p className="text-slate-600 text-sm">Try a different filter or click "Sync Now" to fetch latest updates.</p>
          </div>
        ) : (
          <>
            {showBookmarks && (
              <div className="mb-8 p-5 rounded-2xl bg-[#C9A94B]/5 border border-[#C9A94B]/15">
                <h2 className="text-sm font-medium text-[#C9A94B] mb-4 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Your Bookmarks ({bookmarkedIds.size})
                </h2>
                {bookmarkedIds.size === 0 ? (
                  <p className="text-slate-600 text-sm">No bookmarks yet. Click the bookmark icon on any notification.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {news.filter(n => bookmarkedIds.has(n.id)).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-[#C9A94B]/25"
                        onClick={() => window.open(item.officialUrl, '_blank')}>
                        <span className="text-sm text-slate-300 truncate">{item.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 ml-3" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : viewMode === 'list' ? 'flex flex-col gap-2' : 'max-w-2xl mx-auto'}>
              {news.map(item => (
                <NewsCard key={item.id} item={item} view={viewMode}
                  bookmarked={bookmarkedIds.has(item.id)}
                  onBookmark={handleBookmarkToggle} token={token || undefined} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-400 text-sm disabled:opacity-40 hover:text-white hover:bg-white/[0.08] transition-all">
                  Previous
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const p = i + Math.max(1, Math.min(page - 3, totalPages - 6));
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm transition-all ${p === page ? 'bg-[#C9A94B]/20 text-[#C9A94B] border border-[#C9A94B]/40' : 'bg-white/[0.04] border border-white/[0.07] text-slate-500 hover:text-white'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-400 text-sm disabled:opacity-40 hover:text-white hover:bg-white/[0.08] transition-all">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
