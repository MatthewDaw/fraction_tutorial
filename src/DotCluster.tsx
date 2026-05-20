import { useEffect, useMemo, useRef, useState } from 'react';

type Dot = { id: number; x: number; y: number };

type Props = {
  count: number;
  // 'prescribed' (default): require every blob to equal `groupSize`.
  // 'explore':   any arrangement is valid; the parent decides what to do
  //              with the reported blob sizes.
  mode?: 'prescribed' | 'explore';
  groupSize?: number;
  // Bumped by the parent when the student should get a fresh scattered pile
  // (re-entering a step, hitting reset).
  resetKey?: number;
  // 'prescribed' callback — fires when every blob is exactly `groupSize`.
  onAllGrouped?: () => void;
  // 'explore' callback — fires once per distinct equal-size arrangement.
  // `size` is the size of each blob (4 groups of 3 reports size=3).
  onEqualArrangement?: (size: number) => void;
  // 'prescribed' callback — fires when floor(count/groupSize) full blobs
  // exist and the remainder dots are lone, so "can't pair everything"
  // steps still advance.
  onMaxed?: () => void;
};

// Distance (in stage-% units) at which two dots are considered part of the
// same blob. Sized to be comfortably bigger than DOT_RADIUS so dots that
// visually touch always cluster.
const SNAP_RADIUS = 7;
const DOT_RADIUS = 2.8;
// Center-to-center distance between adjacent dots in a packed blob. The 2.05
// fudge keeps dots from rendering with overlapping pixels at retina sizes.
const PACK_STEP = DOT_RADIUS * 2.05;
const SCATTER_MIN_SEP = SNAP_RADIUS * 1.6;

// Tight hex packing inside a blob — child dots orbit the first member.
const BLOB_OFFSETS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [[0, 0]];
  for (let ring = 1; out.length < 32; ring++) {
    for (let i = 0; i < 6 * ring; i++) {
      const angle = (i / (6 * ring)) * Math.PI * 2;
      out.push([Math.cos(angle) * PACK_STEP * ring, Math.sin(angle) * PACK_STEP * ring]);
    }
  }
  return out;
})();

const scatterPositions = (count: number): Dot[] => {
  // Poisson-ish scatter: reject candidates that land too close to existing
  // dots so the starting pile reads as separated, not pre-clustered.
  const dots: Dot[] = [];
  const margin = 10;
  const max = 100 - margin;
  let attempts = 0;
  while (dots.length < count && attempts < count * 200) {
    attempts++;
    const x = margin + Math.random() * (max - margin);
    const y = margin + Math.random() * (max - margin);
    if (dots.every((d) => Math.hypot(d.x - x, d.y - y) >= SCATTER_MIN_SEP)) {
      dots.push({ id: dots.length, x, y });
    }
  }
  // Fallback grid if rejection sampling stalled (high-density piles).
  while (dots.length < count) {
    const i = dots.length;
    const cols = Math.ceil(Math.sqrt(count));
    const cx = margin + ((i % cols) / Math.max(1, cols - 1)) * (max - margin);
    const cy = margin + (Math.floor(i / cols) / Math.max(1, cols - 1)) * (max - margin);
    dots.push({ id: i, x: cx, y: cy });
  }
  return dots;
};

// Union-find clustering: any two dots within SNAP_RADIUS go in the same blob.
const computeBlobs = (dots: Dot[]): number[] => {
  const parent = dots.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      if (Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) <= SNAP_RADIUS) {
        union(i, j);
      }
    }
  }
  return dots.map((_, i) => find(i));
};

const DotCluster = ({
  count,
  mode = 'prescribed',
  groupSize,
  resetKey = 0,
  onAllGrouped,
  onEqualArrangement,
  onMaxed,
}: Props) => {
  const [dots, setDots] = useState<Dot[]>(() => scatterPositions(count));
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    dotIndex: number;
    pointerId: number;
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    setDots(scatterPositions(count));
  }, [count, resetKey]);

  const blobOf = useMemo(() => computeBlobs(dots), [dots]);

  const blobSizes = useMemo(() => {
    const sizes = new Map<number, number>();
    for (const b of blobOf) sizes.set(b, (sizes.get(b) ?? 0) + 1);
    return sizes;
  }, [blobOf]);

  // Centroids of every blob — used to anchor the group-count badges that
  // float above each valid cluster (1, 2, 3, ...).
  const blobCentroids = useMemo(() => {
    const sums = new Map<number, { x: number; y: number; n: number }>();
    dots.forEach((d, i) => {
      const b = blobOf[i];
      const acc = sums.get(b) ?? { x: 0, y: 0, n: 0 };
      acc.x += d.x;
      acc.y += d.y;
      acc.n += 1;
      sums.set(b, acc);
    });
    const out = new Map<number, { x: number; y: number }>();
    sums.forEach((v, b) => out.set(b, { x: v.x / v.n, y: v.y / v.n }));
    return out;
  }, [dots, blobOf]);

  const allGrouped =
    mode === 'prescribed' &&
    groupSize != null &&
    dots.length > 0 &&
    [...blobSizes.values()].every((s) => s === groupSize);

  const lastFiredRef = useRef(false);
  useEffect(() => {
    if (allGrouped && !lastFiredRef.current) {
      lastFiredRef.current = true;
      onAllGrouped?.();
    } else if (!allGrouped) {
      lastFiredRef.current = false;
    }
  }, [allGrouped, onAllGrouped]);

  // Maxed-out arrangement: as many full blobs of `groupSize` as possible,
  // with the rest lone. For 7 dots in groups of 2 that's 3 pairs + 1 lone.
  // Used by "can't pair everything" steps to auto-advance once the leftover
  // is exposed (the student isn't trapped finishing an impossible task).
  const maxed =
    mode === 'prescribed' &&
    groupSize != null &&
    groupSize > 1 &&
    dots.length > 0 &&
    (() => {
      const expectedFull = Math.floor(count / groupSize);
      const expectedLone = count - expectedFull * groupSize;
      if (expectedLone === 0) return false; // perfectly divisible — let onAllGrouped handle it
      const sizes = [...blobSizes.values()];
      const full = sizes.filter((s) => s === groupSize).length;
      const lone = sizes.filter((s) => s === 1).length;
      return full === expectedFull && lone === expectedLone;
    })();
  const lastMaxedRef = useRef(false);
  useEffect(() => {
    if (maxed && !lastMaxedRef.current) {
      lastMaxedRef.current = true;
      onMaxed?.();
    } else if (!maxed) {
      lastMaxedRef.current = false;
    }
  }, [maxed, onMaxed]);

  const equalSize: number | null = (() => {
    if (mode !== 'explore') return null;
    if (dots.length === 0) return null;
    const sizes = [...blobSizes.values()];
    if (sizes.length === 0) return null;
    const first = sizes[0];
    return sizes.every((s) => s === first) ? first : null;
  })();
  const lastReportedSize = useRef<number | null>(null);
  // Clear the dedup ref when the parent reloads the step (resetKey bump) so
  // a fresh scatter still credits "1" even if the previous step ended on a
  // scatter too.
  useEffect(() => {
    lastReportedSize.current = null;
  }, [resetKey, count]);
  useEffect(() => {
    if (equalSize == null) {
      lastReportedSize.current = null;
      return;
    }
    if (lastReportedSize.current === equalSize) return;
    lastReportedSize.current = equalSize;
    onEqualArrangement?.(equalSize);
  }, [equalSize, onEqualArrangement]);

  // Valid blobs ordered left-to-right for the 1, 2, 3, ... count badges.
  // A blob is "valid" when it matches the target size: groupSize in
  // prescribed mode, equalSize in explore mode. Only sized blobs (≥2 dots)
  // get a badge — counting "1" over a lone dot would muddy the lesson.
  const numberedBlobs = useMemo(() => {
    const validSize =
      mode === 'explore' ? equalSize : groupSize ?? null;
    if (validSize == null || validSize < 2) return [];
    const items: Array<{ id: number; x: number; y: number }> = [];
    blobCentroids.forEach((c, b) => {
      if (blobSizes.get(b) === validSize) items.push({ id: b, x: c.x, y: c.y });
    });
    items.sort((a, b) => a.x - b.x);
    return items;
  }, [mode, equalSize, groupSize, blobCentroids, blobSizes]);

  const clientToPct = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handlePointerDown = (e: React.PointerEvent, dotId: number) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { x, y } = clientToPct(e.clientX, e.clientY);
    dragState.current = {
      dotIndex: dotId,
      pointerId: e.pointerId,
      originX: x,
      originY: y,
      startX: dots[dotId].x,
      startY: dots[dotId].y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const st = dragState.current;
    if (!st || st.pointerId !== e.pointerId) return;
    const { x, y } = clientToPct(e.clientX, e.clientY);
    const dx = x - st.originX;
    const dy = y - st.originY;
    setDots((prev) => {
      const next = prev.map((d) => ({ ...d }));
      next[st.dotIndex] = {
        ...next[st.dotIndex],
        x: Math.max(2, Math.min(98, st.startX + dx)),
        y: Math.max(2, Math.min(98, st.startY + dy)),
      };
      return next;
    });
  };

  const endDrag = (e: React.PointerEvent) => {
    const dragged = dragState.current;
    if (dragged?.pointerId !== e.pointerId) return;
    dragState.current = null;
    setDots((prev) => {
      const fresh = computeBlobs(prev);
      // Only repack the blob the user actually dragged — leaving the others
      // alone prevents drift from BLOB_OFFSETS not being zero-centered.
      const targetBlob = fresh[dragged.dotIndex];
      const members: number[] = [];
      for (let i = 0; i < fresh.length; i++) {
        if (fresh[i] === targetBlob) members.push(i);
      }
      if (members.length < 2) return prev;
      const cx = members.reduce((s, i) => s + prev[i].x, 0) / members.length;
      const cy = members.reduce((s, i) => s + prev[i].y, 0) / members.length;
      // Zero-center the offsets so the repacked blob's centroid lands on
      // (cx, cy) — otherwise BLOB_OFFSETS skew shifts the whole blob each
      // time it's repacked.
      const offsets = members.map((_, k) => BLOB_OFFSETS[k] ?? [0, 0]);
      const ax = offsets.reduce((s, [x]) => s + x, 0) / offsets.length;
      const ay = offsets.reduce((s, [, y]) => s + y, 0) / offsets.length;
      const next = prev.map((d) => ({ ...d }));
      members.forEach((i, k) => {
        const [ox, oy] = offsets[k];
        next[i] = {
          ...next[i],
          x: Math.max(2, Math.min(98, cx + ox - ax)),
          y: Math.max(2, Math.min(98, cy + oy - ay)),
        };
      });
      return next;
    });
  };

  return (
    <div
      ref={stageRef}
      className="dot-cluster"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="dot-cluster__total" aria-hidden="true">
        {count}
      </div>
      <div className="dot-cluster__legend">
        {mode === 'explore' ? (
          <>Drag the dots into equal-size groups. Every arrangement reveals a factor!</>
        ) : (
          <>
            Drag the dots together into groups of <strong>{groupSize}</strong>.
          </>
        )}
      </div>
      {dots.map((dot, i) => {
        const size = blobSizes.get(blobOf[i]) ?? 1;
        let state: 'lone' | 'valid' | 'oversized' = 'lone';
        if (mode === 'explore') {
          // In explore mode, "valid" lights when every dot belongs to an
          // equal-size arrangement — that's a successful factor moment.
          if (equalSize != null && size === equalSize) state = 'valid';
        } else {
          if (size === groupSize) state = 'valid';
          else if (groupSize != null && size > groupSize) state = 'oversized';
        }
        return (
          <button
            key={dot.id}
            type="button"
            className={`dot dot--${state}`}
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            onPointerDown={(e) => handlePointerDown(e, i)}
            aria-label={`Counter ${i + 1}`}
          />
        );
      })}
      {numberedBlobs.map((b, i) => (
        <div
          key={`badge-${b.id}`}
          className="dot-cluster__badge"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
          aria-hidden="true"
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};

export default DotCluster;
