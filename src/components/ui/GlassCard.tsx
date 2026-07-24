import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  tilt?: boolean;
  goldBorder?: boolean;
}

export function GlassCard({ children, className = '', glowOnHover = true, tilt = true, goldBorder = true }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / 20;
    const y = (e.clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        transform: tilt && hovered
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl overflow-hidden ${className}`}
    >
      {/* Gradient border via ::before hack using box-shadow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none z-10 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0.4,
          boxShadow: goldBorder
            ? 'inset 0 0 0 1px rgba(201,169,75,0.2), inset 0 1px 0 rgba(232,201,107,0.3)'
            : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      />

      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(201,169,75,0.6), transparent)',
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Outer glow */}
      {glowOnHover && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none -z-10 transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            boxShadow: '0 0 40px rgba(201,169,75,0.18), 0 16px 48px rgba(0,0,0,0.4)',
          }}
        />
      )}

      {/* Glass fill */}
      <div
        className="relative h-full"
        style={{
          backdropFilter:         'blur(20px)',
          WebkitBackdropFilter:   'blur(20px)',
          background:             'rgba(20,20,24,0.75)',
          transition:             'background 0.3s ease',
          ...(hovered ? { background: 'rgba(26,26,32,0.85)' } : {}),
        }}
      >
        <motion.div 
          className="relative z-10 p-5 sm:p-8 h-full"
          style={{
            transform: tilt && hovered
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.1s ease-out",
          }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
