import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  zone: number; // 0=noise, 1=lattice, 2=convergence
  speed: number;
}

const COLORS = {
  magenta: "320, 100%, 60%",
  amber: "35, 100%, 55%",
  teal: "170, 40%, 50%",
};

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const count = Math.min(200, Math.floor(window.innerWidth * 0.15));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const colorKeys = Object.keys(COLORS) as (keyof typeof COLORS)[];
      const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: COLORS[colorKey],
        zone: Math.floor(Math.random() * 3),
        speed: Math.random() * 0.5 + 0.2,
      });
    }
    particlesRef.current = particles;

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let time = 0;
    const animate = () => {
      time += 0.005;
      const progress = scrollRef.current; // 0 to 1
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Zone behavior based on scroll
        if (progress < 0.33) {
          // Zone 1: Random drift (noise)
          p.x += p.vx + Math.sin(time + p.baseY * 0.01) * 0.3;
          p.y += p.vy + Math.cos(time + p.baseX * 0.01) * 0.3;
        } else if (progress < 0.66) {
          // Zone 2: Lattice formation
          const lerpFactor = (progress - 0.33) / 0.33;
          const gridX = Math.round(p.baseX / 80) * 80;
          const gridY = Math.round(p.baseY / 80) * 80;
          p.x += (gridX - p.x) * 0.02 * lerpFactor + p.vx * (1 - lerpFactor);
          p.y += (gridY - p.y) * 0.02 * lerpFactor + p.vy * (1 - lerpFactor);
          // Subtle oscillation
          p.x += Math.sin(time * 2 + p.baseY * 0.05) * 0.5 * (1 - lerpFactor);
          p.y += Math.cos(time * 2 + p.baseX * 0.05) * 0.5 * (1 - lerpFactor);
        } else {
          // Zone 3: Spherical convergence
          const lerpFactor = (progress - 0.66) / 0.34;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const angle = Math.atan2(p.baseY - cy, p.baseX - cx) + time * 0.3;
          const radius = 150 * (1 - lerpFactor * 0.6);
          const targetX = cx + Math.cos(angle) * radius;
          const targetY = cy + Math.sin(angle) * radius;
          p.x += (targetX - p.x) * 0.03;
          p.y += (targetY - p.y) * 0.03;
        }

        // Wrap
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Draw
        const glowAlpha = p.alpha * (0.6 + Math.sin(time * 3 + p.baseX) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, ${glowAlpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, ${glowAlpha * 0.15})`;
        ctx.fill();
      }

      // Draw filament connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = progress > 0.33 ? 120 : 80;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(320, 100%, 60%, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
