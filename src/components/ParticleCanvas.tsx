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
  const mouseRef = useRef({ x: 0, y: 0, active: false });
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

    const count = Math.min(250, Math.floor(window.innerWidth * 0.18));
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
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: COLORS[colorKey],
        speed: Math.random() * 0.5 + 0.2,
      });
    }
    particlesRef.current = particles;

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    let time = 0;
    const animate = () => {
      time += 0.005;
      const progress = scrollRef.current;
      const mouse = mouseRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Mouse interaction — particles are attracted/repelled
        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          const influence = Math.max(0, 1 - mDist / 200);
          // Gentle orbit around cursor
          if (mDist < 200 && mDist > 20) {
            const angle = Math.atan2(mdy, mdx);
            p.x += Math.cos(angle + Math.PI / 2) * influence * 1.5;
            p.y += Math.sin(angle + Math.PI / 2) * influence * 1.5;
            // slight attraction
            p.x += mdx * influence * 0.005;
            p.y += mdy * influence * 0.005;
          } else if (mDist < 20) {
            // repel if too close
            p.x -= mdx * 0.05;
            p.y -= mdy * 0.05;
          }
        }

        // Scroll-based zone behavior
        if (progress < 0.33) {
          p.x += p.vx + Math.sin(time + p.baseY * 0.01) * 0.4;
          p.y += p.vy + Math.cos(time + p.baseX * 0.01) * 0.4;
        } else if (progress < 0.66) {
          const lerpFactor = (progress - 0.33) / 0.33;
          const gridX = Math.round(p.baseX / 80) * 80;
          const gridY = Math.round(p.baseY / 80) * 80;
          p.x += (gridX - p.x) * 0.02 * lerpFactor + p.vx * (1 - lerpFactor);
          p.y += (gridY - p.y) * 0.02 * lerpFactor + p.vy * (1 - lerpFactor);
          p.x += Math.sin(time * 2 + p.baseY * 0.05) * 0.5 * (1 - lerpFactor);
          p.y += Math.cos(time * 2 + p.baseX * 0.05) * 0.5 * (1 - lerpFactor);
        } else {
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

        // Scroll velocity burst — particles scatter on fast scroll
        const scrollSpeed = Math.abs(progress - (scrollRef.current || 0));
        p.x += (Math.random() - 0.5) * scrollSpeed * 20;
        p.y += (Math.random() - 0.5) * scrollSpeed * 20;

        // Wrap
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Draw with enhanced glow
        const glowAlpha = p.alpha * (0.6 + Math.sin(time * 3 + p.baseX) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, ${glowAlpha})`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, ${glowAlpha * 0.1})`;
        ctx.fill();
      }

      // Filament connections
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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
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
