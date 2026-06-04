# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (HMR)
npm run build    # Production build to dist/ (vite build only — does NOT run tsc)
npm run lint     # ESLint over the whole repo (strict; the real type/dead-code gate)
npm run preview  # Serve the built dist/ locally
npm run deploy   # Publish dist/ to GitHub Pages (gh-pages); run build first
```

There is no test runner configured. `npm run build` is `vite build` only, so it does **not**
fail on TypeScript errors. Type and dead-code issues surface through `npm run lint`
(`noUnusedLocals`/`noUnusedParameters` are on, so unused imports/vars are lint errors).
Treat `npm run lint` as the gate.

## Architecture

Single-page app with **no router**. `src/App.tsx` is a tiny **mode router**: it reads the
active mode from `useHashMode()` and renders exactly one of three top-level experiences.

**Three modes** (`boot` | `terminal` | `gui`), switched by `src/hooks/useHashMode.ts`:
- The hook mirrors the mode to the URL hash (`#terminal`, `#gui`, default `#boot`) and to
  `localStorage["bootChoice"]`. It only recognises those three **mode tokens** — any other
  hash (e.g. the GUI's in-page `#about` links) is ignored and never switches modes.
- `boot` → `src/modes/BootMenu.tsx`, a GRUB-style selector (arrow-key nav, countdown
  auto-boot to the default `terminal` entry; countdown disabled under reduced motion).
- `terminal` → `src/modes/TerminalMode/Terminal.tsx` (lazy chunk) — the phosphor terminal.
- `gui` → `src/modes/GuiMode.tsx` (lazy chunk) — the **classic portfolio**, i.e. the existing
  `Header/Hero/About/Projects/Skills/Contact/Footer` components inside `ThemeProvider`, plus a
  fixed "⏻ reboot" button that returns to the boot menu. A `gui` command in the terminal jumps
  here; `exit` returns to the boot menu.

**Terminal engine** (`src/terminal/`):
- `types.ts` — `Command`, `Registry`, `RunResult` (a discriminated union: `output` / `clear` /
  `effect` / `none`), `OutputToken`/`OutputLine`, and token builders (`t`, `line`, `link`, `blank`).
- `content.ts` — all portfolio data (profile, education, work, skill groups, projects, stack,
  interests, fake filesystem, motd quotes, CV paths). **Edit copy here, not in components.**
- `commands.ts` — a data-driven `registry` of commands plus `run(input, ctx)`. `help`, `man`, and
  Tab-completion all derive from the registry, so adding a command is a single registry entry.
  Side effects are never executed here — commands return `{ kind: 'effect', effect, arg }` and the
  `Terminal` component performs the effect (open URL, download, theme, matrix, crt, gui, exit).
- `themes.ts` — phosphor color presets; `applyTheme(root, name)` writes CSS custom properties.

**Terminal UI** (`src/modes/TerminalMode/`): `Terminal.tsx` orchestrates the boot phase,
scrollback, prompt, history/Tab/Ctrl+L, chips, HUD, and effects. `BootSequence.tsx` (Linux-style
boot animation), `AsciiBanner.tsx`, `Prompt.tsx` (input line), `Hud.tsx` (clock, color swatches,
matrix/CRT toggles), `MatrixRain.tsx` (canvas). `src/hooks/useTypewriter.ts` reveals output
token-by-token (interruptible; full output by default under reduced motion).

## Styling conventions

- **Terminal** styling is self-contained: CSS custom properties live on `.terminal-root` in
  `src/index.css` (`--term-fg`, `--term-accent`, `--term-glow`, …) with `.t-*` color utilities
  (`.t-accent`, `.t-dim`, `.t-amber`, `.t-red`, `.t-blue`, `.t-link`). The `theme` command / HUD
  swatches overwrite these vars at runtime; the choice persists in `localStorage["termTheme"]`.
  CRT is `localStorage["termCrt"]`. The terminal is always phosphor and does **not** use the
  site-wide dark/light `ThemeContext`.
- **GUI/desktop** mode uses the existing Tailwind semantic palette (`primary`=emerald,
  `secondary`=teal, `accent`=lime, plus `success`/`warning`/`error`) and `ThemeContext` dark mode.
  Reusable component classes (`.container-custom`, `.btn*`, `.card`, `.glass`, `.skill-*`) are in
  `src/index.css` under `@layer components`.

## Accessibility (hard requirement)

Final states are visible by **default**; all motion (boot, typewriter, matrix, CRT flicker, banner
glow, caret blink) is gated behind `@media (prefers-reduced-motion: no-preference)` in
`src/index.css`. Any key skips the boot sequence and the typewriter. Keep new animation behind that
media query, and keep the final/complete state as the default.

## Known gotchas

- `npm run build` does not run `tsc`; rely on `npm run lint` for type/dead-code errors.
- Fonts: JetBrains Mono (terminal) + Inter (GUI) are loaded in `index.html`; the `mono` family and
  the custom `xs: 420px` screen are defined in `tailwind.config.js`.
- The CRT effect is pure CSS (`.t-crt` / `.t-crt-flicker` classes on the terminal root), not a
  component — there is no `CrtOverlay.tsx`.
- A green-theme **design system kit** lives in `design-system/` (reference material, gitignored
  `.zip`); it is not part of the build.
