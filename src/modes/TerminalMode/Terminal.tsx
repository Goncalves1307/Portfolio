import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsciiBanner from './AsciiBanner';
import BootSequence from './BootSequence';
import Prompt from './Prompt';
import { useTypewriter, sliceLines } from '../../hooks/useTypewriter';
import { run, completionNames } from '../../terminal/commands';
import type { OutputLine } from '../../terminal/types';
import { applyTheme } from '../../terminal/themes';
import Hud from './Hud';

type Block = { command: string | null; lines: OutputLine[] };
type TerminalProps = { onExit: () => void };

const CHIPS = ['help', 'about', 'skills', 'projects', 'contact'];

export default function Terminal({ onExit }: TerminalProps) {
  const [phase, setPhase] = useState<'boot' | 'ready'>('boot');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('termTheme') ?? 'green');
  const [matrixOn, setMatrixOn] = useState(false);
  const [crtOn, setCrtOn] = useState(() => localStorage.getItem('termCrt') === '1');

  // Typewriter drives ONLY the most recent block.
  const lastLines = blocks.length ? blocks[blocks.length - 1].lines : [];
  const { visible, done, skip } = useTypewriter(lastLines);

  // Apply phosphor theme + persist.
  useEffect(() => {
    if (rootRef.current) applyTheme(rootRef.current, theme);
    localStorage.setItem('termTheme', theme);
  }, [theme]);

  // Persist CRT preference.
  useEffect(() => { localStorage.setItem('termCrt', crtOn ? '1' : '0'); }, [crtOn]);

  // Auto-scroll to bottom as output reveals.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [visible, blocks, phase]);

  // After boot, seed the first block (auto-run whoami) and focus input.
  const onBootDone = useCallback(() => {
    setPhase('ready');
    const res = run('whoami', { history: [], theme });
    if (res.kind === 'output') setBlocks([{ command: 'whoami', lines: res.lines }]);
    setHistory(['whoami']);
  }, []);

  useEffect(() => {
    if (phase === 'ready') inputRef.current?.focus();
  }, [phase]);

  const handleEffect = useCallback((effect: string, arg?: string) => {
    switch (effect) {
      case 'open-url': if (arg) window.open(arg, '_blank', 'noopener'); break;
      case 'download':
        if (arg) {
          const a = document.createElement('a');
          a.href = arg; a.download = ''; a.click();
        }
        break;
      case 'goto-gui': window.location.hash = 'gui'; break;
      case 'exit': onExit(); break;
      case 'theme': if (arg) setTheme(arg); break;
      case 'matrix': setMatrixOn((m) => !m); break;
      case 'crt': setCrtOn((c) => !c); break;
      default: break;
    }
  }, [onExit]);

  const execute = useCallback((raw: string) => {
    const cmd = raw.trim();
    const res = run(cmd, { history, theme });
    if (cmd) setHistory((h) => [...h, cmd]);
    setHistIdx(null);
    setInput('');

    if (res.kind === 'clear') { setBlocks([]); return; }
    if (res.kind === 'none') { setBlocks((b) => [...b, { command: cmd, lines: [] }]); return; }
    if (res.kind === 'effect') {
      handleEffect(res.effect, res.arg);
      setBlocks((b) => [...b, { command: cmd, lines: res.lines ?? [] }]);
      return;
    }
    setBlocks((b) => [...b, { command: cmd, lines: res.lines }]);
  }, [history, handleEffect]);

  const onSubmit = useCallback(() => {
    if (!done) { skip(); return; }
    execute(input);
  }, [done, skip, input, execute]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setBlocks([]); return; }
    if (!done) { skip(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx === null ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx); setInput(history[idx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === null) return;
      const idx = histIdx + 1;
      if (idx >= history.length) { setHistIdx(null); setInput(''); }
      else { setHistIdx(idx); setInput(history[idx]); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const prefix = input.trim();
      if (!prefix) return;
      const matches = completionNames().filter((n) => n.startsWith(prefix));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        // print the candidates as a block, keep current input
        setBlocks((b) => [...b, { command: null, lines: [matches.map((m) => ({ text: m + '  ', className: 't-accent' }))] }]);
      }
    }
  }, [done, skip, history, histIdx, input]);

  const chips = useMemo(() => CHIPS, []);

  if (phase === 'boot') return <BootSequence onDone={onBootDone} />;

  return (
    <div
      ref={rootRef}
      className={`terminal-root flex flex-col p-4 sm:p-6 ${crtOn ? 't-crt t-crt-flicker' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <Hud
        onTheme={(n) => setTheme(n)}
        matrixOn={matrixOn}
        onToggleMatrix={() => setMatrixOn((m) => !m)}
        crtOn={crtOn}
        onToggleCrt={() => setCrtOn((c) => !c)}
      />
      <AsciiBanner />

      <div className="flex flex-wrap gap-2 my-3">
        {chips.map((c) => (
          <button
            key={c}
            onClick={(e) => { e.stopPropagation(); if (done) execute(c); else skip(); }}
            className="rounded-md border border-[#2ea043]/50 px-3 py-1 text-sm t-accent hover:bg-[#39d353] hover:text-[#010409] transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1">
        {blocks.map((b, bi) => {
          const isLast = bi === blocks.length - 1;
          const renderLines = isLast ? sliceLines(b.lines, visible) : b.lines;
          return (
            <div key={bi} className="mb-2">
              {b.command !== null && (
                <p><span className="t-accent">guest@diogo.dev:~$</span> <span className="t-fg">{b.command}</span></p>
              )}
              {renderLines.map((ln, li) => (
                <p key={li} className="whitespace-pre-wrap break-words">
                  {ln.map((tok, ti) =>
                    tok.href ? (
                      <a key={ti} href={tok.href} target="_blank" rel="noopener noreferrer"
                         onClick={(e) => e.stopPropagation()} className={tok.className}>{tok.text}</a>
                    ) : (
                      <span key={ti} className={tok.className}>{tok.text}</span>
                    ),
                  )}
                  {isLast && !done && li === renderLines.length - 1 && <span className="t-caret">▌</span>}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      <Prompt
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        disabled={!done}
      />
    </div>
  );
}
