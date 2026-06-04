import {
  profile, skillGroups, projects, education, work,
  interests, experienceTimeline, stackGroups, cvFiles, fileSystem, quotes,
} from './content';
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
  cv: {
    name: 'cv', category: 'me', summary: 'alias of resume', hidden: true,
    run: (args, ctx) => ctx.registry.resume.run(args, ctx),
  },
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
