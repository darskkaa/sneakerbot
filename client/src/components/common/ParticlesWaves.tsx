import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseY: number;
  vx: number;
  size: number;
  speed: number;
  freq: number;
  phase: number;
  alpha: number;
  colorIdx: number;
  trail: Array<{ x: number; y: number }>;
}

// Palette: indigo-weighted with emerald and violet accents
const COLORS: [number, number, number][] = [
  [99, 102, 241],   // indigo (primary)
  [99, 102, 241],   // indigo (extra weight)
  [139, 92, 246],   // violet
  [99, 102, 241],   // indigo
  [16, 185, 129],   // emerald
  [129, 140, 248],  // indigo-light
];

export default function ParticlesWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = window.innerWidth < 768 ? 45 : 85;

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      baseY: canvas.height * (0.12 + Math.random() * 0.76),
      y: 0,
      vx: 0.12 + Math.random() * 0.30,
      size: 0.8 + Math.random() * 2.0,
      speed: 0.20 + Math.random() * 0.38,
      freq: 0.0025 + Math.random() * 0.0055,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.45,
      colorIdx: Math.floor(Math.random() * COLORS.length),
      trail: [],
    });

    for (let i = 0; i < count; i++) {
      const p = spawn();
      // Scatter initial positions so they don't all start at x=0
      p.x = Math.random() * canvas.width;
      particles.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      for (const p of particles) {
        // Dual-frequency wave for natural, non-repetitive motion
        p.y =
          p.baseY +
          Math.sin(p.x * p.freq + time * p.speed + p.phase) * 52 +
          Math.sin(p.x * p.freq * 1.8 + time * p.speed * 0.55 + p.phase * 0.7) * 20;

        p.x += p.vx;

        if (p.trail.length > 14) p.trail.shift();
        p.trail.push({ x: p.x, y: p.y });

        // Recycle particle when it exits the right edge
        if (p.x > canvas.width + 25) {
          Object.assign(p, spawn());
          p.x = -20;
          p.trail = [];
        }

        const [r, g, b] = COLORS[p.colorIdx];

        // Trail
        for (let t = 1; t < p.trail.length; t++) {
          const progress = t / p.trail.length;
          const a = progress * p.alpha * 0.38;
          ctx.beginPath();
          ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y);
          ctx.lineTo(p.trail[t].x, p.trail[t].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = p.size * 0.5 * progress;
          ctx.stroke();
        }

        // Soft glow halo
        const haloR = p.size * 6;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
        grd.addColorStop(0, `rgba(${r},${g},${b},${p.alpha * 0.22})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.fill();
      }

      // Connecting lines between nearby particles
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const d = Math.sqrt(d2);
            const a = (1 - d / 120) * 0.09;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
