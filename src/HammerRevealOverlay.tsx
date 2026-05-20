import { useEffect } from 'react';
import { HAMMER_PATHS } from './ToolPanel';

const DURATION_MS = 2000;
const SPARKLE_COUNT = 8;

const HammerRevealOverlay = ({ n, onComplete }: { n: number; onComplete: () => void }) => {
  useEffect(() => {
    const t = window.setTimeout(onComplete, DURATION_MS);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  const path = HAMMER_PATHS[n] ?? HAMMER_PATHS[2];

  return (
    <div className="hammer-reveal" aria-hidden>
      <div className="hammer-reveal__glow" />
      <div className="hammer-reveal__waves">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`hammer-reveal__wave hammer-reveal__wave--${i}`} />
        ))}
      </div>
      <svg className="hammer-reveal__sparkles" viewBox="-100 -100 200 200">
        {Array.from({ length: SPARKLE_COUNT }).map((_, i) => {
          const angle = (i / SPARKLE_COUNT) * Math.PI * 2;
          const r = 70;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          // Squiggle/zig-zag mark instead of a plain star.
          const d = `M${x - 6} ${y} q3 -4 6 0 t6 0`;
          return (
            <path
              key={i}
              d={d}
              className="hammer-reveal__squiggle"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          );
        })}
      </svg>
      <svg className="hammer-reveal__hammer" viewBox="0 0 512 512">
        <path d={path} />
      </svg>
    </div>
  );
};

export default HammerRevealOverlay;
