// ── Domain-accurate Indian Tax & GST Data ─────────────────────────────────

export const TAX_SLABS_NEW = [
  { range: '₹0 – ₹3L', rate: 0, label: 'Nil', color: '#94A3B8' },
  { range: '₹3L – ₹7L', rate: 5, label: '5%', color: '#38BDF8' },
  { range: '₹7L – ₹10L', rate: 10, label: '10%', color: '#60A5FA' },
  { range: '₹10L – ₹12L', rate: 15, label: '15%', color: '#818CF8' },
  { range: '₹12L – ₹15L', rate: 20, label: '20%', color: '#A78BFA' },
  { range: 'Above ₹15L', rate: 30, label: '30%', color: '#F472B6' },
];

export const TAX_SLABS_OLD = [
  { range: '₹0 – ₹2.5L', rate: 0, label: 'Nil', color: '#94A3B8' },
  { range: '₹2.5L – ₹5L', rate: 5, label: '5%', color: '#38BDF8' },
  { range: '₹5L – ₹10L', rate: 20, label: '20%', color: '#818CF8' },
  { range: 'Above ₹10L', rate: 30, label: '30%', color: '#F472B6' },
];

export const GST_RATES = [0, 5, 12, 18, 28];

export const GST_UPDATES = [
  {
    id: 1,
    title: 'GST Council 55th Meeting: Rate rationalisation on insurance',
    date: '2025-12-21',
    category: 'Rate Change',
    summary: 'Life and health insurance premiums exempted from GST; electric vehicles 5% GST confirmed.',
    severity: 'high' as const,
  },
  {
    id: 2,
    title: 'Mandatory e-invoicing threshold reduced to ₹5 Crore turnover',
    date: '2025-10-01',
    category: 'Compliance',
    summary: 'Businesses with aggregate turnover ≥ ₹5 Cr must mandatorily generate e-invoices via IRP.',
    severity: 'medium' as const,
  },
  {
    id: 3,
    title: 'GSTR-1 due date extended for October filing',
    date: '2025-11-13',
    category: 'Filing Deadline',
    summary: 'CBIC extends GSTR-1 filing deadline to November 13 for quarterly filers (Oct–Dec quarter).',
    severity: 'low' as const,
  },
];

export const FILING_TIMELINE = [
  { form: 'GSTR-1', description: 'Outward supplies return', dueDate: '11th of next month', frequency: 'Monthly/Quarterly', status: 'filed' as const },
  { form: 'GSTR-3B', description: 'Summary return with tax payment', dueDate: '20th of next month', frequency: 'Monthly', status: 'pending' as const },
  { form: 'GSTR-2B', description: 'Auto-drafted ITC statement', dueDate: '14th of next month', frequency: 'Monthly', status: 'filed' as const },
  { form: 'GSTR-9', description: 'Annual return', dueDate: '31st December', frequency: 'Annual', status: 'upcoming' as const },
  { form: 'GSTR-9C', description: 'Reconciliation statement', dueDate: '31st December', frequency: 'Annual', status: 'upcoming' as const },
];

export const DEDUCTION_CATEGORIES = [
  {
    id: 'business',
    label: 'Business Expenses',
    icon: 'Briefcase',
    totalSavings: 485000,
    color: '#38BDF8',
    items: [
      { name: 'Office Rent & Utilities', maxAmount: 'Actual', section: '37(1)', description: 'Rent paid for office premises, electricity, internet, water bills.' },
      { name: 'Employee Salaries & PF', maxAmount: 'Actual', section: '36(1)(va)', description: 'Salaries, bonus, allowances, and employer contribution to PF/ESIC.' },
      { name: 'Professional & Legal Fees', maxAmount: 'Actual', section: '37(1)', description: 'CA fees, legal fees, consultant charges for business purposes.' },
      { name: 'Depreciation on Assets', maxAmount: 'As per Schedule', section: '32', description: 'Depreciation on plant & machinery, computers, vehicles (WDV method).' },
    ],
  },
  {
    id: 'investment',
    label: 'Investments & Savings',
    icon: 'TrendingUp',
    totalSavings: 350000,
    color: '#818CF8',
    items: [
      { name: 'Section 80C – Investments', maxAmount: '₹1.5 Lakh', section: '80C', description: 'PPF, ELSS, LIC premiums, 5-yr FD, NSC, home loan principal.' },
      { name: 'Section 80D – Health Insurance', maxAmount: '₹25,000/₹50,000', section: '80D', description: 'Health insurance premiums for self, family, and parents (higher limit for senior citizens).' },
      { name: 'NPS Contribution', maxAmount: '₹50,000', section: '80CCD(1B)', description: 'Additional deduction for NPS contribution over and above 80C limit.' },
    ],
  },
  {
    id: 'rd',
    label: 'R&D & Innovation',
    icon: 'Lightbulb',
    totalSavings: 220000,
    color: '#34D399',
    items: [
      { name: 'Scientific R&D Expenditure', maxAmount: '150% of actual', section: '35(2AB)', description: 'Weighted deduction for expenditure on approved in-house R&D facilities.' },
      { name: 'Technology Acquisition', maxAmount: 'Actual', section: '35AB', description: 'Lump-sum payment for acquiring know-how or technology rights.' },
    ],
  },
  {
    id: 'startup',
    label: 'Startup Benefits',
    icon: 'Rocket',
    totalSavings: 175000,
    color: '#FBBF24',
    items: [
      { name: '80-IAC Tax Holiday', maxAmount: '100% for 3 years', section: '80-IAC', description: 'DPIIT-recognised startups get 100% deduction on profits for 3 consecutive years within 10 years.' },
      { name: 'Angel Tax Exemption', maxAmount: 'Full exemption', section: '56(2)(viib)', description: 'DPIIT-recognised startups exempt from angel tax on equity fundraising.' },
    ],
  },
];

export const CLIENTS_DATA = [
  { id: 1, name: 'Nexus Tech Pvt. Ltd.', avatar: 'NT', gstin: '27AABCN1234F1Z5', status: 'Compliant', outstanding: 0, lastFiling: '2025-11-20', type: 'Private Limited', industry: 'Technology', turnover: 45000000 },
  { id: 2, name: 'Sharma & Sons Trading', avatar: 'SS', gstin: '09AAEFS5678G2H3', status: 'Pending', outstanding: 125000, lastFiling: '2025-10-15', type: 'Partnership', industry: 'Trading', turnover: 12000000 },
  { id: 3, name: 'GreenBuild Infrastructure', avatar: 'GB', gstin: '29AABCG4321K1Z8', status: 'Overdue', outstanding: 340000, lastFiling: '2025-09-30', type: 'Private Limited', industry: 'Construction', turnover: 85000000 },
  { id: 4, name: 'Medlife Pharmaceuticals', avatar: 'MP', gstin: '33AADCM8765L2M9', status: 'Compliant', outstanding: 0, lastFiling: '2025-11-18', type: 'Private Limited', industry: 'Healthcare', turnover: 32000000 },
  { id: 5, name: 'FoodBox Cloud Kitchen', avatar: 'FC', gstin: '07AABCF2345P1Z2', status: 'Pending', outstanding: 56000, lastFiling: '2025-10-25', type: 'Proprietorship', industry: 'Food & Beverage', turnover: 8500000 },
  { id: 6, name: 'Rajasthan Textiles Ltd.', avatar: 'RT', gstin: '08AABCR9876Q3R4', status: 'Compliant', outstanding: 0, lastFiling: '2025-11-22', type: 'Public Limited', industry: 'Manufacturing', turnover: 125000000 },
  { id: 7, name: 'UrbanNest Realty', avatar: 'UR', gstin: '27AABCU3456S2T6', status: 'Overdue', outstanding: 890000, lastFiling: '2025-08-31', type: 'Private Limited', industry: 'Real Estate', turnover: 67000000 },
  { id: 8, name: 'Apex Logistics Corp', avatar: 'AL', gstin: '19AABCA7654U4V7', status: 'Compliant', outstanding: 0, lastFiling: '2025-11-19', type: 'Private Limited', industry: 'Logistics', turnover: 41000000 },
];

export const ANALYTICS_REVENUE = [
  { month: 'Jun', revenue: 4200000, tax: 756000, savings: 320000 },
  { month: 'Jul', revenue: 3900000, tax: 702000, savings: 285000 },
  { month: 'Aug', revenue: 5100000, tax: 918000, savings: 415000 },
  { month: 'Sep', revenue: 4750000, tax: 855000, savings: 380000 },
  { month: 'Oct', revenue: 6200000, tax: 1116000, savings: 520000 },
  { month: 'Nov', revenue: 5850000, tax: 1053000, savings: 490000 },
];

export const TAX_BREAKDOWN = [
  { name: 'Income Tax', value: 38, amount: 2140000, color: '#38BDF8' },
  { name: 'GST Payable', value: 32, amount: 1806000, color: '#818CF8' },
  { name: 'TDS/TCS', value: 18, amount: 1016000, color: '#34D399' },
  { name: 'Advance Tax', value: 12, amount: 677000, color: '#FBBF24' },
];

export const RECENT_ACTIVITY = [
  { id: 1, action: 'GSTR-3B filed successfully', time: '2 hours ago', type: 'success', amount: null },
  { id: 2, action: 'TDS deposited for October', time: '1 day ago', type: 'success', amount: 245000 },
  { id: 3, action: 'Advance tax Q3 due in 5 days', time: '5 days remaining', type: 'warning', amount: 380000 },
  { id: 4, action: 'New GST notice received', time: '3 days ago', type: 'danger', amount: null },
  { id: 5, action: 'GSTR-1 auto-populated', time: '5 days ago', type: 'info', amount: null },
];

export const GST_NEWS = [
  {
    id: 1,
    featured: true,
    title: 'GST Council Okays Insurance Relief: Zero Tax on Term Life & Basic Health Cover',
    excerpt: 'The 55th GST Council meeting in Jaisalmer delivered a landmark decision — term life insurance and basic health insurance will be fully exempt from the 18% GST that currently applies, providing substantial relief to millions of Indian families and businesses.',
    category: 'Policy Reform',
    readTime: '6 min read',
    date: 'Dec 22, 2025',
    trending: true,
    tags: ['GST Council', 'Insurance', 'Rate Rationalisation'],
  },
  {
    id: 2,
    featured: false,
    title: 'CBIC Rolls Out Biometric Aadhaar Authentication for GST Registration',
    excerpt: 'CBIC mandates biometric Aadhaar authentication to curb fake registrations and GST fraud.',
    category: 'Compliance',
    readTime: '4 min read',
    date: 'Dec 10, 2025',
    trending: false,
    tags: ['Registration', 'Fraud Prevention'],
  },
  {
    id: 3,
    featured: false,
    title: "Budget 2026 Expectations: Industry Calls for GST Simplification on B2C Transactions",
    excerpt: "Industry bodies FICCI and CII submit pre-budget memorandums demanding single-rate GST for B2C services sector.",
    category: 'Budget',
    readTime: '5 min read',
    date: 'Dec 05, 2025',
    trending: true,
    tags: ['Budget 2026', 'Simplification'],
  },
  {
    id: 4,
    featured: false,
    title: 'E-Invoice Threshold Slashed to ₹5 Crore – Are You Ready?',
    excerpt: 'With the new threshold effective October 2025, thousands more businesses must adopt e-invoicing.',
    category: 'E-Invoicing',
    readTime: '3 min read',
    date: 'Nov 28, 2025',
    trending: false,
    tags: ['E-Invoice', 'IRP', 'Threshold'],
  },
  {
    id: 5,
    featured: false,
    title: 'GST Portal Gets a Major Upgrade: AI-Powered Reconciliation Tool Now Live',
    excerpt: 'GSTN launches an AI-powered reconciliation feature in the GST portal to reduce ITC mismatches.',
    category: 'Technology',
    readTime: '4 min read',
    date: 'Nov 20, 2025',
    trending: true,
    tags: ['GSTN', 'AI', 'Reconciliation'],
  },
];

export const AI_SUGGESTED_QUESTIONS = [
  'What is my estimated tax liability for FY 2025-26?',
  'How do I maximize deductions under 80C and 80D?',
  'Explain GST composition scheme for my business',
  'What are the consequences of late GSTR-3B filing?',
  'Can I claim ITC on purchases made before GST registration?',
  'What is the difference between GSTR-1 and GSTR-3B?',
];

export const FEATURES_DATA = [
  { id: 1, icon: 'Calculator', title: 'Business Tax Calculator', desc: 'Compute income tax under both old and new regimes with real-time comparison and optimal regime suggestion.', accent: '#38BDF8', size: 'large' },
  { id: 2, icon: 'TrendingDown', title: 'Tax Deduction Analyzer', desc: 'Identify every eligible deduction across 80C, 80D, business expenses, and startup benefits automatically.', accent: '#818CF8', size: 'medium' },
  { id: 3, icon: 'Receipt', title: 'GST Management', desc: 'End-to-end GST lifecycle: filing, reconciliation, e-invoicing, and ITC optimization in one dashboard.', accent: '#34D399', size: 'medium' },
  { id: 4, icon: 'Bot', title: 'AI Tax Assistant', desc: 'Ask any tax question in plain English. Get accurate answers grounded in Income Tax Act and GST law.', accent: '#F472B6', size: 'large' },
  { id: 5, icon: 'Users', title: 'Client Management', desc: 'Manage all your business clients — GSTIN, filing status, outstanding dues, and history in one place.', accent: '#FBBF24', size: 'small' },
  { id: 6, icon: 'BarChart2', title: 'Reports & Analytics', desc: 'Visualize tax liability trends, compliance scores, and cash flow forecasts with interactive dashboards.', accent: '#38BDF8', size: 'small' },
  { id: 7, icon: 'FileText', title: 'Invoice Tracking', desc: 'Track all outward invoices, match with GSTR-2B auto-population, and flag reconciliation mismatches.', accent: '#818CF8', size: 'small' },
  { id: 8, icon: 'ShieldCheck', title: 'Compliance Monitoring', desc: 'Never miss a due date. Get intelligent alerts for GST, TDS, advance tax, ROC, and statutory filings.', accent: '#34D399', size: 'small' },
];
