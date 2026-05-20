import {
  Piece,
  computeFractions,
  computeGroupFractions,
  findLeafGroupKey,
} from './fractions';
import { gcf } from './factors';

export type HammerSize = 2 | 3 | 5;
export type AllowedOp = `split:${HammerSize}` | 'glue';

// V2 lessons all run in build mode: the student manipulates the board with the
// allowed ops, and the puzzle is "solved" when any group reaches 1/meta.target.
// Lesson steps without a target are free-play — never auto-solve.
export type Question = {
  prompt: string;
  initialState: Piece;
  allowedOps: AllowedOp[];
  // Target denominator. When present, the puzzle solves the instant any group
  // reaches 1/target.
  meta?: { target?: number };
};

export type AnswerResult = { correct: boolean };

export const checkAnswer = (question: Question, root: Piece): AnswerResult => {
  const target = question.meta?.target;
  if (!target) return { correct: false };
  const groups = computeGroupFractions(root);
  return {
    correct: [...groups.values()].some((f) => f.num === 1 && f.denom === target),
  };
};

export type Move =
  | { kind: 'divide'; pieceId: string; n: number }
  | { kind: 'glue'; leafIdA: string; leafIdB: string };

const lcm = (a: number, b: number) => (a * b) / gcf(a, b);

// A move is "on the chain" toward the target denominator iff the resulting
// piece sits at 1/k where k divides the target. For divide, only unit pieces
// whose denominator divides the target can be split further.
export const isCorrectMove = (question: Question, root: Piece, move: Move): boolean => {
  const target = question.meta?.target;
  if (target == null) return true;

  if (move.kind === 'divide') {
    const fractions = computeFractions(root);
    const f = fractions.get(move.pieceId);
    if (!f) return false;
    if (f.num !== 1) return false;
    if (target % f.denom !== 0) return false;
    const after = (f.denom * move.n) / gcf(f.num, f.denom * move.n);
    return target % after === 0;
  }

  const groups = computeGroupFractions(root);
  const aKey = findLeafGroupKey(root, move.leafIdA);
  const bKey = findLeafGroupKey(root, move.leafIdB);
  if (!aKey || !bKey || aKey === bKey) return false;
  const aF = groups.get(aKey);
  const bF = groups.get(bKey);
  if (!aF || !bF) return false;
  const commonDen = lcm(aF.denom, bF.denom);
  const sumNum = (commonDen / aF.denom) * aF.num + (commonDen / bF.denom) * bF.num;
  const g = gcf(sumNum, commonDen);
  const resultNum = sumNum / g;
  const resultDen = commonDen / g;
  if (resultNum !== 1) return false;
  return target % resultDen === 0;
};
