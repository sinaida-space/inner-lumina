import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Web Audio API ambient drone generator — no external files needed
// Creates layered oscillators that shift based on scroll position

interface DroneLayer {
  osc: OscillatorNode;
  gain: GainNode;
  baseFreq: number;
}

export default function AmbientDrone() {
  const ctxRef = useRef<AudioContext | null>(null);
  const layersRef = useRef<DroneLayer[]>([]);
  const masterRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const scrollRef = useRef(0);

  const initAudio = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Reverb-like effect via delay
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 1200;
    master.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(ctx.destination);

    // LFO for subtle volume modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    lfoRef.current = lfo;

    // Three drone layers — each zone has a fundamental
    const frequencies = [
      { freq: 55, type: "sine" as OscillatorType },    // Zone 1: Past (deep A)
      { freq: 82.4, type: "sine" as OscillatorType },   // Zone 2: Connection (low E)
      { freq: 110, type: "triangle" as OscillatorType }, // Zone 3: Legacy (A octave)
    ];

    // Sub-harmonics for richness
    const subFreqs = [
      { freq: 27.5, type: "sine" as OscillatorType },
      { freq: 41.2, type: "sine" as OscillatorType },
      { freq: 55, type: "sine" as OscillatorType },
    ];

    const layers: DroneLayer[] = [];

    frequencies.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = f.type;
      osc.frequency.value = f.freq;
      gain.gain.value = i === 0 ? 0.5 : 0;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      layers.push({ osc, gain, baseFreq: f.freq });
    });

    subFreqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = f.type;
      osc.frequency.value = f.freq;
      gain.gain.value = i === 0 ? 0.3 : 0;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      layers.push({ osc, gain, baseFreq: f.freq });
    });

    layersRef.current = layers;
    setPlaying(true);
  }, []);

  // Scroll listener — crossfade between drone layers
  useEffect(() => {
    if (!playing) return;

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      const ctx = ctxRef.current;
      const layers = layersRef.current;
      if (!ctx || layers.length < 6) return;

      const p = scrollRef.current;
      const now = ctx.currentTime;

      // Zone crossfade: 0–0.33 = Past, 0.33–0.66 = Connection, 0.66–1 = Legacy
      // Main tones
      const zone1 = Math.max(0, 1 - p * 3);
      const zone2 = Math.max(0, p < 0.5 ? (p - 0.2) * 3.3 : (0.8 - p) * 3.3);
      const zone3 = Math.max(0, (p - 0.5) * 2);

      layers[0].gain.gain.linearRampToValueAtTime(zone1 * 0.5, now + 0.5);
      layers[1].gain.gain.linearRampToValueAtTime(zone2 * 0.5, now + 0.5);
      layers[2].gain.gain.linearRampToValueAtTime(zone3 * 0.4, now + 0.5);

      // Sub tones follow
      layers[3].gain.gain.linearRampToValueAtTime(zone1 * 0.3, now + 0.8);
      layers[4].gain.gain.linearRampToValueAtTime(zone2 * 0.3, now + 0.8);
      layers[5].gain.gain.linearRampToValueAtTime(zone3 * 0.25, now + 0.8);

      // Slight detuning based on scroll for organic feel
      layers[0].osc.frequency.linearRampToValueAtTime(
        layers[0].baseFreq + Math.sin(p * Math.PI * 2) * 1.5, now + 0.3
      );
      layers[1].osc.frequency.linearRampToValueAtTime(
        layers[1].baseFreq + Math.cos(p * Math.PI * 3) * 2, now + 0.3
      );
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [playing]);

  // Mute toggle
  useEffect(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;
    master.gain.linearRampToValueAtTime(muted ? 0 : 0.12, ctx.currentTime + 0.3);
  }, [muted]);

  // Cleanup
  useEffect(() => {
    return () => {
      layersRef.current.forEach((l) => {
        try { l.osc.stop(); } catch {}
      });
      try { lfoRef.current?.stop(); } catch {}
      ctxRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence mode="wait">
        {!playing ? (
          <motion.button
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={initAudio}
            className="bloom-border rounded-full px-4 py-2 mono text-xs tracking-widest text-foreground/50 hover:text-foreground/80 transition-colors uppercase bg-card/80 backdrop-blur-sm"
          >
            ♫ Enable Ambient
          </motion.button>
        ) : (
          <motion.button
            key="toggle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setMuted(!muted)}
            className="bloom-border rounded-full w-10 h-10 flex items-center justify-center mono text-sm text-foreground/50 hover:text-foreground/80 transition-colors bg-card/80 backdrop-blur-sm"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "♫"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
