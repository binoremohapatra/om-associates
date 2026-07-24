import React from 'react';

const LegalPageTemplate = ({ title, content }: { title: string, content: React.ReactNode }) => (
  <div className="max-w-4xl mx-auto px-4 py-32 min-h-[80vh]">
    <h1 className="text-4xl font-display font-bold text-white mb-8">{title}</h1>
    <div className="prose prose-invert max-w-none text-slate-400 space-y-6">
      {content}
    </div>
  </div>
);

export function PrivacyPolicy() {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      content={
        <>
          <p>Last updated: July 2026</p>
          <p>At OM Associates, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our services.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, request a consultation, or contact us for support. This includes personal and financial data necessary for taxation and legal services.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure compliance with Indian legal and taxation requirements.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Security</h2>
          <p>We implement appropriate security measures (including SSL encryption and ISO 27001 standards) to protect your personal information from unauthorized access or disclosure.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at op.tripathi2009@gmail.com.</p>
        </>
      }
    />
  );
}

export function TermsOfService() {
  return (
    <LegalPageTemplate
      title="Terms of Service"
      content={
        <>
          <p>Last updated: July 2026</p>
          <p>Welcome to OM Associates. By accessing our website and using our services, you agree to be bound by these Terms of Service.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By using our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description of Services</h2>
          <p>OM Associates provides legal, taxation, GST, and corporate compliance consulting. The information provided on our platform does not constitute binding legal advice unless a formal client-attorney relationship is established.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Responsibilities</h2>
          <p>You agree to provide accurate and complete information required for tax filings and legal compliance. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </>
      }
    />
  );
}

export function RefundPolicy() {
  return (
    <LegalPageTemplate
      title="Refund Policy"
      content={
        <>
          <p>Last updated: July 2026</p>
          <p>We strive to provide the best legal and taxation services. Our refund policy outlines the conditions under which refunds may be issued.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Eligibility for Refunds</h2>
          <p>Refunds are only issued if the requested service has not been initiated or if there was a technical error resulting in double payment. Once legal or tax filing work has commenced, fees are non-refundable.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Processing Time</h2>
          <p>Approved refunds will be processed within 5-7 business days and credited back to the original method of payment.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Contact for Refunds</h2>
          <p>To request a refund, please contact our support team with your invoice details at op.tripathi2009@gmail.com.</p>
        </>
      }
    />
  );
}

export function DPDPCompliance() {
  return (
    <LegalPageTemplate
      title="DPDP Act Compliance"
      content={
        <>
          <p>Last updated: July 2026</p>
          <p>OM Associates is fully compliant with the Digital Personal Data Protection (DPDP) Act of India.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Data Principal Rights</h2>
          <p>You have the right to access, correct, and erase your personal data stored with us. You also have the right to nominate consent managers as per the DPDP framework.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Data Fiduciary Obligations</h2>
          <p>As a Data Fiduciary, we ensure that your personal data is processed lawfully, fairly, and transparently, with adequate security safeguards to prevent data breaches.</p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Grievance Redressal</h2>
          <p>If you have any concerns regarding data privacy, you may contact our designated Data Protection Officer via our official contact channels.</p>
        </>
      }
    />
  );
}
