import { useEffect, useReducer } from 'react';

// Animated demonstration of a divisibility rule on a few example numbers.
// One example at a time cycles through three phases:
//   show  → digits appear plain
//   apply → the rule animates (last digit pulses, digits fly up to sum,
//           or last digit doubles+subtracts depending on `rule`)
//   verdict → ✓ or ✗ + plain-English conclusion
// Then it advances to the next example and loops.

export type TechniqueRule = 'last-digit' | 'digit-sum' | 'double-subtract' | 'alternating-sum';

export type TechniqueExample = {
  value: number;
  passes: boolean;
};

type Props = {
  rule: TechniqueRule;
  divisor: number;
  examples: TechniqueExample[];
};

type Phase = 'show' | 'apply' | 'verdict';

const PHASE_MS: Record<Phase, number> = {
  show: 900,
  apply: 1800,
  verdict: 1800,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  show: 'apply',
  apply: 'verdict',
  verdict: 'show',
};

type State = { exampleIdx: number; phase: Phase };

const reducer = (state: State, total: number): State => {
  const nextPhase = NEXT_PHASE[state.phase];
  const nextExample =
    state.phase === 'verdict' ? (state.exampleIdx + 1) % total : state.exampleIdx;
  return { exampleIdx: nextExample, phase: nextPhase };
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const TechniqueAnimation = ({ rule, divisor, examples }: Props) => {
  const [state, advance] = useReducer(reducer, { exampleIdx: 0, phase: 'show' as Phase });
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => advance(examples.length), PHASE_MS[state.phase]);
    return () => window.clearTimeout(id);
  }, [state.phase, state.exampleIdx, examples.length, reduced]);

  if (reduced) {
    return <StaticBoard rule={rule} divisor={divisor} examples={examples} />;
  }

  const example = examples[state.exampleIdx];
  return (
    <div className="technique" data-phase={state.phase} aria-live="polite">
      <div className="technique__stage">
        <RuleStage
          rule={rule}
          divisor={divisor}
          example={example}
          phase={state.phase}
        />
      </div>
      <div className="technique__dots" aria-hidden>
        {examples.map((_, i) => (
          <span
            key={i}
            className={`technique__dot${i === state.exampleIdx ? ' technique__dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

type StageProps = {
  rule: TechniqueRule;
  divisor: number;
  example: TechniqueExample;
  phase: Phase;
};

const RuleStage = ({ rule, divisor, example, phase }: StageProps) => {
  if (rule === 'last-digit') return <LastDigitStage divisor={divisor} example={example} phase={phase} />;
  if (rule === 'digit-sum') return <DigitSumStage divisor={divisor} example={example} phase={phase} />;
  if (rule === 'alternating-sum') return <AlternatingSumStage divisor={divisor} example={example} phase={phase} />;
  return <DoubleSubtractStage divisor={divisor} example={example} phase={phase} />;
};

const splitDigits = (n: number): string[] => String(n).split('');

const Verdict = ({ passes, divisor, label }: { passes: boolean; divisor: number; label?: string }) => (
  <div className={`technique__verdict technique__verdict--${passes ? 'yes' : 'no'}`}>
    <span className="technique__verdict-mark" aria-hidden>
      {passes ? '✓' : '✗'}
    </span>
    <span className="technique__verdict-text">
      {label ?? `${passes ? '' : 'not '}divisible by ${divisor}`}
    </span>
  </div>
);

const LastDigitStage = ({ divisor, example, phase }: { divisor: number; example: TechniqueExample; phase: Phase }) => {
  const digits = splitDigits(example.value);
  const lastIdx = digits.length - 1;
  return (
    <div className="technique__row">
      <div className="technique__number">
        {digits.map((d, i) => (
          <span
            key={i}
            className={`technique__digit${
              i === lastIdx && phase !== 'show' ? ' technique__digit--focused' : ''
            }${i !== lastIdx && phase === 'apply' ? ' technique__digit--dim' : ''}`}
          >
            {d}
          </span>
        ))}
      </div>
      {phase === 'verdict' && <Verdict passes={example.passes} divisor={divisor} />}
    </div>
  );
};

const DigitSumStage = ({ divisor, example, phase }: { divisor: number; example: TechniqueExample; phase: Phase }) => {
  const digits = splitDigits(example.value);
  const sum = digits.reduce((acc, d) => acc + Number(d), 0);
  return (
    <div className="technique__row technique__row--col">
      <div className="technique__number">
        {digits.map((d, i) => (
          <span
            key={i}
            className={`technique__digit${
              phase === 'apply' ? ' technique__digit--lift' : ''
            }`}
            style={phase === 'apply' ? { transitionDelay: `${i * 120}ms` } : undefined}
          >
            {d}
          </span>
        ))}
      </div>
      {phase !== 'show' && (
        <div className="technique__formula">
          {digits.join(' + ')} = <strong>{sum}</strong>
        </div>
      )}
      {phase === 'verdict' && (
        <Verdict
          passes={example.passes}
          divisor={divisor}
          label={`${sum} ${example.passes ? 'is' : 'is not'} divisible by ${divisor}`}
        />
      )}
    </div>
  );
};

const AlternatingSumStage = ({ divisor, example, phase }: { divisor: number; example: TechniqueExample; phase: Phase }) => {
  const digits = splitDigits(example.value);
  // Sign per position: + for even index (0, 2, ...), - for odd. Matches the
  // div-11 rule taught in v2lessons.ts (start from leftmost digit, add).
  const signs = digits.map((_, i) => (i % 2 === 0 ? '+' : '−'));
  const result = digits.reduce(
    (acc, d, i) => acc + (i % 2 === 0 ? Number(d) : -Number(d)),
    0,
  );
  const formula =
    digits.map((d, i) => `${i === 0 ? '' : signs[i] + ' '}${d}`).join(' ') +
    ` = ${result}`;
  return (
    <div className="technique__row technique__row--col">
      <div className="technique__number">
        {digits.map((d, i) => (
          <span
            key={i}
            className={`technique__digit${
              phase === 'apply' ? ' technique__digit--lift' : ''
            }`}
            style={phase === 'apply' ? { transitionDelay: `${i * 120}ms` } : undefined}
          >
            {phase !== 'show' && i > 0 && (
              <span className="technique__sign" aria-hidden>{signs[i]}</span>
            )}
            {d}
          </span>
        ))}
      </div>
      {phase !== 'show' && <div className="technique__formula">{formula}</div>}
      {phase === 'verdict' && (
        <Verdict
          passes={example.passes}
          divisor={divisor}
          label={`${result} ${example.passes ? 'is' : 'is not'} divisible by ${divisor}`}
        />
      )}
    </div>
  );
};

const DoubleSubtractStage = ({ divisor, example, phase }: { divisor: number; example: TechniqueExample; phase: Phase }) => {
  const digits = splitDigits(example.value);
  const lastDigit = Number(digits[digits.length - 1]);
  const rest = Number(digits.slice(0, -1).join('') || '0');
  const doubled = lastDigit * 2;
  const result = rest - doubled;
  return (
    <div className="technique__row technique__row--col">
      <div className="technique__number">
        {digits.map((d, i) => (
          <span
            key={i}
            className={`technique__digit${
              i === digits.length - 1 && phase !== 'show' ? ' technique__digit--focused' : ''
            }`}
          >
            {d}
          </span>
        ))}
      </div>
      {phase !== 'show' && (
        <div className="technique__formula">
          {rest} − ({lastDigit} × 2) = <strong>{result}</strong>
        </div>
      )}
      {phase === 'verdict' && (
        <Verdict
          passes={example.passes}
          divisor={divisor}
          label={`${result} ${example.passes ? 'is' : 'is not'} divisible by ${divisor}`}
        />
      )}
    </div>
  );
};

const StaticBoard = ({ rule, divisor, examples }: { rule: TechniqueRule; divisor: number; examples: TechniqueExample[] }) => (
  <div className="technique technique--static">
    {examples.map((ex, i) => (
      <div key={i} className="technique__static-row">
        <RuleStage rule={rule} divisor={divisor} example={ex} phase="verdict" />
      </div>
    ))}
  </div>
);

export default TechniqueAnimation;
