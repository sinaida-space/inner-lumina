import { motion } from "framer-motion";
import QuestionReveal from "./QuestionReveal";
import ParticleText from "./ParticleText";

interface ReflectionZoneProps {
  title: string;
  subtitle: string;
  sectorLabel: string;
  questions: string[];
  zoneColor: "amber" | "magenta" | "teal";
  onAnswer: (question: string, answer: string) => void;
  answeredQuestions: Set<string>;
}

const oracleTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function ReflectionZone({
  title,
  subtitle,
  sectorLabel,
  questions,
  zoneColor,
  onAnswer,
  answeredQuestions,
}: ReflectionZoneProps) {
  return (
    <section className="relative min-h-screen py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={oracleTransition}
        className="text-center mb-12 px-6"
      >
        <div className="mono text-xs tracking-[0.3em] text-foreground/50 mb-4 uppercase">
          {sectorLabel}
        </div>

        <ParticleText text={title} color={zoneColor} className="mb-4" />

        <p className="text-foreground/50 mono text-xs max-w-md mx-auto">
          {subtitle}
        </p>

        <div className="filament h-16 mx-auto mt-8 animate-pulse-glow" />
      </motion.div>

      <QuestionReveal
        questions={questions}
        zoneColor={zoneColor}
        onAnswer={onAnswer}
        answeredQuestions={answeredQuestions}
      />

      <div className="filament h-40 mx-auto animate-pulse-glow mt-12" />
    </section>
  );
}
