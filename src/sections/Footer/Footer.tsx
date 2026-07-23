import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink, Globe } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import GoldDivider from '../../components/ui/GoldDivider';

const FOOTER_LINKS = {
  'Services': [
    { label: 'GST Filing & Advisory',  href: '#features' },
    { label: 'Income Tax Returns',     href: '#features' },
    { label: 'TDS Compliance',         href: '#features' },
    { label: 'Tax Planning',           href: '#features' },
    { label: 'Company Registration',   href: '#features' },
  ],
  'Platform': [
    { label: 'Tax Calculator',   href: '/tax-calculator' },
    { label: 'DIY ITR Filing',   href: '/diy-itr' },
    { label: 'AI Tax Assistant', href: '/ai-assistant' },
    { label: 'Dashboard',        href: '/dashboard' },
    { label: 'GST News',         href: '#gst-news' },
  ],
  'Legal': [
    { label: 'Privacy Policy',      href: '#' },
    { label: 'Terms of Service',    href: '#' },
    { label: 'Refund Policy',       href: '#' },
    { label: 'DPDP Compliance',     href: '#' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Globe, href: '#', label: 'Facebook' },
  { icon: Globe, href: '#', label: 'Twitter' },
];

export default function Footer() {
  return (
    <footer
      style={{
        background:  '#0D0D0F',
        borderTop:   '1px solid rgba(201,169,75,0.1)',
      }}
    >
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16"
        >
          {/* Brand column */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 flex flex-col gap-6">
            {/* Logo */}
            <a href="/" className="block w-fit">
              <img
                src="/logo.png"
                alt="Om Associates"
                style={{ height: 'clamp(50px, 8vw, 80px)', width: 'auto' }}
              />
            </a>

            {/* Tagline */}
            <div>
              <GoldDivider className="mb-4" />
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{ color: '#68687C' }}
              >
                OP. TRIPATHI ADVOCATE | Om Associates - Legal & Tax Consultants.<br />
                Solutions That Build Trust.
              </p>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Mail,    text: 'op.tripathi2009@gmail.com',  href: 'mailto:op.tripathi2009@gmail.com' },
                { icon: Phone,   text: '+91 99999 47354, +91 97169 10699',           href: 'tel:+919999947354' },
                { icon: MapPin,  text: '722, Ground Floor, Ekta Society, Burari, Delhi-110084',      href: '#' },
              ].map(({ icon: Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="flex items-start gap-2.5 text-sm transition-colors duration-200 group"
                  style={{ color: '#68687C' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C9A94B'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#68687C'}
                >
                  <Icon size={14} style={{ color: '#C9A94B', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ maxWidth: '240px' }}>{text}</span>
                </a>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    border:     '1px solid rgba(201,169,75,0.15)',
                    color:      '#68687C',
                    background: 'rgba(201,169,75,0.03)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color      = '#E8C96B';
                    el.style.borderColor= 'rgba(201,169,75,0.4)';
                    el.style.background = 'rgba(201,169,75,0.08)';
                    el.style.boxShadow  = '0 4px 12px rgba(201,169,75,0.15)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color      = '#68687C';
                    el.style.borderColor= 'rgba(201,169,75,0.15)';
                    el.style.background = 'rgba(201,169,75,0.03)';
                    el.style.boxShadow  = 'none';
                  }}
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <motion.div key={section} variants={fadeInUp}>
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: '#C9A94B', letterSpacing: '0.1em' }}
              >
                {section}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm flex items-center gap-1 group transition-colors duration-200"
                      style={{ color: '#68687C' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E8C96B'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#68687C'}
                    >
                      {link.label}
                      {link.href === '#' && (
                        <ExternalLink
                          size={10}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: '#68687C' }}
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <GoldDivider className="mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#3E3E4E' }}>
            © 2025 Om Associates. All rights reserved. · GSTIN: 29AABCT1234F1Z5
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#3E3E4E' }}>
            <span style={{ color: '#C9A94B' }}>🔒</span> SSL Secured
            <span>·</span>
            <span>ISO 27001</span>
            <span>·</span>
            <span>DPIIT Recognised</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
