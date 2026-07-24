import type { Variants } from 'framer-motion';

// Cubic bezier tuples for Framer Motion — typed as required
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animation Variants (Framer Motion) ──────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
};

export const tapScale = {
  tap: { scale: 0.98 },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], when: 'beforeChildren' } 
  },
  exit: { opacity: 0, y: -10, filter: 'blur(5px)', transition: { duration: 0.3 } }
};

export const textReveal: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -20 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

// ── Reduced-Motion Safe Variants ─────────────────────────────────────────────
// Use these for users who prefer reduced motion (prefers-reduced-motion: reduce)
// or on low-end devices detected at runtime.

export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const pageTransitionReduced: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

