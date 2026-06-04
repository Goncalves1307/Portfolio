import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../hooks/useHashMode';

type Entry = { id: Exclude<Mode, 'boot'>; label: string; hint: string };

const ENTRIES: Entry[] = [
  { id: 'terminal', label: 'diogo.dev terminal (phosphor)', hint: 'interactive shell — recommended' },
  { id: 'gui', label: 'diogo.dev desktop (graphical)', hint: 'classic portfolio site' },
];

const COUNTDOWN_START = 5;

type BootMenuProps = { onSelect: (mode: Exclude<Mode, 'boot'>) => void };

export default function BootMenu({ onSelect }: BootMenuProps) {
  const [selected, setSelected] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(COUNTDOWN_START);
  const reduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  // Auto-boot countdown (disabled under reduced motion — user chooses explicitly).
  useEffect(() => {
    if (reduced) { setCountdown(null); return; }
    if (countdown === null) return;
    if (countdown <= 0) { onSelect(ENTRIES[selected].id); return; }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, reduced, onSelect, selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setCountdown(null); // any key cancels auto-boot
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => (s + 1) % ENTRIES.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => (s - 1 + ENTRIES.length) % ENTRIES.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(ENTRIES[selected].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, onSelect]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-[#010409] font-mono text-[#c9d1d9] px-4">
      <div className="text-center">
        <p className="text-[#56d364]">GNU GRUB  version 3.0.1-phosphor</p>
        <p className="text-[#8b949e] text-sm">Use ↑ and ↓ to select an entry. Press Enter to boot.</p>
      </div>

      <ul className="w-full max-w-xl border border-[#30363d] rounded-md overflow-hidden">
        {ENTRIES.map((entry, i) => (
          <li key={entry.id}>
            <button
              onMouseEnter={() => { setSelected(i); setCountdown(null); }}
              onClick={() => onSelect(entry.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === selected ? 'bg-[#39d353] text-[#010409]' : 'hover:bg-[#161b22]'
              }`}
            >
              <span aria-hidden>{i === selected ? '▸' : ' '}</span>
              <span className="flex-1">
                {entry.label}
                <span className={`block text-xs ${i === selected ? 'text-[#06310f]' : 'text-[#8b949e]'}`}>
                  {entry.hint}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-[#8b949e] text-sm h-5" aria-live="polite">
        {countdown !== null
          ? `The highlighted entry will be booted automatically in ${countdown}s.`
          : '↑/↓ select · Enter boot'}
      </p>
    </div>
  );
}
