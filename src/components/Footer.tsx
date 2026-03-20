import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="relative z-10 border-t border-border/30 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm">
          {/* Brand */}
          <div>
            <h4 className="font-gothic text-xl text-candle-amber mb-3">The Altar of the Circuit</h4>
            <p className="text-muted-foreground text-xs leading-relaxed mono">
              A spiritual machine for self-reflection. Look inward, trace the circuits of memory.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h5 className="mono text-xs tracking-widest text-foreground/80 uppercase mb-3">Contact</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://www.linkedin.com/in/sinaida/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ghost-teal hover:text-foreground transition-colors"
                  >
                    Sinaida on LinkedIn ↗
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="mono text-xs tracking-widest text-foreground/80 uppercase mb-3">Legal</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setShowPrivacy(true)}
                    className="text-ghost-teal hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-8 border-t border-border/20 space-y-2">
          <div className="mono text-xs text-candle-amber/40 tracking-widest uppercase">
            The Altar of the Circuit — v0.1 — © {new Date().getFullYear()}
          </div>
          <div className="mono text-xs text-foreground/20">
            Made with good vibes by{" "}
            <a href="https://sinaida.eu/" target="_blank" rel="noopener noreferrer" className="text-ghost-teal/50 hover:text-ghost-teal transition-colors">
              Sinaida
            </a>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={() => setShowPrivacy(false)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-screen rounded-lg p-8 max-w-lg w-full relative z-10 bloom-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-gothic text-xl text-ghost-teal">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="mono text-xs text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="text-foreground/70 text-sm leading-relaxed space-y-3 mono">
                <p className="mono text-xs tracking-widest text-ghost-teal uppercase mb-4">GDPR Compliant</p>
                <p>
                  The Altar of the Circuit does <strong className="text-foreground">not</strong> collect, store, or transmit any personal data.
                  All reflections and answers remain exclusively in your browser session and are never sent to any server.
                </p>
                <p>
                  No analytics trackers, advertising cookies, or third-party scripts are used.
                  Only essential cookies required for basic site functionality (such as cookie consent preference) are stored locally.
                </p>
                <p>
                  You may clear all local data at any time by clearing your browser's storage.
                  For questions, contact{" "}
                  <a
                    href="https://www.linkedin.com/in/sinaida/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ghost-teal underline underline-offset-2"
                  >
                    Sinaida on LinkedIn
                  </a>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
