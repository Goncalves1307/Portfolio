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
