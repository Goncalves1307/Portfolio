import { useEffect, useState } from "react";

/**
 * Decides whether the (heavier) WebGL hero scene should mount.
 *
 * Off when the user prefers reduced motion, or on small / touch-first screens
 * where the canvas isn't worth the battery and bandwidth. Starts `false` so the
 * first paint never blocks on the 3D chunk — it flips on after mount, letting
 * the lazy import load in the background. Re-evaluates if the media queries change
 * (e.g. the user toggles "reduce motion" or rotates a tablet).
 */
export function useEnable3D(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 768px)");
    const update = () => setEnabled(!reduced.matches && !small.matches);

    update();
    reduced.addEventListener("change", update);
    small.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      small.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}
