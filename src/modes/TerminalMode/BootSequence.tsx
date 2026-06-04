import { useEffect, useRef, useState } from 'react';

const SERVICES = [
  'Mounting /home/diogo',
  'Starting curiosity.service',
  'Starting Coffee Daemon ☕',
  'Loading Full-Stack modules',
  'Starting Developer (UMAIA · Worten)',
  'Reticulating splines',
];
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

type BootSequenceProps = { onDone: () => void };

function reducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function BootSequence({ onDone }: BootSequenceProps) {
  const [shown, setShown] = useState(0);   // services revealed
  const [pct, setPct] = useState(0);       // progress bar
  const [spin, setSpin] = useState(0);     // spinner frame
  const done = useRef(false);

  const finish = () => { if (!done.current) { done.current = true; onDone(); } };

  // Skip on any key/click.
  useEffect(() => {
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  });

  useEffect(() => {
    if (reducedMotion()) { setShown(SERVICES.length); setPct(100); const id = setTimeout(finish, 50); return () => clearTimeout(id); }
    const timers: number[] = [];
    SERVICES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setShown(i + 1), 250 * (i + 1)));
    });
    const afterServices = 250 * (SERVICES.length + 1);
    const spinId = window.setInterval(() => setSpin((s) => (s + 1) % SPINNER.length), 90);
    const endId = window.setTimeout(finish, afterServices + 1700);
    timers.push(spinId, endId);
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fill the progress bar only once all services are shown, so the fill is visible.
  useEffect(() => {
    if (reducedMotion()) return;
    if (shown < SERVICES.length) return;
    const barId = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) { clearInterval(barId); return 100; }
        return Math.min(100, p + 7);
      });
    }, 70);
    return () => clearInterval(barId);
  }, [shown]);

  const cells = Math.round(pct / 12.5); // 8 cells
  const bar = '■'.repeat(cells) + '·'.repeat(8 - cells);

  return (
    <div className="terminal-root flex flex-col gap-1 p-6 font-mono">
      <p className="t-dim">[ 0.000000 ] booting diogo.dev kernel 3.0.1-phosphor</p>
      {SERVICES.slice(0, shown).map((s) => (
        <p key={s}><span className="t-accent">[  OK  ]</span> <span className="t-fg">{s}</span></p>
      ))}
      {shown >= SERVICES.length && (
        <>
          <p className="t-fg">loading portfolio … [{bar}] {pct}%</p>
          <p className="t-fg">
            <span className="t-accent">{pct >= 100 ? '✓' : SPINNER[spin]}</span>{' '}
            {pct >= 100 ? 'welcome aboard' : 'authenticating guest@diogo.dev …'}
          </p>
        </>
      )}
      <p className="t-dim mt-2">press any key to skip</p>
    </div>
  );
}
