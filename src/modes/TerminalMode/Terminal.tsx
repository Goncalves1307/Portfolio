type TerminalProps = { onExit: () => void };

export default function Terminal({ onExit }: TerminalProps) {
  return (
    <div className="terminal-root flex flex-col items-start gap-3 p-6">
      <p className="t-accent t-banner">diogo.dev terminal — booting soon…</p>
      <p className="t-dim">Engine arrives in Phase 2.</p>
      <button onClick={onExit} className="t-link" aria-label="Back to boot menu">
        ⏻ exit to boot menu
      </button>
    </div>
  );
}
