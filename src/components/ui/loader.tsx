import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const LoaderOne = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className="w-5 h-5 border-[2.5px] border-current/30 border-t-current rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};
