import { useEffect } from 'react';

export function useVanillaSmoothScroll() {
  useEffect(() => {
    // Only apply on desktop
    if (window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    // Map of scroll targets to their current animation state
    const scrollStates = new Map<HTMLElement | Window, {
      targetScroll: number;
      currentScroll: number;
      isScrolling: boolean;
      maxScroll: number;
    }>();

    const getScrollableParent = (node: HTMLElement | null): HTMLElement | Window => {
      if (!node || node === document.body || node === document.documentElement) {
        return window;
      }
      
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
      
      if (isScrollable) {
        return node;
      }
      
      return getScrollableParent(node.parentElement);
    };

    const updateScroll = (target: HTMLElement | Window) => {
      const state = scrollStates.get(target);
      if (!state) return;

      const lerp = 0.08;
      state.currentScroll += (state.targetScroll - state.currentScroll) * lerp;

      if (Math.abs(state.targetScroll - state.currentScroll) < 0.5) {
        state.currentScroll = state.targetScroll;
        target.scrollTo(0, state.currentScroll);
        state.isScrolling = false;
      } else {
        target.scrollTo(0, state.currentScroll);
        requestAnimationFrame(() => updateScroll(target));
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return; // Let native handle zoom and horizontal
      }

      const targetElement = e.target as HTMLElement;
      const scrollContainer = getScrollableParent(targetElement);
      
      // Calculate max scroll for the specific container
      let maxScroll = 0;
      let currentY = 0;
      
      if (scrollContainer === window) {
        maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        currentY = window.scrollY;
      } else {
        const el = scrollContainer as HTMLElement;
        maxScroll = el.scrollHeight - el.clientHeight;
        currentY = el.scrollTop;
      }

      // If container can't scroll, let it bubble (or just prevent default and do nothing)
      if (maxScroll <= 0) return;

      e.preventDefault();

      let state = scrollStates.get(scrollContainer);
      if (!state) {
        state = {
          targetScroll: currentY,
          currentScroll: currentY,
          isScrolling: false,
          maxScroll: maxScroll
        };
        scrollStates.set(scrollContainer, state);
      } else {
        // Keep maxScroll up to date (in case layout changed)
        state.maxScroll = maxScroll;
      }
      
      // If native scroll changed the position while we weren't looking, sync it
      if (!state.isScrolling && Math.abs(state.currentScroll - currentY) > 2) {
        state.currentScroll = currentY;
        state.targetScroll = currentY;
      }

      const scrollSpeed = 1.2;
      state.targetScroll += e.deltaY * scrollSpeed;
      state.targetScroll = Math.max(0, Math.min(state.targetScroll, state.maxScroll));

      if (!state.isScrolling) {
        state.isScrolling = true;
        requestAnimationFrame(() => updateScroll(scrollContainer));
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, []);
}
