export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/30 mt-20">
      <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-12 text-sm font-body">
        {/* Brand */}
        <div>
          <h4 className="font-fraunces text-lg text-candle-amber mb-3">The Altar of the Circuit</h4>
          <p className="text-muted-foreground/60 text-xs leading-relaxed">
            A spiritual machine for self-reflection. Look inward, trace the circuits of memory.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h5 className="mono text-xs tracking-widest text-foreground/70 uppercase mb-3">Contact</h5>
          <ul className="space-y-2 text-muted-foreground/60 text-xs">
            <li>
              <a href="mailto:hello@altarofcircuit.com" className="hover:text-foreground/80 transition-colors">
                hello@altarofcircuit.com
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground/80 transition-colors">
                Twitter / X
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h5 className="mono text-xs tracking-widest text-foreground/70 uppercase mb-3">Legal</h5>
          <ul className="space-y-2 text-muted-foreground/60 text-xs">
            <li>
              <a href="#privacy" className="hover:text-foreground/80 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" className="hover:text-foreground/80 transition-colors">
                Terms of Use
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Privacy section */}
      <div id="privacy" className="max-w-4xl mx-auto px-6 pb-12">
        <div className="glass-screen rounded-lg p-6">
          <h5 className="mono text-xs tracking-widest text-ghost-teal uppercase mb-3">Privacy Policy — GDPR</h5>
          <div className="text-muted-foreground/60 text-xs leading-relaxed space-y-2">
            <p>
              The Altar of the Circuit does <strong className="text-foreground/70">not</strong> collect, store, or transmit any personal data.
              All reflections and answers remain exclusively in your browser session and are never sent to any server.
            </p>
            <p>
              No analytics trackers, advertising cookies, or third-party scripts are used.
              Only essential cookies required for basic site functionality (such as cookie consent preference) are stored locally.
            </p>
            <p>
              You may clear all local data at any time by clearing your browser's storage.
              For questions, contact us at hello@altarofcircuit.com.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center py-8 border-t border-border/20">
        <div className="mono text-xs text-muted-foreground/30 tracking-widest uppercase">
          The Altar of the Circuit — v0.1 — © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
