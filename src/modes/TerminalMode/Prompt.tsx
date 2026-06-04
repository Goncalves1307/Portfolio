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
