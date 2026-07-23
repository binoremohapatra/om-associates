import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LuxuryBackground — Premium charcoal + gold light rays
 * Pure CSS/Canvas — no WebGL dependency
 */
export default function LuxuryBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Canvas animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* SVG noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Rotating light rays */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          animation: 'rayRotate 40s linear infinite',
          opacity: 0.03,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: '50%',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(201,169,75,0.8), transparent)',
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Floating gold dust particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            background: `rgba(201,169,75,${0.2 + (i % 4) * 0.1})`,
            left: `${8 + i * 7.5}%`,
            top: `${10 + (i * 13) % 80}%`,
          }}
          animate={{
            y:       [-6, 6, -6],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Bottom vignette fade */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(to bottom, transparent, rgba(13,13,15,0.6))',
        }}
      />
    </div>
  );
}
