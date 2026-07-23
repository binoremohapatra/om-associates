// ── App-wide TypeScript types ─────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface TaxSlab {
  range: string;
  rate: number;
  label: string;
  color: string;
}

export interface DeductionItem {
  name: string;
  maxAmount: string;
  section: string;
  description: string;
}

export interface DeductionCategory {
  id: string;
  label: string;
  icon: string;
  totalSavings: number;
  color: string;
  items: DeductionItem[];
}

export interface GSTUpdate {
  id: number;
  title: string;
  date: string;
  category: string;
  summary: string;
  severity: 'high' | 'medium' | 'low';
}

export interface FilingEntry {
  form: string;
  description: string;
  dueDate: string;
  frequency: string;
  status: 'filed' | 'pending' | 'upcoming' | 'overdue';
}

export interface Client {
  id: number;
  name: string;
  avatar: string;
  gstin: string;
  status: 'Compliant' | 'Pending' | 'Overdue';
  outstanding: number;
  lastFiling: string;
  type: string;
  industry: string;
  turnover: number;
}

export interface NewsArticle {
  id: number;
  featured: boolean;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  trending: boolean;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface AnalyticsPoint {
  month: string;
  revenue: number;
  tax: number;
  savings: number;
}

export interface TaxBreakdown {
  name: string;
  value: number;
  amount: number;
  color: string;
}
