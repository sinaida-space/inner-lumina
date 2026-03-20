import { useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ParticleCanvas from "@/components/ParticleCanvas";
import ReflectionZone from "@/components/ReflectionZone";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ShareImageCanvas from "@/components/ShareImageCanvas";
import ConstellationShareCanvas from "@/components/ConstellationShareCanvas";

const ZONES = [
  {
    title: "The Past",
    subtitle: "Descend into the circuits of memory. The machine remembers what you choose to offer.",
    sectorLabel: "Memory Sector 01 — Deep Reflection",
    zoneColor: "amber" as const,
    questions: [
      "What's a memory that shaped who you are?",
      "What's something you've learned about yourself this year?",
      "When do you feel most like yourself?",
      "How do you usually respond to failure?",
      "What's one belief you've changed in the past few years?",
      "When was the last time you cried, and why?",
      "What emotion do you struggle to express?",
      "What does being 'strong' mean to you?",
      "If your younger self could see you now, what would they think?",
      "What's a challenge you overcame that made you stronger?",
    ],
  },
  {
    title: "Connection",
    subtitle: "The lattice grows between souls. Each filament carries the weight of love.",
    sectorLabel: "Memory Sector 02 — Relationships",
    zoneColor: "magenta" as const,
    questions: [
      "How do you show love to others?",
      "What do you value most in a friendship?",
      "How do you handle conflict in close relationships?",
      "What's one way someone surprised you with kindness?",
      "What do you need from the people closest to you?",
      "When do you feel most connected to others?",
      "What makes you feel truly seen?",
      "What's a boundary that's important to you?",
      "Who do you miss, and why?",
      "What kind of support means the most to you?",
    ],
  },
  {
    title: "Legacy",
    subtitle: "The core converges. Your constellation is taking form in the void.",
    sectorLabel: "Memory Sector 03 — Dreams & Legacy",
    zoneColor: "teal" as const,
    questions: [
      "What's something you've always dreamed of doing?",
      "What would you try if you knew you wouldn't fail?",
      "How do you want to be remembered?",
      "What's a life goal that still scares you?",
      "What legacy do you hope to leave behind?",
      "What does a meaningful life look like to you?",
      "If time and money weren't an issue, how would you spend your days?",
      "What motivates you to keep going during tough times?",
      "What's a dream you haven't told many people about?",
      "What advice would you give to someone going through what you went through?",
    ],
  },
];

const oracleTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
};

// Shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Index() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConstellationShare, setShowConstellationShare] = useState(false);

  // Shuffle questions once on mount using useRef
  const shuffledZones = useRef(
    ZONES.map((zone) => ({ ...zone, questions: shuffleArray(zone.questions) }))
  ).current;

  const handleAnswer = useCallback((question: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  }, []);

  const answeredSet = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const totalAnswered = answeredSet.size;
  const totalQuestions = ZONES.reduce((acc, z) => acc + z.questions.length, 0);

  return (
    <div className="relative min-h-screen bg-background">
      <ParticleCanvas />

      {/* Fixed status bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="mono text-xs tracking-widest text-candle-amber/60 uppercase">
          The Altar of the Circuit
        </div>
        <div className="mono text-xs tracking-widest text-ghost-teal">
          {totalAnswered}/{totalQuestions} Fragments
        </div>
      </div>

      {/* Right filament scroll indicator */}
      <div className="fixed right-2 top-0 bottom-0 z-40 flex items-center">
        <div className="filament h-full animate-pulse-glow" />
      </div>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...oracleTransition, delay: 0.3 }}
        >
          <div className="mono text-xs tracking-[0.4em] text-magenta-pulse mb-8 uppercase animate-pulse-glow">
            System Initialized
          </div>
          <h1 className="font-gothic text-5xl md:text-7xl lg:text-8xl text-glow-amber text-candle-amber mb-6 leading-[1.1]">
            Initialize
            <br />
            Reflection
          </h1>
          <p className="text-muted-foreground mono text-sm max-w-lg mx-auto mb-12">
            The machine is listening. Scroll to descend into the circuitry of self.
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-candle-amber/40 text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* Zones */}
      <div className="relative z-10">
        {shuffledZones.map((zone) => (
          <ReflectionZone
            key={zone.title}
            title={zone.title}
            subtitle={zone.subtitle}
            sectorLabel={zone.sectorLabel}
            questions={zone.questions}
            zoneColor={zone.zoneColor}
            onAnswer={handleAnswer}
            answeredQuestions={answeredSet}
          />
        ))}
      </div>

      {/* Final constellation summary */}
      {totalAnswered > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={oracleTransition}
          className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center py-32"
        >
          <div className="mono text-xs tracking-[0.3em] text-ghost-teal mb-6 uppercase">
            Constellation Complete
          </div>
          <h2 className="font-gothic text-4xl md:text-5xl text-glow-teal text-ghost-teal mb-12">
            Your Soul Map
          </h2>
          <div className="max-w-2xl mx-auto grid gap-4">
            {Object.entries(answers).map(([q, a], i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...oracleTransition, delay: i * 0.05 }}
                className="glass-screen bloom-border hover-bloom rounded-lg p-5 text-left"
              >
                <div className="mono text-xs text-candle-amber/70 mb-2">
                  {q}
                </div>
                <p className="text-foreground/80 text-sm mono italic">
                  "{a}"
                </p>
              </motion.div>
            ))}
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ ...oracleTransition, delay: 0.3 }}
            onClick={() => setShowConstellationShare(true)}
            className="mono text-xs tracking-widest text-candle-amber hover:text-candle-amber/80 transition-colors uppercase px-8 py-4 border border-candle-amber/40 rounded-sm hover:border-candle-amber/60 bloom-border mt-12"
          >
            ✦ Share My Constellation
          </motion.button>
          <div className="mono text-xs text-foreground/40 mt-8">
            {totalAnswered} fragments integrated into the machine
          </div>
        </motion.section>
      )}

      {showConstellationShare && (
        <ConstellationShareCanvas
          answers={answers}
          onClose={() => setShowConstellationShare(false)}
        />
      )}

      <Footer />
      <CookieBanner />
    </div>
  );
}
