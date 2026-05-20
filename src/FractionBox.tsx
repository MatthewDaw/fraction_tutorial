import {
  Piece,
  Fraction,
  computeGroupFractions,
  colorForDenominator,
  getEdgeLeaves,
  computeSubCracks,
  groupKeyFor,
} from './fractions';

type Props = {
  root: Piece;
  selectedId: string | null;
  glueActive: boolean;
  blockedLeafIds: Set<string>;
  onPieceClick: (id: string) => void;
  onSubCrackClick: (leftLeafId: string, rightLeafId: string) => void;
};

const FractionBox = ({
  root,
  selectedId,
  glueActive,
  blockedLeafIds,
  onPieceClick,
  onSubCrackClick,
}: Props) => {
  const groupFractions = computeGroupFractions(root);

  // Walk once to derive: leaf→group key, per-group size, and each leaf's
  // normalized bounding rect (so we can place the label on the leaf nearest
  // the group's centroid — keeps the label centered as pieces merge).
  type Rect = { cx: number; cy: number; area: number };
  const leafGroupKey = new Map<string, string>();
  const groupSize = new Map<string, number>();
  const leafRect = new Map<string, Rect>();
  const walk = (piece: Piece, x0: number, y0: number, x1: number, y1: number) => {
    if (piece.kind === 'leaf') {
      const key = groupKeyFor(piece);
      leafGroupKey.set(piece.id, key);
      groupSize.set(key, (groupSize.get(key) ?? 0) + 1);
      leafRect.set(piece.id, {
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
        area: (x1 - x0) * (y1 - y0),
      });
      return;
    }
    const n = piece.children.length;
    piece.children.forEach((c, i) => {
      if (piece.axis === 'column') {
        const xs = x0 + ((x1 - x0) * i) / n;
        const xe = x0 + ((x1 - x0) * (i + 1)) / n;
        walk(c, xs, y0, xe, y1);
      } else {
        const ys = y0 + ((y1 - y0) * i) / n;
        const ye = y0 + ((y1 - y0) * (i + 1)) / n;
        walk(c, x0, ys, x1, ye);
      }
    });
  };
  walk(root, 0, 0, 1, 1);

  // Area-weighted centroid per group.
  const groupCentroid = new Map<string, { cx: number; cy: number; area: number }>();
  for (const [leafId, key] of leafGroupKey) {
    const r = leafRect.get(leafId)!;
    const prev = groupCentroid.get(key);
    if (prev) {
      const a = prev.area + r.area;
      groupCentroid.set(key, {
        cx: (prev.cx * prev.area + r.cx * r.area) / a,
        cy: (prev.cy * prev.area + r.cy * r.area) / a,
        area: a,
      });
    } else {
      groupCentroid.set(key, { cx: r.cx, cy: r.cy, area: r.area });
    }
  }

  // Label-bearing leaf = closest to centroid; tiebreak on larger area so the
  // fraction has room to render.
  const groupLabelLeaf = new Map<string, string>();
  const groupBest = new Map<string, { dist: number; area: number }>();
  for (const [leafId, key] of leafGroupKey) {
    const r = leafRect.get(leafId)!;
    const c = groupCentroid.get(key)!;
    const dist = (r.cx - c.cx) ** 2 + (r.cy - c.cy) ** 2;
    const best = groupBest.get(key);
    if (!best || dist < best.dist - 1e-9 || (dist < best.dist + 1e-9 && r.area > best.area)) {
      groupBest.set(key, { dist, area: r.area });
      groupLabelLeaf.set(key, leafId);
    }
  }

  return (
    <div className={`fraction-box${glueActive ? ' fraction-box--glue' : ''}`}>
      <PieceNode
        piece={root}
        selectedId={selectedId}
        groupFractions={groupFractions}
        leafGroupKey={leafGroupKey}
        groupLabelLeaf={groupLabelLeaf}
        groupSize={groupSize}
        blockedLeafIds={blockedLeafIds}
        onPieceClick={onPieceClick}
        onSubCrackClick={onSubCrackClick}
      />
    </div>
  );
};

type NodeProps = {
  piece: Piece;
  selectedId: string | null;
  groupFractions: Map<string, Fraction>;
  leafGroupKey: Map<string, string>;
  groupLabelLeaf: Map<string, string>;
  groupSize: Map<string, number>;
  blockedLeafIds: Set<string>;
  onPieceClick: (id: string) => void;
  onSubCrackClick: (leftLeafId: string, rightLeafId: string) => void;
};

const PieceNode = (props: NodeProps) => {
  const {
    piece,
    selectedId,
    groupFractions,
    leafGroupKey,
    groupLabelLeaf,
    groupSize,
    blockedLeafIds,
    onPieceClick,
    onSubCrackClick,
  } = props;

  if (piece.kind === 'leaf') {
    const groupKey = groupKeyFor(piece);
    const groupFrac = groupFractions.get(groupKey)!;
    const isSelected = selectedId === piece.id;
    const isBlocked = blockedLeafIds.has(piece.id);
    const isLabelLeaf = groupLabelLeaf.get(groupKey) === piece.id;
    const isGrouped = (groupSize.get(groupKey) ?? 1) > 1;
    return (
      <LeafPiece
        leafId={piece.id}
        groupKey={groupKey}
        groupFrac={groupFrac}
        isSelected={isSelected}
        isBlocked={isBlocked}
        isLabelLeaf={isLabelLeaf}
        isGrouped={isGrouped}
        onPieceClick={onPieceClick}
      />
    );
  }

  const crackOrientation = piece.axis === 'column' ? 'vertical' : 'horizontal';
  const n = piece.children.length;
  const sideForLeft = piece.axis === 'column' ? ('right' as const) : ('bottom' as const);
  const sideForRight = piece.axis === 'column' ? ('left' as const) : ('top' as const);

  type RenderableSubCrack = {
    leftLeafId: string;
    rightLeafId: string;
    pctAlongSplit: number;
    perpStart: number;
    perpEnd: number;
  };
  const subCracks: RenderableSubCrack[] = [];
  for (let i = 0; i < n - 1; i++) {
    const leftEdges = getEdgeLeaves(piece.children[i], sideForLeft);
    const rightEdges = getEdgeLeaves(piece.children[i + 1], sideForRight);
    const pct = ((i + 1) / n) * 100;
    for (const s of computeSubCracks(leftEdges, rightEdges)) {
      subCracks.push({
        leftLeafId: s.leftLeafId,
        rightLeafId: s.rightLeafId,
        pctAlongSplit: pct,
        perpStart: s.start,
        perpEnd: s.end,
      });
    }
  }

  return (
    <div className={`piece-split piece-split--${piece.axis}`}>
      {piece.children.map((child) => (
        <PieceNode key={child.id} {...props} piece={child} />
      ))}
      {subCracks.map((sc, k) => {
        // Skip cracks between two leaves already in the same group — clicking
        // would be a no-op and the visual divider is already hidden.
        const lg = leafGroupKey.get(sc.leftLeafId);
        const rg = leafGroupKey.get(sc.rightLeafId);
        if (lg && rg && lg === rg) return null;

        const positionStyle: React.CSSProperties =
          piece.axis === 'column'
            ? {
                left: `${sc.pctAlongSplit}%`,
                top: `${sc.perpStart * 100}%`,
                height: `${(sc.perpEnd - sc.perpStart) * 100}%`,
                bottom: 'auto',
              }
            : {
                top: `${sc.pctAlongSplit}%`,
                left: `${sc.perpStart * 100}%`,
                width: `${(sc.perpEnd - sc.perpStart) * 100}%`,
                right: 'auto',
              };
        const isBlocked =
          blockedLeafIds.has(sc.leftLeafId) || blockedLeafIds.has(sc.rightLeafId);
        const crackClasses = [
          'piece-crack',
          `piece-crack--${crackOrientation}`,
          isBlocked ? 'piece-crack--blocked' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={`crack-${k}`}
            type="button"
            className={crackClasses}
            style={positionStyle}
            aria-label="Glue pieces together"
            onClick={(e) => {
              e.stopPropagation();
              onSubCrackClick(sc.leftLeafId, sc.rightLeafId);
            }}
          />
        );
      })}
    </div>
  );
};

type LeafProps = {
  leafId: string;
  groupKey: string;
  groupFrac: Fraction;
  isSelected: boolean;
  isBlocked: boolean;
  isLabelLeaf: boolean;
  isGrouped: boolean;
  onPieceClick: (id: string) => void;
};

const LeafPiece = ({
  leafId,
  groupKey,
  groupFrac,
  isSelected,
  isBlocked,
  isLabelLeaf,
  isGrouped,
  onPieceClick,
}: LeafProps) => {
  const classes = [
    'piece-leaf',
    isSelected ? 'piece-leaf--selected' : '',
    isBlocked ? 'piece-leaf--blocked' : '',
    isGrouped ? 'piece-leaf--grouped' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      data-group={groupKey}
      style={{ backgroundColor: colorForDenominator(groupFrac.denom) }}
      onClick={(e) => {
        e.stopPropagation();
        onPieceClick(leafId);
      }}
    >
      {isLabelLeaf && (
        groupFrac.num === 1 && groupFrac.denom === 1 ? (
          <span className="piece-fraction">
            <span className="piece-fraction__num">1</span>
          </span>
        ) : (
          <span className="piece-fraction">
            <span className="piece-fraction__num">{groupFrac.num}</span>
            <span className="piece-fraction__bar" />
            <span className="piece-fraction__den">{groupFrac.denom}</span>
          </span>
        )
      )}
    </button>
  );
};

export default FractionBox;
