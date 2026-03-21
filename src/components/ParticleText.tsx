import { useEffect, useRef, useState } from "react";

interface ParticleTextProps {
  text: string;
  color: "amber" | "magenta" | "teal";
  className?: string;
}

const COLOR_HSL: Record<string, [number, number, number]> = {
  amber: [35, 100, 55],
  magenta: [320, 100, 60],
  teal: [170, 40, 50],
};

interface TextParticle {
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
  delay: number;
  settled: boolean;
}

export default function ParticleText({ text, color, className = "" }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const particlesRef = useRef<TextParticle[]>([]);
  const sampledRef = useRef(false);
  const [dimensions, setDimensions] = useState({ w: 800, h: 120 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        // Scale height based on text size
        const h = Math.max(80, Math.min(160, w * 0.15));
        setDimensions({ w, h });
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const { w, h } = dimensions;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Sample text pixels to create particle positions
    const fontSize = Math.min(w * 0.1, 72);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = `${fontSize}px CloisterBlack, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const particles: TextParticle[] = [];
    const step = Math.max(2, Math.floor(3 / dpr));

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          const px = x / dpr;
          const py = y / dpr;
          // Scatter from random positions
          const angle = Math.random() * Math.PI * 2;
          const dist = 200 + Math.random() * 400;
          particles.push({
            targetX: px,
            targetY: py,
            x: px + Math.cos(angle) * dist,
            y: py + Math.sin(angle) * dist,
            size: Math.random() * 2 + 0.8,
            alpha: Math.random() * 0.5 + 0.5,
            delay: Math.random() * 0.4,
            settled: false,
          });
        }
      }
    }

    particlesRef.current = particles;
    sampledRef.current = true;
  }, [text, dimensions]);

  // Scroll-driven animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d")!;
    const [h, s, l] = COLOR_HSL[color];
    const { w, h: ch } = dimensions;

    const updateProgress = () => {
      const rect = container.getBoundingClientRect();
      const viewH = window.innerHeight;
      const centerY = rect.top + rect.height / 2;
      const screenCenter = viewH / 2;
      const distFromCenter = Math.abs(centerY - screenCenter);
      const threshold = viewH * 0.7;
      
      // Form particles as element enters
      const enterProgress = 1 - (rect.top / (viewH * 0.7));
      // Stay fully formed while within 70% of screen center
      if (distFromCenter < threshold && enterProgress >= 1) {
        progressRef.current = 1;
      } else if (centerY < screenCenter - threshold) {
        // Dissolve when scrolled well past
        const exitRaw = 1 - (screenCenter - threshold - centerY) / (viewH * 0.3);
        progressRef.current = Math.max(0, Math.min(1, exitRaw));
      } else {
        progressRef.current = Math.max(0, Math.min(1, enterProgress));
      }
    };

    let time = 0;
    const animate = () => {
      updateProgress();
      time += 0.016;
      const progress = progressRef.current;
      const dpr = Math.min(window.devicePixelRatio, 2);
      
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, ch);

      const particles = particlesRef.current;
      for (const p of particles) {
        const adjustedProgress = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        
        // Eased progress
        const ease = adjustedProgress < 0.5 
          ? 4 * adjustedProgress * adjustedProgress * adjustedProgress
          : 1 - Math.pow(-2 * adjustedProgress + 2, 3) / 2;

        // Interpolate position
        const scatterX = p.targetX + Math.cos(time * 0.5 + p.targetX * 0.1) * (1 - ease) * 100;
        const scatterY = p.targetY + Math.sin(time * 0.7 + p.targetY * 0.1) * (1 - ease) * 100;
        
        const currentX = scatterX + (p.targetX - scatterX) * ease;
        const currentY = scatterY + (p.targetY - scatterY) * ease;

        const alpha = p.alpha * ease;
        
        if (alpha < 0.01) continue;

        // Glow
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha * 0.08})`;
        ctx.fill();

        // Core particle  
        const flicker = 0.7 + Math.sin(time * 4 + p.targetX * 0.3) * 0.3;
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha * flicker})`;
        ctx.fill();
      }

      // Draw some free-floating ambient particles when text isn't fully formed
      if (progress < 0.95) {
        const freeCount = Math.floor((1 - progress) * 30);
        for (let i = 0; i < freeCount; i++) {
          const fx = (Math.sin(time * 0.3 + i * 7.3) * 0.5 + 0.5) * w;
          const fy = (Math.cos(time * 0.4 + i * 3.1) * 0.5 + 0.5) * ch;
          const fAlpha = (1 - progress) * 0.3 * (0.5 + Math.sin(time * 2 + i) * 0.5);
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${fAlpha})`;
          ctx.fill();
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [color, dimensions]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full pointer-events-none"
        style={{ height: dimensions.h }}
      />
    </div>
  );
}
