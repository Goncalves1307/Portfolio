# Terminal Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as an interactive computer: a GRUB-style boot menu that boots into a phosphor-green Linux-style terminal (default) or the existing site as a "desktop" mode.

**Architecture:** Three top-level modes (`boot` | `terminal` | `gui`) switched by a tiny custom hash router with localStorage persistence — no react-router. The terminal is driven by a typed command **registry** + a **token-stream typewriter** (interruptible, reduced-motion aware). The existing portfolio components are reused as the `gui` mode. See spec: `docs/superpowers/specs/2026-06-04-terminal-portfolio-design.md`.

**Tech Stack:** Vite + React 18 + TypeScript (strict) + Tailwind. No new runtime dependencies. Fonts: JetBrains Mono (terminal) + Inter (existing).

**Verification model (no test runner in this repo):** Each task is verified with `npm run lint` (strict: `noUnusedLocals`/`noUnusedParameters`, so dead/unused code fails) **and** `npm run build`, plus a concrete manual `npm run dev` check for UI tasks. Pure logic (`run()`, tab-completion, theme map) is written as exported pure functions so it stays unit-testable later, but no test harness is added (matches spec §14).

**Conventions for every task:**
- Use markdown checkboxes; complete steps in order.
- `npm run lint` must report **0 errors** before commit. `npm run build` must succeed.
- Commit messages end with the `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer (omitted from the snippets below for brevity — add it).
- Work happens on branch `feat/terminal-portfolio` (already created off `main`).

---

## File Structure

```
src/
  App.tsx                         # MODIFY → mode router (boot | terminal | gui)
  main.tsx                        # unchanged
  index.css                       # MODIFY → terminal layer (vars, scanlines, reduced-motion)
  hooks/
    useHashMode.ts                # CREATE → mode ⇄ hash + localStorage
    useTypewriter.ts              # CREATE → token-stream reveal, interruptible
    useEnable3D.ts                # existing (GUI hero) — unchanged
  modes/
    BootMenu.tsx                  # CREATE → GRUB-style selector
    GuiMode.tsx                   # CREATE → wraps existing Header…Footer + reboot
    TerminalMode/
      Terminal.tsx                # CREATE → orchestrates boot, scrollback, prompt, effects, HUD
      BootSequence.tsx            # CREATE → Linux boot animation
      AsciiBanner.tsx             # CREATE → glowing "diogo" banner
      Prompt.tsx                  # CREATE → input line (presentational)
      Hud.tsx                     # CREATE → clock, swatches, matrix/CRT toggles
      MatrixRain.tsx              # CREATE → canvas rain
      CrtOverlay.tsx              # CREATE → scanlines/vignette/flicker
  terminal/
    types.ts                      # CREATE → Command, RunResult, OutputToken
    content.ts                    # CREATE → exact portfolio data + fake FS + quotes
    commands.ts                   # CREATE → registry + run()
    themes.ts                     # CREATE → phosphor color presets
  components/ data/ context/ three/  # existing — reused by GuiMode
index.html                        # MODIFY → add JetBrains Mono font link
tailwind.config.js                # MODIFY → add mono fontFamily (+ optional green palette port)
```

---

# PHASE 0 — Foundation (fonts + terminal CSS base)

## Task 0: Fonts and terminal base styles

**Files:**
- Modify: `index.html` (add JetBrains Mono link)
- Modify: `tailwind.config.js:90-92` (add `mono` family)
- Modify: `src/index.css` (append terminal layer)

- [ ] **Step 1: Add JetBrains Mono to `index.html`**

Replace the existing Inter `<link href=...>` (lines 14-17) with this combined link that loads both families:

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 2: Add the `mono` font family to `tailwind.config.js`**

Replace the `fontFamily` block (lines 90-92):

```js
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      screens: { xs: '420px' },
```

(The `xs` breakpoint is added here because the banner and HUD use `xs:` variants in later tasks; an undefined screen variant would silently produce no CSS.)

- [ ] **Step 3: Append the terminal style layer to `src/index.css`**

Add at the END of the file:

```css
/* ───────────────────────── Terminal mode ───────────────────────── */
/* Phosphor theme variables live on .terminal-root, fully independent of the
   site-wide dark/light ThemeContext used by the GUI mode. The `theme` command
   and HUD swatches overwrite these vars at runtime (see terminal/themes.ts). */
.terminal-root {
  --term-bg: #0d1117;
  --term-bg-deep: #010409;
  --term-fg: #c9d1d9;
  --term-fg-dim: #8b949e;
  --term-accent: #39d353;
  --term-accent-soft: #56d364;
  --term-glow: rgba(57, 211, 83, 0.55);
  --term-amber: #d29922;
  --term-red: #f85149;
  --term-blue: #58a6ff;

  position: fixed;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(120% 120% at 50% 0%, var(--term-bg) 0%, var(--term-bg-deep) 100%);
  color: var(--term-fg);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: clamp(13px, 1.6vw, 16px);
  line-height: 1.5;
}

/* Phosphor color utility classes used by output tokens */
.t-fg      { color: var(--term-fg); }
.t-dim     { color: var(--term-fg-dim); }
.t-accent  { color: var(--term-accent); text-shadow: 0 0 6px var(--term-glow); }
.t-amber   { color: var(--term-amber); }
.t-red     { color: var(--term-red); }
.t-blue    { color: var(--term-blue); }
.t-link    { color: var(--term-blue); text-decoration: underline; cursor: pointer; }

/* Cursor block + caret */
.t-caret {
  display: inline-block;
  width: 0.6ch;
  background: var(--term-accent);
  box-shadow: 0 0 8px var(--term-glow);
  color: transparent;
}

/* CRT overlay (scanlines + vignette); flicker added only when motion allowed */
.t-crt::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  background:
    repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 3px),
    radial-gradient(120% 120% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%);
}

@keyframes t-flicker { 0%,100% { opacity: 1; } 50% { opacity: 0.94; } }
@keyframes t-blink   { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes t-glow-pulse {
  0%,100% { text-shadow: 0 0 6px var(--term-glow); }
  50%     { text-shadow: 0 0 18px var(--term-glow); }
}

/* Final states are visible by DEFAULT. Motion is opt-in only. */
@media (prefers-reduced-motion: no-preference) {
  .t-caret      { animation: t-blink 1s steps(1) infinite; }
  .t-crt.t-crt-flicker::after { animation: t-flicker 4s ease-in-out infinite; }
  .t-banner     { animation: t-glow-pulse 3s ease-in-out infinite; }
}
```

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint`
Expected: 0 errors.
Run: `npm run build`
Expected: build succeeds (`dist/` produced).

- [ ] **Step 5: Commit**

```bash
git add index.html tailwind.config.js src/index.css
git commit -m "feat(terminal): add JetBrains Mono + phosphor terminal base styles"
```

---

# PHASE 1 — Mode shell (boot menu + GUI mode + router)

## Task 1: `useHashMode` hook

The router recognizes only the three **mode tokens** (`terminal`, `gui`, `boot`). Any other hash (e.g. the GUI's `#about` section links) is ignored, so in-page nav never changes the mode. The durable source of truth is `localStorage["bootChoice"]`.

**Files:**
- Create: `src/hooks/useHashMode.ts`

- [ ] **Step 1: Create the hook**

```ts
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
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useHashMode.ts
git commit -m "feat(terminal): add useHashMode mode router hook"
```

## Task 2: `GuiMode` — wrap the existing site + reboot control

**Files:**
- Create: `src/modes/GuiMode.tsx`

- [ ] **Step 1: Create the component**

This reuses the existing section components verbatim and adds a fixed "reboot" control that returns to the boot menu.

```tsx
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AnimatedCursor from '../components/AnimatedCursor';
import { ThemeProvider } from '../context/ThemeContext';
import { Power } from 'lucide-react';

type GuiModeProps = { onReboot: () => void };

export default function GuiMode({ onReboot }: GuiModeProps) {
  return (
    <ThemeProvider>
      <AnimatedCursor />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
      <button
        onClick={onReboot}
        aria-label="Reboot to boot menu"
        className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-gray-900/80 text-white px-4 py-2 text-sm font-mono shadow-lg backdrop-blur hover:bg-gray-900"
      >
        <Power size={16} /> reboot
      </button>
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/modes/GuiMode.tsx
git commit -m "feat(terminal): add GuiMode wrapping the existing portfolio"
```

## Task 3: `App` router + temporary terminal placeholder

**Files:**
- Modify: `src/App.tsx` (full rewrite)
- Create: `src/modes/TerminalMode/Terminal.tsx` (temporary placeholder; replaced in Task 11)

- [ ] **Step 1: Create a minimal placeholder `Terminal.tsx`**

```tsx
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
```

- [ ] **Step 2: Rewrite `src/App.tsx` as the mode router**

```tsx
import { lazy, Suspense } from 'react';
import { useHashMode } from './hooks/useHashMode';
import BootMenu from './modes/BootMenu';

const Terminal = lazy(() => import('./modes/TerminalMode/Terminal'));
const GuiMode = lazy(() => import('./modes/GuiMode'));

export default function App() {
  const { mode, setMode } = useHashMode();

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#010409]" />}>
      {mode === 'boot' && (
        <BootMenu onSelect={(m) => setMode(m)} />
      )}
      {mode === 'terminal' && <Terminal onExit={() => setMode('boot')} />}
      {mode === 'gui' && <GuiMode onReboot={() => setMode('boot')} />}
    </Suspense>
  );
}
```

- [ ] **Step 3: Verify** — `npm run lint` will FAIL until `BootMenu` exists (Task 4). Proceed to Task 4 first, then run lint/build at the end of Task 4. Do NOT commit yet.

> Note: Tasks 3 and 4 are committed together because `App.tsx` imports `BootMenu`.

## Task 4: `BootMenu` — GRUB-style selector

**Files:**
- Create: `src/modes/BootMenu.tsx`

- [ ] **Step 1: Create the component**

Data-driven entries (extensible for a future `ide` mode), arrow-key nav, Enter to boot, countdown auto-boot to the default. Any key cancels the countdown.

```tsx
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
              <span aria-hidden>{i === selected ? '▸' : ' '}</span>
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
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds.

- [ ] **Step 3: Manual verify**

Run: `npm run dev`. Expected:
- Load `/` → boot menu with two entries, countdown ticking.
- ↑/↓ moves the highlight; countdown stops on first key.
- Enter (or click) on "terminal" → placeholder terminal; "⏻ exit" returns to the menu.
- Enter on "desktop" → existing portfolio renders; "reboot" button bottom-right returns to the menu.
- Refresh while in `#gui` or `#terminal` → lands back in the same mode (localStorage). Refresh after reboot → menu.

- [ ] **Step 4: Commit (Tasks 3 + 4 together)**

```bash
git add src/App.tsx src/modes/BootMenu.tsx src/modes/TerminalMode/Terminal.tsx
git commit -m "feat(terminal): mode router with GRUB boot menu and lazy modes"
```

---

# PHASE 2 — Terminal core (engine + boot + prompt)

## Task 5: `terminal/types.ts`

**Files:**
- Create: `src/terminal/types.ts`

- [ ] **Step 1: Create the types**

```ts
/** A styled span of output. `className` is one of the .t-* utilities. */
export type OutputToken = { text: string; className?: string; href?: string };

/** One logical line is an array of tokens (a line can mix colors/links). */
export type OutputLine = OutputToken[];

export type EffectName =
  | 'theme' | 'matrix' | 'crt' | 'open-url' | 'download' | 'goto-gui' | 'exit';

export type RunResult =
  | { kind: 'output'; lines: OutputLine[] }
  | { kind: 'clear' }
  | { kind: 'effect'; effect: EffectName; arg?: string; lines?: OutputLine[] }
  | { kind: 'none' };

export type CommandCategory = 'me' | 'work' | 'system' | 'fun';

export interface CommandContext {
  history: string[];
  registry: Registry;
  theme: string;
}

export interface Command {
  name: string;
  category: CommandCategory;
  summary: string;
  usage?: string;
  manual?: string;
  hidden?: boolean;
  run(args: string[], ctx: CommandContext): RunResult;
}

export type Registry = Record<string, Command>;

/** Convenience builders for output tokens. */
export const t = (text: string, className?: string): OutputToken => ({ text, className });
export const link = (text: string, href: string): OutputToken => ({ text, href, className: 't-link' });
/** A whole line from a single styled token. */
export const line = (text: string, className?: string): OutputLine => [t(text, className)];
export const blank: OutputLine = [t('')];
```

- [ ] **Step 2: Verify** — `npm run lint` → 0 errors (note: `lint` may warn these are unused until Task 7 imports them; if so, proceed and commit with Task 6 instead). `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/terminal/types.ts
git commit -m "feat(terminal): command engine types"
```

## Task 6: `terminal/content.ts` (core data)

**Files:**
- Create: `src/terminal/content.ts`

> Uses the EXACT content from spec §9. This task adds the data the core commands need; Task 12 extends it (fake FS, quotes, etc.).

- [ ] **Step 1: Create the content module**

```ts
export const profile = {
  name: 'Diogo Gonçalves',
  role: 'Computer Science Student & Full-Stack Developer',
  location: 'Matosinhos, Portugal',
  email: 'diogog.dev@gmail.com',
  github: 'https://github.com/Goncalves1307',
  linkedin: 'https://www.linkedin.com/in/diogo-goncalves-448814248',
  bio:
    "Hello there! I'm Diogo, a junior developer with an unwavering passion for " +
    'crafting seamless digital experiences. Currently pursuing my Computer Science ' +
    'degree at UMAIA, I keep expanding my knowledge through extra Udemy courses. By ' +
    'day I work as a Technical Specialist at Worten — smartphones, IT, small ' +
    "appliances and customer support. Beyond the screen you'll find me at the gym " +
    'or indulging my passion for cars.',
} as const;

export const education = {
  degree: 'BSc Computer Science',
  school: 'University of Maia (UMAIA)',
  period: '2022 — Present',
} as const;

export const work = {
  title: 'Technical Specialist',
  company: 'Worten',
  period: 'Since 2022',
} as const;

export type Skill = { name: string; level: number };
export type SkillGroup = { group: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  { group: 'Languages', skills: [
    { name: 'JavaScript', level: 90 }, { name: 'SQL', level: 60 },
    { name: 'TypeScript', level: 40 }, { name: 'Python', level: 40 },
    { name: 'Java', level: 20 },
  ] },
  { group: 'Web', skills: [
    { name: 'HTML & CSS', level: 95 }, { name: 'Responsive', level: 90 },
    { name: 'Tailwind', level: 70 },
  ] },
  { group: 'Frameworks', skills: [
    { name: 'Node.js', level: 85 }, { name: 'Express', level: 80 },
    { name: 'React', level: 70 }, { name: 'Django', level: 30 },
  ] },
  { group: 'Databases', skills: [
    { name: 'PostgreSQL', level: 80 }, { name: 'MySQL', level: 75 },
  ] },
  { group: 'Tools', skills: [
    { name: 'Git & GitHub', level: 90 }, { name: 'Docker', level: 75 },
    { name: 'UI/UX', level: 75 },
  ] },
];

export type Project = {
  id: string;
  name: string;
  kind: string;
  tech: string[];
  description: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    id: 'bookvault',
    name: 'BookVault',
    kind: 'Android App',
    tech: ['Kotlin', 'Android Studio', 'Open Library API'],
    description: 'Book-tracking app: search any title and track your reads.',
    repo: 'https://github.com/Goncalves745/BookVaultAndroid',
  },
  {
    id: 'tower-defense',
    name: 'Tower Defense',
    kind: 'Unity Game',
    tech: ['Unity', 'C#'],
    description: 'Defende a base colocando e melhorando torres contra vagas de inimigos.',
  },
  {
    id: 'schedulo',
    name: 'Schedulo',
    kind: 'Full-Stack',
    tech: ['React', 'Node', 'Express', 'PostgreSQL', 'Prisma', 'Tailwind'],
    description: 'Plataforma SaaS de agendamentos por disponibilidade.',
    repo: 'https://github.com/Goncalves745/Schedulo',
  },
];

export const cvFiles = { pt: '/cv_pt.pdf', en: '/cv_en.pdf' } as const;
```

- [ ] **Step 2: Verify lint + build** — `npm run lint` → 0 errors (may be "unused" until Task 7; if flagged, commit alongside Task 7). `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/terminal/content.ts
git commit -m "feat(terminal): portfolio content data (core)"
```

## Task 7: `terminal/commands.ts` — registry + `run()` (core commands)

**Files:**
- Create: `src/terminal/commands.ts`

Implements `help`, `about`, `whoami`, `skills`, `projects`, `contact`, `clear`. `help`/`man`/Tab all derive from the registry. Effects (`open-url`, etc.) are returned, not executed here.

- [ ] **Step 1: Create the module**

```ts
import { profile, skillGroups, projects } from './content';
import type { CommandContext, OutputLine, Registry, RunResult } from './types';
import { t, line, link, blank } from './types';

// ── individual command output builders ───────────────────────────────
function aboutLines(): OutputLine[] {
  return [
    line(profile.name, 't-accent'),
    line(profile.role, 't-dim'),
    blank,
    // wrap the bio to ~78 cols for terminal feel
    ...wrap(profile.bio, 78).map((l) => line(l)),
  ];
}

function skillsLines(): OutputLine[] {
  const out: OutputLine[] = [];
  for (const grp of skillGroups) {
    out.push(line(grp.group, 't-accent'));
    for (const s of grp.skills) {
      const filled = Math.round(s.level / 5); // 20 cells
      const bar = '█'.repeat(filled) + '·'.repeat(20 - filled);
      out.push([
        t(s.name.padEnd(14), 't-fg'),
        t(bar, 't-accent'),
        t(` ${s.level}%`, 't-dim'),
      ]);
    }
    out.push(blank);
  }
  return out;
}

function projectsLines(): OutputLine[] {
  const out: OutputLine[] = [line('projects', 't-accent'), blank];
  for (const p of projects) {
    out.push([t(`▸ ${p.name}`, 't-accent'), t(`  — ${p.kind}`, 't-dim')]);
    out.push([t('  ' + p.description)]);
    out.push([t('  tech: ', 't-dim'), t(p.tech.join(', '))]);
    out.push(p.repo
      ? [t('  repo: ', 't-dim'), link(p.repo, p.repo)]
      : [t('  repo: ', 't-dim'), t('(not public)', 't-dim')]);
    out.push([t('  run ', 't-dim'), t(`project ${p.id}`, 't-amber'), t(' to open', 't-dim')]);
    out.push(blank);
  }
  return out;
}

function contactLines(): OutputLine[] {
  return [
    line('contact', 't-accent'),
    blank,
    [t('email     ', 't-dim'), link(profile.email, `mailto:${profile.email}`)],
    [t('github    ', 't-dim'), link(profile.github, profile.github)],
    [t('linkedin  ', 't-dim'), link(profile.linkedin, profile.linkedin)],
    [t('location  ', 't-dim'), t(profile.location)],
  ];
}

function helpLines(registry: Registry): OutputLine[] {
  const cats = ['me', 'work', 'system', 'fun'];
  const out: OutputLine[] = [line('available commands', 't-accent'), blank];
  for (const cat of cats) {
    const cmds = Object.values(registry)
      .filter((c) => c.category === cat && !c.hidden)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!cmds.length) continue;
    out.push(line(cat, 't-amber'));
    for (const c of cmds) {
      out.push([t('  ' + c.name.padEnd(12), 't-accent'), t(c.summary, 't-dim')]);
    }
    out.push(blank);
  }
  out.push([t("type ", 't-dim'), t('man <command>', 't-amber'), t(' for details.', 't-dim')]);
  return out;
}

// ── word wrap helper (exported for reuse/testing) ─────────────────────
export function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

// ── registry ──────────────────────────────────────────────────────────
export const registry: Registry = {
  help: {
    name: 'help', category: 'system', summary: 'list commands by category',
    manual: 'Lists every available command grouped by category.',
    run: (_a, ctx) => ({ kind: 'output', lines: helpLines(ctx.registry) }),
  },
  about: {
    name: 'about', category: 'me', summary: 'who I am',
    run: () => ({ kind: 'output', lines: aboutLines() }),
  },
  whoami: {
    name: 'whoami', category: 'me', summary: 'short bio (alias of about)',
    run: () => ({ kind: 'output', lines: aboutLines() }),
  },
  skills: {
    name: 'skills', category: 'me', summary: 'skill bars by group',
    run: () => ({ kind: 'output', lines: skillsLines() }),
  },
  projects: {
    name: 'projects', category: 'work', summary: 'list my projects',
    run: () => ({ kind: 'output', lines: projectsLines() }),
  },
  contact: {
    name: 'contact', category: 'me', summary: 'how to reach me',
    run: () => ({ kind: 'output', lines: contactLines() }),
  },
  clear: {
    name: 'clear', category: 'system', summary: 'clear the screen',
    run: () => ({ kind: 'clear' }),
  },
};

/** Parse + dispatch a raw input line. Pure: side effects are returned.
 *  Callers pass everything except `registry` — `run` injects it. */
export function run(input: string, ctx: Omit<CommandContext, 'registry'>): RunResult {
  const trimmed = input.trim();
  if (!trimmed) return { kind: 'none' };
  const [name, ...args] = trimmed.split(/\s+/);
  const cmd = registry[name.toLowerCase()];
  if (!cmd) {
    return {
      kind: 'output',
      lines: [[t(`command not found: ${name}`, 't-red'), t("  (try 'help')", 't-dim')]],
    };
  }
  return cmd.run(args, { ...ctx, registry });
}

/** Names visible to autocomplete (excludes hidden commands). */
export function completionNames(): string[] {
  return Object.values(registry).filter((c) => !c.hidden).map((c) => c.name).sort();
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint` → 0 errors (Tasks 5/6 imports now satisfied). Run: `npm run build` → succeeds.

- [ ] **Step 3: Commit (Tasks 5–7 together if lint flagged earlier)**

```bash
git add src/terminal/types.ts src/terminal/content.ts src/terminal/commands.ts
git commit -m "feat(terminal): command registry + run() with core commands"
```

## Task 8: `useTypewriter` hook

**Files:**
- Create: `src/hooks/useTypewriter.ts`

- [ ] **Step 1: Create the hook**

```ts
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
```

- [ ] **Step 2: Verify lint + build** — `npm run lint` → 0 errors (may be unused until Task 11; commit with Task 11 if so). `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTypewriter.ts
git commit -m "feat(terminal): token-stream typewriter hook"
```

## Task 9: `AsciiBanner` + command chips data

**Files:**
- Create: `src/modes/TerminalMode/AsciiBanner.tsx`

- [ ] **Step 1: Create the banner**

```tsx
// Built as an array of single-quoted strings (no template literal) so the art
// can contain backslashes (escaped as \\) without any backtick/escape hazard.
const ART = [
  ' ___  _  ___   ___  ___  ',
  '|   \\| |/ _ \\ / __|/ _ \\ ',
  '| |) | | (_) | (_ | (_) |',
  '|___/|_|\\___/ \\___|\\___/ ',
].join('\n');

export default function AsciiBanner() {
  return (
    <pre className="t-accent t-banner whitespace-pre leading-[1.1] text-[10px] xs:text-xs sm:text-sm select-none">
      {ART}
    </pre>
  );
}
```

- [ ] **Step 2: Verify lint + build** — `npm run lint` → 0 errors (unused until Task 11). `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/modes/TerminalMode/AsciiBanner.tsx
git commit -m "feat(terminal): glowing ASCII banner"
```

## Task 10: `BootSequence`

**Files:**
- Create: `src/modes/TerminalMode/BootSequence.tsx`

Plays the Linux boot animation then calls `onDone`. Skippable with any key/click. Under reduced motion it renders the final state and calls `onDone` on the next tick.

- [ ] **Step 1: Create the component**

```tsx
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
    const barId = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) { clearInterval(barId); return 100; }
        return Math.min(100, p + 7);
      });
    }, 70);
    const spinId = window.setInterval(() => setSpin((s) => (s + 1) % SPINNER.length), 90);
    const endId = window.setTimeout(finish, afterServices + 1700);
    timers.push(barId, spinId, endId);
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
```

- [ ] **Step 2: Verify lint + build** — `npm run lint` → 0 errors. `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/modes/TerminalMode/BootSequence.tsx
git commit -m "feat(terminal): Linux-style boot sequence"
```

## Task 11: `Prompt` + `Terminal` orchestrator (replace placeholder)

This is the heart of Phase 2. The `Terminal` owns scrollback `blocks`, command history, the typewriter for the newest block, the boot phase, chips, and effect handling. `Prompt` is presentational.

**Files:**
- Create: `src/modes/TerminalMode/Prompt.tsx`
- Modify (replace placeholder): `src/modes/TerminalMode/Terminal.tsx`

- [ ] **Step 1: Create `Prompt.tsx`**

```tsx
import { forwardRef } from 'react';

type PromptProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

const PS1 = 'guest@diogo.dev:~$';

const Prompt = forwardRef<HTMLInputElement, PromptProps>(function Prompt(
  { value, onChange, onSubmit, onKeyDown, disabled },
  ref,
) {
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      <span className="t-accent shrink-0">{PS1}</span>
      <input
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-label="terminal input"
        className="flex-1 bg-transparent outline-none text-[color:var(--term-fg)] caret-[color:var(--term-accent)]"
      />
    </form>
  );
});

export default Prompt;
```

- [ ] **Step 2: Replace `Terminal.tsx` with the full orchestrator**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsciiBanner from './AsciiBanner';
import BootSequence from './BootSequence';
import Prompt from './Prompt';
import { useTypewriter, sliceLines } from '../../hooks/useTypewriter';
import { registry, run, completionNames } from '../../terminal/commands';
import type { OutputLine } from '../../terminal/types';

type Block = { command: string | null; lines: OutputLine[] };
type TerminalProps = { onExit: () => void };

const CHIPS = ['help', 'about', 'skills', 'projects', 'contact'];

export default function Terminal({ onExit }: TerminalProps) {
  const [phase, setPhase] = useState<'boot' | 'ready'>('boot');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Typewriter drives ONLY the most recent block.
  const lastLines = blocks.length ? blocks[blocks.length - 1].lines : [];
  const { visible, done, skip } = useTypewriter(lastLines);

  // Auto-scroll to bottom as output reveals.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [visible, blocks, phase]);

  // After boot, seed the first block (auto-run whoami) and focus input.
  const onBootDone = useCallback(() => {
    setPhase('ready');
    const res = run('whoami', { history: [], theme: 'green' });
    if (res.kind === 'output') setBlocks([{ command: 'whoami', lines: res.lines }]);
    setHistory(['whoami']);
  }, []);

  useEffect(() => {
    if (phase === 'ready') inputRef.current?.focus();
  }, [phase]);

  const execute = useCallback((raw: string) => {
    const cmd = raw.trim();
    const res = run(cmd, { history, theme: 'green' });
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
  }, [history]);

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
      // 'theme' | 'matrix' | 'crt' handled in Phase 4 (Task 15/16)
      default: break;
    }
  }, [onExit]);

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
      className="terminal-root flex flex-col p-4 sm:p-6"
      onClick={() => inputRef.current?.focus()}
    >
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
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds.

- [ ] **Step 4: Manual verify**

Run: `npm run dev`. Boot the terminal entry. Expected:
- Boot sequence plays; any key skips it.
- Banner + chips render; `whoami` auto-runs and types out.
- Typing `help`, `about`, `skills`, `projects`, `contact` + Enter types each output; links are clickable.
- ↑/↓ recalls history; Tab completes (`ab`+Tab → `about`); Ctrl+L clears; clicking a chip runs it.
- Pressing a key mid-typing instantly completes the current output.
- DevTools → emulate `prefers-reduced-motion: reduce` → reload: boot collapses instantly, output appears without typing, everything usable.

- [ ] **Step 5: Commit**

```bash
git add src/modes/TerminalMode/Prompt.tsx src/modes/TerminalMode/Terminal.tsx
git commit -m "feat(terminal): interactive terminal — scrollback, prompt, history, tab, chips"
```

---

# PHASE 3 — Full command set

## Task 12: Extend `content.ts` (FS tree, quotes, neofetch data)

**Files:**
- Modify: `src/terminal/content.ts` (append)

- [ ] **Step 1: Append to `content.ts`**

```ts
export const interests = ['Gym & fitness', 'Cars', 'Coffee ☕', 'Game dev', 'Self-hosting'];

export const experienceTimeline = [
  { when: '2022 — Present', what: 'BSc Computer Science', where: 'UMAIA' },
  { when: 'Since 2022', what: 'Technical Specialist', where: 'Worten' },
  { when: 'Ongoing', what: 'Udemy courses (full-stack)', where: 'self-taught' },
];

export const stackGroups = [
  { group: 'Frontend', items: ['React', 'TypeScript', 'Tailwind', 'HTML', 'CSS'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'Django', 'Prisma'] },
  { group: 'Data', items: ['PostgreSQL', 'MySQL', 'SQL'] },
  { group: 'Tooling', items: ['Git', 'GitHub', 'Docker', 'Vite'] },
];

export const quotes = [
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Programs must be written for people to read. — Abelson & Sussman',
  'Make it work, make it right, make it fast. — Kent Beck',
  'Simplicity is the soul of efficiency. — Austin Freeman',
];

/** Fake filesystem for ls/tree/cat. Files map to renderable command names. */
export const fileSystem: Record<string, string> = {
  'about.txt': 'about',
  'skills.md': 'skills',
  'projects/': 'projects',
  'contact.vcf': 'contact',
  'resume.pdf': 'resume',
  'experience.log': 'experience',
};
```

- [ ] **Step 2: Verify** — `npm run lint` → 0 errors (module exports are not flagged as unused; first consumer is Task 13). `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/terminal/content.ts
git commit -m "feat(terminal): extend content (interests, stack, quotes, fake FS)"
```

## Task 13: Commands batch A — `experience, stack, interests, project, social, resume, neofetch`

**Files:**
- Modify: `src/terminal/commands.ts` (add imports + builders + registry entries)

- [ ] **Step 1: Extend imports at the top of `commands.ts`**

Replace the existing import-from-content line with:

```ts
import {
  profile, skillGroups, projects, education, work,
  interests, experienceTimeline, stackGroups, cvFiles,
} from './content';
```

- [ ] **Step 2: Add these builders (above the `registry` declaration)**

```ts
function experienceLines(): OutputLine[] {
  const out: OutputLine[] = [line('experience', 't-accent'), blank];
  experienceTimeline.forEach((e, i) => {
    const connector = i === experienceTimeline.length - 1 ? ' ' : '│';
    out.push([t('  ● ', 't-accent'), t(e.when, 't-amber')]);
    out.push([t('  ' + connector + '   ', 't-dim'), t(e.what, 't-fg'), t(`  · ${e.where}`, 't-dim')]);
    if (i !== experienceTimeline.length - 1) out.push([t('  │', 't-dim')]);
  });
  return out;
}

function stackLines(): OutputLine[] {
  const out: OutputLine[] = [line('stack', 't-accent'), blank];
  for (const g of stackGroups) {
    out.push([t(g.group.padEnd(10), 't-amber'), t(g.items.map((x) => `[${x}]`).join(' '), 't-fg')]);
  }
  return out;
}

function interestsLines(): OutputLine[] {
  return [line('interests', 't-accent'), blank, ...interests.map((i) => line('  ▸ ' + i))];
}

function socialLines(): OutputLine[] {
  return [
    line('social', 't-accent'), blank,
    [t('github    ', 't-dim'), link(profile.github, profile.github)],
    [t('linkedin  ', 't-dim'), link(profile.linkedin, profile.linkedin)],
    [t('email     ', 't-dim'), link(profile.email, `mailto:${profile.email}`)],
  ];
}

function neofetchLines(): OutputLine[] {
  const logo = [
    '      ___      ', '     (.. \\     ', '     (<>  |    ',
    '    /(__)  |   ', '   ( /_____/   ', '    \\______/   ',
  ];
  const info: OutputLine[] = [
    [t('guest', 't-accent'), t('@', 't-dim'), t('diogo.dev', 't-accent')],
    [t('-----------', 't-dim')],
    [t('OS:      ', 't-amber'), t('phosphor 3.0.1')],
    [t('Host:    ', 't-amber'), t(profile.role)],
    [t('Uptime:  ', 't-amber'), t('since 2022')],
    [t('Shell:   ', 't-amber'), t('diogo-sh')],
    [t('Edu:     ', 't-amber'), t(`${education.degree} · ${education.school}`)],
    [t('Work:    ', 't-amber'), t(`${work.title} · ${work.company}`)],
    [t('Location:', 't-amber'), t(' ' + profile.location)],
  ];
  const rows = Math.max(logo.length, info.length);
  const out: OutputLine[] = [];
  for (let i = 0; i < rows; i++) {
    const l = logo[i] ?? '              ';
    out.push([t(l, 't-accent'), ...(info[i] ?? [t('')])]);
  }
  return out;
}

function projectById(id: string) {
  return projects.find((p) => p.id === id.toLowerCase() || p.name.toLowerCase() === id.toLowerCase());
}
```

- [ ] **Step 3: Add these entries to the `registry` object**

```ts
  experience: {
    name: 'experience', category: 'me', summary: 'career timeline',
    run: () => ({ kind: 'output', lines: experienceLines() }),
  },
  stack: {
    name: 'stack', category: 'me', summary: 'tech I use, grouped',
    run: () => ({ kind: 'output', lines: stackLines() }),
  },
  interests: {
    name: 'interests', category: 'me', summary: 'things I enjoy',
    run: () => ({ kind: 'output', lines: interestsLines() }),
  },
  social: {
    name: 'social', category: 'me', summary: 'social links',
    run: () => ({ kind: 'output', lines: socialLines() }),
  },
  neofetch: {
    name: 'neofetch', category: 'system', summary: 'system info + logo',
    run: () => ({ kind: 'output', lines: neofetchLines() }),
  },
  project: {
    name: 'project', category: 'work', summary: 'open a project repo',
    usage: 'project <name>',
    run: (args) => {
      const id = args[0];
      if (!id) return { kind: 'output', lines: [line('usage: project <name>', 't-amber'),
        ...projects.map((p) => line('  ' + p.id, 't-dim'))] };
      const p = projectById(id);
      if (!p) return { kind: 'output', lines: [[t(`unknown project: ${id}`, 't-red')]] };
      if (!p.repo) return { kind: 'output', lines: [[t(`${p.name} has no public repo.`, 't-amber')]] };
      return { kind: 'effect', effect: 'open-url', arg: p.repo,
        lines: [[t(`opening ${p.name} → `, 't-dim'), link(p.repo, p.repo)]] };
    },
  },
  resume: {
    name: 'resume', category: 'me', summary: 'download my CV (PT/EN)',
    usage: 'resume [pt|en]',
    run: (args) => {
      const which = (args[0] ?? '').toLowerCase();
      if (which === 'pt' || which === 'en') {
        return { kind: 'effect', effect: 'download', arg: cvFiles[which],
          lines: [[t(`downloading CV (${which.toUpperCase()})…`, 't-dim')]] };
      }
      return { kind: 'output', lines: [
        line('resume / cv', 't-accent'), blank,
        [t('  '), link('Download CV (PT)', cvFiles.pt)],
        [t('  '), link('Download CV (EN)', cvFiles.en)],
        [t('  or: ', 't-dim'), t('resume pt', 't-amber'), t(' / ', 't-dim'), t('resume en', 't-amber')],
      ] };
    },
  },
```

Also add a `cv` alias entry:

```ts
  cv: {
    name: 'cv', category: 'me', summary: 'alias of resume', hidden: true,
    run: (args, ctx) => ctx.registry.resume.run(args, ctx),
  },
```

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds.

- [ ] **Step 5: Manual verify** — `npm run dev`: run `experience`, `stack`, `interests`, `social`, `neofetch`; `project schedulo` opens GitHub; `resume` shows links, `resume pt` downloads.

- [ ] **Step 6: Commit**

```bash
git add src/terminal/commands.ts
git commit -m "feat(terminal): experience, stack, interests, project, social, resume, neofetch"
```

## Task 14: Commands batch B — `ls, tree, cat, echo, history, man, sudo, uptime, date, motd, weather, coffee, banner, exit, gui`

**Files:**
- Modify: `src/terminal/commands.ts`

- [ ] **Step 1: Add `fileSystem, quotes` to the content import**

```ts
import {
  profile, skillGroups, projects, education, work,
  interests, experienceTimeline, stackGroups, cvFiles, fileSystem, quotes,
} from './content';
```

- [ ] **Step 2: Add builders (above `registry`)**

> `motd` and `weather` use deterministic selection (no `Math.random` requirement, but it is allowed in app code — here we rotate by minute to stay simple and SSR-safe).

```ts
function lsLines(): OutputLine[] {
  return [Object.keys(fileSystem).map((f) => ({
    text: f.padEnd(16),
    className: f.endsWith('/') ? 't-blue' : 't-fg',
  }))];
}

function treeLines(): OutputLine[] {
  const names = Object.keys(fileSystem);
  const out: OutputLine[] = [line('.', 't-accent')];
  names.forEach((n, i) => {
    const last = i === names.length - 1;
    out.push([t(last ? '└── ' : '├── ', 't-dim'), t(n, n.endsWith('/') ? 't-blue' : 't-fg')]);
  });
  return out;
}

function catLines(arg: string | undefined, registry: Registry): RunResult {
  if (!arg) return { kind: 'output', lines: [line('usage: cat <file>  (see `ls`)', 't-amber')] };
  const target = fileSystem[arg] ?? fileSystem[arg + '/'];
  if (!target) return { kind: 'output', lines: [[t(`cat: ${arg}: No such file`, 't-red')]] };
  return registry[target].run([], { history: [], theme: 'green', registry });
}

function manLines(arg: string | undefined, registry: Registry): OutputLine[] {
  if (!arg) return [line('what manual page do you want? (try: man help)', 't-amber')];
  const cmd = registry[arg.toLowerCase()];
  if (!cmd) return [[t(`No manual entry for ${arg}`, 't-red')]];
  return [
    line('NAME', 't-amber'),
    line('    ' + cmd.name + ' — ' + cmd.summary),
    blank,
    line('SYNOPSIS', 't-amber'),
    line('    ' + (cmd.usage ?? cmd.name)),
    blank,
    line('DESCRIPTION', 't-amber'),
    line('    ' + (cmd.manual ?? cmd.summary)),
  ];
}
```

- [ ] **Step 3: Add registry entries**

```ts
  ls: {
    name: 'ls', category: 'system', summary: 'list files',
    run: () => ({ kind: 'output', lines: lsLines() }),
  },
  tree: {
    name: 'tree', category: 'system', summary: 'show file tree',
    run: () => ({ kind: 'output', lines: treeLines() }),
  },
  cat: {
    name: 'cat', category: 'system', summary: 'print a file', usage: 'cat <file>',
    run: (args, ctx) => catLines(args[0], ctx.registry),
  },
  man: {
    name: 'man', category: 'system', summary: 'manual page', usage: 'man <command>',
    run: (args, ctx) => ({ kind: 'output', lines: manLines(args[0], ctx.registry) }),
  },
  echo: {
    name: 'echo', category: 'system', summary: 'print text', usage: 'echo <text>',
    run: (args) => ({ kind: 'output', lines: [line(args.join(' '))] }),
  },
  history: {
    name: 'history', category: 'system', summary: 'command history',
    run: (_a, ctx) => ({ kind: 'output',
      lines: ctx.history.map((h, i) => [t(String(i + 1).padStart(4) + '  ', 't-dim'), t(h)]) }),
  },
  sudo: {
    name: 'sudo', category: 'system', summary: 'superuser do (nice try)',
    run: (args) => ({ kind: 'output',
      lines: [[t(`guest is not in the sudoers file. This incident will be reported.`, 't-red')],
        ...(args.length ? [line(`(you asked to: ${args.join(' ')})`, 't-dim')] : [])] }),
  },
  uptime: {
    name: 'uptime', category: 'system', summary: 'how long Diogo has been coding',
    run: () => ({ kind: 'output', lines: [[t('up since 2022 — ', 't-fg'), t('load average: ☕ ☕ ☕', 't-amber')]] }),
  },
  date: {
    name: 'date', category: 'system', summary: 'current date/time',
    run: () => ({ kind: 'output', lines: [line(new Date().toString())] }),
  },
  motd: {
    name: 'motd', category: 'fun', summary: 'message of the day',
    run: () => ({ kind: 'output', lines: [line(quotes[new Date().getMinutes() % quotes.length], 't-amber')] }),
  },
  weather: {
    name: 'weather', category: 'fun', summary: 'Matosinhos forecast',
    run: () => ({ kind: 'output', lines: [
      [t('Matosinhos: ', 't-fg'), t('☀ 19°C', 't-amber'), t('  light Atlantic breeze ●', 't-dim')] ] }),
  },
  coffee: {
    name: 'coffee', category: 'fun', summary: 'brew a coffee',
    run: () => ({ kind: 'output', lines: [
      line('      ( (', 't-dim'), line('       ) )', 't-dim'),
      line('    ........', 't-amber'), line('    |      |]', 't-amber'),
      line('    \\      /', 't-amber'), line('     `----´', 't-amber'),
      line('  ☕ enjoy your coffee', 't-accent') ] }),
  },
  banner: {
    name: 'banner', category: 'fun', summary: 'reprint the banner',
    run: () => ({ kind: 'output', lines: [line('diogo.dev', 't-accent')] }),
  },
  gui: {
    name: 'gui', category: 'system', summary: 'boot the graphical desktop',
    run: () => ({ kind: 'effect', effect: 'goto-gui', lines: [line('switching to desktop…', 't-dim')] }),
  },
  exit: {
    name: 'exit', category: 'system', summary: 'return to the boot menu',
    run: () => ({ kind: 'effect', effect: 'exit', lines: [line('logging out…', 't-dim')] }),
  },
```

> Note: `banner` prints a simple wordmark in scrollback; the big ASCII art stays the persistent header (`AsciiBanner`). This avoids embedding the multi-line `pre` art into the token stream.

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds.

- [ ] **Step 5: Manual verify** — `npm run dev`: `help` now lists all commands under me/work/system/fun; `ls`, `tree`, `cat about.txt`, `man skills`, `echo hi`, `history`, `sudo rm -rf /`, `uptime`, `date`, `motd`, `weather`, `coffee`, `gui` (→ desktop), `exit` (→ boot menu) all behave.

- [ ] **Step 6: Commit**

```bash
git add src/terminal/commands.ts
git commit -m "feat(terminal): filesystem, man, and fun commands"
```

---

# PHASE 4 — Effects, HUD, polish

## Task 15: `themes.ts` + `theme` command + apply on the terminal root

**Files:**
- Create: `src/terminal/themes.ts`
- Modify: `src/terminal/commands.ts` (add `theme` command)
- Modify: `src/modes/TerminalMode/Terminal.tsx` (apply theme via CSS vars + handle `theme` effect + persist)

- [ ] **Step 1: Create `themes.ts`**

```ts
export type PhosphorTheme = {
  accent: string; accentSoft: string; glow: string;
};

export const THEMES: Record<string, PhosphorTheme> = {
  green:   { accent: '#39d353', accentSoft: '#56d364', glow: 'rgba(57,211,83,.55)' },
  amber:   { accent: '#d29922', accentSoft: '#e3b341', glow: 'rgba(210,153,34,.55)' },
  cyan:    { accent: '#39d3c6', accentSoft: '#56d3d3', glow: 'rgba(57,211,198,.55)' },
  magenta: { accent: '#d339a7', accentSoft: '#e056b8', glow: 'rgba(211,57,167,.55)' },
  blue:    { accent: '#58a6ff', accentSoft: '#79b8ff', glow: 'rgba(88,166,255,.55)' },
  white:   { accent: '#e6edf3', accentSoft: '#ffffff', glow: 'rgba(230,237,243,.55)' },
};

export const THEME_NAMES = Object.keys(THEMES);

/** Apply a phosphor theme by writing CSS vars onto the given root element. */
export function applyTheme(root: HTMLElement, name: string): boolean {
  const theme = THEMES[name];
  if (!theme) return false;
  root.style.setProperty('--term-accent', theme.accent);
  root.style.setProperty('--term-accent-soft', theme.accentSoft);
  root.style.setProperty('--term-glow', theme.glow);
  return true;
}
```

- [ ] **Step 2: Add the `theme` command to `commands.ts`**

Add to imports: `import { THEME_NAMES } from './themes';`
Add registry entry:

```ts
  theme: {
    name: 'theme', category: 'system', summary: 'change phosphor color',
    usage: 'theme <green|amber|cyan|magenta|blue|white>',
    run: (args) => {
      const name = (args[0] ?? '').toLowerCase();
      if (!THEME_NAMES.includes(name)) {
        return { kind: 'output', lines: [
          [t('usage: theme <color>', 't-amber')],
          [t('available: ', 't-dim'), t(THEME_NAMES.join(', '), 't-fg')] ] };
      }
      return { kind: 'effect', effect: 'theme', arg: name,
        lines: [[t('phosphor set to ', 't-dim'), t(name, 't-accent')]] };
    },
  },
```

- [ ] **Step 3: Wire theme application + persistence into `Terminal.tsx`**

Add imports:

```tsx
import { applyTheme } from '../../terminal/themes';
```

Add a ref to the root + theme state near the other state:

```tsx
  const rootRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('termTheme') ?? 'green');
```

Apply theme whenever it changes (and on mount):

```tsx
  useEffect(() => {
    if (rootRef.current) applyTheme(rootRef.current, theme);
    localStorage.setItem('termTheme', theme);
  }, [theme]);
```

In `handleEffect`, add a `theme` case:

```tsx
      case 'theme': if (arg) setTheme(arg); break;
```

Replace `theme: 'green'` in both `run(...)` calls with `theme` (the state). Attach the ref to the root element: change `<div className="terminal-root …"` to `<div ref={rootRef} className="terminal-root …"`.

- [ ] **Step 4: Verify lint + build** → 0 errors / succeeds.

- [ ] **Step 5: Manual verify** — `theme amber` recolors the phosphor; reload keeps it (localStorage). `theme bogus` shows usage.

- [ ] **Step 6: Commit**

```bash
git add src/terminal/themes.ts src/terminal/commands.ts src/modes/TerminalMode/Terminal.tsx
git commit -m "feat(terminal): phosphor color themes via CSS vars + persistence"
```

## Task 16: `Hud` — clock, swatches, matrix + CRT toggles

**Files:**
- Create: `src/modes/TerminalMode/Hud.tsx`
- Modify: `src/modes/TerminalMode/Terminal.tsx` (render HUD, own matrix/CRT state, handle effects)

- [ ] **Step 1: Create `Hud.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { THEME_NAMES, THEMES } from '../../terminal/themes';

type HudProps = {
  onTheme: (name: string) => void;
  matrixOn: boolean;
  onToggleMatrix: () => void;
  crtOn: boolean;
  onToggleCrt: () => void;
};

export default function Hud({ onTheme, matrixOn, onToggleMatrix, crtOn, onToggleCrt }: HudProps) {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute top-3 right-3 z-40 flex items-center gap-3 text-xs select-none">
      <span className="t-dim tabular-nums">{clock}</span>
      <div className="flex items-center gap-1">
        {THEME_NAMES.map((name) => (
          <button
            key={name}
            aria-label={`theme ${name}`}
            onClick={() => onTheme(name)}
            className="h-3 w-3 rounded-full border border-black/30"
            style={{ background: THEMES[name].accent }}
          />
        ))}
      </div>
      <button onClick={onToggleMatrix} className={`px-2 py-0.5 rounded border ${matrixOn ? 't-accent border-current' : 't-dim border-[#30363d]'}`}>
        matrix
      </button>
      <button onClick={onToggleCrt} className={`px-2 py-0.5 rounded border ${crtOn ? 't-accent border-current' : 't-dim border-[#30363d]'}`}>
        crt
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Wire HUD + matrix/CRT state into `Terminal.tsx`**

Add state:

```tsx
  const [matrixOn, setMatrixOn] = useState(false);
  const [crtOn, setCrtOn] = useState(() => localStorage.getItem('termCrt') === '1');
```

Persist CRT:

```tsx
  useEffect(() => { localStorage.setItem('termCrt', crtOn ? '1' : '0'); }, [crtOn]);
```

Extend `handleEffect` cases:

```tsx
      case 'matrix': setMatrixOn((m) => !m); break;
      case 'crt': setCrtOn((c) => !c); break;
```

Render the HUD inside the root (after `<AsciiBanner/>` or as first child). Add the `crt` classes to the root: change the root `className` to include CRT conditionally:

```tsx
    className={`terminal-root flex flex-col p-4 sm:p-6 ${crtOn ? 't-crt t-crt-flicker' : ''}`}
```

Add the HUD element near the top of the returned JSX:

```tsx
      <Hud
        onTheme={(n) => setTheme(n)}
        matrixOn={matrixOn}
        onToggleMatrix={() => setMatrixOn((m) => !m)}
        crtOn={crtOn}
        onToggleCrt={() => setCrtOn((c) => !c)}
      />
```

Add the import: `import Hud from './Hud';`

- [ ] **Step 3: Verify lint + build** → 0 errors / succeeds.

- [ ] **Step 4: Manual verify** — clock ticks; clicking a swatch recolors; matrix/crt buttons toggle state (matrix visual lands in Task 17); CRT overlay appears and persists across reload.

- [ ] **Step 5: Commit**

```bash
git add src/modes/TerminalMode/Hud.tsx src/modes/TerminalMode/Terminal.tsx
git commit -m "feat(terminal): HUD with clock, color swatches, matrix/CRT toggles"
```

## Task 17: `MatrixRain` canvas

**Files:**
- Create: `src/modes/TerminalMode/MatrixRain.tsx`
- Modify: `src/modes/TerminalMode/Terminal.tsx` (render when `matrixOn`)

- [ ] **Step 1: Create `MatrixRain.tsx`**

```tsx
import { useEffect, useRef } from 'react';

/** Falling-glyph canvas behind the terminal. Static (no animation) under
 *  reduced motion; the toggle still controls visibility. */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glyphs = 'アカサタナハマヤラワ0123456789ABCDEF<>/{}$#'.split('');
    let raf = 0;
    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.floor(canvas.width / 14);
      drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * 40));
    };
    resize();
    window.addEventListener('resize', resize);

    const accent = () =>
      getComputedStyle(canvas).getPropertyValue('--term-accent').trim() || '#39d353';

    const draw = () => {
      ctx.fillStyle = 'rgba(1,4,9,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accent();
      ctx.font = '14px "JetBrains Mono", monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(ch, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // one static frame
      ctx.fillStyle = accent();
      ctx.font = '14px "JetBrains Mono", monospace';
      for (let i = 0; i < cols; i++) {
        ctx.fillText(glyphs[i % glyphs.length], i * 14, (i % 20) * 14 + 14);
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.28] z-0"
    />
  );
}
```

- [ ] **Step 2: Render in `Terminal.tsx`**

Add import `import MatrixRain from './MatrixRain';`. Inside the root `<div>`, as the FIRST child (so it sits behind via z-0; ensure the content wrapper has a higher stacking by leaving default flow which paints after), render:

```tsx
      {matrixOn && <MatrixRain />}
```

Ensure interactive content stays above: the existing `AsciiBanner`, chips, scrollback, and Prompt are in normal flow after the canvas; add `relative z-10` to the scrollback wrapper and chips container if needed so text stays above the `z-0` canvas. Concretely, add `relative z-10` to the chips `div` and the `scrollRef` `div` and the `Prompt` wrapper. Simplest: wrap banner/chips/scroll/prompt in a single `<div className="relative z-10 flex flex-1 flex-col min-h-0">…</div>`.

- [ ] **Step 3: Verify lint + build** → 0 errors / succeeds.

- [ ] **Step 4: Manual verify** — `matrix` command or HUD button toggles the rain behind the text; text stays readable; reduced-motion shows a static field, no animation.

- [ ] **Step 5: Commit**

```bash
git add src/modes/TerminalMode/MatrixRain.tsx src/modes/TerminalMode/Terminal.tsx
git commit -m "feat(terminal): matrix rain canvas effect"
```

## Task 18: Responsive + accessibility final pass

**Files:**
- Modify: `src/modes/TerminalMode/Terminal.tsx`, `src/modes/TerminalMode/Hud.tsx`, `src/index.css` as needed.

- [ ] **Step 1: Mobile/HUD/scroll polish**

- In `Hud.tsx`, hide the clock on very small screens to avoid overlap: add `hidden xs:inline` to the clock `<span>` (or `sm:inline`). Ensure swatches/buttons wrap: add `flex-wrap` and `max-w-[60vw]` to the HUD container.
- In `Terminal.tsx`, ensure the scrollback area uses `min-h-0` so flexbox scrolling works on mobile (add `min-h-0` to the scroll wrapper). Confirm the root already fills the viewport (`.terminal-root` is `position:fixed; inset:0`).
- Confirm tapping anywhere focuses the input (already wired via root `onClick`), so the mobile keyboard opens.

- [ ] **Step 2: Confirm the `xs` breakpoint exists**

The `xs: '420px'` screen was already added to `tailwind.config.js` (`theme.extend.screens`) in Task 0. Verify it is present — the `xs:` variants used here and in `AsciiBanner`/`Hud` depend on it. No change needed if already there.

- [ ] **Step 3: Reduced-motion audit**

Verify (DevTools emulate `prefers-reduced-motion: reduce`):
- Boot collapses instantly; typewriter renders full output immediately; caret does not blink; CRT does not flicker (but overlay still visible if on); matrix renders a static field; banner glow static; skill bars fully filled.
- No animation is required to read or use anything.

- [ ] **Step 4: Verify lint + build** → 0 errors / succeeds.

- [ ] **Step 5: Manual verify** — DevTools device toolbar (e.g. iPhone SE width): terminal fills screen, HUD doesn't overlap banner, chips wrap, input focuses on tap, scrollback scrolls.

- [ ] **Step 6: Commit**

```bash
git add src/modes/TerminalMode/Terminal.tsx src/modes/TerminalMode/Hud.tsx tailwind.config.js src/index.css
git commit -m "feat(terminal): responsive + reduced-motion accessibility pass"
```

## Task 19 (optional polish): Port the green palette to the GUI/desktop mode

So the desktop alternate matches the phosphor brand instead of the original blue/purple.

**Files:**
- Modify: `tailwind.config.js` (primary→emerald, secondary→teal, accent→lime)

- [ ] **Step 1: Replace the `primary`, `secondary`, `accent` color blocks** in `tailwind.config.js` with the emerald/teal/lime values from the redesign branch:

```js
        primary: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
        },
        secondary: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
          500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
        },
        accent: {
          50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
          500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314',
        },
```

- [ ] **Step 2: Verify lint + build** → 0 errors / succeeds.

- [ ] **Step 3: Manual verify** — boot into desktop mode: the portfolio now reads green/teal/lime; dark-mode toggle still works.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(gui): port emerald/teal/lime palette to desktop mode"
```

## Task 20: Final verification + cleanup

- [ ] **Step 1: Full lint + build**

Run: `npm run lint` → 0 errors. Run: `npm run build` → succeeds. Run: `npm run preview` and click through both modes once.

- [ ] **Step 2: Dead-code/import sweep**

Confirm no leftover unused exports (lint enforces this). Confirm `App.tsx` no longer references the old loading spinner / direct section imports (they moved into `GuiMode`).

- [ ] **Step 3: Update `CLAUDE.md` "Architecture" section**

Add a short paragraph documenting the new mode router (`boot`/`terminal`/`gui`), the terminal engine (`src/terminal/*`), and that the classic sections are now the `gui` mode. (Replace the line claiming `App.tsx` renders the sections directly.)

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document terminal mode architecture in CLAUDE.md"
```

---

## Spec Coverage Check

- Boot sequence (kernel → `[OK]` → progress bar → braille spinner → banner → auto `whoami`) → Task 10 + Task 11.
- GRUB boot menu + alternate desktop version → Tasks 2–4 (+ green port Task 19). VS Code mode deferred (spec §2 non-goal); menu is data-driven for later extension.
- Command engine (`run`, registry, effects) → Tasks 5, 7, 13, 14.
- Full command catalog (spec §10) → Tasks 7, 13, 14 (help/about/whoami/skills/projects/contact/clear; experience/stack/interests/project/social/resume/cv/neofetch; ls/tree/cat/man/echo/history/sudo/uptime/date/motd/weather/coffee/banner/gui/exit; theme/matrix/crt).
- Typewriter preserving styled spans, interruptible → Task 8 + Task 11.
- History ↑/↓, Tab complete, Ctrl+L, chips → Task 11.
- HUD (clock, swatches, matrix, CRT) → Task 16.
- Themes via CSS vars + persistence → Task 15. Matrix → Task 17. CRT → Tasks 0 (styles) + 16 (toggle).
- Accessibility (final states default, motion gated, `scaleX` not needed for the █-cell bars which are character-based and always visible, any-key skip, mobile full-screen) → Tasks 0, 10, 11, 18.
- Exact content (spec §9) → Tasks 6, 12.

> Spec §9 skill bars: the spec calls for `transform: scaleX()` animated bars. This plan renders skill bars as **character cells** (`█`/`·`) inside the typewriter stream, which are visible-by-default and reveal via the typewriter (no width/scale animation needed), satisfying the accessibility intent. If an animated GUI-style bar is wanted instead, it belongs in the `gui` Skills section, which already uses that pattern. This is an intentional, documented deviation.

## Open follow-ups (not in this plan)
- VS Code / IDE alternate boot entry (spec §2 deferred).
- Curated final ASCII banner art tuning and a larger motd quote set.
