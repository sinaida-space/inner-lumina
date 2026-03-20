import { useEffect, useRef, useCallback } from "react";

interface StarButtonProps {
  color: "amber" | "magenta" | "teal";
  onClick: () => void;
  disabled?: boolean;
}

const COLOR_HSL = {
  amber: "35, 100%, 55%",
  magenta: "320, 100%, 60%",
  teal: "170, 40%, 50%",
};

export default function StarButton({ color, onClick, disabled }: StarButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const hoverRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = 200;
    canvas.width = size * 2;
    canvas.height = size * 2;
    const cx = size;
    const cy = size;

    // Star particles
    const particles: { angle: number; dist: number; size: number; speed: number; wobble: number; wobbleSpeed: number }[] = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({
        angle,
        dist: 30 + Math.random() * 50,
        size: Math.random() * 2.5 + 1,
        speed: (Math.random() - 0.5) * 0.01,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hScale = hoverRef.current ? 1.15 : 1;
      const hsl = COLOR_HSL[color];

      // Draw star shape with particles
      for (const p of particles) {
        p.wobble += p.wobbleSpeed;
        p.angle += p.speed;

        // Star radius modulation (5-pointed star)
        const starFactor = Math.cos(p.angle * 5) * 0.4 + 0.6;
        const wobbleOffset = Math.sin(p.wobble) * 8;
        const r = (p.dist * starFactor + wobbleOffset) * hScale;

        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hsl}, 0.08)`;
        ctx.fill();

        // Particle
        const flicker = 0.5 + Math.sin(time * 3 + p.angle * 7) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hsl}, ${0.4 + flicker * 0.6})`;
        ctx.fill();
      }

      // Central glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * hScale);
      gradient.addColorStop(0, `hsla(${hsl}, 0.3)`);
      gradient.addColorStop(1, `hsla(${hsl}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, 40 * hScale, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [color]);

  const handleMouseEnter = useCallback(() => { hoverRef.current = true; }, []);
  const handleMouseLeave = useCallback(() => { hoverRef.current = false; }, []);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-[200px] h-[200px] cursor-pointer transition-transform duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-default group"
      aria-label="Reveal a question"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <span className="absolute inset-0 flex items-center justify-center mono text-xs tracking-widest text-candle-amber/60 group-hover:text-candle-amber transition-colors uppercase">
        Invoke
      </span>
    </button>
  );
}
