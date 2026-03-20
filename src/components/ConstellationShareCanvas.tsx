import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConstellationShareCanvasProps {
  answers: Record<string, string>;
  onClose: () => void;
}

export default function ConstellationShareCanvas({ answers, onClose }: ConstellationShareCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Galaxy background
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.7);
    bgGrad.addColorStop(0, `hsl(260, 30%, 8%)`);
    bgGrad.addColorStop(0.5, `hsl(260, 20%, 4%)`);
    bgGrad.addColorStop(1, `hsl(260, 20%, 1%)`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Nebula glows
    const nebulaColors = [
      { h: 35, s: 100, l: 55 },
      { h: 320, s: 100, l: 60 },
      { h: 170, s: 40, l: 50 },
    ];
    for (let n = 0; n < 5; n++) {
      const nc = nebulaColors[n % nebulaColors.length];
      const nx = W * (0.2 + Math.random() * 0.6);
      const ny = H * (0.1 + Math.random() * 0.8);
      const nr = 150 + Math.random() * 250;
      const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      nebGrad.addColorStop(0, `hsla(${nc.h}, ${nc.s}%, ${nc.l}%, 0.1)`);
      nebGrad.addColorStop(1, `hsla(${nc.h}, ${nc.s}%, ${nc.l}%, 0)`);
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Stars
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const sr = Math.random() * 1.5 + 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(0, 0%, 100%, ${Math.random() * 0.7 + 0.2})`;
      ctx.fill();
    }

    // Constellation lines connecting answer positions
    const entries = Object.entries(answers);
    const positions = entries.map((_, i) => {
      const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
      const rx = 250 + Math.random() * 100;
      const ry = 250 + Math.random() * 100;
      return {
        x: W / 2 + Math.cos(angle) * rx,
        y: 300 + Math.sin(angle) * ry + (i * ((H - 700) / Math.max(entries.length, 1))),
      };
    });

    // Draw constellation lines
    ctx.strokeStyle = `hsla(35, 100%, 55%, 0.15)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 500) {
          ctx.beginPath();
          ctx.moveTo(positions[i].x, positions[i].y);
          ctx.lineTo(positions[j].x, positions[j].y);
          ctx.globalAlpha = (1 - dist / 500) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw constellation nodes
    positions.forEach((pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(35, 100%, 55%, 0.8)`;
      ctx.fill();
      // Glow
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
      glow.addColorStop(0, `hsla(35, 100%, 55%, 0.3)`);
      glow.addColorStop(1, `hsla(35, 100%, 55%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();
    });

    // Title
    ctx.textAlign = "center";
    ctx.fillStyle = `hsl(35, 100%, 55%)`;
    ctx.font = "48px 'Cloister Black', serif";
    ctx.fillText("Your Soul Map", W / 2, 140);

    // Subtitle
    ctx.fillStyle = `hsla(170, 40%, 50%, 0.6)`;
    ctx.font = "16px 'JetBrains Mono', monospace";
    ctx.fillText(`${entries.length} fragments integrated`, W / 2, 190);

    // Answers - laid out vertically
    const startY = 260;
    const maxAnswers = Math.min(entries.length, 12); // cap for readability
    const availableH = H - 360 - startY;
    const slotH = Math.min(availableH / maxAnswers, 130);

    entries.slice(0, maxAnswers).forEach(([q, a], i) => {
      const y = startY + i * slotH;
      const colors = [
        { h: 35, s: 100, l: 55 },
        { h: 320, s: 100, l: 60 },
        { h: 170, s: 40, l: 50 },
      ];
      const c = colors[i % 3];

      // Question
      ctx.textAlign = "center";
      ctx.fillStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.5)`;
      ctx.font = "14px 'JetBrains Mono', monospace";
      wrapText(ctx, q, W / 2, y, W - 140, 18, 2);

      // Answer
      ctx.fillStyle = `hsl(40, 15%, 85%)`;
      ctx.font = "italic 18px 'Inter', sans-serif";
      wrapText(ctx, `"${a}"`, W / 2, y + 40, W - 120, 24, 2);
    });

    if (entries.length > maxAnswers) {
      ctx.fillStyle = `hsla(0, 0%, 100%, 0.3)`;
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.fillText(`+ ${entries.length - maxAnswers} more reflections`, W / 2, startY + maxAnswers * slotH + 20);
    }

    // Branding
    ctx.fillStyle = `hsla(35, 100%, 55%, 0.4)`;
    ctx.font = "18px 'JetBrains Mono', monospace";
    ctx.fillText("THE ALTAR OF THE CIRCUIT", W / 2, H - 100);
    ctx.fillStyle = `hsla(0, 0%, 100%, 0.2)`;
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillText("altarofcircuit.com", W / 2, H - 70);

    setImageUrl(canvas.toDataURL("image/png"));
  }, [answers]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "soul-map-constellation.png";
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
              alt="Your soul map constellation"
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
            Share your constellation on Instagram Stories ✦
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99
) {
  const words = text.split(" ");
  let line = "";
  let ty = y;
  let lineCount = 0;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + "…", x, ty);
        return;
      }
      ctx.fillText(line.trim(), x, ty);
      line = word + " ";
      ty += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, ty);
}
