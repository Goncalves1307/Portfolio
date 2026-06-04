# Terminal Portfolio — Design Spec

**Date:** 2026-06-04
**Branch:** `feat/terminal-portfolio` (off `main`)
**Status:** Approved design — pending implementation plan

## 1. Vision

Rebuild the personal portfolio as an interactive **computer/terminal**. On load the
visitor sees a GRUB-style boot menu, picks a "kernel," and (by default) drops into a
phosphor-green Linux-style terminal where they type commands to explore Diogo's profile.
A second bootable entry reuses the existing graphical portfolio as the "desktop" mode.

The goal is a striking, memorable experience that still degrades gracefully (reduced
motion, mobile, no-JS-effects) and stays cheap to extend (data-driven commands + menu).

## 2. Goals / Non-Goals

**Goals**
- Boot animation → interactive phosphor terminal with a real, data-driven command engine.
- GRUB-style boot menu choosing between **Terminal** (default) and **Desktop** (existing site).
- Full command catalog from the brief (see §10), HUD, color themes, matrix rain, CRT overlay.
- Strict accessibility: final states visible by default; motion gated behind
  `prefers-reduced-motion: no-preference`; any key skips boot/typing.
- Light dependency footprint — no react-router, no heavy terminal library. CSS + a small JS
  typewriter engine.
- Mobile-first responsive: terminal fills the screen.

**Non-Goals (deferred, not built now)**
- The VS Code / IDE "desktop with windows" alternate mode. The boot menu and mode router are
  built **extensibly** so a third entry can be added later with no rework.
- Any backend, analytics, or form submission (Contact stays display-only, as today).
- Replacing/removing the existing classic portfolio components — they are **reused** as the
  desktop mode, not rewritten.

## 3. High-Level Architecture

Three top-level modes, switched by a tiny custom hash router (no react-router):

```
        ┌───────────────────────── App (mode router) ─────────────────────────┐
        │  mode: 'boot' | 'terminal' | 'gui'  ⇄  URL hash + localStorage        │
        └───────────┬───────────────────┬───────────────────────┬──────────────┘
                    │                   │                       │
              BootMenu (GRUB)     TerminalMode             GuiMode
              - arrow nav         - BootSequence           - wraps existing
              - countdown         - Prompt + engine          Header…Footer
              - Enter selects     - HUD / effects            (ThemeProvider)
                    │                   ▲                       │
                    └─ select ──────────┘   `gui` command ──────┘  "⏻ reboot" → boot
```

- **`mode`** lives in `App` state, mirrored to the URL hash (`#terminal`, `#gui`, default `#boot`)
  and `localStorage["bootChoice"]`. Deep links and refresh land in the right mode. A first-time
  visitor sees the boot menu; the menu auto-boots to the terminal after a countdown unless a key
  is pressed.
- **TerminalMode** and **GuiMode** are lazy-loaded into separate chunks so the initial boot menu
  is tiny and each experience only pays for itself.
- **GuiMode** renders the current portfolio (`Header, Hero, About, Projects, Skills, Contact,
  Footer`) inside the existing `ThemeProvider`, plus a small fixed "⏻ reboot" control that returns
  to the boot menu. The green theme + 3D icosahedron hero from `redesign/green-3d` are
  cherry-picked into this mode so that work is preserved, not wasted.

### Why a custom hash router
The brief asks for "no heavy dependencies." We only need 3 mutually-exclusive screens with
persistence — a ~30-line `useHashMode` hook (read hash on mount, `hashchange` listener, setter
that writes hash + localStorage) covers it without pulling in react-router-dom.

## 4. Command Engine (the core)

**Chosen approach: typed registry + token-stream output** (Approach A from brainstorming).

### Types (`src/terminal/types.ts`)
```ts
// A styled span of output text. className maps to a phosphor color utility.
type OutputToken = { text: string; className?: string; href?: string };
// One logical line is an array of tokens (so a line can mix colors / links).
type OutputLine = OutputToken[];

type RunResult =
  | { kind: 'output'; lines: OutputLine[] }      // print these (typed out)
  | { kind: 'clear' }                            // wipe scrollback
  | { kind: 'effect'; effect: EffectName; arg?: string; lines?: OutputLine[] }
  | { kind: 'none' };                            // no output (e.g. empty input)

type EffectName = 'theme' | 'matrix' | 'crt' | 'open-url' | 'download' | 'goto-gui' | 'exit';

interface Command {
  name: string;
  category: 'me' | 'work' | 'system' | 'fun';
  summary: string;            // one-liner for `help`
  usage?: string;             // for `man <cmd>`
  manual?: string;            // longer text for `man <cmd>`
  hidden?: boolean;           // excluded from help/autocomplete (e.g. easter eggs)
  run(args: string[], ctx: CommandContext): RunResult;
}

interface CommandContext {
  history: string[];
  registry: Record<string, Command>;
  theme: string;              // current phosphor color name
}
```

### Registry + dispatch (`src/terminal/commands.ts`)
- Commands are a `Record<string, Command>`. `help`, `man`, and Tab-completion all **derive** from
  this object — adding a command is a single entry, nothing else to wire.
- `run(input: string, ctx): RunResult` trims input, splits into `cmd` + `args`, looks up the
  command (case-insensitive), and dispatches. Unknown command → an error `output` line
  (`command not found: <x>  (try 'help')`).
- Effects (`theme`, `matrix`, `crt`, link opens, downloads, `gui`, `exit`) are returned as
  `effect` results and executed by the `Terminal` component (which owns DOM/side-effect access),
  keeping `commands.ts` pure and testable.

### Content (`src/terminal/content.ts`)
All portfolio data as typed exported objects (profile, education, work, skills groups, stack
groups, interests, projects, file-system tree for `ls/tree/cat`, motd quotes). Uses the **exact**
content from §9. Commands read from here so copy edits never touch component code.

## 5. Typewriter (`src/hooks/useTypewriter.ts`)

Reveals output character-by-character across the **token stream** (not by walking DOM nodes):

- Input: `OutputLine[]`. The hook flattens to a total character count, and exposes a `visibleCount`
  that advances on a timer (configurable cps, default ~ fast). Render slices the token stream to
  `visibleCount`, preserving each token's `className`/`href`.
- **Interruptible:** any keypress (or click) sets `visibleCount` to the total, instantly completing
  the current output. The same handler skips the boot sequence.
- **Reduced motion:** when `prefers-reduced-motion: reduce`, the hook starts fully revealed (no
  timer) so output appears instantly.
- A blinking cursor block (`▌`) trails the currently-typing position.

This is fully React-controlled (no `dangerouslySetInnerHTML`), so links are real `<a>` elements and
interruption is deterministic.

## 6. Boot Sequence (`TerminalMode/BootSequence.tsx`)

Plays once per session entry into the terminal (skippable with any key):

1. Kernel line: `[ 0.000000 ] booting diogo.dev kernel 3.0.1-phosphor`.
2. A list of `[  OK  ]` service lines appear with small staggered delays (curiosity,
   `/home/diogo`, Coffee Daemon, Full-Stack, Developer (UMAIA · Worten), …). `[  OK  ]` in green.
3. An in-place filling progress bar: `loading portfolio … [■■■■····] 45%` → 100%.
4. Braille spinner `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` with `authenticating guest@diogo.dev …` → `✓ welcome aboard`.
5. Clear screen → ASCII "diogo" banner with a pulsing glow.
6. Auto-type `whoami` (typewriter) and show its output.
7. Settle into the interactive prompt `guest@diogo.dev:~$ `.

All timings live in one constants object so the whole sequence is easy to tune. Under reduced
motion the sequence collapses to its final state (banner + prompt) immediately.

## 7. Boot Menu (`BootMenu.tsx`, GRUB-style)

- Renders bootable entries from a data array: `[{ id:'terminal', label:'diogo.dev terminal
  (phosphor)' }, { id:'gui', label:'diogo.dev desktop (graphical)' }]` (extensible — a future
  `ide` entry slots in here).
- Keyboard: ↑/↓ move selection, Enter boots, any other key cancels the countdown.
- A countdown line ("Booting `terminal` in 4s…") auto-selects the default (terminal) when it
  reaches 0. Visiting `#terminal`/`#gui` directly (or a stored `bootChoice`) skips the menu.
- GRUB-flavored chrome: title, version line, help footer (`↑/↓ select · Enter boot`).

## 8. HUD & Effects

- **HUD** (fixed corner, present in terminal mode): live clock, clickable phosphor **color
  swatches** (green/amber/cyan/magenta/blue/white), a **matrix** toggle button, a **CRT** toggle.
  Each control mirrors a command so HUD and commands stay in sync.
- **Theme** (`theme <color>` / swatch): swaps CSS custom properties (`--term-fg`, `--term-fg-dim`,
  `--term-glow`, accent) on the terminal root. Persisted in `localStorage["termTheme"]`.
- **Matrix** (`matrix` / HUD): a `<canvas>` behind the terminal (opacity ~.28) with falling glyphs,
  toggled on/off. Paused entirely under reduced motion (toggle still available but static).
- **CRT overlay** (HUD toggle): CSS scanlines + vignette + subtle flicker. Flicker only under
  `prefers-reduced-motion: no-preference`; persisted in `localStorage["termCrt"]`.

## 9. Theming & Visual System

Terminal uses its **own** CSS-variable theme on a `.terminal-root` element, independent of the
site-wide dark/light `ThemeContext` (the terminal is always phosphor; the GUI mode keeps the
existing `ThemeProvider`).

```
Background   #0d1117 / #010409 (near-black)
Green        main #39d353 · light #56d364 · dark #2ea043 · glow rgba(57,211,83,.55)
Text         #c9d1d9   Dim #8b949e
Amber #d29922   Red #f85149   Blue #58a6ff
Fonts        'JetBrains Mono' (terminal) · 'Inter' (long-form text in GUI mode)
```

Soft rounded corners, neutral shadows, no real emoji (only ASCII/unicode marks: `☕ ☀ ● ▸ ✓ ■`).
Phosphor color presets are a small map keyed by theme name; `theme white` etc. swaps the var set.

### Exact content (single source of truth — `content.ts`)
- **Identity:** Diogo Gonçalves — *Computer Science Student & Full-Stack Developer*.
  Matosinhos, Portugal. Email `diogog.dev@gmail.com`.
  GitHub `https://github.com/Goncalves1307` · LinkedIn `in/diogo-goncalves-448814248`.
- **Bio:** "Hello there! I'm Diogo, a junior developer with an unwavering passion for crafting
  seamless digital experiences. Currently pursuing my Computer Science degree at UMAIA, I keep
  expanding my knowledge through extra Udemy courses. By day I work as a Technical Specialist at
  Worten — smartphones, IT, small appliances and customer support. Beyond the screen you'll find
  me at the gym or indulging my passion for cars."
- **Education:** BSc Computer Science · University of Maia (UMAIA) · 2022 — Present.
- **Work:** Technical Specialist · Worten · Since 2022.
- **Skills (name, %):** Languages — JavaScript 90, SQL 60, TypeScript 40, Python 40, Java 20.
  Web — HTML&CSS 95, Responsive 90, Tailwind 70. Frameworks — Node.js 85, Express 80, React 70,
  Django 30. Databases — PostgreSQL 80, MySQL 75. Tools — Git&GitHub 90, Docker 75, UI/UX 75.
- **Projects:**
  1. **BookVault** — Android App (Kotlin, Android Studio, Open Library API). "Book-tracking app:
     search any title and track your reads." repo `https://github.com/Goncalves745/BookVaultAndroid`.
  2. **Tower Defense** — Unity Game (Unity, C#). "Defende a base colocando e melhorando torres
     contra vagas de inimigos." (no public repo)
  3. **Schedulo** — Full-Stack (React, Node, Express, PostgreSQL, Prisma, Tailwind). "Plataforma
     SaaS de agendamentos por disponibilidade." repo `https://github.com/Goncalves745/Schedulo`.
- **CV:** `public/cv_pt.pdf`, `public/cv_en.pdf` (existing). `resume`/`cv` prints both as
  clickable download links (no interactive sub-prompt — keeps the engine stateless).

> Note: the brief's content (name "Diogo Gonçalves", role "Full-Stack Developer") is the
> authority for the terminal and supersedes the slightly different values in
> `src/data/siteConfig.ts`. We will not retro-edit the GUI mode's copy in this work.

## 10. Command Catalog

Derived from the brief; grouped by `help` category. Output styling via tokens.

**me:** `about` / `whoami` (bio), `experience` (vertical ASCII career timeline), `skills`
(animated `scaleX` bars per group), `stack` (tech as chips), `interests` (list),
`resume`/`cv` (prints two clickable download links, PT + EN — stateless, no sub-prompt),
`contact`/`social` (email, github, linkedin, location).

**work:** `projects` (list), `project <name>` (opens repo via `window.open`; Tower Defense has no
repo → friendly note).

**system:** `help` (categorized list), `man <cmd>` (manual page), `ls` / `tree` / `cat <file>`
(fake filesystem from `content.ts`), `neofetch` (ASCII logo + "system" info), `history`, `clear`,
`uptime`, `date`, `echo <text>`, `theme <green|amber|cyan|magenta|blue|white>`, `gui` (boot into
desktop mode), `exit` (returns to boot menu), `sudo` (joke: "nice try, guest").

**fun:** `matrix` (toggle rain), `banner` (ASCII banner), `coffee` (☕ art), `weather` (canned
Matosinhos line), `motd` (random quote). Easter-egg/hidden commands allowed via `hidden:true`.

Input UX: command history (↑/↓), Tab autocomplete (longest-common-prefix + cycle), Ctrl+L clears,
clickable command **chips** under the banner that run the command on click.

## 11. Accessibility & Responsive (hard requirements)

- **Reduced motion:** all entrance animations, boot sequence, typewriter, matrix flicker/rain, and
  CRT flicker are gated behind `@media (prefers-reduced-motion: no-preference)`. Final states
  (revealed text, filled skill bars, banner) are the **default**, so reduced-motion users get a
  fully usable, complete UI with no animation.
- **Skill bars** animate with `transform: scaleX()` (origin-left), never `width %`.
- **Any key** during boot/typing skips to the final state.
- **Mobile:** terminal occupies the full viewport; HUD collapses to a compact bar; font/spacing
  scale down; chips wrap. Touch: tapping the screen focuses the hidden input so the mobile keyboard
  opens; chips remain tappable.
- Inputs are real focusable elements; links are real `<a>`; color is never the only signal
  (labels accompany colored status).

## 12. Proposed File Layout

```
src/
  App.tsx                         # mode router (boot | terminal | gui)
  hooks/
    useHashMode.ts                # mode ⇄ hash + localStorage
    useTypewriter.ts              # token-stream reveal, interruptible, reduced-motion aware
    useCommandHistory.ts          # ↑/↓ history + Tab complete state
    useEnable3D.ts                # (existing) reused by GUI hero
  modes/
    BootMenu.tsx
    TerminalMode/
      Terminal.tsx                # orchestrates boot, prompt, scrollback, effects, HUD
      BootSequence.tsx
      Prompt.tsx                  # input line: history, tab, ctrl+L
      Scrollback.tsx              # rendered command/output lines
      Hud.tsx
      MatrixRain.tsx
      CrtOverlay.tsx
      AsciiBanner.tsx
    GuiMode.tsx                   # wraps existing Header…Footer + reboot control
  terminal/
    types.ts
    content.ts                    # exact portfolio data + fake FS + quotes
    commands.ts                   # registry + run()
    themes.ts                     # phosphor color presets (CSS var maps)
  components/                     # existing classic-portfolio components (reused by GuiMode)
  context/ThemeContext.tsx        # existing (GUI mode only)
  index.css                       # + terminal layer (vars, scanlines, fonts)
```

Existing `components/*`, `data/*`, `context/*`, `three/*` are kept and consumed by `GuiMode`.

## 13. Build Phases (all in scope; VS Code mode deferred)

- **P1 — Mode shell:** `useHashMode`, `App` router, `BootMenu` (nav + countdown), `GuiMode`
  wrapping the existing site + reboot control. Lazy-load terminal/gui chunks. *Verify:* boot menu
  navigates to either mode and back; refresh/deep-link persists.
- **P2 — Terminal core:** `types.ts`, `content.ts`, `commands.ts` (`help, about/whoami, skills,
  projects, contact`), `useTypewriter`, `Terminal` + `Prompt` + `Scrollback` + `BootSequence` +
  `AsciiBanner`, history/Tab/Ctrl+L, chips. *Verify:* boot plays, prompt accepts the five core
  commands, typewriter interruptible, reduced-motion path works.
- **P3 — Full command set:** remaining commands in §10 (experience, stack, interests, project,
  social, resume, neofetch, ls/tree/cat, echo, history, man, sudo, uptime, date, motd, weather,
  coffee, banner, clear, exit, gui). *Verify:* `help` lists all; `man`/Tab derive correctly.
- **P4 — Effects, HUD, polish:** `themes.ts` + `theme`/swatches, `MatrixRain`, `CrtOverlay`, HUD
  clock/toggles, full responsive + a11y pass, JetBrains Mono/Inter font loading. *Verify:* theme
  swap persists, matrix/CRT toggle + persist, mobile layout, `npm run lint` + `npm run build` clean.

## 14. Verification Strategy

No test runner is configured (per CLAUDE.md). Verification is:
- `npm run lint` (strict; `noUnusedLocals`/`noUnusedParameters`) and `npm run build` clean at the
  end of every phase.
- Manual run via `npm run dev`: walk each phase's "Verify" checklist, including a
  `prefers-reduced-motion: reduce` pass (DevTools emulation) and a mobile-viewport pass.
- Pure logic (`run()` dispatch, Tab-completion, theme map) is structured to be trivially unit-
  testable later, but no test harness is added in this work.

## 15. Risks / Mitigations

- **Typewriter performance on long output** → cap cps, reveal in token chunks, allow instant skip.
- **Mobile keyboard / focus** → hidden input focused on container tap; test on a real device.
- **Scope creep (VS Code mode)** → explicitly deferred; menu/router built to accept a 3rd entry.
- **Font flash** → preload JetBrains Mono; phosphor styles don't depend on font load.
- **Two themes coexisting** → terminal CSS vars are namespaced under `.terminal-root`; GUI keeps
  `ThemeContext`. They never share state.

## 16. Open Questions (none blocking)

- Final ASCII banner art for "diogo" — pick during P2 (tune glow).
- Exact motd quote list — fill a small curated set in `content.ts` during P3.
