type Props = {
  rows: number;
  cols: number;
  // Total dots in the lesson example. When rows * cols < total, the extras
  // are rendered as a separate "leftover" row to show the array doesn't fit.
  total?: number;
};

const ArrayCanvas = ({ rows, cols, total }: Props) => {
  const targetTotal = total ?? rows * cols;
  const fitted = Math.min(rows * cols, targetTotal);
  const leftover = Math.max(0, targetTotal - fitted);
  const rowsToRender = Math.ceil(fitted / cols);

  return (
    <div className="array-canvas">
      <div className="array-canvas__caption">
        {rows} × {cols} = {rows * cols} dots
        {leftover > 0 && ` (need ${targetTotal} — ${leftover} left over)`}
      </div>
      <div className="array-canvas__grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rowsToRender * cols }).map((_, i) => {
          const filled = i < fitted;
          return (
            <span
              key={i}
              className={`array-dot${filled ? '' : ' array-dot--empty'}`}
              aria-hidden={!filled}
            />
          );
        })}
      </div>
      {leftover > 0 && (
        <div className="array-canvas__leftover">
          <div className="array-canvas__leftover-label">Left over:</div>
          <div className="array-canvas__leftover-dots">
            {Array.from({ length: leftover }).map((_, i) => (
              <span key={i} className="array-dot array-dot--orphan" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrayCanvas;
