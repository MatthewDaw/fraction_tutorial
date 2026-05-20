// Used by the "numbers" canvas mode — divisibility lessons show the number
// being discussed instead of a fraction box.
const NumberDisplay = ({ number }: { number?: number }) => (
  <div className="number-display">
    {number != null ? (
      <span className="number-display__digits">{number}</span>
    ) : (
      <span className="number-display__placeholder" aria-hidden>
        🔍
      </span>
    )}
  </div>
);

export default NumberDisplay;
