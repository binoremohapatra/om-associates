import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css'; // Optional, but helps with performance

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
