# Diogo.dev — Design System

A design system distilled from **Diogo Gonçalves's personal portfolio website** (he goes by *Diogo Soares* / *Diogo.dev*), a Computer Science student and full-stack developer based in Matosinhos, Portugal. The portfolio is a single-page, scroll-driven site introducing him, his skills, his projects, and how to reach him.

> **Green re-theme.** The live site ships a *blue / purple / teal* palette. The brand owner asked for a **green** identity, so this system re-themes the entire palette to a **green family — emerald primary, teal secondary, lime accent** — while preserving the original structure, type, components, copy, motion and assets exactly as built. Everything else is lifted faithfully from the source code.

---

## Sources

- **GitHub repo (source of truth):** https://github.com/Goncalves1307/Portfolio
  - Stack: **Vite + React 18 + TypeScript + Tailwind CSS**, `framer-motion` (animation), `lucide-react` (icons), `react-intersection-observer` (scroll reveals), `@formspree/react` (contact form).
  - Author's other repos worth exploring for more context: https://github.com/Goncalves1307 (e.g. `Schedulo`, `bookvaultandroid`, `propulse`).
- No Figma, decks, or written brand guidelines were provided — the visual language below is reverse-engineered from the component code (`src/components/*.tsx`, `src/index.css`, `tailwind.config.js`).

The reader is encouraged to browse the repo above to build higher-fidelity designs than this system alone allows.

---

## Product context

It's a **one-page developer portfolio** with a sticky glass navbar and these stacked sections:

| Section | Purpose |
|---|---|
| **Hero** | Name + tagline, two CTAs (*Get in touch*, *Download CV* with a PT/EN language popup), profile photo with floating tech-logo bubbles and blurred color blobs. |
| **About** | Bio ("My Journey"), Education + Experience cards, interest tags. |
| **Skills** | Six skill categories, each a card of labelled progress bars (animated fill). |
| **Projects** | Filterable grid of project cards (image, title, category pill, description, tech tags, GitHub link). |
| **Contact** | Email + location + social links (GitHub, LinkedIn). |
| **Footer** | Wordmark, quick links, contact recap on a dark slab. |

Cross-cutting: a **dark-mode toggle** (sun/moon, class strategy, persisted), a custom **animated cursor** (blend-mode dot that scales on hover/click), and **framer-motion staggered reveals** as sections enter the viewport.

The person: junior developer, CS degree at **University of Maia (UMAIA)**, day job as **Technical Specialist at Worten**, into the gym and cars. Socials: GitHub `Goncalves1307` / `Goncalves745`, LinkedIn `diogo-goncalves-448814248`, email `diogog.dev@gmail.com`.

---

## CONTENT FUNDAMENTALS

**Voice — first person, warm, and direct.** Copy is written as *Diogo speaking to a visitor*: "**I**'m a dedicated computer science student…", "**you'll** find me pursuing physical excellence at the gym." It opens literally with "**Hello there!** I'm Diogo." Friendly, a little informal, earnest rather than corporate.

**Tone:** enthusiastic and self-assured without bragging — "an unwavering passion for crafting seamless digital experiences," "discipline and continuous improvement … are the cornerstones of success." Aspirational but grounded in real specifics (UMAIA, Worten, the gym, cars).

**Casing:** Headings are **Title Case** ("Featured Projects", "Let's Work Together", "Technologies & Expertise"). Eyebrow labels are short and Title Case ("About Me", "My Work", "My Skills", "Get In Touch"). Body is normal sentence case.

**Structure of a section:** every section follows the same rhythm —
1. a small **eyebrow pill** (colored, rounded-full) naming the section,
2. a bold **H2 headline**,
3. a one-sentence **lead paragraph** in muted gray, max-width-constrained and centered.

**Pronouns:** "I / my" for Diogo, "you" for the reader. Inclusive and conversational.

**Emoji:** essentially none in UI copy. The only glyph used decoratively is a Heart icon (lucide) before "My Interests" and an `✕` as the modal close. No emoji in headings or body. Keep it emoji-free.

**Examples to echo:**
- Eyebrow → H2 → lead: *"My Work" → "Featured Projects" → "Here are some of my recent projects that showcase my skills and passion…"*
- CTA verbs: "Get in touch", "Download CV", "View More on GitHub", "Let's Work Together".
- Slightly raw, human phrasing is on-brand (the real site even has small typos like "i'm" lowercase) — keep copy natural, not over-polished.

---

## VISUAL FOUNDATIONS

**Overall vibe:** clean, modern, friendly developer-portfolio. Lots of whitespace, soft shadows, rounded corners, and bright green accents over a near-white (or near-black in dark mode) slate-tinted canvas. Light and dark modes are first-class.

**Color** — re-themed to a **green family**:
- **Primary = Emerald** (`--primary-500 #10b981`, buttons use 600/700). This is the brand green — used for the logo accent, links, primary buttons, eyebrow pills, icon wells, skill-bar fill, focus accents.
- **Secondary = Teal** (`#14b8a6`) — project filter chips, secondary buttons, the second "Projects" eyebrow, decorative blobs.
- **Accent = Lime** (`#84cc16`) — energetic highlights, the Skills eyebrow, occasional icon tints.
- **Semantic:** success green `#16a34a`, warning amber `#f59e0b`, error red `#ef4444` (error red tints the Contact eyebrow and the Heart icon).
- **Neutrals:** slate-tinted grays. Page bg `--light #f8fafc`; ink/dark bg `--dark #0f172a`; cards pure white (gray-800 in dark). Borders are `gray-200` (gray-700 dark).
- Each brand hue ships a full **50→900 ramp** (see `colors_and_type.css`). Tinted-surface pattern: `bg-{hue}-50` + `text-{hue}-700` for light pills, `bg-{hue}-900/30` + `text-{hue}-300` for dark.

**Type:** **Inter** only (400/500/600/700, plus 800 for heavy display), loaded from Google Fonts. Headings are **bold, tight leading, slightly negative tracking**, and *fluid/responsive* (h1 scales 40→60px, h2 30→36px, h3 24→30px). Body is `leading-relaxed` (~1.65). No serif, no mono — single-family system.

**Spacing & layout:** 4px base scale. Content lives in a centered `max-w-7xl` container with `px-4 md:px-8`. Sections are tall and breathable (`py-16 md:py-24`). Generous `gap-8` grids (1 → 2 → 3 columns responsive). Lead paragraphs and section intros are width-capped (`max-w-2xl`) and centered.

**Backgrounds:** mostly flat — white sections alternating with `gray-50 / gray-900` tinted sections for rhythm. The signature flourish is **large, blurred, low-opacity color "blobs"** (`rounded-full blur-3xl`, ~20–30% opacity) floating behind the hero and decoratively beside the profile image — emerald/teal/lime orbs that softly tint the canvas. No photographic backgrounds, no repeating patterns, no heavy gradients beyond these soft blobs and two utility gradients (radial/conic) defined but rarely used.

**Imagery:** real project screenshots and a single warm profile photo (`diogo.jpeg`), shown in a `rounded-2xl` frame with a thick **white/dark border-4** and `shadow-2xl`. Project images sit at the top of cards (`h-56`, `object-cover`) and **zoom on hover** (`group-hover:scale-110`, 500ms). Imagery is natural-colored, no global filter or grain.

**Cards:** white (`gray-800` dark), `rounded-xl` (`--radius-lg`), `shadow-md` resting → **`shadow-xl` on hover**, with the whole card lifting `-5px` (framer `whileHover={{ y: -5 }}`). No borders on content cards (shadow does the separation); bordered only on tag chips and ghost buttons.

**Buttons:**
- *Primary*: `bg-primary-600` → hover `bg-primary-700`, white text, `rounded-lg`, `py-3 px-6`, `shadow-md` → `shadow-lg`, often with a trailing lucide icon (ArrowRight / Download).
- *Secondary*: same shape, `bg-secondary-600` → `700`.
- *Ghost*: transparent with a `gray-300/700` border, hover fills `gray-100 / gray-800`.
- All buttons: `font-semibold`, `inline-flex items-center`, `transition-all duration-300`.

**Pills / chips / tags:** `rounded-full` for eyebrows, interest tags, filter chips, social-icon wells; `rounded-md` (`--radius-sm`) for small tech tags inside cards. Filter chips have an active state (filled tinted bg + shadow) vs inactive (`gray-100 / gray-800`).

**Borders & radii:** radii in active use — `rounded-md` (chips), `rounded-lg` (buttons), `rounded-xl` (cards), `rounded-2xl` (hero image), `rounded-full` (pills/avatars). Borders are 1px hairlines in `gray-200/700`, except the hero photo's decorative `border-4`.

**Shadows / elevation:** Tailwind's scale, used literally — `shadow-sm` (tags), `shadow-md` (resting cards/buttons), `shadow-lg` (button hover, glass header), `shadow-xl` (card hover), `shadow-2xl` (hero photo). All neutral (black-alpha), no colored shadows. No inset shadows.

**Transparency & blur:** the sticky header is **glassmorphic** once scrolled — `bg-white/80 dark:bg-gray-900/80` + `backdrop-blur-md` + `shadow-lg`; transparent at the top of the page. Modals use a `bg-black/50` scrim. Decorative blobs rely on `blur-2xl/3xl` + low opacity. Dark-mode tinted pills use `/30` alpha.

**Motion / animation:**
- **Easing:** `ease-out` for entrances, `ease-in-out` for ambient loops; durations 200ms (fast/interaction), 300ms (most transitions), 500ms (image zoom / reveals).
- **Entrances:** framer-motion fade + 20px slide-up, **staggered** across children (`staggerChildren` 0.1–0.2) as each section scrolls into view (triggers once).
- **Skill bars:** width animates 0 → level% over 1s `easeOut`.
- **Ambient:** `pulse-slow` (4s) on hero blobs; `animate-bounce` on the scroll-down indicator.
- **Hover:** cards lift `-5px` + deepen shadow; images scale 1.1; links/icons shift to brand green; buttons darken one step and deepen shadow.
- **Press:** the custom cursor shrinks (`scale-75`) on mousedown; buttons rely on `transition-all` color/shadow change (no explicit scale-down on buttons).
- **Custom cursor:** a small brand-green dot, `mix-blend-mode: difference`, follows the pointer, scales 1.5× over interactive elements, 0.75× on click; hidden on touch/mobile.

**Fixed elements:** the navbar is `fixed top-0` full-width, z-50; the animated cursor and mobile menu overlay are fixed/z-50. Everything else is normal scroll flow.

---

## ICONOGRAPHY

- **Primary icon set: [Lucide](https://lucide.dev)** via `lucide-react` (v0.344). This is the *only* UI icon system. Stroke icons, **2px stroke, round caps/joins, 24px default grid**, drawn in `currentColor` so they inherit text color (and brand green on hover). Icons in use: `Menu, X, Moon, Sun, Github, Linkedin, Mail, MapPin, ArrowRight, ArrowUpRight, Download, Briefcase, GraduationCap, Heart, Code, Layers, Layout, Database, LineChart, ShieldCheck`. The **favicon / brand mark is the Lucide `Code` glyph** (`< >`), see `assets/favicon.svg`.
  - In HTML mockups, load Lucide from CDN: `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`, or use inline `<i data-lucide="github"></i>`.
- **Brand / tech logos:** colored **devicon** SVGs from CDN (`cdn.jsdelivr.net/gh/devicons/devicon/...`) for the floating hero bubbles — React, Python, TypeScript. These are the official multicolor language/framework marks, dropped into white `rounded-full` wells with `shadow-lg`.
- **Icon wells:** icons frequently sit inside a `w-10/12 h-10/12 rounded-full` tinted circle (`bg-{hue}-100 dark:bg-{hue}-900/30`) with the icon in the matching `{hue}-600/400`.
- **No emoji** as icons. The only non-lucide glyph is a literal `✕` for the modal close button.
- See `assets/` for `favicon.svg` (the code mark) and the project/profile imagery.

---

## INDEX — what's in this system

| File / folder | What it is |
|---|---|
| `README.md` | This document — context, content & visual foundations, iconography. |
| `colors_and_type.css` | All design tokens: green palette ramps, semantic surface/text vars, Inter type scale, radii, shadows, spacing, motion. Light + dark. |
| `SKILL.md` | Agent-Skill manifest so this system can be used inside Claude Code. |
| `assets/` | Real brand imagery: `favicon.svg` (Code brand mark), `diogo.jpeg` (profile), `bookvault1.png`, `schedulo.jpeg`, `towerdefense.png` (project shots). |
| `preview/` | Small HTML specimen cards powering the Design System tab (colors, type, components, motion). |
| `ui_kits/portfolio/` | High-fidelity, interactive recreation of the portfolio site — `index.html` plus modular JSX components. |

> **Font note:** Inter is loaded from Google Fonts (the same way the live site loads it), so no local font files are bundled. If you need an offline copy, ask and I'll vendor the `.woff2` files into `fonts/`.
