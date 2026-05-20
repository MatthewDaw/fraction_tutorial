// Mushroom multiplier toolbar — one button per prime in MUSHROOM_PRIMES.
// Each mushroom has a per-prime cap silhouette and a spot count equal to the
// prime (the easter egg students discover). Colors and base styles live in
// styles.css under .mushroom-icon and .mushroom-icon--p<N>.
//
// The panel is presentational: the parent owns active-state and dispatch.
// Per D8/D16 the palette extends from {2, 3, 5} to {2, 3, 5, 7, 11}.

// TODO(lane-a-followup): gate mushroom visibility per concept. Each
// divisibility-N lesson should unlock the matching mushroom; until that's
// wired in App.tsx, the full palette is always available.
export const MUSHROOM_PRIMES = [2, 3, 5, 7, 11] as const;

export type MushroomPrime = (typeof MUSHROOM_PRIMES)[number];

// Cap CSS-variable colors live in styles.css. Mirrored here for any consumer
// that needs the raw values (e.g. matching mushroom-tinted UI elsewhere).
export const MUSHROOM_COLORS: Record<MushroomPrime, { cap: string; shade: string }> = {
  2: { cap: '#e63946', shade: '#a31726' },
  3: { cap: '#2ecc71', shade: '#1f8a4d' },
  5: { cap: '#ffcb05', shade: '#c79a00' },
  7: { cap: '#4cc9f0', shade: '#1f8db0' },
  11: { cap: '#a259ff', shade: '#6a2eb8' },
};

// SVG viewBox is 40×40. Cap sits in the upper ~60%, stem below. Each cap is a
// smooth dome path. Subtle per-prime variation in width and height — same
// species, different mushrooms — surfaces the "different organisms" cue
// without screaming about it.
type CapShape = { d: string; capWidth: number; capLeft: number; capTop: number; capHeight: number };

const CAP_SHAPES: Record<MushroomPrime, CapShape> = {
  // 2: classic round dome (the reference shape).
  2: {
    d: 'M8 22 Q8 8 20 8 Q32 8 32 22 L32 24 L8 24 Z',
    capWidth: 24, capLeft: 8, capTop: 8, capHeight: 16,
  },
  // 3: slightly oval/wider — a touch broader than p2.
  3: {
    d: 'M6 22 Q6 8 20 8 Q34 8 34 22 L34 24 L6 24 Z',
    capWidth: 28, capLeft: 6, capTop: 8, capHeight: 16,
  },
  // 5: tall dome — narrower and reaches higher.
  5: {
    d: 'M9 23 Q9 5 20 5 Q31 5 31 23 L31 25 L9 25 Z',
    capWidth: 22, capLeft: 9, capTop: 5, capHeight: 20,
  },
  // 7: wide-low — broad and shallow.
  7: {
    d: 'M5 22 Q5 11 20 11 Q35 11 35 22 L35 24 L5 24 Z',
    capWidth: 30, capLeft: 5, capTop: 11, capHeight: 13,
  },
  // 11: extra-wide flat-top — widest cap with a softer, near-flat crown.
  11: {
    d: 'M3 22 Q3 12 9 11 Q20 9 31 11 Q37 12 37 22 L37 24 L3 24 Z',
    capWidth: 34, capLeft: 3, capTop: 9, capHeight: 15,
  },
};

// Hand-placed white spots per prime. cx/cy in the 40×40 viewBox; rx/ry size
// the ellipse. Counts equal the prime (2/3/5/7/11). For p=11 the spots are
// smaller and packed in two rows so the cap doesn't read as noise.
type Spot = { cx: number; cy: number; rx: number; ry: number };

const SPOTS: Record<MushroomPrime, Spot[]> = {
  2: [
    { cx: 15, cy: 14, rx: 2.4, ry: 1.8 },
    { cx: 25, cy: 16, rx: 2.4, ry: 1.8 },
  ],
  3: [
    { cx: 20, cy: 12, rx: 2.4, ry: 1.8 },
    { cx: 13, cy: 18, rx: 2.2, ry: 1.7 },
    { cx: 27, cy: 18, rx: 2.2, ry: 1.7 },
  ],
  5: [
    // Dice-5 layout.
    { cx: 15, cy: 11, rx: 2.0, ry: 1.6 },
    { cx: 25, cy: 11, rx: 2.0, ry: 1.6 },
    { cx: 20, cy: 15, rx: 2.0, ry: 1.6 },
    { cx: 14, cy: 19, rx: 2.0, ry: 1.6 },
    { cx: 26, cy: 19, rx: 2.0, ry: 1.6 },
  ],
  7: [
    // Wide-low cap: 1 center top, 3 mid row, 3 lower row.
    { cx: 20, cy: 14, rx: 1.8, ry: 1.4 },
    { cx: 11, cy: 17, rx: 1.8, ry: 1.4 },
    { cx: 20, cy: 18, rx: 1.8, ry: 1.4 },
    { cx: 29, cy: 17, rx: 1.8, ry: 1.4 },
    { cx: 13, cy: 21, rx: 1.6, ry: 1.3 },
    { cx: 20, cy: 22, rx: 1.6, ry: 1.3 },
    { cx: 27, cy: 21, rx: 1.6, ry: 1.3 },
  ],
  11: [
    // Extra-wide flat-top cap: three rows (5 + 4 + 2) for 11 total. Spots
    // are small (~1.4×1.1 in viewBox) so 11 of them read as a deliberate
    // pattern, not noise. The 5-4-2 layout mirrors the broader-on-top cap
    // silhouette and keeps clear lanes between rows. If playtesting shows
    // this still feels noisy, drop the bottom-row pair (yielding ~9 visible)
    // and document the constraint here.
    { cx: 8, cy: 16, rx: 1.4, ry: 1.1 },
    { cx: 14, cy: 14, rx: 1.4, ry: 1.1 },
    { cx: 20, cy: 13, rx: 1.4, ry: 1.1 },
    { cx: 26, cy: 14, rx: 1.4, ry: 1.1 },
    { cx: 32, cy: 16, rx: 1.4, ry: 1.1 },
    { cx: 11, cy: 19, rx: 1.4, ry: 1.1 },
    { cx: 17, cy: 19, rx: 1.4, ry: 1.1 },
    { cx: 23, cy: 19, rx: 1.4, ry: 1.1 },
    { cx: 29, cy: 19, rx: 1.4, ry: 1.1 },
    { cx: 14, cy: 22, rx: 1.4, ry: 1.1 },
    { cx: 26, cy: 22, rx: 1.4, ry: 1.1 },
  ],
};

type MushroomIconProps = { p: MushroomPrime; size?: number };

export const MushroomIcon = ({ p, size = 28 }: MushroomIconProps) => {
  const cap = CAP_SHAPES[p];
  const spots = SPOTS[p];
  const color = MUSHROOM_COLORS[p];
  return (
    <svg
      className={`mushroom-icon mushroom-icon--p${p}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
    >
      {/* Stem: small rounded rectangle anchored to the cap baseline. */}
      <rect
        className="mushroom-icon__stem"
        x="14"
        y="22"
        width="12"
        height="14"
        rx="3"
        ry="3"
        fill="#fff4d6"
        stroke="#e0c98a"
        strokeWidth="0.8"
      />
      {/* Cap: per-prime silhouette. */}
      <path
        className="mushroom-icon__cap"
        d={cap.d}
        fill={color.cap}
        stroke={color.shade}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Cap shading lip along the baseline. */}
      <rect
        x={cap.capLeft}
        y={cap.capTop + cap.capHeight - 3}
        width={cap.capWidth}
        height="2"
        fill={color.shade}
        opacity="0.55"
      />
      {/* Prime-count spots. White with a faint outline so they read on any cap. */}
      {spots.map((s, i) => (
        <ellipse
          key={i}
          className="mushroom-icon__spot"
          cx={s.cx}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill="#ffffff"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.3"
        />
      ))}
    </svg>
  );
};

type MultiplierPanelProps = {
  // Which prime is currently armed, if any.
  activePrime: MushroomPrime | null;
  // Subset of MUSHROOM_PRIMES this lesson exposes. Defaults to the full set.
  available?: readonly MushroomPrime[];
  onSelect: (prime: MushroomPrime | null) => void;
};

const MultiplierPanel = ({ activePrime, available = MUSHROOM_PRIMES, onSelect }: MultiplierPanelProps) => {
  if (available.length === 0) return null;
  return (
    <div className="tool-panel" aria-label="Multipliers">
      {available.map((p) => {
        const active = activePrime === p;
        const classes = ['tool-btn', active && 'tool-btn--active'].filter(Boolean).join(' ');
        return (
          <button
            key={p}
            type="button"
            className={classes}
            onClick={() => onSelect(active ? null : p)}
            aria-label={`Multiplier: multiply by ${p}`}
          >
            <span className="tool-btn__icon">
              <MushroomIcon p={p} />
            </span>
            <span className="tool-btn__label">×{p}</span>
          </button>
        );
      })}
    </div>
  );
};

// Convert a `scale:N` op-string into a prime, or null if N isn't a known
// mushroom prime. Lane A will introduce the `scale:N` AllowedOp variant when
// the multiplier system wires into lesson dispatch.
export const primeFromScaleOp = (op: string): MushroomPrime | null => {
  if (!op.startsWith('scale:')) return null;
  const n = Number(op.slice(6));
  return (MUSHROOM_PRIMES as readonly number[]).includes(n) ? (n as MushroomPrime) : null;
};

export default MultiplierPanel;
