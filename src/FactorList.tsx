type Props = {
  target: number;
  // All factors of `target`, smallest to largest. The list reveals slots in
  // order so kids can see how many they're still hunting for.
  factors: number[];
  // Subset of `factors` the student has discovered so far.
  discovered: number[];
  title?: string;
};

const FactorList = ({ target, factors, discovered, title }: Props) => {
  const known = new Set(discovered);
  return (
    <div className="factor-list">
      <div className="factor-list__title">
        {title ?? `Factors of ${target}`}
      </div>
      <div className="factor-list__chips">
        {factors.map((f) => (
          <span
            key={f}
            className={`factor-chip${known.has(f) ? ' factor-chip--known' : ''}`}
          >
            {known.has(f) ? f : '?'}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FactorList;
