import { useState, useEffect } from 'react';

export function useAdaptivePerformance() {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // 1. Check if the user has explicitly requested reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 2. Simple heuristic for low-end devices
    const nav = navigator as any;
    
    // Core count < 4 is usually a low-end mobile device or older CPU
    const cores = nav.hardwareConcurrency || 4;
    
    // Memory < 4GB is a strong indicator of a low-end device
    const memory = nav.deviceMemory || 4;
    
    // User is on a cellular connection and explicitly enabled data saving
    const saveData = nav.connection?.saveData || false;
    
    // User is on a slow connection (2G, slow-2G, 3G)
    const effectiveType = nav.connection?.effectiveType || '4g';
    const isSlowConnection = ['slow-2g', '2g', '3g'].includes(effectiveType);
    
    if (prefersReducedMotion || cores < 4 || memory < 4 || saveData || isSlowConnection) {
      setIsLowEnd(true);
    }
  }, []);

  return { isLowEnd };
}
