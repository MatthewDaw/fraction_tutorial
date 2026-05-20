export type CapstonePhase = 0 | 1 | 2;

const PHASES: { idx: CapstonePhase; label: string }[] = [
  { idx: 0, label: 'Equate' },
  { idx: 1, label: 'Combine' },
  { idx: 2, label: 'Simplify' },
];

type Props = {
  activePhase: CapstonePhase;
};

const PhaseIndicator = ({ activePhase }: Props) => (
  <div className="phase-indicator" role="status" aria-label="Capstone phase">
    {PHASES.map(({ idx, label }) => {
      const isActive = idx === activePhase;
      const classes = [
        'phase-chip',
        isActive ? 'phase-chip--active' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <span key={idx} className={classes}>
          <span className="phase-chip__num">{idx + 1}</span>
          <span className="phase-chip__label">{label}</span>
        </span>
      );
    })}
  </div>
);

export default PhaseIndicator;
