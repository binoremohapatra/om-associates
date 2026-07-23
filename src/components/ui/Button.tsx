import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'glass';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const SIZE_MAP: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-7 py-3.5 text-sm gap-2',
  xl: 'px-8 py-4 text-base gap-2.5',
};

const VARIANT_MAP: Record<Variant, string> = {
  primary:   'btn-gold',
  gold:      'btn-gold',
  secondary: 'btn-glass',
  glass:     'btn-glass',
  ghost:     'btn-ghost',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', href, children, loading, className = '', ...rest }, ref) => {
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples(r => [...r, { id, x, y }]);
      setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
      rest.onClick?.(e);
    };

    const baseClass = `${VARIANT_MAP[variant]} ${SIZE_MAP[size]} ${className}`;

    const inner = (
      <>
        {ripples.map(rp => (
          <span
            key={rp.id}
            className="pointer-events-none absolute rounded-full animate-ping"
            style={{
              left:    rp.x - 8,
              top:     rp.y - 8,
              width:   16,
              height:  16,
              background: variant === 'ghost' ? 'rgba(201,169,75,0.2)' : 'rgba(255,255,255,0.25)',
              animationDuration: '0.6s',
            }}
          />
        ))}
        {loading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : children}
      </>
    );

    if (href) {
      const isExternal = href.startsWith('http');
      if (isExternal) {
        return (
          <a href={href} className={baseClass} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      }
      return (
        <Link to={href} className={baseClass}>
          {children}
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref as any}
        whileTap={{ scale: 0.975 }}
        className={`${baseClass} relative overflow-hidden`}
        onClick={handleClick}
        disabled={loading}
        {...rest as any}
      >
        {inner}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
