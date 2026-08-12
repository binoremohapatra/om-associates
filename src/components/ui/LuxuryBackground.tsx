import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAdaptivePerformance } from '../../hooks/useAdaptivePerformance';

/**
 * LuxuryBackground — Premium charcoal + gold light rays
 * Pure CSS/Canvas — no WebGL dependency
 */
export default function LuxuryBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLowEnd } = useAdaptivePerformance();

  useEffect(() => {
    if (isLowEnd) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      // Base charcoal gradient
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.5, W * 0.9);
      bg.addColorStop(0,   'rgba(28, 24, 18, 1)');
      bg.addColorStop(0.5, 'rgba(13, 13, 15, 1)');
      bg.addColorStop(1,   'rgba(8, 8, 9, 1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Gold orb 1 — slow drift top-center
      const ox1 = W * 0.5 + Math.sin(t * 0.0008) * W * 0.12;
      const oy1 = H * 0.25 + Math.cos(t * 0.0006) * H * 0.08;
      const orb1 = ctx.createRadialGradient(ox1, oy1, 0, ox1, oy1, W * 0.35);
      orb1.addColorStop(0,   'rgba(201,169,75, 0.10)');
      orb1.addColorStop(0.4, 'rgba(201,169,75, 0.04)');
      orb1.addColorStop(1,   'rgba(201,169,75, 0.00)');
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, W, H);

      // Gold orb 2 — bottom-right
      const ox2 = W * 0.78 + Math.cos(t * 0.0007) * W * 0.08;
      const oy2 = H * 0.7  + Math.sin(t * 0.0009) * H * 0.06;
      const orb2 = ctx.createRadialGradient(ox2, oy2, 0, ox2, oy2, W * 0.28);
      orb2.addColorStop(0,   'rgba(166,139,48, 0.08)');
      orb2.addColorStop(1,   'rgba(166,139,48, 0.00)');
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, W, H);

      // Subtle warm orb left
      const ox3 = W * 0.15 + Math.sin(t * 0.0005) * W * 0.06;
      const oy3 = H * 0.6  + Math.cos(t * 0.0007) * H * 0.05;
      const orb3 = ctx.createRadialGradient(ox3, oy3, 0, ox3, oy3, W * 0.22);
      orb3.addColorStop(0,   'rgba(201,169,75, 0.06)');
      orb3.addColorStop(1,   'rgba(201,169,75, 0.00)');
      ctx.fillStyle = orb3;
      ctx.fillRect(0, 0, W, H);

      t++;
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isLowEnd]);

  return null;
}
