import { useState } from "react";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: string;
  index: number;
  zoneColor: "amber" | "magenta" | "teal";
  onAnswer: (answer: string) => void;
}

const glowClass = {
  amber: "text-glow-amber",
  magenta: "text-glow-magenta",
  teal: "text-glow-teal",
};

const oracleTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function QuestionCard({ question, index, zoneColor, onAnswer }: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (answer.trim()) {
      setSubmitted(true);
      onAnswer(answer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ ...oracleTransition, delay: index * 0.1 }}
      className="relative py-16 px-6 max-w-2xl mx-auto"
    >
      <div className="mono text-xs tracking-widest text-muted-foreground mb-6 uppercase opacity-50">
        Fragment {String(index + 1).padStart(2, "0")}
      </div>

      <h3
        className={`font-fraunces text-2xl md:text-3xl leading-relaxed mb-10 ${glowClass[zoneColor]} text-foreground`}
      >
        {question}
      </h3>

      {!submitted ? (
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
            rows={1}
            className="input-line w-full text-foreground text-lg pb-3 resize-none placeholder:text-muted-foreground/40 font-body"
          />
          {answer.trim() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSubmit}
              className="mono text-xs tracking-widest text-primary mt-4 opacity-70 hover:opacity-100 transition-opacity uppercase"
            >
              ↵ Commit to the machine
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={oracleTransition}
          className="glass-screen rounded-lg p-6"
        >
          <p className="text-foreground/80 font-body text-sm leading-relaxed italic">
            "{answer}"
          </p>
          <div className="mono text-xs text-ghost-teal mt-3 opacity-60">
            ✓ Integrated into constellation
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
