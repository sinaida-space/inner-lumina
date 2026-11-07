export default function Footer() {
  return (
    <>
      <footer className="relative z-10 border-t border-border/30 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm">
          {/* Brand */}
          <div>
            <h4 className="font-gothic text-xl text-candle-amber mb-3">The Altar of the Circuit</h4>
            <p className="text-foreground/50 text-xs leading-relaxed mono">
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
                  <a
                    href={`${import.meta.env.BASE_URL}privacy.html`}
                    className="text-ghost-teal hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-8 border-t border-border/20 space-y-2">
          <div className="mono text-xs text-foreground/30 tracking-widest uppercase">
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
    </>
  );
}
