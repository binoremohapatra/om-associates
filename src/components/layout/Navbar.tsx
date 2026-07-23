import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import FlowingMenu from '../ui/FlowingMenu';
import GooeyNav from '../ui/GooeyNav';

const DEMO_ITEMS = [
  { link: '#', text: 'GST Registration', image: '/images/gst_registration.png' },
  { link: '#', text: 'MCA & ROC', image: '/images/mca_roc.png' },
  { link: '#', text: 'Legal Matters', image: '/images/legal_matters.png' },
  { link: '#', text: 'Import/Export DGFT', image: '/images/import_export.png' }
];

const NAV_LINKS = [
  { label: 'Services',    href: '#services' },
  { label: 'Why Us',      href: '#why-us' },
  { label: 'News',        href: '#gst-news' },
  { label: 'Platform',    href: '#features' },
  { label: 'Analytics',   href: '#analytics' },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [flowingMenuOpen, setFlowingMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setFlowingMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backdropFilter:       scrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          background:           scrolled
            ? 'rgba(13,13,15,0.88)'
            : 'transparent',
          borderBottom:         scrolled
            ? '1px solid rgba(201,169,75,0.1)'
            : '1px solid transparent',
          boxShadow:            scrolled
            ? '0 4px 32px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" style={{ height: 'clamp(60px, 8vw, 80px)' }}>

            {/* Logo */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <motion.img
                src="/logo.png"
                alt="Om Associates"
                className="w-auto"
                style={{ height: 'clamp(44px, 7vw, 64px)' }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </Link>

            {/* Desktop Nav */}
            {isLandingPage && (
              <div className="hidden md:flex items-center">
                <GooeyNav items={NAV_LINKS} initialActiveIndex={0} />
              </div>
            )}

            {/* Right Side */}
            {isLandingPage && (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #C9A94B 0%, #E8C96B 50%, #C9A94B 100%)',
                    backgroundSize: '200% auto',
                    color: '#0D0D0F',
                    boxShadow: '0 4px 16px rgba(201,169,75,0.3)',
                    letterSpacing: '0.03em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundPosition = 'right center';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(201,169,75,0.45)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundPosition = 'left center';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(201,169,75,0.3)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  Client Portal
                </Link>
                
                {/* Flowing Menu Toggle */}
                <button
                  onClick={() => setFlowingMenuOpen(true)}
                  className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                  style={{
                    background: 'rgba(201,169,75,0.1)',
                    border: '1px solid rgba(201,169,75,0.25)',
                    color: '#E8C96B',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,75,0.2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,75,0.1)';
                  }}
                >
                  Explore Services
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen(v => !v)}
                  className="md:hidden p-2.5 rounded-xl transition-all duration-200"
                  style={{
                    color:      '#9898AA',
                    background: mobileOpen ? 'rgba(201,169,75,0.08)' : 'transparent',
                    border:     '1px solid rgba(201,169,75,0.15)',
                  }}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={mobileOpen ? 'close' : 'open'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[80px] z-40 md:hidden"
            style={{
              backdropFilter:       'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background:           'rgba(13,13,15,0.95)',
              borderBottom:         '1px solid rgba(201,169,75,0.12)',
              boxShadow:            '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: '#9898AA' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E8C96B'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,75,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9898AA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-1" style={{ borderTop: '1px solid rgba(201,169,75,0.1)' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl font-semibold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #C9A94B, #E8C96B)',
                    color: '#0D0D0F',
                  }}
                >
                  Client Portal
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flowing Menu Fullscreen Overlay */}
      <AnimatePresence>
        {flowingMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ background: '#0D0D0F' }}
          >
            <div className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 border-b" style={{ borderColor: 'rgba(201,169,75,0.15)' }}>
              <span className="font-display font-bold text-xl" style={{ color: '#E8C96B' }}>Om Associates Services</span>
              <button
                onClick={() => setFlowingMenuOpen(false)}
                className="p-2.5 rounded-full transition-all duration-200 hover:bg-white/10"
                style={{ color: '#F5F5F7' }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 mt-20">
              <FlowingMenu 
                items={DEMO_ITEMS}
                speed={15}
                textColor="#E8C96B"
                bgColor="#0D0D0F"
                marqueeBgColor="#E8C96B"
                marqueeTextColor="#0D0D0F"
                borderColor="rgba(201,169,75,0.15)"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
