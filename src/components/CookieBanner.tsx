import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="glass-screen rounded-lg max-w-2xl mx-auto p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-foreground/70 text-sm font-body flex-1">
              This site uses essential cookies only for functionality. No personal data is stored or shared.
              See our{" "}
              <a href="#privacy" className="text-ghost-teal underline underline-offset-2 hover:text-ghost-teal/80">
                Privacy Policy
              </a>.
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleReject}
                className="mono text-xs tracking-widest text-muted-foreground/60 hover:text-foreground/80 transition-colors uppercase px-4 py-2 border border-border-low rounded-sm"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="mono text-xs tracking-widest text-primary hover:text-primary/80 transition-colors uppercase px-4 py-2 border border-primary/30 rounded-sm"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
