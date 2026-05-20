import {
  Piece,
  collectLeafIds,
  computeFractions,
  createRootPiece,
  dividePiece,
} from './fractions';
import { AllowedOp } from './questions';

export type V2ConceptId =
  | 'divide-by-2'
  | 'divide-by-3'
  | 'divisibility-2'
  | 'divisibility-3'
  | 'divide-by-5'
  | 'divisibility-5'
  | 'divisibility-7'
  | 'divisibility-11'
  | 'factors-of-one'
  | 'factor-pairs'
  | 'gcf-venn'
  | 'equivalent-fractions'
  | 'multiply-by-one'
  | 'equate-two-bases'
  | 'reduce-by-shared-factor'
  | 'simplest-form'
  | 'simplification-drill'
  | 'add-same-base'
  | 'add-different-bases'
  | 'add-and-simplify'
  | 'final-assessment';

export const V2_CONCEPTS: V2ConceptId[] = [
  'divide-by-2',
  'divide-by-3',
  'divisibility-2',
  'divisibility-3',
  'divide-by-5',
  'divisibility-5',
  'divisibility-7',
  'divisibility-11',
  'factors-of-one',
  'factor-pairs',
  'gcf-venn',
  'equivalent-fractions',
  'multiply-by-one',
  'equate-two-bases',
  'reduce-by-shared-factor',
  'simplest-form',
  'simplification-drill',
  'add-same-base',
  'add-different-bases',
  'add-and-simplify',
  'final-assessment',
];

export const V2_CONCEPT_LABELS: Record<V2ConceptId, string> = {
  'divide-by-2': '1 - Divide By 2',
  'divide-by-3': '2 - Divide By 3',
  'divisibility-2': '3 - Divisible By 2',
  'divisibility-3': '4 - Divisible By 3',
  'divide-by-5': '5 - Divide By 5',
  'divisibility-5': '6 - Divisible By 5',
  'divisibility-7': '7 - Divisible By 7',
  'divisibility-11': '8 - Divisible By 11',
  'factors-of-one': '9 - Factors Of A Number',
  'factor-pairs': '10 - Factor Pairs',
  'gcf-venn': '11 - Greatest Common Factor',
  'equivalent-fractions': '12 - Equivalent Fractions',
  'multiply-by-one': '13 - Multiplying By One',
  'equate-two-bases': '14 - Equating Two Bases',
  'reduce-by-shared-factor': '15 - Reducing By A Shared Factor',
  'simplest-form': '16 - Simplest Form',
  'simplification-drill': '17 - Simplification Drill',
  'add-same-base': '18 - Adding With The Same Base',
  'add-different-bases': '19 - Adding With Different Bases',
  'add-and-simplify': '20 - Add And Simplify',
  'final-assessment': '21 - Final Assessment',
};

export type V2ModuleId =
  | 'prime-dividing'
  | 'common-factors'
  | 'base-equating'
  | 'simplification'
  | 'add-fractions';

export const V2_MODULES: V2ModuleId[] = [
  'prime-dividing',
  'common-factors',
  'base-equating',
  'simplification',
  'add-fractions',
];

export const V2_MODULE_LABELS: Record<V2ModuleId, string> = {
  'prime-dividing': 'Prime Number Dividing',
  'common-factors': 'Common Factors',
  'base-equating': 'Base Equating',
  'simplification': 'Simplification',
  'add-fractions': 'Adding Fractions',
};

export const V2_MODULE_CONCEPTS: Record<V2ModuleId, V2ConceptId[]> = {
  'prime-dividing': [
    'divide-by-2',
    'divide-by-3',
    'divisibility-2',
    'divisibility-3',
    'divide-by-5',
    'divisibility-5',
    'divisibility-7',
    'divisibility-11',
  ],
  'common-factors': ['factors-of-one', 'factor-pairs', 'gcf-venn'],
  'base-equating': ['equivalent-fractions', 'multiply-by-one', 'equate-two-bases'],
  'simplification': ['reduce-by-shared-factor', 'simplest-form', 'simplification-drill'],
  'add-fractions': [
    'add-same-base',
    'add-different-bases',
    'add-and-simplify',
    'final-assessment',
  ],
};

export type V2Animation =
  | 'hammer-reveal-2'
  | 'hammer-reveal-3'
  | 'hammer-reveal-5';

// How does the student complete this step?
// 'next-button'         — manual Next button advances.
// 'divide'              — any successful split advances.
// 'animation'           — the entry animation completes and auto-advances.
// 'all-pieces-at-target'— every leaf reaches targetDenominator.
// 'dots-grouped'        — every dot belongs to a blob of size dotGroupSize.
// 'strip-divided'       — student taps a strip with the right hammer and it
//                         slices cleanly into K equal groups.
// 'strip-attempted'     — student taps a strip with any hammer (success or
//                         failure both advance). Used when there's only one
//                         viable hammer so a wrong-hammer trap doesn't exist.
// 'array-fitted'        — the student confirms the arranged array.
// 'common-moved'        — all shared factors moved into the common zone.
// 'venn-placed'         — every factor placed in its correct Venn region.
// 'worksheet-passed'    — rapid-fire divisibility worksheet scored 100%.
// 'dots-explored'       — free-grouping dots; every factor of `count` found.
// 'dots-maxed'          — every dot that CAN fit into a `groupSize` blob has,
//                         with only the remainder left lone. Used for "can't
//                         pair everything" cases so the student isn't trapped.
export type V2StepCompletion =
  | 'next-button'
  | 'divide'
  | 'animation'
  | 'all-pieces-at-target'
  | 'dots-grouped'
  | 'dots-explored'
  | 'dots-maxed'
  | 'strip-divided'
  | 'strip-attempted'
  | 'array-fitted'
  | 'common-moved'
  | 'venn-placed'
  | 'worksheet-passed'
  // Two-fraction board: both sides display the same denominator (denom ×
  // multiplierFactor). Fires the rising-edge transition for phase advance.
  | 'both-sides-same-denom'
  // Two-fraction board: student dragged right onto left after match; the
  // canvas collapsed to a single fraction.
  | 'combined'
  // Single fraction is in simplest form (gcf(num, denom) === 1). Used by
  // the capstone's third phase.
  | 'simplest-form';

// Canvas payload for a step. Each kind carries everything its renderer
// needs. Omitting `canvas` on a step falls back to the fraction-box board;
// pure-text intro/recap steps use `kind: 'none'`.
export type V2StepCanvas =
  | { kind: 'none' }
  // Big-number divisibility quiz screen.
  | { kind: 'number'; value?: number }
  // Draggable counters that the student clusters.
  // 'prescribed' (default): every dot must land in a blob of exactly
  //   `groupSize` to complete the step.
  // 'explore':   the student freely makes any arrangement. Whenever all
  //   dots sit in equal-size blobs, that size is reported as a discovered
  //   factor — and so is its pair (count / size). No prescribed groupSize.
  | {
      kind: 'dots';
      count: number;
      groupSize?: number;
      mode?: 'prescribed' | 'explore';
    }
  // Row of unit blocks. The student picks a hammer from the ToolPanel and
  // taps the strip; it slices into K equal groups or shakes with an orphan.
  | { kind: 'strip'; count: number }
  // Static rows×cols grid; `total` highlights leftover when rows*cols > total.
  | { kind: 'array'; rows: number; cols: number; total?: number }
  // Side-by-side factor lists with a shared zone.
  | { kind: 'common'; a: number; b: number; resultView?: boolean }
  // Two-circle Venn for factor placement; resultView pre-fills it and
  // highlights the GCF.
  | { kind: 'venn'; a: number; b: number; resultView?: boolean }
  // Rapid-fire divisibility drill. The student checks the rows that ARE
  // divisible by `divisor`, then submits. ≥`passPct`% correct advances; a
  // miss reshuffles a new random set and forces a retry.
  | {
      kind: 'worksheet';
      divisor: number;
      // How many rows per attempt.
      count: number;
      // 0-1; defaults to 1 (every answer must be correct).
      passPct?: number;
      // Numbers that ARE divisible by `divisor`. Drawn from at random.
      yesPool: number[];
      // Numbers that are NOT divisible by `divisor`.
      noPool: number[];
      // Which digits to emphasize. 'last-digit' (default) dims everything
      // except the final digit (the 2 and 5 rules). 'all-digits' keeps every
      // digit full-brightness — the 3 rule uses the digit sum, so the whole
      // number matters.
      emphasis?: 'last-digit' | 'all-digits';
    }
  // Side-by-side two-fraction board (Module 3 + capstone). Each side has its
  // own scale state; the renderer signals matched bases and offers drag-to-
  // combine. See `TwoFractionsCanvas.tsx`.
  | {
      kind: 'twoFractions';
      left: { num: number; denom: number };
      right: { num: number; denom: number };
    };

export type V2LessonStep = {
  prompt: string;
  initialState: Piece;
  allowedOps: AllowedOp[];
  completeOn: V2StepCompletion;
  entryAnimation?: V2Animation;
  // Blocks any split that would push a leaf's denominator past this value.
  // Also used as the target denominator for 'all-pieces-at-target' completion.
  targetDenominator?: number;
  // When true, entering this step via Next preserves the current board rather
  // than resetting to initialState.
  preserveBoard?: boolean;
  // Canvas payload for non-board lessons. Omitted means use the fraction box.
  canvas?: V2StepCanvas;
  // For factor-discovery lessons: which target this step is investigating
  // (12 or 18), and which factor(s) to mark "discovered" when the student
  // advances past this step. Two values for a successful pair-split — e.g.
  // 12 into 2s reveals both 2 and 6.
  factorTarget?: number;
  factorReveal?: number[];
  // Yes/No quiz on this step. When present, the chat panel shows two
  // buttons; Next stays hidden until the student picks one.
  guessAnswer?: 'yes' | 'no';
  guessExplanation?: string;
};

const splitAllLeaves = (root: Piece, n: number): Piece => {
  let result = root;
  for (const id of collectLeafIds(result)) {
    result = dividePiece(result, id, n);
  }
  return result;
};

// Uniform-split board: every leaf gets bisected `times` times by `n`.
// splitAll(2, 1) → two halves; splitAll(3, 2) → nine ninths.
const splitAll = (n: number, times: number): Piece => {
  let root = createRootPiece();
  for (let i = 0; i < times; i++) {
    root = splitAllLeaves(root, n);
  }
  return root;
};

export const hammerSizeFromAnim = (anim: V2Animation): number =>
  Number(anim.replace('hammer-reveal-', ''));

// Builds a complete "divide-by-N" lesson: welcome → animation → first smash,
// then alternating wow/smash steps until the deepest reachable level.
const buildDivideByLesson = (
  n: number,
  levels: number,
  prompts: {
    welcome: string;
    firstSmash: string;
    // wows[i] is the celebration after reaching n^(i+1) pieces.
    wows: string[];
    // smashes[i] is the smash-again prompt going from n^(i+1) to n^(i+2)
    // pieces. Should have length `levels - 1`.
    smashes: string[];
  },
): V2LessonStep[] => {
  const splitOp = `split:${n}` as AllowedOp;
  const steps: V2LessonStep[] = [
    {
      prompt: prompts.welcome,
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt: '',
      initialState: createRootPiece(),
      allowedOps: [],
      entryAnimation: `hammer-reveal-${n}` as V2Animation,
      completeOn: 'animation',
    },
    {
      prompt: prompts.firstSmash,
      initialState: createRootPiece(),
      allowedOps: [splitOp],
      completeOn: 'divide',
      targetDenominator: n,
    },
  ];
  for (let level = 1; level <= levels; level++) {
    // Wow step: hammer is visible but locked at the current depth so the
    // student can't preview the next level before reading the celebration.
    steps.push({
      prompt: prompts.wows[level - 1],
      initialState: splitAll(n, level),
      allowedOps: [splitOp],
      completeOn: 'next-button',
      targetDenominator: Math.pow(n, level),
    });
    if (level < levels) {
      steps.push({
        prompt: prompts.smashes[level - 1],
        initialState: splitAll(n, level),
        allowedOps: [splitOp],
        completeOn: 'all-pieces-at-target',
        targetDenominator: Math.pow(n, level + 1),
      });
    }
  }
  return steps;
};

export const V2_LESSONS: Record<V2ConceptId, V2LessonStep[]> = {
  'divide-by-2': buildDivideByLesson(2, 5, {
    welcome:
      'Welcome to Fractical!\n\nA fraction names a part of a whole.\n\nToday we start with one whole block and watch what happens when we split it into smaller, equal pieces.',
    firstSmash:
      'You got the 2 hammer! It splits any piece into 2 equal parts.\n\nClick the 2 hammer, then SMASH the block!',
    wows: [
      "You broke the whole block into 2 equal pieces.\n\nEach piece is 1/2 — say 'one half'.\n\nThe top number 1 is how many pieces you're talking about, and the bottom number 2 is how many equal pieces make up the whole.",
      "Awesome! Now you've got 4 equal pieces.\n\nEach one is 1/4 of the whole — 'one quarter'.\n\nSplitting every half in half doubled the count from 2 to 4. Four 1/4 pieces still add up to one whole!",
      'Now you have 8 pieces, each 1/8 of the whole.\n\nEvery time the 2 hammer strikes, the denominator — the bottom number — doubles: 2 → 4 → 8.\n\nThe pieces shrink, but together they always equal 1 whole.',
      '16 tiny pieces, each 1/16 of the original!\n\nThe bigger the denominator, the smaller each piece.\n\nBut every piece on the board still adds up to the same whole block.',
      'Incredible! 32 equal pieces, each just 1/32 of the original.\n\nThe 2 hammer doubled the denominator five times: 2 → 4 → 8 → 16 → 32.\n\nThe pieces got tinier each time, but they always add right back up to 1 whole!',
    ],
    smashes: [
      'Now use the 2 hammer to smash each 1/2 piece in half.\n\nWhat size do you think the new pieces will be?',
      'Keep going! Smash each 1/4 piece in half.',
      'Smash each 1/8 piece in half with the 2 hammer.',
      'One more time — smash each 1/16 piece in half.',
    ],
  }),

  'divisibility-2': [
    {
      prompt:
        "Welcome to lesson 3!\n\nA number is divisible by 2 when you can group it into perfect pairs — no dot left without a partner.\n\nLet's try some numbers and see which ones work.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Let's start small. Here are 6 dots.\n\nDrag them into groups of 2. If every dot has a partner, then 6 is divisible by 2.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 6, groupSize: 2 },
    },
    {
      prompt:
        "6 split into 3 perfect pairs. ✓\n\nNow try 7 dots. Drag them into pairs.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 7, groupSize: 2 },
    },
    {
      prompt:
        "No matter what, 7 leaves one dot without a partner. ✗ 7 is NOT divisible by 2.\n\nKeep going — try 8 dots.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 8, groupSize: 2 },
    },
    {
      prompt:
        "8 paired up cleanly. ✓\n\nHow about 11?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 11, groupSize: 2 },
    },
    {
      prompt:
        "11 always leaves one dot alone. ✗\n\nLast one: try 10.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 10, groupSize: 2 },
    },
    {
      prompt:
        "10 paired up cleanly. ✓\n\nLook at what we found:\n• 6, 8, 10 → pair up cleanly ✓\n• 7, 11 → one left over ✗\n\nThe ones that worked are all EVEN. The ones that didn't are all ODD.\n\nDragging dots works for small numbers, but what about 38, or 274? We need a faster trick…",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's the trick: a number is divisible by 2 if it's EVEN.\n\nTo spot an even number, look at its LAST DIGIT. If it ends in 0, 2, 4, 6, or 8, the whole number is even — and you can split it with the 2 hammer.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Time to drill it. Look at each number's LAST DIGIT and check the ones that ARE divisible by 2.\n\nGet every answer right to move on. Miss any and you get a fresh worksheet to try again.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'worksheet-passed',
      canvas: {
        kind: 'worksheet',
        divisor: 2,
        count: 10,
        passPct: 1,
        yesPool: [38, 64, 90, 142, 256, 480, 372, 18, 50, 86, 124, 208, 530, 666, 814],
        noPool: [27, 91, 33, 145, 219, 477, 581, 13, 75, 109, 263, 401, 555, 717, 893],
      },
    },
    {
      prompt:
        "Nice work! You've got the divisibility-by-2 trick down.\n\nIf a number ends in 0, 2, 4, 6, or 8, you can split it with the 2 hammer.\n\nNext up: the 3 hammer trick.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'divisibility-3': [
    {
      prompt:
        "Welcome to lesson 4!\n\nSame game, new group size: which numbers split evenly into THREES?\n\nFor each pile, drag the dots into groups of 3 and see if every dot fits.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Start with 9 dots. Drag them into groups of 3 — if every dot fits, then 9 IS divisible by 3.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 9, groupSize: 3 },
    },
    {
      prompt:
        "9 made 3 perfect groups of 3. ✓\n\nNext: 12 dots into groups of 3.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 12, groupSize: 3 },
    },
    {
      prompt:
        "12 fit too. ✓\n\nNow try 8.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 8, groupSize: 3 },
    },
    {
      prompt:
        "8 always leaves dots over — 8 is NOT divisible by 3.\n\nNext up: 15.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 15, groupSize: 3 },
    },
    {
      prompt:
        "15 worked. ✓\n\nLast one: try 10.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 10, groupSize: 3 },
    },
    {
      prompt:
        "Look at which numbers grouped into 3s cleanly:\n• 9 ✓  12 ✓  15 ✓\n• 8 ✗  10 ✗\n\nDragging dots works for small numbers, but it gets hard for big ones. Luckily, 3 has its own trick — and it's a clever one.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's the trick for 3:\n\nAdd up all the digits of the number. If the sum is 3, 6, or 9, the whole number is divisible by 3.\n\nIf your sum is bigger than 9, just add THOSE digits together too and check again.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Time to drill it. Add up each number's digits — keep adding until you're at one digit — and check the ones whose digit sum is 3, 6, or 9.\n\nGet every answer right to move on. Miss any and you get a fresh worksheet to try again.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'worksheet-passed',
      canvas: {
        kind: 'worksheet',
        divisor: 3,
        count: 10,
        passPct: 1,
        emphasis: 'all-digits',
        yesPool: [21, 156, 36, 42, 75, 108, 123, 213, 261, 312, 411, 504, 633, 729, 819],
        noPool: [25, 47, 19, 22, 64, 88, 101, 131, 175, 233, 287, 314, 422, 506, 770],
      },
    },
    {
      prompt:
        "Awesome! Now you've got divisibility tricks for both 2 and 3.\n\nWhen you see a fraction like 1/N:\n\n• N ends in 0, 2, 4, 6, or 8? Grab the 2 hammer.\n• N's digits sum to 3, 6, or 9? Grab the 3 hammer.\n\nNeither work? You'll need a bigger hammer — coming up next!",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'divisibility-5': [
    {
      prompt:
        "Welcome to lesson 6!\n\nLast one in this set: which numbers split evenly into FIVES?\n\nFor each pile, drag the dots into groups of 5 and see if every dot fits.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Start with 15 dots. Drag them into groups of 5 — if every dot fits, then 15 IS divisible by 5.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 15, groupSize: 5 },
    },
    {
      prompt:
        "15 made 3 perfect groups of 5. ✓\n\nNow try 10 dots.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 10, groupSize: 5 },
    },
    {
      prompt:
        "10 worked too. ✓\n\nHow about 9?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 9, groupSize: 5 },
    },
    {
      prompt:
        "9 leaves dots over — 9 is NOT divisible by 5.\n\nTrickier one: try 25.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 25, groupSize: 5 },
    },
    {
      prompt:
        "25 split into 5 groups of 5. ✓\n\nLast one: 12.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 12, groupSize: 5 },
    },
    {
      prompt:
        "Look at which numbers grouped into 5s cleanly:\n• 15 ✓  10 ✓  25 ✓\n• 9 ✗  12 ✗\n\nFor numbers like 245 or 1,300 we'd be dragging dots forever. The 5 trick saves the day…",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "The 5 trick is the easiest yet.\n\nA number is divisible by 5 if its LAST DIGIT is 0 or 5.\n\nNo adding, no digit sums — just check the last digit.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Time to drill it. Check every number whose LAST DIGIT is 0 or 5.\n\nGet every answer right to move on. Miss any and you get a fresh worksheet to try again.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'worksheet-passed',
      canvas: {
        kind: 'worksheet',
        divisor: 5,
        count: 10,
        passPct: 1,
        yesPool: [30, 25, 45, 80, 115, 200, 245, 360, 405, 500, 615, 730, 855, 1000, 1300],
        noPool: [17, 42, 23, 38, 66, 91, 102, 134, 177, 218, 263, 311, 422, 506, 689],
      },
    },
    {
      prompt:
        "Nice work! You've got divisibility tricks for 2, 3, and 5.\n\nWhen you see a fraction like 1/N:\n• N ends in 0, 2, 4, 6, or 8? Grab the 2 hammer.\n• N's digits sum to 3, 6, or 9? Grab the 3 hammer.\n• N ends in 0 or 5? Grab the 5 hammer.\n\nUp next: a trickier divisor — 7. The trick is sneakier, but it works on numbers as big as you'd like.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'divisibility-7': [
    {
      prompt:
        "Welcome to lesson 7!\n\nNow we level up. 7 doesn't have a simple last-digit rule like 2 or 5, and its digit sum isn't useful like 3's. But there IS a trick — it's just a little sneakier.\n\nLet's start the way we always do: drag dots into groups and see which numbers fit.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Start with 14 dots. Drag them into groups of 7 — if every dot fits, then 14 IS divisible by 7.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 14, groupSize: 7 },
    },
    {
      prompt:
        "14 split into 2 perfect groups of 7. ✓\n\nNow try 21 dots into groups of 7.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 21, groupSize: 7 },
    },
    {
      prompt:
        "21 worked too. ✓\n\nHow about 18?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 18, groupSize: 7 },
    },
    {
      prompt:
        "18 fills 2 groups of 7 with 4 left over — 18 is NOT divisible by 7.\n\nTry 35.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 35, groupSize: 7 },
    },
    {
      prompt:
        "35 split into 5 clean groups of 7. ✓\n\nLast one: 25.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 25, groupSize: 7 },
    },
    {
      prompt:
        "Look at what worked:\n• 14 ✓  21 ✓  35 ✓\n• 18 ✗  25 ✗\n\nDragging dots is fine for small numbers, but what about 364? Or 819? Time to learn the 7 trick.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's the 7 trick:\n\n1. Look at the LAST digit of your number.\n2. DOUBLE it.\n3. SUBTRACT that from the rest of the number (everything except the last digit).\n4. If the result is divisible by 7 (or is 0), so is the original.\n\nExample: 364 → last digit is 4, doubled is 8. The rest is 36. 36 − 8 = 28. And 28 = 7 × 4. ✓\n\nIf your result is still big, do the trick again on IT.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Time to drill it. For each number, apply the trick — double the last digit, subtract from the rest, check if the result is divisible by 7.\n\nGet every answer right to move on. Miss any and you get a fresh worksheet to try again.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'worksheet-passed',
      canvas: {
        kind: 'worksheet',
        divisor: 7,
        count: 10,
        passPct: 1,
        emphasis: 'all-digits',
        yesPool: [14, 21, 28, 35, 49, 56, 63, 77, 84, 91, 119, 154, 175, 217, 364, 441, 539, 651, 728, 819],
        noPool: [15, 22, 25, 33, 40, 51, 58, 64, 75, 82, 95, 100, 117, 124, 153, 215, 309, 422, 510, 730],
      },
    },
    {
      prompt:
        "Nice work! You've got the divisibility-by-7 trick.\n\nDouble the last digit, subtract from the rest, check if the result is divisible by 7. Repeat if you need to for big numbers.\n\nUp next: one more divisibility trick — for 11. Its rule is the most elegant of them all.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'divisibility-11': [
    {
      prompt:
        "Welcome to lesson 8!\n\nLast divisibility lesson, and 11 is the most surprising one. Its rule uses ADDING AND SUBTRACTING digits in alternating fashion.\n\nWe'll start as always: which numbers split evenly into 11s?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Start with 22 dots. Drag them into groups of 11 — if every dot fits, then 22 IS divisible by 11.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 22, groupSize: 11 },
    },
    {
      prompt:
        "22 made 2 perfect groups of 11. ✓\n\nTry 33 dots into groups of 11.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 33, groupSize: 11 },
    },
    {
      prompt:
        "33 worked too. ✓\n\nHow about 25?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 25, groupSize: 11 },
    },
    {
      prompt:
        "25 fills 2 groups of 11 with 3 left over — 25 is NOT divisible by 11.\n\nNow try 44.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 44, groupSize: 11 },
    },
    {
      prompt:
        "44 split into 4 clean groups of 11. ✓\n\nLast one: 30.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-maxed',
      canvas: { kind: 'dots', count: 30, groupSize: 11 },
    },
    {
      prompt:
        "Look at what worked:\n• 22 ✓  33 ✓  44 ✓\n• 25 ✗  30 ✗\n\nFor a number like 957 or 1,452, dragging is hopeless. Luckily 11's trick is wild.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's the 11 trick:\n\nTake an ALTERNATING SUM of the digits. Start from the left: ADD the first digit, SUBTRACT the second, ADD the third, SUBTRACT the fourth, and so on.\n\nIf the result is divisible by 11 (or is 0), so is the original.\n\nExamples:\n• 132 → 1 − 3 + 2 = 0 ✓\n• 957 → 9 − 5 + 7 = 11 ✓\n• 121 → 1 − 2 + 1 = 0 ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Time to drill it. For each number, take the alternating sum of its digits and check if the result is divisible by 11 (or is 0).\n\nGet every answer right to move on. Miss any and you get a fresh worksheet to try again.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'worksheet-passed',
      canvas: {
        kind: 'worksheet',
        divisor: 11,
        count: 10,
        passPct: 1,
        emphasis: 'all-digits',
        yesPool: [22, 33, 44, 55, 66, 77, 88, 99, 121, 132, 143, 154, 165, 209, 286, 363, 484, 583, 671, 869],
        noPool: [12, 23, 34, 45, 56, 67, 78, 89, 100, 122, 145, 213, 318, 425, 567, 619, 712, 824, 950, 137],
      },
    },
    {
      prompt:
        "Incredible! You've got divisibility tricks for 2, 3, 5, 7, AND 11.\n\nThat's a full toolbox of prime divisibility checks. Any time you see a fraction's denominator, you can break it down.\n\nUp next: now that you can find which primes divide a number, let's find ALL the factors of a number.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'divide-by-3': buildDivideByLesson(3, 3, {
    welcome:
      "Welcome to lesson 2!\n\nYou've seen the 2 hammer split things in half.\n\nNow meet the 3 hammer, which splits any piece into three equal parts at once.",
    firstSmash:
      'You got the 3 hammer!\n\nClick it, then SMASH the block to break it into 3 equal pieces.',
    wows: [
      "Wow! Three equal pieces, each 1/3 of the whole — 'one third'.\n\nThree thirds together make one whole.",
      'Look at that! 9 pieces now, each 1/9 of the whole.\n\nThe 3 hammer multiplied the denominator by 3: 3 → 9.\n\nBigger hammers shrink the pieces faster than the 2 hammer did.',
      'Amazing! 27 pieces, each just 1/27 of the original.\n\nThe 3 hammer tripled the denominator three times: 3 → 9 → 27.\n\nBigger hammers really make the pieces shrink fast!',
    ],
    smashes: [
      'Now smash each 1/3 piece into 3 with the 3 hammer.',
      'Keep going! Smash each 1/9 piece into 3 more.',
    ],
  }),

  'divide-by-5': buildDivideByLesson(5, 2, {
    welcome:
      "Welcome to lesson 5!\n\nNow you'll meet the 5 hammer, which can split a piece into five equal parts in a single strike.",
    firstSmash:
      'You got the 5 hammer!\n\nClick it, then SMASH the block into 5 equal pieces.',
    wows: [
      'Wow! Five equal pieces, each 1/5 of the whole.\n\nFive fifths together make one whole.',
      'Whoa, 25 pieces already! Each is 1/25 of the whole.\n\nThe 5 hammer multiplied the denominator by 5 in one swing: 5 → 25.\n\nWith bigger hammers, the pieces shrink incredibly fast.',
    ],
    smashes: ['Now smash each 1/5 piece into 5 more with the 5 hammer.'],
  }),

  'factors-of-one': [
    {
      prompt:
        "Welcome to lesson 9!\n\nA FACTOR of a number is a smaller number that divides into it evenly — no leftovers. The grouping game you just played is exactly how to find them.\n\nLet's hunt for ALL the factors of 12.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here are our 12 dots, all spread out. Each dot is its own group of 1 — so 1 is a factor of 12 (already lit up on the right).\n\nTry pulling ALL 12 dots into one giant blob. That's 1 big group of 12 — proving 12 is a factor of itself.\n\nThen hunt for the factors in between.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'dots', count: 12, mode: 'explore' },
      factorTarget: 12,
    },
    {
      prompt:
        "Your turn. Drag the 12 dots into equal-size groups — try every size you can think of.\n\nEach time ALL 12 dots fit cleanly into equal groups of some size, that size is a factor of 12. The side panel reveals them as you find them.\n\nFind every factor of 12 to move on.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-explored',
      canvas: { kind: 'dots', count: 12, mode: 'explore' },
      factorTarget: 12,
    },
    {
      prompt:
        "We've found all of them! The factors of 12 are:\n\n1, 2, 3, 4, 6, 12.\n\nNotice they come in pairs: 1×12, 2×6, 3×4. Every factor has a partner — and those pairs are the topic of the next lesson.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      factorTarget: 12,
    },
  ],

  'factor-pairs': [
    {
      prompt:
        "Welcome to lesson 10!\n\nLast lesson we found that factors come in pairs: 2×6=12, 3×4=12. Each pair makes a RECTANGLE.\n\nLet's see all the rectangles 12 dots can make.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "First, the skinniest one: 1 row of 12 dots — a 1×12 strip.\n\nThis is the factor pair 1 × 12 = 12.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'array', rows: 1, cols: 12 },
      factorTarget: 12,
    },
    {
      prompt:
        "Stack those 12 dots into 2 rows: a 2×6 rectangle.\n\nSame 12 dots, taller shape. This is the factor pair 2 × 6 = 12.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'array', rows: 2, cols: 6 },
      factorTarget: 12,
    },
    {
      prompt:
        "Stack them tighter: 3 rows of 4 dots — a 3×4 rectangle.\n\nLast factor pair: 3 × 4 = 12.\n\nThree clean rectangles, six factors. But what about numbers that AREN'T factors? Let's see what happens.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'array', rows: 3, cols: 4 },
      factorTarget: 12,
    },
    {
      prompt:
        "Can we fit 12 dots into rows of 5? Let's check.\n\n2 full rows of 5 use 10 dots — and 2 are left over. 5 doesn't fit evenly into 12, so 5 is NOT a factor of 12. No clean rectangle.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'array', rows: 2, cols: 5, total: 12 },
      factorTarget: 12,
    },
    {
      prompt:
        "Every factor pair of 12 makes a clean rectangle: 1×12, 2×6, 3×4. Three rectangles, six factors.\n\nNow that you can find ALL the factors of a single number, the next lesson asks a bigger question: what about TWO numbers?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'gcf-venn': [
    {
      prompt:
        "Welcome to lesson 11!\n\nNow let's meet a new number: 18. We'll compare its factors with the factors of 12 — using a VENN DIAGRAM.\n\nTwo overlapping circles: one holds the factors of 12, the other holds the factors of 18. The factors they SHARE go in the middle.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Your turn to fill it in. Drag each factor tile into the right region:\n\n• Only a factor of 12? → left circle.\n• Only a factor of 18? → right circle.\n• A factor of BOTH? → the middle overlap.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 12, b: 18 },
    },
    {
      prompt:
        "Look in the overlap: 1, 2, 3, 6 — the factors shared by 12 and 18.\n\nThose are the COMMON FACTORS. And the BIGGEST one (6) gets a special name: the GREATEST COMMON FACTOR, or GCF.\n\nGCF(12, 18) = 6. That's the number you'd use to simplify 12/18 in one step.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 12, b: 18, resultView: true },
    },
    {
      prompt:
        "Nice work!\n\nYou can split fractions, spot divisibility, find every factor of a number, and find the GCF of two numbers.\n\nNext up: using those skills to compare two fractions with different bottoms — and then to actually add them together.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  // ---- Module 3: base-equating ------------------------------------------------

  'equivalent-fractions': [
    {
      prompt:
        "Welcome to lesson 12!\n\nA fraction can wear lots of different outfits. 1/2 and 2/4 and 4/8 all name the same amount — they just slice the whole into more pieces.\n\nLet's watch one fraction try on a few different outfits.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's a whole block. Smash it once with the 2 hammer to make halves.\n\nThen smash one of the halves again to make 1/2 = 2/4.",
      initialState: createRootPiece(),
      allowedOps: ['split:2'],
      completeOn: 'all-pieces-at-target',
      targetDenominator: 4,
    },
    {
      prompt:
        "Same shaded region. The pieces got smaller, but you have twice as many of them.\n\n1/2 = 2/4. The bottom doubled, the top doubled too.",
      initialState: splitAll(2, 2),
      allowedOps: ['split:2'],
      completeOn: 'next-button',
      targetDenominator: 4,
    },
    {
      prompt:
        "Keep going. Smash each piece in half with the 2 hammer.\n\n2/4 becomes 4/8 — still the same shaded amount.",
      initialState: splitAll(2, 2),
      allowedOps: ['split:2'],
      completeOn: 'all-pieces-at-target',
      targetDenominator: 8,
    },
    {
      prompt:
        "One more time. Smash every 1/8 piece in half to reach 1/2 = 4/8 = 8/16.",
      initialState: splitAll(2, 3),
      allowedOps: ['split:2'],
      completeOn: 'all-pieces-at-target',
      targetDenominator: 16,
    },
    {
      prompt:
        "Look at the chain you just built:\n\n1/2 = 2/4 = 4/8 = 8/16.\n\nEvery time you split each piece into 2 more, the top AND the bottom both multiplied by 2. The amount didn't change — you just described it in smaller pieces.",
      initialState: splitAll(2, 4),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Same trick works with 3s. Start from one whole block and use the 3 hammer twice to reach 1/3 = 3/9 = 9/27.\n\nFirst smash makes thirds; second smash splits each third into 3 more.",
      initialState: createRootPiece(),
      allowedOps: ['split:3'],
      completeOn: 'all-pieces-at-target',
      targetDenominator: 9,
    },
    {
      prompt:
        "Now one more smash to reach 27ths.",
      initialState: splitAll(3, 2),
      allowedOps: ['split:3'],
      completeOn: 'all-pieces-at-target',
      targetDenominator: 27,
    },
    {
      prompt:
        "Any fraction equals itself when you multiply BOTH the top and the bottom by the same number.\n\nThat's the rule we'll use next to make two different fractions match up.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'multiply-by-one': [
    {
      prompt:
        "Welcome to lesson 13!\n\nHere's WHY that trick works. Watch this: 8 divided by 8 is 1. So is 3 divided by 3. So is 247 divided by 247.\n\nAny number over itself equals 1.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "And multiplying by 1 changes nothing.\n\n1/3 × 1 = 1/3. Obvious.\n\nBut here's the twist: 1 can wear different outfits too. 1 = 8/8. So 1/3 × 8/8 also equals 1/3 — same value, different form.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Let's see it on the board.\n\nHere's 1/3. To multiply it by 8/8, we'll use the mushrooms below — and per our prime trick, multiplying by 8 means three ×2 mushroom clicks (×2, ×2, ×2).\n\nClick the ×2 mushroom under the LEFT fraction three times. Watch 1/3 become 2/6, then 4/12, then 8/24.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 3 },
        right: { num: 1, denom: 3 },
      },
    },
    {
      prompt:
        "Each old piece became 8 new pieces — but the shaded chunk is exactly the same.\n\n1/3 = 8/24. Same fraction, new outfit.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Your turn. Here's 1/8. Multiply it by 3 using the ×3 mushroom on the LEFT side.\n\nOne click takes 1/8 → 3/24.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 8 },
        right: { num: 1, denom: 8 },
      },
    },
    {
      prompt:
        "Both 1/3 and 1/8 can be re-dressed to share the same bottom number: 24.\n\nThat's no accident — we picked the multipliers on purpose. Next lesson puts the two together.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'equate-two-bases': [
    {
      prompt:
        "Welcome to lesson 14!\n\nTime to put it together. Given 1/3 and 1/8, how do we make their bottoms match?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's the recipe:\n\n• Take the LEFT fraction and multiply by the RIGHT's denominator.\n• Take the RIGHT fraction and multiply by the LEFT's denominator.\n\nBoth bottoms end at 3 × 8 = 24.\n\nOn the board: click ×2 three times on the LEFT (that's ×8), and click ×3 once on the RIGHT.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 3 },
        right: { num: 1, denom: 8 },
      },
    },
    {
      prompt:
        "Both fractions now share /24. ✓\n\nWhy did multiplying by the OPPOSITE denominator work? Because each side picked up the missing factor from the other side's bottom — guaranteeing both bottoms end the same.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Try another pair: 1/2 and 1/5.\n\nLEFT × 5 (one ×5 mushroom click) and RIGHT × 2 (one ×2 mushroom click). Both reach /10.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 2 },
        right: { num: 1, denom: 5 },
      },
    },
    {
      prompt:
        "One more, with non-unit tops: 2/3 and 1/4.\n\nLEFT × 4 (two ×2 clicks) takes 2/3 → 8/12. RIGHT × 3 takes 1/4 → 3/12.\n\nThe top of each fraction scales by the same multiplier as the bottom — that's why the trick keeps the value the same.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 2, denom: 3 },
        right: { num: 1, denom: 4 },
      },
    },
    {
      prompt:
        "Last one for practice: 3/4 and 2/5.\n\nLEFT × 5 → 15/20. RIGHT × 2 × 2 → 8/20.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 3, denom: 4 },
        right: { num: 2, denom: 5 },
      },
    },
    {
      prompt:
        "Two fractions, two scale moves, one shared base.\n\nNext up: now that they share a base, how do you actually combine them?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  // ---- Module 4: simplification ---------------------------------------------

  'reduce-by-shared-factor': [
    {
      prompt:
        "Welcome to lesson 15!\n\nLast module taught you how to make pieces SMALLER while keeping the same amount. Now we go the other way: make pieces BIGGER while keeping the same amount.\n\nThis is called simplifying.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here are 8 dots — think of them as the 8 in 4/8. Pull them into pairs.\n\nEach pair of small pieces is the same as one bigger piece. After pairing, the 8 turn into 4 groups — that's the /4 in 2/4.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 8, groupSize: 2 },
    },
    {
      prompt:
        "Look what happened: 8 little pieces collapsed into 4 bigger pieces.\n\n4/8 became 2/4 — same shaded amount, fewer, bigger pieces.\n\nThis works because BOTH the top (4) and the bottom (8) were divisible by 2. So we divided BOTH by 2.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Can we keep going? In 2/4, the top (2) and bottom (4) still share a factor of 2.\n\nPair up these 4 dots one more time.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 4, groupSize: 2 },
    },
    {
      prompt:
        "Two more pieces collapsed into one. 2/4 → 1/2 — the simplest version.\n\nThe rule: whenever the top and bottom share a factor K, you can divide BOTH by K. The fraction looks simpler, but its value doesn't change.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Try it with 6/9. The top is 6, the bottom is 9 — they share a factor of 3.\n\nPair these 9 dots into groups of 3.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'dots-grouped',
      canvas: { kind: 'dots', count: 9, groupSize: 3 },
    },
    {
      prompt:
        "9 dots became 3 groups of 3. So 9 ÷ 3 = 3.\n\nDo the same to the top: 6 ÷ 3 = 2.\n\n6/9 = 2/3. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Whenever the top and bottom share a factor, you can divide both by it.\n\nThe fraction looks simpler. The value doesn't change.\n\nNext lesson: how do you know when to stop?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'simplest-form': [
    {
      prompt:
        "Welcome to lesson 16!\n\nWhen can you stop simplifying?\n\nWhen the top and bottom share no factors except 1. That's called SIMPLEST FORM.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Look at 8/12. Is it in simplest form?\n\nDo 8 and 12 share any factors bigger than 1?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      guessAnswer: 'no',
      guessExplanation:
        "8 and 12 share 2 and 4 as factors — so 8/12 is NOT in simplest form. We can simplify it.",
    },
    {
      prompt:
        "Let's find the BIGGEST factor 8 and 12 share — their GCF.\n\nDrag each factor tile into the right region. Anything in the overlap is shared.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 8, b: 12 },
    },
    {
      prompt:
        "GCF(8, 12) = 4.\n\nDivide both top and bottom by 4:\n• 8 ÷ 4 = 2\n• 12 ÷ 4 = 3\n\nResult: 8/12 = 2/3 in one move.\n\nAnd 2 and 3 share no factors except 1 — so 2/3 IS in simplest form. Done.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 8, b: 12, resultView: true },
    },
    {
      prompt:
        "Now try 5/9. Is it in simplest form?\n\nThink about what 5 and 9 share.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      guessAnswer: 'yes',
      guessExplanation:
        "5 and 9 share no factors except 1 — so 5/9 is already in simplest form. It can't be simplified.",
    },
    {
      prompt:
        "One trickier one: 9/24.\n\nFind the GCF first — drag the factors into the Venn diagram.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 9, b: 24 },
    },
    {
      prompt:
        "GCF(9, 24) = 3.\n\nDivide both by 3:\n• 9 ÷ 3 = 3\n• 24 ÷ 3 = 8\n\nResult: 9/24 = 3/8. ✓\n\nAnd 3 and 8 share no factors except 1 — simplest form.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 9, b: 24, resultView: true },
    },
    {
      prompt:
        "Simplest form means GCF(top, bottom) = 1.\n\nTo get there fastest: find the GCF, then divide both by it once.\n\nNext up: drill it.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'simplification-drill': [
    {
      prompt:
        "Welcome to lesson 17!\n\nYour turn. Several fractions in a row — for each one, find the GCF of the top and bottom, then simplify.\n\nNo new tricks. Just reps.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Round 1: 4/10.\n\nWhat do 4 and 10 share?",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 4, b: 10 },
    },
    {
      prompt:
        "GCF(4, 10) = 2.\n\n4 ÷ 2 = 2, 10 ÷ 2 = 5. So 4/10 = 2/5. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 4, b: 10, resultView: true },
    },
    {
      prompt:
        "Round 2: 6/15. Find their GCF.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 6, b: 15 },
    },
    {
      prompt:
        "GCF(6, 15) = 3.\n\n6 ÷ 3 = 2, 15 ÷ 3 = 5. So 6/15 = 2/5. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 6, b: 15, resultView: true },
    },
    {
      prompt:
        "Round 3: 12/18.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 12, b: 18 },
    },
    {
      prompt:
        "GCF(12, 18) = 6.\n\n12 ÷ 6 = 2, 18 ÷ 6 = 3. So 12/18 = 2/3. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 12, b: 18, resultView: true },
    },
    {
      prompt:
        "Round 4: 10/25.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 10, b: 25 },
    },
    {
      prompt:
        "GCF(10, 25) = 5.\n\n10 ÷ 5 = 2, 25 ÷ 5 = 5. So 10/25 = 2/5. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 10, b: 25, resultView: true },
    },
    {
      prompt:
        "Round 5: 9/12.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'venn-placed',
      canvas: { kind: 'venn', a: 9, b: 12 },
    },
    {
      prompt:
        "GCF(9, 12) = 3.\n\n9 ÷ 3 = 3, 12 ÷ 3 = 4. So 9/12 = 3/4. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: { kind: 'venn', a: 9, b: 12, resultView: true },
    },
    {
      prompt:
        "You can take any fraction and find its simplest form.\n\nNext module: combine THIS with base-equating to add ANY two fractions together.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  // ---- Module 5: add-fractions ----------------------------------------------

  'add-same-base': [
    {
      prompt:
        "Welcome to lesson 18!\n\nFinal stretch. Let's actually ADD fractions.\n\nWe'll start with the easy case: same denominator.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Here's 2/8 + 3/8. Both fractions are eighths — same bottom.\n\nThe bases already match. Drag the RIGHT fraction onto the LEFT to combine them into a single fraction.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 2, denom: 8 },
        right: { num: 3, denom: 8 },
      },
    },
    {
      prompt:
        "You had 2 eighths plus 3 more eighths. That's 5 eighths total.\n\n2/8 + 3/8 = 5/8.\n\nThe pieces are the same size — you just have more of them now.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Try: 1/5 + 2/5.\n\nDrag the right onto the left.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 5 },
        right: { num: 2, denom: 5 },
      },
    },
    {
      prompt:
        "1/5 + 2/5 = 3/5. ✓\n\nOne more: 2/6 + 3/6. Drag to combine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 2, denom: 6 },
        right: { num: 3, denom: 6 },
      },
    },
    {
      prompt:
        "2/6 + 3/6 = 5/6. ✓\n\n(You might be itching to simplify — resist! That's the next lesson's job.)\n\nThe rule for same-denominator addition: add the tops, keep the bottom. That's it.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'add-different-bases': [
    {
      prompt:
        "Welcome to lesson 19!\n\nWhat if the bottoms DON'T match?\n\nYou already know the answer: EQUATE first (Module 3), then ADD.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "1/3 + 1/8. Bottoms don't match.\n\nFirst, equate: LEFT × 8 (three ×2 clicks) → 8/24. RIGHT × 3 → 3/24.\n\nThen drag to combine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 3 },
        right: { num: 1, denom: 8 },
      },
    },
    {
      prompt:
        "1/3 + 1/8 = 8/24 + 3/24 = 11/24. ✓\n\nEquate, then add. Two steps.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Try 1/2 + 1/4.\n\nHere only the LEFT needs scaling: ×2 once gives 2/4. The RIGHT is already at /4.\n\nThen drag to combine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 2 },
        right: { num: 1, denom: 4 },
      },
    },
    {
      prompt:
        "1/2 + 1/4 = 2/4 + 1/4 = 3/4. ✓\n\nWhen one bottom already divides the other, only one side needs scaling. The recipe still works either way.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Non-unit tops this time: 2/3 + 1/4.\n\nLEFT × 4 (two ×2 clicks) → 8/12. RIGHT × 3 → 3/12. Then combine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 2, denom: 3 },
        right: { num: 1, denom: 4 },
      },
    },
    {
      prompt:
        "2/3 + 1/4 = 8/12 + 3/12 = 11/12. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Last one: 3/5 + 1/2.\n\nLEFT × 2 → 6/10. RIGHT × 5 → 5/10. Combine.\n\nThe answer is going to be MORE than 1 whole — that's fine. Just stay with the recipe.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 3, denom: 5 },
        right: { num: 1, denom: 2 },
      },
    },
    {
      prompt:
        "3/5 + 1/2 = 6/10 + 5/10 = 11/10.\n\n11/10 is more than one whole — and that's perfectly OK. We'll just leave it as 11/10 for now.\n\nThe recipe: equate the bases, add the tops, keep the shared bottom. Two moves, every time.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'add-and-simplify': [
    {
      prompt:
        "Welcome to lesson 20!\n\nOne last polish.\n\nAfter adding, the result is often NOT in simplest form. Always finish by simplifying.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "1/6 + 1/3.\n\nEquate: LEFT × 3 → 3/18. RIGHT × 2 × 3 → 6/18.\n\nThen drag the right onto the left to combine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 6 },
        right: { num: 1, denom: 3 },
      },
    },
    {
      prompt:
        "1/6 + 1/3 = 3/18 + 6/18 = 9/18.\n\nNot simplest form! GCF(9, 18) = 9.\n\n9 ÷ 9 = 1, 18 ÷ 9 = 2.\n\nSo 1/6 + 1/3 = 1/2. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Try 1/4 + 1/12.\n\nEquate: LEFT × 12 (two ×2 clicks plus one ×3 click — total 12) → 12/48. RIGHT × 4 (two ×2 clicks) → 4/48.\n\nCombine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 1, denom: 4 },
        right: { num: 1, denom: 12 },
      },
    },
    {
      prompt:
        "1/4 + 1/12 = 12/48 + 4/48 = 16/48.\n\nGCF(16, 48) = 16. So divide both by 16:\n• 16 ÷ 16 = 1\n• 48 ÷ 16 = 3\n\nResult: 1/3. ✓",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "One that goes improper: 2/3 + 4/9.\n\nEquate: LEFT × 9 (one ×3 click then another ×3 — total 9) → 18/27. RIGHT × 3 → 12/27.\n\nCombine.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
      canvas: {
        kind: 'twoFractions',
        left: { num: 2, denom: 3 },
        right: { num: 4, denom: 9 },
      },
    },
    {
      prompt:
        "2/3 + 4/9 = 18/27 + 12/27 = 30/27.\n\nMore than one whole — and still simplifiable! GCF(30, 27) = 3.\n\n30 ÷ 3 = 10, 27 ÷ 3 = 9. Result: 10/9. ✓\n\nImproper fractions can still be simplified. We just leave them in n/d form.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "The full recipe — every fraction addition, every time:\n\n1. EQUATE — multiply each fraction by the opposite denominator over itself, so both share a base.\n2. ADD — add the numerators; keep the shared base.\n3. SIMPLIFY — divide top and bottom by their GCF.\n\nNext: the capstone. You'll do it all yourself.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

  'final-assessment': [
    {
      prompt:
        "Welcome to the final assessment!\n\nYou've learned everything you need. Time to put it together.\n\nThe test gives you 10 random pairs of fractions. For each one: equate, combine, simplify. Pass at 8 out of 10.\n\nClick over to the TEST tab when you're ready.",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
    {
      prompt:
        "Quick refresher:\n\n• EQUATE — multiply each side by the opposite denominator. Use the mushrooms on each side of the board.\n• ADD — once bottoms match, drag the right fraction onto the left to combine.\n• SIMPLIFY — divide top and bottom by their GCF until they share no factors except 1.\n\nGood luck!",
      initialState: createRootPiece(),
      allowedOps: [],
      completeOn: 'next-button',
    },
  ],

};

export type V2Tab = 'lesson' | 'test';

// Per-lesson tab list. Lessons that omit 'test' won't show the tab bar at all.
// The block-breaking test for the 5 hammer lives on divisibility-5 — the
// student learns the divisibility trick first, then applies it on the test.
export const V2_LESSON_TABS: Record<V2ConceptId, V2Tab[]> = {
  'divide-by-2': ['lesson'],
  'divide-by-3': ['lesson', 'test'],
  'divisibility-2': ['lesson'],
  'divisibility-3': ['lesson'],
  'divide-by-5': ['lesson'],
  'divisibility-5': ['lesson'],
  'divisibility-7': ['lesson'],
  'divisibility-11': ['lesson'],
  'factors-of-one': ['lesson'],
  'factor-pairs': ['lesson'],
  'gcf-venn': ['lesson'],
  'equivalent-fractions': ['lesson'],
  'multiply-by-one': ['lesson'],
  'equate-two-bases': ['lesson'],
  'reduce-by-shared-factor': ['lesson'],
  'simplest-form': ['lesson'],
  'simplification-drill': ['lesson'],
  'add-same-base': ['lesson'],
  'add-different-bases': ['lesson'],
  'add-and-simplify': ['lesson'],
  'final-assessment': ['lesson', 'test'],
};

// Per-lesson test configuration. Lessons without an entry render the
// "Test coming soon." placeholder.
//
// Single-step (default kind) — Quiz mode (when `pool` is set): each round
// picks a denominator from the pool, asks the student which hammer makes
// 1/N, then asks them to surface that fraction. Free-play mode (when only
// `prompt` and `allowedOps` are set): just shows the prompt next to the
// toolbar.
//
// Multi-phase (kind: 'multiPhase') — Capstone format. A generator produces a
// pair of fractions; the student walks through `phases` in order (equate →
// combine → simplify). The harness in App.tsx advances phase index as each
// `completeOn` check fires. After all phases pass, the next problem is
// generated and phase resets to 0.
export type V2LessonSingleStepTest = {
  kind?: 'singleStep';
  allowedOps: AllowedOp[];
  pool?: number[];
  prompt?: string;
  // Persistent reminder shown alongside every question of a quiz test — nudges
  // the student to apply their divisibility checks instead of guessing.
  hint?: string;
  // Per-test cap on the number of rounds. Defaults to MAX_TEST_QUESTIONS.
  maxQuestions?: number;
};

export type V2CapstoneProblem = {
  left: { num: number; denom: number };
  right: { num: number; denom: number };
};

export type V2MultiPhaseStep = {
  // The canvas kind this phase renders. `'twoFractions'` for equate/combine,
  // undefined (i.e. default fraction-box) for simplify.
  canvasKind: 'twoFractions' | undefined;
  completeOn: V2StepCompletion;
};

export type V2LessonMultiPhaseTest = {
  kind: 'multiPhase';
  // Total problems the student must solve to "pass" the capstone.
  totalProblems: number;
  // Minimum problems correct to pass the run.
  passThreshold: number;
  generator: () => V2CapstoneProblem;
  phases: V2MultiPhaseStep[];
};

export type V2LessonTest = V2LessonSingleStepTest | V2LessonMultiPhaseTest;

// Narrowing helpers — the single-step shape is the default; presence of
// `kind === 'multiPhase'` flips the variant.
export const isMultiPhaseTest = (
  t: V2LessonTest | undefined,
): t is V2LessonMultiPhaseTest => t?.kind === 'multiPhase';

// Quiz tests cap their length to this many questions. If the pool has fewer
// entries, the test ends once the pool is exhausted. No denominator repeats
// within a single run-through.
export const MAX_TEST_QUESTIONS = 10;

// Capstone generator (T14). Per D5: denominators ∈ [2, 12] including 7 and 11
// (D8), proper fractions only, denominators MUST differ, and operand pairs
// don't repeat across the current run. Rejecting pairs whose product exceeds
// MAX_CAPSTONE_PRODUCT keeps the equated denominator readable on tablet.
const CAPSTONE_DENOMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MAX_CAPSTONE_PRODUCT = 100;
const MAX_GENERATOR_ATTEMPTS = 200;

type CapstonePair = {
  leftNum: number;
  leftDenom: number;
  rightNum: number;
  rightDenom: number;
};

// Memo of recently emitted pairs. Capped at MAX_TEST_QUESTIONS so a long-
// running session can't starve the generator of legal pairs.
const recentCapstonePairs: CapstonePair[] = [];

// (a+b) and (b+a) are treated as the same problem.
const samePair = (a: CapstonePair, b: CapstonePair): boolean =>
  (a.leftNum === b.leftNum &&
    a.leftDenom === b.leftDenom &&
    a.rightNum === b.rightNum &&
    a.rightDenom === b.rightDenom) ||
  (a.leftNum === b.rightNum &&
    a.leftDenom === b.rightDenom &&
    a.rightNum === b.leftNum &&
    a.rightDenom === b.leftDenom);

const pickDenom = (): number =>
  CAPSTONE_DENOMS[Math.floor(Math.random() * CAPSTONE_DENOMS.length)];

const pickNumerator = (denom: number): number => 1 + Math.floor(Math.random() * (denom - 1));

const toProblem = (p: CapstonePair): V2CapstoneProblem => ({
  left: { num: p.leftNum, denom: p.leftDenom },
  right: { num: p.rightNum, denom: p.rightDenom },
});

export const generateCapstoneProblem = (): V2CapstoneProblem => {
  for (let attempt = 0; attempt < MAX_GENERATOR_ATTEMPTS; attempt++) {
    const leftDenom = pickDenom();
    const rightDenom = pickDenom();
    if (leftDenom === rightDenom) continue;
    if (leftDenom * rightDenom > MAX_CAPSTONE_PRODUCT) continue;
    const pair: CapstonePair = {
      leftNum: pickNumerator(leftDenom),
      leftDenom,
      rightNum: pickNumerator(rightDenom),
      rightDenom,
    };
    if (recentCapstonePairs.some((p) => samePair(p, pair))) continue;
    recentCapstonePairs.push(pair);
    if (recentCapstonePairs.length > MAX_TEST_QUESTIONS) recentCapstonePairs.shift();
    return toProblem(pair);
  }
  // Practically unreachable: relax dedup so the test stays playable instead
  // of throwing if the (already dense) legal-pair space somehow exhausts.
  // The fallback must still satisfy denom!==denom and product<=MAX, so we
  // hard-code a known-good pair instead of re-rolling.
  return toProblem({ leftNum: 1, leftDenom: 2, rightNum: 1, rightDenom: 3 });
};

// Each test cumulates the hammers from the current lesson and all previous
// ones, so the student can practice everything they've seen so far.
export const V2_LESSON_TESTS: Partial<Record<V2ConceptId, V2LessonTest>> = {
  'divide-by-3': {
    allowedOps: ['split:2', 'split:3'],
    // Start with 1/2 (the warm-up the lesson built toward), then random
    // through everything covered in lessons 1 and 2.
    pool: [2, 4, 8, 16, 32, 3, 9, 27],
  },
  'final-assessment': {
    kind: 'multiPhase',
    totalProblems: 10,
    passThreshold: 8,
    generator: generateCapstoneProblem,
    phases: [
      // Phase 0: equate. Student scales each side until displayed denominators match.
      { canvasKind: 'twoFractions', completeOn: 'both-sides-same-denom' },
      // Phase 1: combine. Student drags right onto left.
      { canvasKind: 'twoFractions', completeOn: 'combined' },
      // Phase 2: simplify. Single-fraction board; student divides by GCF.
      { canvasKind: undefined, completeOn: 'simplest-form' },
    ],
  },
};

// Which hammer is required to surface 1/denom — i.e. the unique prime
// hammer in `available` that fully factors `denom`. Returns null if no
// single hammer works (denom isn't a prime power of any allowed hammer).
export const requiredHammerFor = (
  denom: number,
  allowedOps: AllowedOp[],
): number | null => {
  const primes = allowedOps
    .filter((op) => op.startsWith('split:'))
    .map((op) => Number(op.slice(6)));
  for (const p of primes) {
    let d = denom;
    while (d > 1 && d % p === 0) d /= p;
    if (d === 1) return p;
  }
  return null;
};

// Can any leaf on the board still be split (with the allowed hammers) into
// a piece with denominator `target`? Used by tests to detect when the
// student has split too far in the wrong direction.
export const canReachTarget = (
  root: Piece,
  target: number,
  allowedOps: AllowedOp[],
): boolean => {
  const hammers = allowedOps
    .filter((op) => op.startsWith('split:'))
    .map((op) => Number(op.slice(6)));
  for (const f of computeFractions(root).values()) {
    if (f.num !== 1) continue;
    if (target % f.denom !== 0) continue;
    // Try to reduce target/leafDenom to 1 by repeatedly dividing by any
    // available hammer. If we get to 1, the leaf can still reach the target.
    let q = target / f.denom;
    let progress = true;
    while (q > 1 && progress) {
      progress = false;
      for (const h of hammers) {
        if (q % h === 0) {
          q /= h;
          progress = true;
          break;
        }
      }
    }
    if (q === 1) return true;
  }
  return false;
};
