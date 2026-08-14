import { useEffect } from 'react';

export function useVanillaSmoothScroll() {
  useEffect(() => {
    // Only apply on desktop. Mobile browsers have native smooth scrolling and touch events are complex to intercept cleanly.
    if (window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let isScrolling = false;

    const onWheel = (e: WheelEvent) => {
      // Allow horizontal scrolling or trackpad zooming to pass through
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      e.preventDefault();
      
      // Adjust multiplier for scroll speed
      const scrollSpeed = 1.2;
      targetScroll += e.deltaY * scrollSpeed;
      
      // Clamp the target scroll to page bounds
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      // Lerp factor for smoothness (lower = smoother/slower, higher = snappier)
      const lerp = 0.08;
      currentScroll += (targetScroll - currentScroll) * lerp;
      
      if (Math.abs(targetScroll - currentScroll) < 0.5) {
        currentScroll = targetScroll;
        window.scrollTo(0, currentScroll);
        isScrolling = false;
      } else {
        window.scrollTo(0, currentScroll);
        requestAnimationFrame(updateScroll);
      }
    };

    // Use passive: false to allow e.preventDefault()
    window.addEventListener('wheel', onWheel, { passive: false });

    // Handle native scroll events (e.g. dragging scrollbar or arrow keys)
    const onScroll = () => {
      if (!isScrolling) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
