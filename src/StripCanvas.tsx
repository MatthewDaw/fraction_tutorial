import { useEffect, useState } from 'react';
import { colorForDenominator } from './fractions';

type Props = {
  count: number;
  // Bumped by the parent when the student should get a fresh undivided strip
  // (re-entering a step, hitting reset).
  resetKey?: number;
  // The hammer the student has armed from the ToolPanel. Tapping the strip
  // with a hammer set attempts to slice `count` blocks into `hammer` equal
  // groups. Null = no hammer armed; tap does nothing.
  activeHammer: number | null;
  // Fires once per student tap that actually runs (hammer armed, not already
  // succeeded). `success` is true when the strip sliced cleanly. Lessons that
  // advance only on success ignore the false case; lessons that always
  // advance (one-hammer intros) call markSolved either way.
  onAttempt?: (success: boolean) => void;
};

type Attempt = { hammer: number; fullGroups: number; perGroup: number; leftover: number };

const StripCanvas = ({ count, resetKey = 0, activeHammer, onAttempt }: Props) => {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [shakeNonce, setShakeNonce] = useState(0);

  useEffect(() => {
    setAttempt(null);
  }, [count, resetKey]);

  const tryHammer = () => {
    if (activeHammer == null) return;
    if (attempt && attempt.leftover === 0) return;
    const fullGroups = Math.floor(count / activeHammer);
    const leftover = count - fullGroups * activeHammer;
    setAttempt({ hammer: activeHammer, fullGroups, perGroup: activeHammer, leftover });
    if (leftover > 0) setShakeNonce((n) => n + 1);
    onAttempt?.(leftover === 0);
  };

  const hue = attempt ? colorForDenominator(attempt.hammer) : colorForDenominator(count);
  const armedClass = activeHammer != null && (!attempt || attempt.leftover > 0)
    ? ' strip-canvas--armed'
    : '';

  const renderBlocks = () => {
    if (!attempt) {
      return (
        <div className="strip-row">
          <div className="strip-group" style={{ background: hue }}>
            {Array.from({ length: count }).map((_, i) => (
              <span key={i} className="strip-block" />
            ))}
          </div>
        </div>
      );
    }
    const groups = Array.from({ length: attempt.fullGroups });
    return (
      <div className={`strip-row strip-row--split${attempt.leftover > 0 ? ' strip-row--failed' : ''}`}>
        {groups.map((_, g) => (
          <div key={g} className="strip-group strip-group--clean" style={{ background: hue }}>
            {Array.from({ length: attempt.perGroup }).map((_, i) => (
              <span key={i} className="strip-block" />
            ))}
          </div>
        ))}
        {attempt.leftover > 0 && (
          <div key={`leftover-${shakeNonce}`} className="strip-group strip-group--orphan">
            {Array.from({ length: attempt.leftover }).map((_, i) => (
              <span key={i} className="strip-block strip-block--orphan" />
            ))}
          </div>
        )}
      </div>
    );
  };

  const caption = (() => {
    if (!attempt) {
      if (activeHammer != null) {
        return (
          <>Tap the strip with the <strong>{activeHammer}</strong> hammer to split {count} into groups of {activeHammer}.</>
        );
      }
      return <>Pick a hammer, then tap the strip.</>;
    }
    if (attempt.leftover === 0) {
      return (
        <>{attempt.fullGroups} groups of {attempt.perGroup} — {count} IS divisible by {attempt.hammer}.</>
      );
    }
    return (
      <>{attempt.fullGroups} groups of {attempt.perGroup} with {attempt.leftover} left over — {count} is NOT divisible by {attempt.hammer}.</>
    );
  })();

  return (
    <div className={`strip-canvas${armedClass}`}>
      <div className="strip-canvas__caption">{caption}</div>
      <button
        type="button"
        className="strip-canvas__target"
        onClick={tryHammer}
        aria-label={`Strip of ${count} blocks`}
        key={shakeNonce}
      >
        {renderBlocks()}
      </button>
    </div>
  );
};

export default StripCanvas;
