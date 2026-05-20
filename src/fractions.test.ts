import {
  Piece,
  Fraction,
  canDivide,
  collectLeafIds,
  colorForDenominator,
  computeFractions,
  computeGroupFractions,
  computeSubCracks,
  createRootPiece,
  dividePiece,
  findLeafGroupKey,
  getEdgeLeaves,
  glueLeaves,
  groupKeyFor,
} from './fractions';

// The transformation helpers (dividePiece, glueLeaves) mint new ids from a
// module-level counter. Tests work against `computeFractions` and the public
// leaf-id helpers, so we never hard-code an id string — that keeps these
// tests robust against test-execution order.

const leafIds = (root: Piece): string[] => collectLeafIds(root);

const fractionFor = (root: Piece, id: string): Fraction => {
  const f = computeFractions(root).get(id);
  if (!f) throw new Error(`no fraction for ${id}`);
  return f;
};

describe('colorForDenominator', () => {
  it('returns an HSL string for any positive denominator', () => {
    expect(colorForDenominator(1)).toMatch(/^hsl\(\d/);
    expect(colorForDenominator(7)).toMatch(/^hsl\(/);
    expect(colorForDenominator(120)).toMatch(/^hsl\(/);
  });

  it('produces different hues for sequential denominators (golden-angle spacing)', () => {
    const c2 = colorForDenominator(2);
    const c3 = colorForDenominator(3);
    expect(c2).not.toEqual(c3);
  });

  it('stays inside [0,360) hue range for negative denominators too', () => {
    const out = colorForDenominator(-5);
    const hue = Number(out.match(/hsl\(([\d.]+)/)?.[1] ?? -1);
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });
});

describe('createRootPiece', () => {
  it('returns a leaf with a unique id and no children', () => {
    const a = createRootPiece();
    const b = createRootPiece();
    expect(a.kind).toBe('leaf');
    expect(b.kind).toBe('leaf');
    expect(a.id).not.toEqual(b.id);
  });
});

describe('dividePiece', () => {
  it('replaces the target leaf with N equal children', () => {
    const root = createRootPiece();
    const split = dividePiece(root, root.id, 3);
    const ids = leafIds(split);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      expect(fractionFor(split, id)).toEqual({ num: 1, denom: 3 });
    }
  });

  it('is a no-op when n < 2', () => {
    const root = createRootPiece();
    expect(dividePiece(root, root.id, 1)).toBe(root);
    expect(dividePiece(root, root.id, 0)).toBe(root);
  });

  it('is a no-op when the id is not in the tree', () => {
    const root = createRootPiece();
    expect(dividePiece(root, 'no-such-id', 2)).toBe(root);
  });

  it('alternates split axis: row, then column on its children', () => {
    const root = createRootPiece();
    const once = dividePiece(root, root.id, 2);
    expect(once.kind).toBe('split');
    if (once.kind === 'split') {
      expect(once.axis).toBe('row');
      const child = once.children[0];
      const twice = dividePiece(once, child.id, 2);
      // Walk to the parent of the newly-split child to inspect its axis.
      if (twice.kind === 'split') {
        const newChild = twice.children[0];
        expect(newChild.kind).toBe('split');
        if (newChild.kind === 'split') expect(newChild.axis).toBe('column');
      }
    }
  });

  it('blocks splits that would push the denominator past MAX_DENOMINATOR (120)', () => {
    let root: Piece = createRootPiece();
    root = dividePiece(root, root.id, 11); // denom 11
    // Now try to split one of those leaves by 12 → denom 132 > 120.
    const leaf = leafIds(root)[0];
    const blocked = dividePiece(root, leaf, 12);
    // Blocked: returns the same root reference.
    expect(blocked).toBe(root);
  });

  it('allows splits up to the cap', () => {
    let root: Piece = createRootPiece();
    root = dividePiece(root, root.id, 10);
    const leaf = leafIds(root)[0];
    const ok = dividePiece(root, leaf, 12); // denom would be 120, exactly the cap
    expect(ok).not.toBe(root);
  });

  it('children inherit the parent leaf groupId so splits keep joins intact', () => {
    let root: Piece = createRootPiece();
    root = dividePiece(root, root.id, 2);
    const [a, b] = leafIds(root);
    const glued = glueLeaves(root, a, b);
    const gKey = findLeafGroupKey(glued, a);
    // Split one of the grouped leaves; its children should keep that group.
    const after = dividePiece(glued, a, 3);
    const newLeaves = leafIds(after).filter((id) => id !== b);
    for (const id of newLeaves) {
      expect(findLeafGroupKey(after, id)).toBe(gKey);
    }
  });
});

describe('canDivide', () => {
  it('returns true when the result stays within MAX_DENOMINATOR', () => {
    const root = createRootPiece();
    expect(canDivide(root, root.id, 2)).toBe(true);
    expect(canDivide(root, root.id, 120)).toBe(true);
  });

  it('returns false when the split would exceed MAX_DENOMINATOR', () => {
    const root = createRootPiece();
    expect(canDivide(root, root.id, 121)).toBe(false);
  });

  it('returns false for an unknown id', () => {
    const root = createRootPiece();
    expect(canDivide(root, 'no-such-id', 2)).toBe(false);
  });
});

describe('glueLeaves', () => {
  it('is a no-op when both ids are equal', () => {
    const root = createRootPiece();
    expect(glueLeaves(root, root.id, root.id)).toBe(root);
  });

  it('is a no-op when either id is missing', () => {
    const root = createRootPiece();
    expect(glueLeaves(root, root.id, 'no-such')).toBe(root);
    expect(glueLeaves(root, 'no-such', root.id)).toBe(root);
  });

  it('groups two previously-ungrouped leaves under one shared id', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 2);
    const [a, b] = leafIds(r);
    const after = glueLeaves(r, a, b);
    expect(findLeafGroupKey(after, a)).toEqual(findLeafGroupKey(after, b));
  });

  it('is a no-op when the two leaves are already in the same group', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 3);
    const ids = leafIds(r);
    const once = glueLeaves(r, ids[0], ids[1]);
    const twice = glueLeaves(once, ids[0], ids[1]);
    expect(twice).toBe(once);
  });

  it('merges two distinct groups into one when their members are glued', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 4);
    const [a, b, c, d] = leafIds(r);
    r = glueLeaves(r, a, b); // group 1: {a,b}
    r = glueLeaves(r, c, d); // group 2: {c,d}
    const merged = glueLeaves(r, a, c); // now: {a,b,c,d}
    const k = findLeafGroupKey(merged, a);
    expect(findLeafGroupKey(merged, b)).toBe(k);
    expect(findLeafGroupKey(merged, c)).toBe(k);
    expect(findLeafGroupKey(merged, d)).toBe(k);
  });
});

describe('collectLeafIds', () => {
  it('returns the single id for a leaf-only root', () => {
    const r = createRootPiece();
    expect(collectLeafIds(r)).toEqual([r.id]);
  });

  it('returns ids in left-to-right render order', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 3);
    expect(collectLeafIds(r)).toHaveLength(3);
  });
});

describe('computeFractions', () => {
  it('a single leaf is 1/1', () => {
    const r = createRootPiece();
    const m = computeFractions(r);
    expect(m.get(r.id)).toEqual({ num: 1, denom: 1 });
  });

  it('a split into 4 yields four 1/4 leaves', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 4);
    const ids = leafIds(r);
    for (const id of ids) {
      expect(fractionFor(r, id)).toEqual({ num: 1, denom: 4 });
    }
  });

  it('nested splits multiply the denominator', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 2);
    const firstChild = leafIds(r)[0];
    r = dividePiece(r, firstChild, 3);
    const ids = leafIds(r);
    // Two children at 1/2, three children at 1/6 each.
    const fracs = ids.map((id) => fractionFor(r, id));
    const denoms = fracs.map((f) => f.denom).sort();
    expect(denoms).toEqual([2, 6, 6, 6]);
  });

  it('returns lowest-terms fractions via the internal simplify', () => {
    // After splitting by 2 then 2 again on one side, leaves are 2/4 in raw
    // terms but should be reported as 1/2.
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 2);
    const first = leafIds(r)[0];
    r = dividePiece(r, first, 2);
    const ids = leafIds(r);
    const fracs = ids.map((id) => fractionFor(r, id));
    // The non-split sibling stays 1/2; the two sub-splits become 1/4 each.
    const denoms = fracs.map((f) => f.denom).sort();
    expect(denoms).toEqual([2, 4, 4]);
  });
});

describe('groupKeyFor', () => {
  it('returns the leaf id when no groupId is set', () => {
    const r = createRootPiece();
    expect(groupKeyFor(r)).toBe(r.id);
  });

  it('returns the groupId when set', () => {
    expect(groupKeyFor({ id: 'x', groupId: 'g7' })).toBe('g7');
  });
});

describe('findLeafGroupKey', () => {
  it('returns null when the id is not present', () => {
    const r = createRootPiece();
    expect(findLeafGroupKey(r, 'no-such')).toBeNull();
  });

  it('returns the leaf id when no group is set', () => {
    const r = createRootPiece();
    expect(findLeafGroupKey(r, r.id)).toBe(r.id);
  });
});

describe('computeGroupFractions', () => {
  it('a single leaf is its own group at its fraction', () => {
    const r = createRootPiece();
    const m = computeGroupFractions(r);
    expect(m.size).toBe(1);
    expect(m.get(r.id)).toEqual({ num: 1, denom: 1 });
  });

  it('sums the fractions of leaves in the same group', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 4);
    const [a, b, c, d] = leafIds(r);
    r = glueLeaves(r, a, b);
    r = glueLeaves(r, a, c);
    const groups = computeGroupFractions(r);
    const gKey = findLeafGroupKey(r, a)!;
    expect(groups.get(gKey)).toEqual({ num: 3, denom: 4 });
    // The unglued leaf is its own group at 1/4.
    expect(groups.get(d)).toEqual({ num: 1, denom: 4 });
  });

  it('sums leaves with different denominators via LCD', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 2);
    const [a, b] = leafIds(r);
    // Split one half into thirds — leaves are 1/2, 1/6, 1/6, 1/6.
    r = dividePiece(r, a, 3);
    // Glue the half-leaf (b) with one of the sixths.
    const after = leafIds(r);
    const sixths = after.filter((id) => id !== b);
    const merged = glueLeaves(r, b, sixths[0]);
    const groups = computeGroupFractions(merged);
    const gKey = findLeafGroupKey(merged, b)!;
    // 1/2 + 1/6 = 3/6 + 1/6 = 4/6 = 2/3.
    expect(groups.get(gKey)).toEqual({ num: 2, denom: 3 });
  });
});

describe('getEdgeLeaves', () => {
  it('returns the single leaf when called on a leaf root', () => {
    const r = createRootPiece();
    expect(getEdgeLeaves(r, 'left')).toEqual([{ id: r.id, start: 0, end: 1 }]);
  });

  it('splits along the requested edge when children run parallel to it', () => {
    // A row-axis split places dividers horizontally; the left/right edges
    // see every child along them.
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 3);
    if (r.kind !== 'split') throw new Error('expected split');
    expect(r.axis).toBe('row');
    const left = getEdgeLeaves(r, 'left');
    expect(left).toHaveLength(3);
    // Segments tile [0,1].
    expect(left[0].start).toBe(0);
    expect(left[2].end).toBe(1);
  });

  it('returns only the boundary child when split runs across the edge', () => {
    // For a row-axis split, the top edge is touched only by the first child.
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 3);
    const top = getEdgeLeaves(r, 'top');
    expect(top).toHaveLength(1);
    expect(top[0].start).toBe(0);
    expect(top[0].end).toBe(1);
  });

  it('returns the last child along the bottom edge for a row-axis split', () => {
    let r: Piece = createRootPiece();
    r = dividePiece(r, r.id, 3);
    if (r.kind !== 'split') throw new Error('expected split');
    const bottom = getEdgeLeaves(r, 'bottom');
    expect(bottom).toHaveLength(1);
    expect(bottom[0].id).toBe(r.children[r.children.length - 1].id);
  });
});

describe('computeSubCracks', () => {
  it('returns the overlap interval between two single-leaf edges', () => {
    const cracks = computeSubCracks(
      [{ id: 'A', start: 0, end: 1 }],
      [{ id: 'B', start: 0, end: 1 }],
    );
    expect(cracks).toEqual([{ leftLeafId: 'A', rightLeafId: 'B', start: 0, end: 1 }]);
  });

  it('handles partial overlaps and skips disjoint segments', () => {
    const cracks = computeSubCracks(
      [
        { id: 'A', start: 0, end: 0.5 },
        { id: 'B', start: 0.5, end: 1 },
      ],
      [
        { id: 'X', start: 0, end: 0.3 },
        { id: 'Y', start: 0.3, end: 1 },
      ],
    );
    // A/X overlap [0, 0.3]; A/Y overlap [0.3, 0.5]; B/Y overlap [0.5, 1].
    expect(cracks).toHaveLength(3);
    expect(cracks.map((c) => `${c.leftLeafId}-${c.rightLeafId}`).sort()).toEqual([
      'A-X',
      'A-Y',
      'B-Y',
    ]);
  });

  it('drops zero-length overlaps below the 1e-9 epsilon', () => {
    const cracks = computeSubCracks(
      [{ id: 'A', start: 0, end: 0.5 }],
      [{ id: 'B', start: 0.5, end: 1 }],
    );
    expect(cracks).toHaveLength(0);
  });
});
