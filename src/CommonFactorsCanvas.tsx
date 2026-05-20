import { useEffect, useMemo, useRef, useState } from 'react';
import { commonFactors, factorsOf } from './factors';

type Side = 'a' | 'b';

type Props = {
  a: number;
  b: number;
  // Bumped by parent when the step changes — wipes the moved set so a revisit
  // starts fresh.
  resetKey?: number;
  onAllMoved?: () => void;
  // 'result' pre-fills the common zone with every shared factor and disables
  // interaction — used by recap steps to show the finished state.
  mode?: 'play' | 'result';
};

const CommonFactorsCanvas = ({
  a,
  b,
  resetKey = 0,
  onAllMoved,
  mode = 'play',
}: Props) => {
  const factorsA = useMemo(() => factorsOf(a), [a]);
  const factorsB = useMemo(() => factorsOf(b), [b]);
  const shared = useMemo(() => new Set(commonFactors(a, b)), [a, b]);

  const [moved, setMoved] = useState<Set<number>>(() =>
    mode === 'result' ? new Set(shared) : new Set(),
  );
  // Key bump remounts the chip so the CSS shake animation replays.
  const [shakeNonce, setShakeNonce] = useState(0);
  const [shaking, setShaking] = useState<{ side: Side; f: number } | null>(null);

  useEffect(() => {
    setMoved(mode === 'result' ? new Set(shared) : new Set());
    setShaking(null);
  }, [a, b, resetKey, mode, shared]);

  const lastFiredRef = useRef(false);
  const allMoved = moved.size === shared.size && shared.size > 0;
  useEffect(() => {
    if (allMoved && !lastFiredRef.current) {
      lastFiredRef.current = true;
      onAllMoved?.();
    } else if (!allMoved) {
      lastFiredRef.current = false;
    }
  }, [allMoved, onAllMoved]);

  const handleTap = (f: number, side: Side) => {
    if (mode === 'result') return;
    if (!shared.has(f)) {
      setShaking({ side, f });
      setShakeNonce((n) => n + 1);
      return;
    }
    setMoved((m) => {
      if (m.has(f)) return m;
      const next = new Set(m);
      next.add(f);
      return next;
    });
  };

  const renderChip = (f: number, side: Side) => {
    const isMoved = moved.has(f);
    const isShaking = shaking?.side === side && shaking.f === f;
    const classes = [
      'factor-chip',
      'factor-chip--clickable',
      shared.has(f) && 'factor-chip--shared',
      isMoved && 'factor-chip--moved',
      isShaking && 'factor-chip--shake',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <button
        key={isShaking ? `${f}-${shakeNonce}` : f}
        type="button"
        className={classes}
        onClick={() => handleTap(f, side)}
        disabled={isMoved}
      >
        {f}
      </button>
    );
  };

  return (
    <div className="common-canvas">
      <div className="common-canvas__side">
        <div className="common-canvas__heading">Factors of {a}</div>
        <div className="common-canvas__chips">{factorsA.map((f) => renderChip(f, 'a'))}</div>
      </div>
      <div className="common-canvas__side">
        <div className="common-canvas__heading">Factors of {b}</div>
        <div className="common-canvas__chips">{factorsB.map((f) => renderChip(f, 'b'))}</div>
      </div>
      <div className="common-canvas__center">
        <div className="common-canvas__heading common-canvas__heading--center">Common</div>
        <div className="common-canvas__common-zone">
          {[...moved].sort((x, y) => x - y).map((f) => (
            <span key={f} className="factor-chip factor-chip--landed">
              {f}
            </span>
          ))}
          {moved.size === 0 && (
            <span className="common-canvas__hint">Tap shared factors ←</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonFactorsCanvas;
