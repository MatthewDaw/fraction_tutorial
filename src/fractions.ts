const MAX_DENOMINATOR = 120;

type Axis = 'row' | 'column';

// Leaves can share a `groupId` to form a single logical piece (a "join").
// A leaf with no groupId is its own singleton group. Splits don't carry a
// group — only leaves do, since groups are over the actual visible cells.
export type Piece = { id: string } & (
  | { kind: 'leaf'; groupId?: string }
  | { kind: 'split'; axis: Axis; children: Piece[] }
);

export type Fraction = { num: number; denom: number };

// Map each denominator to a unique hue via the golden angle — sequential
// denominators land far apart on the color wheel, so collisions are rare even
// for compound denominators like 2*4, 3*5, etc.
const GOLDEN_ANGLE = 137.508;

export const colorForDenominator = (denom: number): string => {
  const hue = ((denom * GOLDEN_ANGLE) % 360 + 360) % 360;
  return `hsl(${hue.toFixed(1)}, 72%, 55%)`;
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

const simplify = (num: number, denom: number): Fraction => {
  const g = gcd(num, denom);
  return { num: num / g, denom: denom / g };
};

let idSeq = 0;
const nextId = () => `p${++idSeq}`;
let groupSeq = 0;
const nextGroupId = () => `g${++groupSeq}`;

export const createRootPiece = (): Piece => ({
  id: nextId(),
  kind: 'leaf',
});

const oppositeAxis = (axis: Axis): Axis => (axis === 'row' ? 'column' : 'row');

// Walk the tree, find the piece with `id`, and replace it via `replacer`.
const transformPiece = (
  piece: Piece,
  id: string,
  replacer: (leaf: Piece, parentAxis: Axis | null) => Piece,
  parentAxis: Axis | null = null,
): Piece => {
  if (piece.id === id) return replacer(piece, parentAxis);
  if (piece.kind === 'split') {
    return {
      ...piece,
      children: piece.children.map((c) => transformPiece(c, id, replacer, piece.axis)),
    };
  }
  return piece;
};

// Divide a leaf into N equal children. Children inherit the parent leaf's
// groupId so that a "joined" piece stays joined when one of its parts is
// further subdivided.
export const dividePiece = (root: Piece, id: string, n: number): Piece => {
  if (n < 2) return root;
  const fractions = computeFractions(root);
  const f = fractions.get(id);
  if (!f) return root;
  if (simplify(f.num, f.denom * n).denom > MAX_DENOMINATOR) return root;
  return transformPiece(root, id, (leaf, parentAxis) => {
    if (leaf.kind !== 'leaf') return leaf;
    const axis: Axis = parentAxis ? oppositeAxis(parentAxis) : 'row';
    const children: Piece[] = Array.from({ length: n }, () => ({
      id: nextId(),
      kind: 'leaf',
      groupId: leaf.groupId,
    }));
    return { id: leaf.id, kind: 'split', axis, children };
  });
};

export const canDivide = (root: Piece, id: string, n: number): boolean => {
  const fractions = computeFractions(root);
  const f = fractions.get(id);
  if (!f) return false;
  return simplify(f.num, f.denom * n).denom <= MAX_DENOMINATOR;
};

// Join two leaves into the same group. If they're already grouped (transitively),
// no-op; if one is grouped and one isn't, the loner adopts the group; if both
// are in different groups, those groups merge.
export const glueLeaves = (root: Piece, idA: string, idB: string): Piece => {
  if (idA === idB) return root;
  let aGroup: string | undefined;
  let bGroup: string | undefined;
  const findGroups = (piece: Piece) => {
    if (piece.kind === 'leaf') {
      if (piece.id === idA) aGroup = piece.groupId ?? piece.id;
      if (piece.id === idB) bGroup = piece.groupId ?? piece.id;
      return;
    }
    piece.children.forEach(findGroups);
  };
  findGroups(root);
  if (aGroup === undefined || bGroup === undefined) return root;
  if (aGroup === bGroup) return root;

  // Mint a stable shared id and rewrite every leaf in either old group to use it.
  const sharedId = nextGroupId();
  const oldA = aGroup;
  const oldB = bGroup;

  const walk = (piece: Piece): Piece => {
    if (piece.kind === 'leaf') {
      const g = piece.groupId ?? piece.id;
      if (g === oldA || g === oldB) {
        return { ...piece, groupId: sharedId };
      }
      return piece;
    }
    return { ...piece, children: piece.children.map(walk) };
  };
  return walk(root);
};

// Collect the IDs of every leaf in the tree, in left-to-right render order.
export const collectLeafIds = (root: Piece): string[] => {
  const ids: string[] = [];
  const walk = (piece: Piece) => {
    if (piece.kind === 'leaf') ids.push(piece.id);
    else piece.children.forEach(walk);
  };
  walk(root);
  return ids;
};

// Compute each leaf's fraction (in lowest terms). Splits are always uniform —
// every child has equal weight — so the math is just denom *= children.length.
export const computeFractions = (root: Piece): Map<string, Fraction> => {
  const map = new Map<string, Fraction>();
  const walk = (piece: Piece, num: number, denom: number) => {
    if (piece.kind === 'leaf') {
      map.set(piece.id, simplify(num, denom));
      return;
    }
    const n = piece.children.length;
    piece.children.forEach((c) => walk(c, num, denom * n));
  };
  walk(root, 1, 1);
  return map;
};

// The effective group id for a leaf — its own id if it has no groupId.
export const groupKeyFor = (leaf: { id: string; groupId?: string }): string =>
  leaf.groupId ?? leaf.id;

// Find the group key for the leaf with the given id, or null if not present.
export const findLeafGroupKey = (root: Piece, leafId: string): string | null => {
  let out: string | null = null;
  const walk = (p: Piece) => {
    if (out) return;
    if (p.kind === 'leaf') {
      if (p.id === leafId) out = groupKeyFor(p);
      return;
    }
    p.children.forEach(walk);
  };
  walk(root);
  return out;
};

// Combined fraction of each group (group key → Fraction).
export const computeGroupFractions = (root: Piece): Map<string, Fraction> => {
  const leafFracs = computeFractions(root);
  const groups = new Map<string, Fraction>();
  const walk = (piece: Piece) => {
    if (piece.kind === 'leaf') {
      const key = groupKeyFor(piece);
      const f = leafFracs.get(piece.id)!;
      const existing = groups.get(key);
      if (existing) {
        const commonDen = lcm(existing.denom, f.denom);
        const newNum =
          (commonDen / existing.denom) * existing.num + (commonDen / f.denom) * f.num;
        groups.set(key, simplify(newNum, commonDen));
      } else {
        groups.set(key, f);
      }
      return;
    }
    piece.children.forEach(walk);
  };
  walk(root);
  return groups;
};

// Edge leaf segment along a piece's edge, normalized to [start, end].
type EdgeLeaf = { id: string; start: number; end: number };
type EdgeSide = 'left' | 'right' | 'top' | 'bottom';

// Walk into `piece` and find every leaf that touches the requested edge, with
// the y/x range each leaf occupies along that edge.
export const getEdgeLeaves = (
  piece: Piece,
  side: EdgeSide,
  start = 0,
  end = 1,
): EdgeLeaf[] => {
  if (piece.kind === 'leaf') {
    return [{ id: piece.id, start, end }];
  }
  const sideIsVertical = side === 'left' || side === 'right';
  // The split's children "run along" the edge when the split's dividers
  // are parallel to the edge — i.e., row-axis (horizontal dividers) for a
  // vertical edge, column-axis (vertical dividers) for a horizontal edge.
  const childrenRunAlongEdge =
    (sideIsVertical && piece.axis === 'row') ||
    (!sideIsVertical && piece.axis === 'column');
  if (childrenRunAlongEdge) {
    const n = piece.children.length;
    const segments: EdgeLeaf[] = [];
    piece.children.forEach((c, i) => {
      const cStart = start + ((end - start) * i) / n;
      const cEnd = start + ((end - start) * (i + 1)) / n;
      segments.push(...getEdgeLeaves(c, side, cStart, cEnd));
    });
    return segments;
  }
  // Children sit across the edge; only the boundary-side child touches it.
  const edgeChild =
    side === 'right' || side === 'bottom'
      ? piece.children[piece.children.length - 1]
      : piece.children[0];
  return getEdgeLeaves(edgeChild, side, start, end);
};

// One sub-crack between two specific leaves, spanning [start, end] of the
// parent crack's length. The sub-crack is exactly the overlap between the
// two adjacent leaves' edge segments — the "edge across the smaller shape".
type SubCrack = {
  leftLeafId: string;
  rightLeafId: string;
  start: number;
  end: number;
};

export const computeSubCracks = (
  leftEdges: EdgeLeaf[],
  rightEdges: EdgeLeaf[],
): SubCrack[] => {
  const out: SubCrack[] = [];
  for (const le of leftEdges) {
    for (const re of rightEdges) {
      const s = Math.max(le.start, re.start);
      const e = Math.min(le.end, re.end);
      if (e - s > 1e-9) {
        out.push({ leftLeafId: le.id, rightLeafId: re.id, start: s, end: e });
      }
    }
  }
  return out;
};

