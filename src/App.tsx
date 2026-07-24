import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';

import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import Navbar from './components/layout/Navbar';
import FAB from './components/layout/FAB';
import Footer from './sections/Footer/Footer';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TaxCalculatorPage from './pages/calculator/TaxCalculatorPage';
import DIYITRPage from './pages/itr/DIYITRPage';
import AIAssistantPage from './pages/assistant/AIAssistantPage';
import QueriesPage from './pages/queries/QueriesPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProfilePage from './pages/dashboard/profile/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// GST Module
import GstLayout from './pages/dashboard/gst/GstLayout';
import GstDashboardPage from './pages/dashboard/gst/GstDashboardPage';
import GstReturnsPage from './pages/dashboard/gst/GstReturnsPage';
import GstChallansPage from './pages/dashboard/gst/GstChallansPage';
import GstRegistrationPage from './pages/dashboard/gst/GstRegistrationPage';

// Document Vault Module
import DocumentVaultLayout from './pages/dashboard/documents/DocumentVaultLayout';
import DocumentDashboard from './pages/dashboard/documents/DocumentDashboard';
import StarredPage from './pages/dashboard/documents/StarredPage';
import TrashPage from './pages/dashboard/documents/TrashPage';

// Payments Module
import PaymentsLayout from './pages/dashboard/payments/PaymentsLayout';
import PaymentsDashboardPage from './pages/dashboard/payments/PaymentsDashboardPage';
import InvoicesPage from './pages/dashboard/payments/InvoicesPage';

// Income Tax
import IncomeTaxLayout from './pages/dashboard/income-tax/IncomeTaxLayout';
import IncomeTaxDashboardPage from './pages/dashboard/income-tax/IncomeTaxDashboardPage';
import TaxFilingsPage from './pages/dashboard/income-tax/TaxFilingsPage';
import DeductionsPage from './pages/dashboard/income-tax/DeductionsPage';

// News & Appointments
import NewsPage from './pages/dashboard/news/NewsPage';
import AppointmentsPage from './pages/dashboard/appointments/AppointmentsPage';

// Legal & EXIM
import LegalPage from './pages/dashboard/legal/LegalPage';
import ImportExportPage from './pages/dashboard/import-export/ImportExportPage';

// Settings & Reports
import SettingsPage from './pages/dashboard/settings/SettingsPage';
import ReportsPage from './pages/dashboard/reports/ReportsPage';
import AnalyticsDashboardPage from './pages/dashboard/analytics/AnalyticsDashboardPage';
import GstNoticesPage from './pages/dashboard/gst/GstNoticesPage';

// Public Legal Pages
import { PrivacyPolicy, TermsOfService, RefundPolicy, DPDPCompliance } from './pages/public-legal/LegalDocuments';

import SplashCursor from './components/ui/SplashCursor';

function Layout() {
  const location = useLocation();
  // Always show Navbar and Footer on public pages, not just the root
  const isPublicPage = true;

  return (
    <div className="min-h-screen text-[var(--text-primary)] overflow-x-hidden flex flex-col" style={{ background: '#0D0D0F' }}>
      <SplashCursor />
      {isPublicPage && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {isPublicPage && <Footer />}
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
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-of-service" element={<TermsOfService />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="dpdp-compliance" element={<DPDPCompliance />} />
            </Route>

            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tax-calculator" element={<TaxCalculatorPage />} />
              <Route path="diy-itr" element={<DIYITRPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="queries" element={<QueriesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              
              {/* GST Module */}
              <Route path="gst" element={<GstLayout />}>
                <Route index element={<GstDashboardPage />} />
                <Route path="returns" element={<GstReturnsPage />} />
                <Route path="challans" element={<GstChallansPage />} />
                <Route path="notices" element={<GstNoticesPage />} />
                <Route path="registration" element={<GstRegistrationPage />} />
              </Route>

              {/* Document Vault Module */}
              <Route path="documents" element={<DocumentVaultLayout />}>
                <Route index element={<DocumentDashboard />} />
                <Route path="starred" element={<StarredPage />} />
                <Route path="trash" element={<TrashPage />} />
                <Route path="recent" element={<DocumentDashboard />} />
              </Route>
              
              {/* Payments Module */}
              <Route path="payments" element={<PaymentsLayout />}>
                <Route index element={<PaymentsDashboardPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
              </Route>

              {/* Income Tax */}
              <Route path="income-tax" element={<IncomeTaxLayout />}>
                <Route index element={<IncomeTaxDashboardPage />} />
                <Route path="filings" element={<TaxFilingsPage />} />
                <Route path="deductions" element={<DeductionsPage />} />
                <Route path="calculator" element={<TaxCalculatorPage />} />
              </Route>
              

              <Route path="legal" element={<LegalPage />} />
              <Route path="import-export" element={<ImportExportPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="analytics" element={<AnalyticsDashboardPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
    </AuthProvider>
  );
}
