import { useEffect, useRef, useState } from 'react';
import { colorForDenominator } from './fractions';
import MultiplierPanel, { MUSHROOM_PRIMES, MushroomPrime, MUSHROOM_COLORS } from './MultiplierPanel';

// A single side of the two-fraction board carries its own scale state. The
// `multipliers` map mirrors the canonical Multipliers system (Lane B):
// prime → exponent count. Per D7 we don't add new AllowedOps; the per-side
// mushroom toolbar bumps the count directly and the displayed num/denom are
// `base × ∏ p^count`. Combine (T5) reads the displayed pair.
export type SideMultipliers = Record<number, number>;

export type FractionSide = {
  num: number;
  denom: number;
  multipliers: SideMultipliers;
};

export const multiplierFactor = (m: SideMultipliers): number => {
  let f = 1;
  for (const prime of Object.keys(m)) {
    const p = Number(prime);
    const c = m[p] ?? 0;
    for (let i = 0; i < c; i++) f *= p;
  }
  return f;
};

export const displayedFraction = (side: FractionSide): { num: number; denom: number } => {
  const f = multiplierFactor(side.multipliers);
  return { num: side.num * f, denom: side.denom * f };
};

const incPrime = (m: SideMultipliers, p: number): SideMultipliers => ({
  ...m,
  [p]: (m[p] ?? 0) + 1,
});

const decPrime = (m: SideMultipliers, p: number): SideMultipliers => {
  const c = m[p] ?? 0;
  if (c <= 0) return m;
  const next = { ...m };
  if (c - 1 === 0) delete next[p];
  else next[p] = c - 1;
  return next;
};

type SideStub = {
  side: 'left' | 'right';
  fraction: FractionSide;
  onAddPrime: (p: MushroomPrime) => void;
  onDecPrime: (p: number) => void;
  available: readonly MushroomPrime[];
  draggable: boolean;
  isDragSource: boolean;
  showDropZone: boolean;
  fractionRef?: React.RefObject<HTMLDivElement>;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  dragTranslate?: { x: number; y: number } | null;
  snappingBack?: boolean;
};

const SideBlock = (props: SideStub) => {
  const {
    side,
    fraction,
    onAddPrime,
    onDecPrime,
    available,
    draggable,
    isDragSource,
    showDropZone,
    fractionRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    dragTranslate,
    snappingBack,
  } = props;

  const display = displayedFraction(fraction);
  const sideClasses = [
    'two-fraction__side',
    draggable ? 'two-fraction__side--draggable' : '',
    isDragSource ? 'two-fraction__side--dragging' : '',
    snappingBack ? 'two-fraction__side--snapback' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const fractionClasses = [
    'two-fraction__fraction',
    side === 'left' && showDropZone ? 'two-fraction__drop-zone two-fraction__drop-zone--active' : '',
    side === 'left' && draggable && !showDropZone ? 'two-fraction__drop-zone' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const transformStyle: React.CSSProperties | undefined =
    isDragSource && dragTranslate
      ? { transform: `translate(${dragTranslate.x}px, ${dragTranslate.y}px)` }
      : undefined;

  // Each prime in the multipliers shows a small decrement chip; the
  // MultiplierPanel below the fraction box bumps the count up. The chip's
  // colour mirrors the mushroom cap for the same prime so the increment and
  // decrement read as the same control surface. Only canonical mushroom
  // primes get chips — multipliers picked up from anywhere else would be
  // colourless and confusing, so we filter them out.
  const activePrimes = (MUSHROOM_PRIMES as readonly number[]).filter(
    (p) => (fraction.multipliers[p] ?? 0) > 0,
  );

  return (
    <div className={sideClasses}>
      <div
        ref={fractionRef}
        className={fractionClasses}
        style={transformStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="two-fraction__box"
          style={{ backgroundColor: colorForDenominator(display.denom) }}
        >
          <span className="two-fraction__numerals">
            <span className="two-fraction__num">{display.num}</span>
            <span className="two-fraction__bar" />
            <span className="two-fraction__den">{display.denom}</span>
          </span>
        </div>
        {activePrimes.length > 0 && (
          <div className="two-fraction__active-primes">
            {activePrimes.map((p) => (
              <button
                key={p}
                type="button"
                className="two-fraction__prime-chip"
                style={{ background: MUSHROOM_COLORS[p as MushroomPrime].cap }}
                aria-label={`Decrement multiplier by ${p}`}
                onClick={() => onDecPrime(p)}
              >
                ×{p}
                <sup>{fraction.multipliers[p]}</sup>
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        className="two-fraction__toolbar-wrap"
        role="toolbar"
        aria-label={`${side} mushrooms`}
      >
        <MultiplierPanel
          activePrime={null}
          available={available}
          onSelect={(p) => p != null && onAddPrime(p)}
        />
      </div>
    </div>
  );
};

type Props = {
  left: FractionSide;
  right: FractionSide;
  onChangeLeft: (next: FractionSide) => void;
  onChangeRight: (next: FractionSide) => void;
  // Fires when the student drops the right fraction onto the left while
  // displayed denominators match. The parent handles the actual combine
  // (T5 in App.tsx): seeds a single-fraction tree, swaps canvas.kind, etc.
  onCombine: (combined: { num: number; denom: number }) => void;
  // Fires when both sides' displayed denominators match. Used by the parent
  // to advance lesson/test phase state ('both-sides-same-denom' completion).
  onMatchedBases?: (matchedDenom: number) => void;
  // Subset of MUSHROOM_PRIMES each side's toolbar exposes. Defaults to the
  // full palette. The parent narrows this based on per-concept mastery —
  // e.g. ×7 is hidden until divisibility-7 is complete.
  availablePrimes?: readonly MushroomPrime[];
};

const TwoFractionsCanvas = ({
  left,
  right,
  onChangeLeft,
  onChangeRight,
  onCombine,
  onMatchedBases,
  availablePrimes = MUSHROOM_PRIMES,
}: Props) => {
  const leftDisp = displayedFraction(left);
  const rightDisp = displayedFraction(right);
  const matched = leftDisp.denom === rightDisp.denom;

  // Drag state lives in component memory; Pointer Events unify mouse + touch.
  const [dragging, setDragging] = useState(false);
  const [dragTranslate, setDragTranslate] = useState<{ x: number; y: number } | null>(null);
  const [snappingBack, setSnappingBack] = useState(false);
  const dragStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<number | null>(null);
  const lastMatchedNotified = useRef<number | null>(null);

  // Drive `onMatchedBases` only on the rising edge (matched flips false→true).
  useEffect(() => {
    if (!matched) {
      lastMatchedNotified.current = null;
      return;
    }
    if (lastMatchedNotified.current === leftDisp.denom) return;
    lastMatchedNotified.current = leftDisp.denom;
    onMatchedBases?.(leftDisp.denom);
  }, [matched, leftDisp.denom, onMatchedBases]);

  useEffect(() => () => {
    if (snapTimer.current != null) window.clearTimeout(snapTimer.current);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!matched) return;
    if (snappingBack) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    setDragTranslate({ x: 0, y: 0 });
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    if (e.pointerId !== dragStart.current.pointerId) return;
    setDragTranslate({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const droppedOnLeft = (clientX: number, clientY: number): boolean => {
    const el = leftRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    if (e.pointerId !== dragStart.current.pointerId) return;
    const hitLeft = droppedOnLeft(e.clientX, e.clientY);
    setDragging(false);
    dragStart.current = null;
    if (hitLeft && matched) {
      // Compute the combined fraction from displayed values, hand off to parent.
      const combinedNum = leftDisp.num + rightDisp.num;
      const sharedDenom = leftDisp.denom;
      setDragTranslate(null);
      onCombine({ num: combinedNum, denom: sharedDenom });
      return;
    }
    // Snap back: keep the translate, mount the snapback class so CSS animates
    // back to (0,0), then clear after the animation.
    setSnappingBack(true);
    if (snapTimer.current != null) window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => {
      setSnappingBack(false);
      setDragTranslate(null);
    }, 200);
  };

  const showDropZone = matched && dragging;

  return (
    <div className={`two-fraction${matched ? ' two-fraction--matched' : ''}`}>
      <SideBlock
        side="left"
        fraction={left}
        onAddPrime={(p) => onChangeLeft({ ...left, multipliers: incPrime(left.multipliers, p) })}
        onDecPrime={(p) => onChangeLeft({ ...left, multipliers: decPrime(left.multipliers, p) })}
        available={availablePrimes}
        draggable={false}
        isDragSource={false}
        showDropZone={showDropZone}
        fractionRef={leftRef}
      />
      <div
        className={`two-fraction__operator${matched ? ' two-fraction__operator--pulse' : ''}`}
        aria-hidden
      >
        +
      </div>
      <SideBlock
        side="right"
        fraction={right}
        onAddPrime={(p) => onChangeRight({ ...right, multipliers: incPrime(right.multipliers, p) })}
        onDecPrime={(p) => onChangeRight({ ...right, multipliers: decPrime(right.multipliers, p) })}
        available={availablePrimes}
        draggable={matched}
        isDragSource={dragging}
        showDropZone={false}
        fractionRef={rightRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        dragTranslate={dragTranslate}
        snappingBack={snappingBack}
      />
    </div>
  );
};

export default TwoFractionsCanvas;
