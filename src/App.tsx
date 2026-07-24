import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';

import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import Navbar from './components/layout/Navbar';
import FAB from './components/layout/FAB';
import Footer from './sections/Footer/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';

// Minimal loading fallback — preserves design (no flash)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]" aria-label="Loading...">
    <div className="w-10 h-10 border-4 border-[#C9A94B]/30 border-t-[#C9A94B] rounded-full animate-spin" />
  </div>
);

// ── Eagerly loaded (public, fast entry points) ────────────────────────────────
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SplashCursor from './components/ui/SplashCursor';

// Public Legal Pages (small, eager is fine)
import { PrivacyPolicy, TermsOfService, RefundPolicy, DPDPCompliance } from './pages/public-legal/LegalDocuments';

// ── Lazily loaded (dashboard — only when user is logged in) ──────────────────
const DashboardPage          = lazy(() => import('./pages/dashboard/DashboardPage'));
const TaxCalculatorPage      = lazy(() => import('./pages/calculator/TaxCalculatorPage'));
const DIYITRPage             = lazy(() => import('./pages/itr/DIYITRPage'));
const AIAssistantPage        = lazy(() => import('./pages/assistant/AIAssistantPage'));
const QueriesPage            = lazy(() => import('./pages/queries/QueriesPage'));
const ProfilePage            = lazy(() => import('./pages/dashboard/profile/ProfilePage'));

// GST Module
const GstLayout              = lazy(() => import('./pages/dashboard/gst/GstLayout'));
const GstDashboardPage       = lazy(() => import('./pages/dashboard/gst/GstDashboardPage'));
const GstReturnsPage         = lazy(() => import('./pages/dashboard/gst/GstReturnsPage'));
const GstChallansPage        = lazy(() => import('./pages/dashboard/gst/GstChallansPage'));
const GstRegistrationPage    = lazy(() => import('./pages/dashboard/gst/GstRegistrationPage'));
const GstNoticesPage         = lazy(() => import('./pages/dashboard/gst/GstNoticesPage'));

// Document Vault Module
const DocumentVaultLayout    = lazy(() => import('./pages/dashboard/documents/DocumentVaultLayout'));
const DocumentDashboard      = lazy(() => import('./pages/dashboard/documents/DocumentDashboard'));
const StarredPage            = lazy(() => import('./pages/dashboard/documents/StarredPage'));
const TrashPage              = lazy(() => import('./pages/dashboard/documents/TrashPage'));

// Payments Module
const PaymentsLayout         = lazy(() => import('./pages/dashboard/payments/PaymentsLayout'));
const PaymentsDashboardPage  = lazy(() => import('./pages/dashboard/payments/PaymentsDashboardPage'));
const InvoicesPage           = lazy(() => import('./pages/dashboard/payments/InvoicesPage'));

// Income Tax
const IncomeTaxLayout        = lazy(() => import('./pages/dashboard/income-tax/IncomeTaxLayout'));
const IncomeTaxDashboardPage = lazy(() => import('./pages/dashboard/income-tax/IncomeTaxDashboardPage'));
const TaxFilingsPage         = lazy(() => import('./pages/dashboard/income-tax/TaxFilingsPage'));
const DeductionsPage         = lazy(() => import('./pages/dashboard/income-tax/DeductionsPage'));

// News & Appointments
const NewsPage               = lazy(() => import('./pages/dashboard/news/NewsPage'));
const AppointmentsPage       = lazy(() => import('./pages/dashboard/appointments/AppointmentsPage'));

// Legal & EXIM
const LegalPage              = lazy(() => import('./pages/dashboard/legal/LegalPage'));
const ImportExportPage       = lazy(() => import('./pages/dashboard/import-export/ImportExportPage'));

// Settings & Reports
const SettingsPage           = lazy(() => import('./pages/dashboard/settings/SettingsPage'));
const ReportsPage            = lazy(() => import('./pages/dashboard/reports/ReportsPage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/dashboard/analytics/AnalyticsDashboardPage'));

// Placeholder
const PlaceholderPage        = lazy(() => import('./pages/PlaceholderPage'));

function Layout() {
  return (
    <div className="min-h-screen text-[var(--text-primary)] overflow-x-hidden flex flex-col" style={{ background: '#0D0D0F' }}>
      <SplashCursor RAINBOW_MODE={false} COLOR="#C9A94B" />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FAB />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login"          element={<LoginPage />} />
                <Route path="/register"       element={<RegisterPage />} />
                <Route path="/verify-email"   element={<VerifyEmailPage />} />
                <Route path="/forgot-password"element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

                <Route path="/" element={<Layout />}>
                  <Route index                     element={<LandingPage />} />
                  <Route path="privacy-policy"     element={<PrivacyPolicy />} />
                  <Route path="terms-of-service"   element={<TermsOfService />} />
                  <Route path="refund-policy"      element={<RefundPolicy />} />
                  <Route path="dpdp-compliance"    element={<DPDPCompliance />} />
                </Route>

                <Route path="/" element={<DashboardLayout />}>
                  <Route path="dashboard"          element={<DashboardPage />} />
                  <Route path="tax-calculator"     element={<TaxCalculatorPage />} />
                  <Route path="diy-itr"            element={<DIYITRPage />} />
                  <Route path="ai-assistant"       element={<AIAssistantPage />} />
                  <Route path="queries"            element={<QueriesPage />} />
                  <Route path="profile"            element={<ProfilePage />} />

                  {/* GST Module */}
                  <Route path="gst" element={<GstLayout />}>
                    <Route index                   element={<GstDashboardPage />} />
                    <Route path="returns"          element={<GstReturnsPage />} />
                    <Route path="challans"         element={<GstChallansPage />} />
                    <Route path="notices"          element={<GstNoticesPage />} />
                    <Route path="registration"     element={<GstRegistrationPage />} />
                  </Route>

                  {/* Document Vault Module */}
                  <Route path="documents" element={<DocumentVaultLayout />}>
                    <Route index                   element={<DocumentDashboard />} />
                    <Route path="starred"          element={<StarredPage />} />
                    <Route path="trash"            element={<TrashPage />} />
                    <Route path="recent"           element={<DocumentDashboard />} />
                  </Route>

                  {/* Payments Module */}
                  <Route path="payments" element={<PaymentsLayout />}>
                    <Route index                   element={<PaymentsDashboardPage />} />
                    <Route path="invoices"         element={<InvoicesPage />} />
                  </Route>

                  {/* Income Tax */}
                  <Route path="income-tax" element={<IncomeTaxLayout />}>
                    <Route index                   element={<IncomeTaxDashboardPage />} />
                    <Route path="filings"          element={<TaxFilingsPage />} />
                    <Route path="deductions"       element={<DeductionsPage />} />
                    <Route path="calculator"       element={<TaxCalculatorPage />} />
                  </Route>

                  <Route path="legal"              element={<LegalPage />} />
                  <Route path="import-export"      element={<ImportExportPage />} />
                  <Route path="news"               element={<NewsPage />} />
                  <Route path="appointments"       element={<AppointmentsPage />} />
                  <Route path="analytics"          element={<AnalyticsDashboardPage />} />
                  <Route path="reports"            element={<ReportsPage />} />
                  <Route path="settings"           element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
