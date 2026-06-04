import { useEffect, useRef } from 'react';

/** Falling-glyph canvas behind the terminal. Static (no animation) under
 *  reduced motion; the toggle still controls visibility. */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glyphs = 'アカサタナハマヤラワ0123456789ABCDEF<>/{}$#'.split('');
    let raf = 0;
    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.floor(canvas.width / 14);
      drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * 40));
    };
    resize();
    window.addEventListener('resize', resize);

    const accent = () =>
      getComputedStyle(canvas).getPropertyValue('--term-accent').trim() || '#39d353';

    const draw = () => {
      ctx.fillStyle = 'rgba(1,4,9,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accent();
      ctx.font = '14px "JetBrains Mono", monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(ch, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // one static frame
      ctx.fillStyle = accent();
      ctx.font = '14px "JetBrains Mono", monospace';
      for (let i = 0; i < cols; i++) {
        ctx.fillText(glyphs[i % glyphs.length], i * 14, (i % 20) * 14 + 14);
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.28] z-0"
    />
  );
}
