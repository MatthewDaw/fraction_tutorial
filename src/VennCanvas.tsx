import { useEffect, useMemo, useRef, useState } from 'react';
import { factorsOf, gcf } from './factors';

type PlacedRegion = 'a-only' | 'b-only' | 'both';
type Region = PlacedRegion | 'pool';
const PLACED_REGIONS: PlacedRegion[] = ['a-only', 'b-only', 'both'];

type Tile = {
  factor: number;
  // Stage-percent coordinates of the tile center.
  x: number;
  y: number;
  region: Region;
  placed: boolean;
};

type Props = {
  a: number;
  b: number;
  resetKey?: number;
  onAllPlaced?: () => void;
  // When true, the GCF in the overlap is highlighted.
  highlightGcf?: boolean;
  // 'result' pre-places every factor in its correct region; the student is
  // just observing (used for the GCF reveal step).
  mode?: 'play' | 'result';
};

// Geometry of the two circles in stage-% space. Must stay in lockstep with
// the SVG viewBox so click hit-tests match what the student sees.
const CIRCLE_R = 24;
const CIRCLE_A_CX = 35;
const CIRCLE_B_CX = 65;
const CIRCLES_CY = 40;

// Where placed tiles cluster inside each region.
const REGION_CENTER: Record<PlacedRegion, { x: number; y: number }> = {
  'a-only': { x: 22, y: 40 },
  'b-only': { x: 78, y: 40 },
  both: { x: 50, y: 44 },
};
const PLACED_SPREAD = 11;
const POOL_Y = 86;
const POOL_SPREAD = 80;

const insideCircleA = (x: number, y: number) =>
  Math.hypot(x - CIRCLE_A_CX, y - CIRCLES_CY) <= CIRCLE_R;
const insideCircleB = (x: number, y: number) =>
  Math.hypot(x - CIRCLE_B_CX, y - CIRCLES_CY) <= CIRCLE_R;

const regionAt = (x: number, y: number): Region => {
  const inA = insideCircleA(x, y);
  const inB = insideCircleB(x, y);
  if (inA && inB) return 'both';
  if (inA) return 'a-only';
  if (inB) return 'b-only';
  return 'pool';
};

const correctRegionFor = (factor: number, a: number, b: number): Region => {
  const inA = a % factor === 0;
  const inB = b % factor === 0;
  if (inA && inB) return 'both';
  if (inA) return 'a-only';
  if (inB) return 'b-only';
  return 'pool';
};

const poolPositions = (n: number): Array<{ x: number; y: number }> => {
  const left = 50 - POOL_SPREAD / 2;
  return Array.from({ length: n }, (_, i) => ({
    x: left + (i / Math.max(1, n - 1)) * POOL_SPREAD,
    y: POOL_Y,
  }));
};

const placedPosition = (
  region: PlacedRegion,
  indexInRegion: number,
  regionCount: number,
) => {
  const cols = Math.ceil(Math.sqrt(regionCount));
  const row = Math.floor(indexInRegion / cols);
  const col = indexInRegion % cols;
  const center = REGION_CENTER[region];
  return {
    x: center.x + (col - (cols - 1) / 2) * PLACED_SPREAD,
    y: center.y + (row - 0.5) * (PLACED_SPREAD * 0.9),
  };
};

const buildTiles = (allFactors: number[], a: number, b: number, mode: 'play' | 'result'): Tile[] => {
  if (mode === 'result') {
    const byRegion: Record<PlacedRegion, number[]> = { 'a-only': [], 'b-only': [], both: [] };
    for (const f of allFactors) {
      const r = correctRegionFor(f, a, b);
      if (r !== 'pool') byRegion[r].push(f);
    }
    const tiles: Tile[] = [];
    for (const region of PLACED_REGIONS) {
      byRegion[region].forEach((f, i) => {
        const { x, y } = placedPosition(region, i, byRegion[region].length);
        tiles.push({ factor: f, x, y, region, placed: true });
      });
    }
    return tiles.sort((p, q) => p.factor - q.factor);
  }
  const positions = poolPositions(allFactors.length);
  return allFactors.map((f, i) => ({
    factor: f,
    x: positions[i].x,
    y: positions[i].y,
    region: 'pool' as Region,
    placed: false,
  }));
};

const VennCanvas = ({
  a,
  b,
  resetKey = 0,
  onAllPlaced,
  highlightGcf = false,
  mode = 'play',
}: Props) => {
  const allFactors = useMemo(
    () => Array.from(new Set([...factorsOf(a), ...factorsOf(b)])).sort((x, y) => x - y),
    [a, b],
  );

  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(allFactors, a, b, mode));
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ idx: number; pointerId: number; offX: number; offY: number } | null>(
    null,
  );

  useEffect(() => {
    setTiles(buildTiles(allFactors, a, b, mode));
  }, [a, b, mode, resetKey, allFactors]);

  const allPlaced = tiles.length > 0 && tiles.every((t) => t.placed);
  const lastFiredRef = useRef(false);
  useEffect(() => {
    if (allPlaced && !lastFiredRef.current) {
      lastFiredRef.current = true;
      onAllPlaced?.();
    } else if (!allPlaced) {
      lastFiredRef.current = false;
    }
  }, [allPlaced, onAllPlaced]);

  const clientToPct = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    if (mode === 'result' || tiles[idx].placed) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { x, y } = clientToPct(e.clientX, e.clientY);
    dragRef.current = {
      idx,
      pointerId: e.pointerId,
      offX: x - tiles[idx].x,
      offY: y - tiles[idx].y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const st = dragRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    const { x, y } = clientToPct(e.clientX, e.clientY);
    setTiles((prev) =>
      prev.map((t, i) =>
        i === st.idx
          ? {
              ...t,
              x: Math.max(4, Math.min(96, x - st.offX)),
              y: Math.max(4, Math.min(96, y - st.offY)),
            }
          : t,
      ),
    );
  };

  const endDrag = (e: React.PointerEvent) => {
    const st = dragRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setTiles((prev) => {
      const t = prev[st.idx];
      const dropped = regionAt(t.x, t.y);
      const correct = correctRegionFor(t.factor, a, b);
      if (dropped === correct && dropped !== 'pool') {
        return prev.map((tt, i) =>
          i === st.idx ? { ...tt, region: dropped, placed: true } : tt,
        );
      }
      const positions = poolPositions(prev.length);
      return prev.map((tt, i) =>
        i === st.idx ? { ...tt, x: positions[i].x, y: positions[i].y, region: 'pool' } : tt,
      );
    });
  };

  const gcfValue = highlightGcf ? gcf(a, b) : -1;

  return (
    <div
      ref={stageRef}
      className="venn-canvas"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <svg
        className="venn-canvas__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <circle
          cx={CIRCLE_A_CX}
          cy={CIRCLES_CY}
          r={CIRCLE_R}
          className="venn-canvas__circle venn-canvas__circle--a"
        />
        <circle
          cx={CIRCLE_B_CX}
          cy={CIRCLES_CY}
          r={CIRCLE_R}
          className="venn-canvas__circle venn-canvas__circle--b"
        />
      </svg>
      <div className="venn-canvas__label venn-canvas__label--a">Factors of {a}</div>
      <div className="venn-canvas__label venn-canvas__label--b">Factors of {b}</div>
      <div className="venn-canvas__label venn-canvas__label--center">Both</div>
      <div className="venn-canvas__pool-label">Drag each factor into its region</div>
      {tiles.map((t, i) => {
        const isGcf = highlightGcf && t.factor === gcfValue && t.placed;
        return (
          <button
            key={t.factor}
            type="button"
            className={`venn-tile${t.placed ? ' venn-tile--placed' : ''}${isGcf ? ' venn-tile--gcf' : ''}`}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            onPointerDown={(e) => handlePointerDown(e, i)}
            aria-label={`Factor ${t.factor}`}
          >
            {t.factor}
          </button>
        );
      })}
    </div>
  );
};

export default VennCanvas;
