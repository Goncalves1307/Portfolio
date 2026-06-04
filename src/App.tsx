import { lazy, Suspense } from 'react';
import { useHashMode } from './hooks/useHashMode';
import BootMenu from './modes/BootMenu';

const Terminal = lazy(() => import('./modes/TerminalMode/Terminal'));
const GuiMode = lazy(() => import('./modes/GuiMode'));

export default function App() {
  const { mode, setMode } = useHashMode();

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#010409]" />}>
      {mode === 'boot' && (
        <BootMenu onSelect={(m) => setMode(m)} />
      )}
      {mode === 'terminal' && <Terminal onExit={() => setMode('boot')} />}
      {mode === 'gui' && <GuiMode onReboot={() => setMode('boot')} />}
    </Suspense>
  );
}
