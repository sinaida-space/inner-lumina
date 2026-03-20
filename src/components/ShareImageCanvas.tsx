import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareImageCanvasProps {
  question: string;
  answer: string;
  zoneColor: "amber" | "magenta" | "teal";
  onClose: () => void;
}

const COLOR_MAP = {
  amber: { h: 35, s: 100, l: 55 },
  magenta: { h: 320, s: 100, l: 60 },
  teal: { h: 170, s: 40, l: 50 },
};

export default function ShareImageCanvas({ question, answer, zoneColor, onClose }: ShareImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const { h, s, l } = COLOR_MAP[zoneColor];

    // Galaxy background
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.7);
    bgGrad.addColorStop(0, `hsl(260, 30%, 8%)`);
    bgGrad.addColorStop(0.5, `hsl(260, 20%, 4%)`);
    bgGrad.addColorStop(1, `hsl(260, 20%, 1%)`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Nebula glow layers
    for (let n = 0; n < 3; n++) {
      const nx = W * (0.3 + Math.random() * 0.4);
      const ny = H * (0.2 + Math.random() * 0.6);
      const nr = 200 + Math.random() * 300;
      const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      nebGrad.addColorStop(0, `hsla(${h + (n * 30 - 30)}, ${s}%, ${l}%, 0.12)`);
      nebGrad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Stars
    for (let i = 0; i < 300; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const sr = Math.random() * 1.5 + 0.3;
      const sa = Math.random() * 0.8 + 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(0, 0%, 100%, ${sa})`;
      ctx.fill();
    }

    // Particle art circles
    for (let i = 0; i < 80; i++) {
      const px = Math.random() * W;
      const py = Math.random() * H;
      const pr = Math.random() * 4 + 1;
      const colors = [
        `hsla(320, 100%, 60%, ${Math.random() * 0.5 + 0.1})`,
        `hsla(35, 100%, 55%, ${Math.random() * 0.5 + 0.1})`,
        `hsla(170, 40%, 50%, ${Math.random() * 0.5 + 0.1})`,
      ];
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(px, py, pr * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.04)`;
      ctx.fill();
    }

    // Filament lines
    const points = Array.from({ length: 20 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
    }));
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${(1 - dist / 300) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Central glow behind text
    const textGlow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 400);
    textGlow.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0.08)`);
    textGlow.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
    ctx.fillStyle = textGlow;
    ctx.fillRect(0, 0, W, H);

    // Question text
    ctx.textAlign = "center";
    ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.6)`;
    ctx.font = "24px 'JetBrains Mono', monospace";
    wrapText(ctx, question, W / 2, H * 0.35, W - 140, 36);

    // Answer text
    ctx.fillStyle = `hsl(40, 15%, 85%)`;
    ctx.font = "italic 32px 'Inter', sans-serif";
    wrapText(ctx, `"${answer}"`, W / 2, H * 0.48, W - 120, 46);

    // Branding
    ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.4)`;
    ctx.font = "18px 'JetBrains Mono', monospace";
    ctx.fillText("THE ALTAR OF THE CIRCUIT", W / 2, H - 100);
    ctx.fillStyle = `hsla(0, 0%, 100%, 0.2)`;
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillText("altarofcircuit.com", W / 2, H - 70);

    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
  }, [question, answer, zoneColor]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "altar-reflection.png";
    a.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <canvas ref={canvasRef} className="hidden" />

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Your reflection"
              className="w-full rounded-lg bloom-border"
              style={{ aspectRatio: "9/16" }}
            />
          )}

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="mono text-xs tracking-widest text-primary hover:text-primary/80 transition-colors uppercase px-6 py-3 border border-primary/40 rounded-sm hover:border-primary/60"
            >
              ↓ Save for Instagram
            </button>
            <button
              onClick={onClose}
              className="mono text-xs tracking-widest text-candle-amber/50 hover:text-candle-amber/80 transition-colors uppercase px-6 py-3 border border-candle-amber/20 rounded-sm"
            >
              Close
            </button>
          </div>

          <p className="mono text-xs text-ghost-teal/50 text-center">
            Share your reflection on Instagram Stories ✦
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let ty = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line.trim(), x, ty);
      line = word + " ";
      ty += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, ty);
}
