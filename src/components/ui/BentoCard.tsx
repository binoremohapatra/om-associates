import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

import { MagicBentoCard } from './MagicBento';

interface BentoCardProps extends HTMLMotionProps<'div'> {
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  noPadding?: boolean;
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, title, description, icon, children, size = 'md', noPadding, ...props }, ref) => {
    const sizeClasses = {
      sm: 'col-span-1 row-span-1',
      md: 'col-span-1 md:col-span-2 row-span-1',
      lg: 'col-span-1 md:col-span-2 row-span-2',
      xl: 'col-span-1 md:col-span-3 row-span-2',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'group relative transition-all duration-500 flex flex-col',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <MagicBentoCard
          className="h-full w-full backdrop-blur-2xl border-white/[0.08]"
          glowColor="201, 169, 75"
          enableStars={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={false} // Disable magnetism for large cards to prevent layout jitter
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A94B]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className={cn("flex flex-col flex-grow z-10 relative h-full", !noPadding && "p-5 sm:p-6 lg:p-8")}>
            {icon && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#C9A94B]/10 text-[#C9A94B] flex items-center justify-center mb-4 sm:mb-6 shadow-inner-top border border-[#C9A94B]/20">
                {icon}
              </div>
            )}
            
            {title && <h3 className={cn("text-lg sm:text-xl font-display font-bold text-[#F5F5F7] mb-2", noPadding && "p-5 sm:p-6 lg:p-8 pb-2")}>{title}</h3>}
            {description && <p className={cn("text-slate-400 text-sm leading-relaxed mb-4 sm:mb-6", noPadding && "px-5 sm:px-6 lg:px-8")}>{description}</p>}
            
            <div className="mt-auto relative z-20">
              {children}
            </div>
          </div>
        </MagicBentoCard>
      </motion.div>
    );
  }
);

BentoCard.displayName = 'BentoCard';
