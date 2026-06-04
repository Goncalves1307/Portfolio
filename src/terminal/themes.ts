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
