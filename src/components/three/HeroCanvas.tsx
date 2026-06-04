import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type ThemeProps = { darkMode: boolean };

/**
 * The brand centerpiece: a slowly spinning, gently distorted emerald polyhedron
 * haloed by lime sparkles. A parallax group leans the whole thing toward the
 * pointer. Pointer tracking is done on `window` (not via canvas events) so the
 * canvas can stay `pointer-events: none` and never steal clicks from the hero CTAs.
 */
function Centerpiece({ darkMode }: ThemeProps) {
  const parallax = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    // clamp delta so a backgrounded tab doesn't jump on return
    const d = Math.min(delta, 0.05);
    if (spin.current) {
      spin.current.rotation.y += d * 0.2;
      spin.current.rotation.z += d * 0.05;
    }
    if (parallax.current) {
      parallax.current.rotation.y = THREE.MathUtils.lerp(
        parallax.current.rotation.y,
        pointer.current.x * 0.35,
        0.05
      );
      parallax.current.rotation.x = THREE.MathUtils.lerp(
        parallax.current.rotation.x,
        pointer.current.y * 0.25,
        0.05
      );
    }
  });

  return (
    <group ref={parallax} position={[1.6, 0.2, -0.5]}>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.9}>
        <Icosahedron ref={spin} args={[1.35, 6]}>
          <MeshDistortMaterial
            color={darkMode ? "#10b981" : "#34d399"}
            emissive={darkMode ? "#064e3b" : "#10b981"}
            emissiveIntensity={darkMode ? 0.4 : 0.15}
            roughness={0.25}
            metalness={0.6}
            distort={0.35}
            speed={1.6}
          />
        </Icosahedron>
      </Float>
      <Sparkles
        count={60}
        scale={[7, 5, 4]}
        size={3}
        speed={0.4}
        noise={1.2}
        color="#a3e635"
        opacity={darkMode ? 0.85 : 0.55}
      />
    </group>
  );
}

/**
 * Lazy-loaded WebGL layer for the hero. Mounted only by `useEnable3D` (desktop,
 * motion allowed) and rendered behind the hero content as a transparent overlay.
 */
export default function HeroCanvas({ darkMode }: ThemeProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={darkMode ? 0.45 : 0.75} />
      <directionalLight position={[3, 4, 5]} intensity={darkMode ? 1.1 : 1.3} />
      <pointLight position={[-4, -2, -2]} intensity={0.6} color="#14b8a6" />
      <Suspense fallback={null}>
        <Centerpiece darkMode={darkMode} />
      </Suspense>
    </Canvas>
  );
}
