# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (HMR)
npm run build    # Production build to dist/
npm run lint     # ESLint over the whole repo
npm run preview  # Serve the built dist/ locally
npm run deploy   # Publish dist/ to GitHub Pages (gh-pages); run build first
```

There is no test runner configured. Type checking happens through `tsc` settings during `vite build` (strict mode, `noUnusedLocals`/`noUnusedParameters` are on, so unused imports/vars fail the build).

## Architecture

Single-page marketing/portfolio site (no router). `src/App.tsx` is the whole page: it renders a fixed loading spinner for 1s, then mounts the sections in fixed order inside a `ThemeProvider` — `Header`, `Hero`, `About`, `Projects`, `Skills`, `Contact`, `Footer` (plus a global `AnimatedCursor`). Each section is a self-contained component in `src/components/`.

**Navigation is hash-based.** `Header.tsx` builds nav links from a hard-coded `["About", "Projects", "Skills", "Contact"]` array and links to `#about`, `#projects`, etc. Each target section sets a matching `id` on its `<section>`. Adding/renaming a section means updating both the array in `Header.tsx` and the section's `id`.

**Content is data-driven.** Section copy that changes often lives in `src/data/` (`projectsData.ts`, `skillsData.ts`) as plain exported arrays; `Projects.tsx` and `Skills.tsx` map over them. Edit data here rather than hand-editing JSX. Skill bars are driven by a numeric `level` (0–100). Project/profile images and CVs are static files in `public/` referenced by absolute path (e.g. `/bookvault1.png`).

**Theming** (`src/context/ThemeContext.tsx`): class-based dark mode (`darkMode: 'class'` in `tailwind.config.js`). The provider toggles the `dark` class on `<html>`, persists to `localStorage["theme"]`, and falls back to `prefers-color-scheme`. Consume via the `useTheme()` hook — never read the class directly. All styling uses Tailwind `dark:` variants.

**Styling conventions:**
- `tailwind.config.js` defines an extended semantic palette — `primary`, `secondary`, `accent`, `success`, `warning`, `error`, each with shades `50`–`900`, plus `light`/`dark` page background tokens. Use these tokens, not raw hex.
- Reusable component classes are declared in `src/index.css` under `@layer components`: `.container-custom` (page-width wrapper), `.section` (vertical padding), `.btn` + `.btn-primary`/`.btn-secondary`/`.btn-ghost`, `.card`, `.glass` (used by the scrolled header), `.skill-bar`/`.skill-progress`. Prefer these over re-deriving the same utility strings.
- Custom keyframe animations (`fade-in`, `slide-up`, etc.) are also in the Tailwind config.

**Scroll animations:** sections animate in on scroll using `framer-motion` + `react-intersection-observer`. The established pattern is `useInView({ triggerOnce: true, threshold: 0.1 })`, a parent `containerVariants` with `staggerChildren`, and per-child `itemVariants`; the motion container switches `animate` between `"hidden"`/`"visible"` based on `inView`. Reuse this pattern for new animated sections. Icons come from `lucide-react`.

## Known gotchas

- `npm run build` is `vite build` only — it does **not** run `tsc`, so TypeScript errors (including `noUnusedLocals`) do not fail the build. Type/dead-code issues only surface via `npm run lint`. Build and dev both currently succeed.
- `src/App.tsx` imports `Blog` from a non-existent `./components/Blog`, but never renders it. esbuild strips the unused import, so build/dev are unaffected — `npm run lint` flags it as an error (`no-unused-vars`). Safe to delete the line. `Projects.tsx` has a similar unused `ArrowUpRight` import.
- `@formspree/react` is a dependency but is not used anywhere; `Contact.tsx` currently renders contact details only, with no form.
- A green-theme **design system kit** lives in `design-system/` (`README.md`, `colors_and_type.css`, `ui_kits/portfolio/*`, `preview/*.html`, `assets/*`). It is reference material for the in-progress green + 3D redesign, not part of the build. The `.zip` archive there is gitignored. Identity/contact details are centralized in `src/data/siteConfig.ts` — edit there, not in components.
