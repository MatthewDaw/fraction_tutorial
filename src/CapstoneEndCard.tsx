export type CapstoneProblem = {
  // The two operands the student saw.
  left: { num: number; denom: number };
  right: { num: number; denom: number };
  // The simplified sum they landed on. May be null if the run was abandoned
  // mid-problem — included for forward-compat; the current harness only
  // records completed problems.
  result?: { num: number; denom: number };
};

type Props = {
  problemsSolved: number;
  totalProblems: number;
  problems: CapstoneProblem[];
  passed?: boolean;
  onRetry: () => void;
};

const FractionGlyph = ({ f }: { f: { num: number; denom: number } }) => (
  <span className="capstone-fraction">
    <span className="capstone-fraction__num">{f.num}</span>
    <span className="capstone-fraction__bar" />
    <span className="capstone-fraction__den">{f.denom}</span>
  </span>
);

const CapstoneEndCard = ({ problemsSolved, totalProblems, problems, passed, onRetry }: Props) => {
  return (
    <div className="capstone-end-card" role="status">
      <div className="capstone-end-card__score">
        <span className="capstone-end-card__score-num">{problemsSolved}</span>
        <span className="capstone-end-card__score-sep">/</span>
        <span className="capstone-end-card__score-den">{totalProblems}</span>
      </div>
      <p className="capstone-end-card__caption">
        {passed ? 'on your first try' : 'this run'}
      </p>
      {problems.length > 0 && (
        <div className="capstone-end-card__proof" aria-label="Problems solved">
          {problems.map((p, i) => (
            <span key={i} className="capstone-end-card__proof-row">
              <FractionGlyph f={p.left} />
              <span className="capstone-end-card__plus">+</span>
              <FractionGlyph f={p.right} />
              {p.result && (
                <>
                  <span className="capstone-end-card__eq">=</span>
                  <FractionGlyph f={p.result} />
                </>
              )}
            </span>
          ))}
        </div>
      )}
      <button type="button" className="capstone-end-card__cta" onClick={onRetry}>
        Try another set.
      </button>
    </div>
  );
};

export default CapstoneEndCard;
