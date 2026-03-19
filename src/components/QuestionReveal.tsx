import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarButton from "./StarButton";
import ShareImageCanvas from "./ShareImageCanvas";

interface QuestionRevealProps {
  questions: string[];
  zoneColor: "amber" | "magenta" | "teal";
  onAnswer: (question: string, answer: string) => void;
  answeredQuestions: Set<string>;
}

const oracleTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export default function QuestionReveal({ questions, zoneColor, onAnswer, answeredQuestions }: QuestionRevealProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareData, setShareData] = useState<{ question: string; answer: string } | null>(null);

  const remaining = useMemo(
    () => questions.filter((q) => !answeredQuestions.has(q)),
    [questions, answeredQuestions]
  );

  const pickRandom = useCallback(() => {
    if (remaining.length === 0) return;
    const q = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentQuestion(q);
    setAnswer("");
    setSubmitting(false);
  }, [remaining]);

  const handleSubmit = useCallback(() => {
    if (!answer.trim() || !currentQuestion) return;
    setSubmitting(true);
    onAnswer(currentQuestion, answer);
    const q = currentQuestion;
    const a = answer;
    setTimeout(() => {
      setShareData({ question: q, answer: a });
      setCurrentQuestion(null);
      setAnswer("");
      setSubmitting(false);
    }, 800);
  }, [answer, currentQuestion, onAnswer]);

  const colorClasses = {
    amber: "text-candle-amber text-glow-amber",
    magenta: "text-magenta-pulse text-glow-magenta",
    teal: "text-ghost-teal text-glow-teal",
  };

  const allDone = remaining.length === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative px-6">
      <AnimatePresence mode="wait">
        {!currentQuestion ? (
          <motion.div
            key="star"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
            transition={oracleTransition}
            className="flex flex-col items-center gap-6"
          >
            <StarButton color={zoneColor} onClick={pickRandom} disabled={allDone} />
            <div className="mono text-xs tracking-widest text-foreground/50 uppercase">
              {allDone
                ? "All fragments collected"
                : `${remaining.length} fragments remaining`}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, x: 80, scale: 0.9, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -80, scale: 0.9, filter: "blur(12px)" }}
            transition={oracleTransition}
            className="glass-screen bloom-border rounded-lg p-8 md:p-10 max-w-xl w-full relative"
          >
            {/* Particle wind decorative dots */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  background: `hsla(var(--${zoneColor === "amber" ? "candle-amber" : zoneColor === "magenta" ? "magenta-pulse" : "ghost-teal"}), 0.4)`,
                }}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: [0, 0.8, 0], x: [-20, -60] }}
                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
              />
            ))}

            <div className="mono text-xs tracking-widest text-foreground/50 mb-6 uppercase">
              Fragment Revealed
            </div>

            <h3 className={`font-gothic text-2xl md:text-3xl leading-relaxed mb-8 ${colorClasses[zoneColor]}`}>
              {currentQuestion}
            </h3>

            {!submitting ? (
              <div className="relative">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Speak your truth..."
                  rows={3}
                  className="input-line w-full text-foreground text-base pb-3 resize-none mono"
                />
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => { setCurrentQuestion(null); setAnswer(""); }}
                    className="mono text-xs tracking-widest text-foreground/40 hover:text-foreground/70 transition-colors uppercase"
                  >
                    ✕ Dismiss
                  </button>
                  {answer.trim() && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleSubmit}
                      className="mono text-xs tracking-widest text-primary hover:text-primary/80 transition-colors uppercase"
                    >
                      ↵ Commit to the machine
                    </motion.button>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <div className="mono text-xs text-ghost-teal">
                  ✓ Integrated into constellation
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Image Modal */}
      {shareData && (
        <ShareImageCanvas
          question={shareData.question}
          answer={shareData.answer}
          zoneColor={zoneColor}
          onClose={() => setShareData(null)}
        />
      )}
    </div>
  );
}
