import { useCallback, useEffect, useState } from 'react';

export type Mode = 'boot' | 'terminal' | 'gui';
const MODES: Mode[] = ['boot', 'terminal', 'gui'];
const STORAGE_KEY = 'bootChoice';

function readHashMode(): Mode | null {
  const raw = window.location.hash.replace(/^#/, '');
  return (MODES as string[]).includes(raw) ? (raw as Mode) : null;
}

function initialMode(): Mode {
  const fromHash = readHashMode();
  if (fromHash) return fromHash;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (MODES as string[]).includes(stored)) return stored as Mode;
  return 'boot';
}

/** Single source of truth for the active top-level mode. */
export function useHashMode() {
  const [mode, setModeState] = useState<Mode>(initialMode);

  // React to manual hash edits / back-forward, but only for known mode tokens.
  useEffect(() => {
    const onHashChange = () => {
      const m = readHashMode();
      if (m) setModeState(m);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    // 'boot' is the menu: clear the durable choice so a refresh re-shows it.
    if (next === 'boot') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
    if (readHashMode() !== next) window.location.hash = next;
  }, []);

  return { mode, setMode };
}
