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
