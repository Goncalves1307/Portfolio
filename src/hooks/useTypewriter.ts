import { useCallback, useEffect, useRef, useState } from 'react';
import type { OutputLine } from '../terminal/types';

function reducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Total characters across all lines, counting one '\n' between lines. */
export function totalChars(lines: OutputLine[]): number {
  let n = 0;
  for (const ln of lines) {
    for (const tok of ln) n += tok.text.length;
    n += 1;
  }
  return n;
}

/**
 * Reveals `lines` character-by-character. Returns the count of characters
 * currently visible, plus `skip()` to reveal everything immediately and a
 * `done` flag. Under reduced motion it starts fully revealed.
 */
export function useTypewriter(lines: OutputLine[], cps = 240) {
  const total = totalChars(lines);
  const [visible, setVisible] = useState(() => (reducedMotion() ? total : 0));
  const raf = useRef<number | null>(null);
  const startTs = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion()) { setVisible(total); return; }
    setVisible(0);
    startTs.current = null;
    const step = (ts: number) => {
      if (startTs.current === null) startTs.current = ts;
      const elapsed = (ts - startTs.current) / 1000;
      const next = Math.min(total, Math.floor(elapsed * cps));
      setVisible(next);
      if (next < total) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [lines, total, cps]);

  const skip = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setVisible(total);
  }, [total]);

  return { visible, total, done: visible >= total, skip };
}

/**
 * Slice a list of lines to the first `count` characters, preserving tokens.
 * Returns the lines that should currently render.
 */
export function sliceLines(lines: OutputLine[], count: number): OutputLine[] {
  if (count <= 0) return [];
  const out: OutputLine[] = [];
  let remaining = count;
  for (const ln of lines) {
    if (remaining <= 0) break;
    const newLine: OutputLine = [];
    for (const tok of ln) {
      if (remaining <= 0) break;
      if (tok.text.length <= remaining) {
        newLine.push(tok);
        remaining -= tok.text.length;
      } else {
        newLine.push({ ...tok, text: tok.text.slice(0, remaining) });
        remaining = 0;
      }
    }
    out.push(newLine);
    remaining -= 1; // newline
  }
  return out;
}
