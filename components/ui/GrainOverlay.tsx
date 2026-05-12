export function GrainOverlay({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-full h-full mix-blend-multiply"
      style={{ opacity }}
    >
      <filter id="grain-noise-overlay">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise-overlay)" />
    </svg>
  );
}
