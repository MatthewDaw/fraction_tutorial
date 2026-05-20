import { useEffect, useMemo, useState } from 'react';

type Props = {
  divisor: number;
  count: number;
  passPct?: number;
  yesPool: number[];
  noPool: number[];
  // 'last-digit' dims everything but the final digit; 'all-digits' keeps the
  // whole number full-brightness (for rules like digit sums).
  emphasis?: 'last-digit' | 'all-digits';
  // Bumped by the parent when the student re-enters the step.
  resetKey?: number;
  // Fires when the student submits a passing attempt.
  onPassed?: () => void;
};

const shuffled = <T,>(arr: readonly T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Roughly half yes, half no, drawn without replacement from each pool.
// Falls back to repeats if a pool is smaller than its share.
const drawSet = (yesPool: number[], noPool: number[], count: number): number[] => {
  const yesCount = Math.ceil(count / 2);
  const noCount = count - yesCount;
  const draw = (pool: number[], n: number): number[] => {
    const bag = shuffled(pool);
    const out: number[] = [];
    while (out.length < n && bag.length > 0) out.push(bag.pop()!);
    while (out.length < n && pool.length > 0) {
      out.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return out;
  };
  return shuffled([...draw(yesPool, yesCount), ...draw(noPool, noCount)]);
};

const WorksheetCanvas = ({
  divisor,
  count,
  passPct = 1,
  yesPool,
  noPool,
  emphasis = 'last-digit',
  resetKey = 0,
  onPassed,
}: Props) => {
  const [attempt, setAttempt] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const numbers = useMemo(
    () => drawSet(yesPool, noPool, count),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, resetKey, count],
  );

  useEffect(() => {
    setChecked(new Set());
    setResult(null);
  }, [attempt, resetKey]);

  const toggle = (idx: number) => {
    if (result) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSubmit = () => {
    if (result) return;
    let correct = 0;
    numbers.forEach((n, i) => {
      const isDivisible = n % divisor === 0;
      const studentSaysYes = checked.has(i);
      if (isDivisible === studentSaysYes) correct++;
    });
    const score = correct / numbers.length;
    const passed = score >= passPct;
    setResult({ score, passed });
    if (passed) onPassed?.();
  };

  const handleRetry = () => setAttempt((a) => a + 1);

  const threshold = Math.round(passPct * 100);

  return (
    <div className="worksheet">
      <header className="worksheet__header">
        <span className="worksheet__title">
          Check every number that IS divisible by {divisor}
        </span>
        <span className="worksheet__threshold">Pass: {threshold}%</span>
      </header>
      <ol className="worksheet__rows">
        {numbers.map((n, i) => {
          const isDivisible = n % divisor === 0;
          const isChecked = checked.has(i);
          const wasCorrect = result && isDivisible === isChecked;
          const wasWrong = result && !wasCorrect;
          const classes = [
            'worksheet__row',
            isChecked && 'worksheet__row--checked',
            wasCorrect && 'worksheet__row--correct',
            wasWrong && 'worksheet__row--wrong',
          ]
            .filter(Boolean)
            .join(' ');
          const digits = String(n);
          return (
            <li key={i} className={classes}>
              <button
                type="button"
                className="worksheet__cell"
                onClick={() => toggle(i)}
                disabled={!!result}
                aria-pressed={isChecked}
              >
                <span className="worksheet__check" aria-hidden="true">
                  {isChecked ? '✓' : ''}
                </span>
                <span className="worksheet__number">
                  {emphasis === 'all-digits' ? (
                    <span className="worksheet__lead">{digits}</span>
                  ) : (
                    <>
                      {digits.length > 1 && (
                        <span className="worksheet__tail">
                          {digits.slice(0, -1)}
                        </span>
                      )}
                      <span className="worksheet__lead">
                        {digits.slice(-1)}
                      </span>
                    </>
                  )}
                </span>
                {result && (
                  <span className="worksheet__mark" aria-hidden="true">
                    {wasCorrect ? '✓' : '✗'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="worksheet__footer">
        {result ? (
          result.passed ? (
            <div className="worksheet__result worksheet__result--pass">
              🎉 {Math.round(result.score * 100)}% — you passed!
            </div>
          ) : (
            <>
              <div className="worksheet__result worksheet__result--fail">
                {Math.round(result.score * 100)}% — need {threshold}%. Try again with a
                fresh set.
              </div>
              <button
                type="button"
                className="worksheet__submit"
                onClick={handleRetry}
              >
                New worksheet
              </button>
            </>
          )
        ) : (
          <button
            type="button"
            className="worksheet__submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default WorksheetCanvas;
