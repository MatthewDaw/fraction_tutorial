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
  | 'gcf-venn';

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
};

export type V2ModuleId = 'prime-dividing' | 'common-factors';

export const V2_MODULES: V2ModuleId[] = ['prime-dividing', 'common-factors'];

export const V2_MODULE_LABELS: Record<V2ModuleId, string> = {
  'prime-dividing': 'Prime Number Dividing',
  'common-factors': 'Common Factors',
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
  | 'worksheet-passed';

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
      "Wow! You broke the whole block into 2 equal pieces.\n\nEach piece is 1/2 — say 'one half'.\n\nThe top number 1 is how many pieces you're talking about, and the bottom number 2 is how many equal pieces make up the whole.",
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
        "Welcome to lesson 7!\n\nA FACTOR of a number is a smaller number that divides into it evenly — no leftovers. The grouping game you just played is exactly how to find them.\n\nLet's hunt for ALL the factors of 12.",
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
        "Welcome to lesson 8!\n\nLast lesson we found that factors come in pairs: 2×6=12, 3×4=12. Each pair makes a RECTANGLE.\n\nLet's see all the rectangles 12 dots can make.",
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
        "Welcome to the last lesson!\n\nNow let's meet a new number: 18. We'll compare its factors with the factors of 12 — using a VENN DIAGRAM.\n\nTwo overlapping circles: one holds the factors of 12, the other holds the factors of 18. The factors they SHARE go in the middle.",
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
        "You did it!\n\nYou can split fractions, spot divisibility, find every factor of a number, and find the GCF of two numbers.\n\nThat's the complete toolkit for simplifying any fraction. 🎉",
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
};

// Per-lesson test configuration. Lessons without an entry render the
// "Test coming soon." placeholder.
//
// Quiz mode (when `pool` is set): each round picks a denominator from the
// pool, asks the student which hammer makes 1/N, then asks them to surface
// that fraction. The first round uses pool[0]; subsequent rounds pick at
// random (avoiding immediate repeats).
//
// Free-play mode (when only `prompt` and `allowedOps` are set): just shows
// the prompt next to the toolbar.
export type V2LessonTest = {
  allowedOps: AllowedOp[];
  pool?: number[];
  prompt?: string;
  // Persistent reminder shown alongside every question of a quiz test — nudges
  // the student to apply their divisibility checks instead of guessing.
  hint?: string;
  // Per-test cap on the number of rounds. Defaults to MAX_TEST_QUESTIONS.
  maxQuestions?: number;
};

// Quiz tests cap their length to this many questions. If the pool has fewer
// entries, the test ends once the pool is exhausted. No denominator repeats
// within a single run-through.
export const MAX_TEST_QUESTIONS = 10;

// Each test cumulates the hammers from the current lesson and all previous
// ones, so the student can practice everything they've seen so far.
export const V2_LESSON_TESTS: Partial<Record<V2ConceptId, V2LessonTest>> = {
  'divide-by-3': {
    allowedOps: ['split:2', 'split:3'],
    // Start with 1/2 (the warm-up the lesson built toward), then random
    // through everything covered in lessons 1 and 2.
    pool: [2, 4, 8, 16, 32, 3, 9, 27],
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
