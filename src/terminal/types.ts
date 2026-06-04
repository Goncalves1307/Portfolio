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
