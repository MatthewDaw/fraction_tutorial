import { useEffect, useMemo, useRef, useState } from 'react';
import FractionBox from './FractionBox';
import ToolPanel, { Tool } from './ToolPanel';
import V2QuestionCard from './V2QuestionCard';
import HammerRevealOverlay from './HammerRevealOverlay';
import NumberDisplay from './NumberDisplay';
import DotCluster from './DotCluster';
import StripCanvas from './StripCanvas';
import FactorList from './FactorList';
import ArrayCanvas from './ArrayCanvas';
import CommonFactorsCanvas from './CommonFactorsCanvas';
import VennCanvas from './VennCanvas';
import WorksheetCanvas from './WorksheetCanvas';
import { factorsOf } from './factors';
import {
  Piece,
  canDivide,
  computeFractions,
  createRootPiece,
  dividePiece,
  glueLeaves,
} from './fractions';
import {
  AllowedOp,
  Question,
  checkAnswer,
  isCorrectMove,
} from './questions';
import {
  MAX_TEST_QUESTIONS,
  V2Animation,
  V2ConceptId,
  V2LessonStep,
  V2LessonTest,
  V2StepCompletion,
  V2Tab,
  V2_CONCEPTS,
  V2_CONCEPT_LABELS,
  V2_LESSONS,
  V2_LESSON_TABS,
  V2_LESSON_TESTS,
  canReachTarget,
  hammerSizeFromAnim,
} from './v2lessons';

const INITIAL_V2_CONCEPT: V2ConceptId = V2_CONCEPTS[0];

// V2 lesson steps are scripted, not generated. Wrap one as a Question so the
// existing board/tool machinery can render it — no target means no auto-solve
// and no move-gating, so the student can practice freely.
const lessonStepToQuestion = (step: V2LessonStep): Question => ({
  prompt: step.prompt,
  initialState: step.initialState,
  allowedOps: step.allowedOps,
});

const buildTestQuizQuestion = (test: V2LessonTest, denom: number): Question => ({
  prompt: `Make 1/${denom}!`,
  initialState: createRootPiece(),
  allowedOps: test.allowedOps,
  // checkAnswer treats meta.target as the target denominator — the puzzle
  // solves the instant any group reaches 1/target.
  meta: { target: denom },
});

const buildFreePlayQuestion = (test: V2LessonTest): Question => ({
  prompt: test.prompt ?? '',
  initialState: createRootPiece(),
  allowedOps: test.allowedOps,
});

// When a question exposes exactly one tool, there's no choice to make —
// arm it for the student so they can act immediately, and never let it be
// deselected. Returns the lone tool, or null if there are 0 or multiple.
const soleTool = (allowedOps: AllowedOp[]): Tool => {
  if (allowedOps.length !== 1) return null;
  const op = allowedOps[0];
  if (op === 'glue') return { kind: 'glue' };
  return { kind: 'hammer', n: Number(op.slice(6)) };
};

const pickFromRemaining = (pool: number[], asked: number[]): number => {
  const remaining = pool.filter((d) => !asked.includes(d));
  if (remaining.length === 0) return pool[0];
  return remaining[Math.floor(Math.random() * remaining.length)];
};

const App = () => {
  const [v2ConceptId, setV2ConceptId] = useState<V2ConceptId>(INITIAL_V2_CONCEPT);
  const [v2Tab, setV2Tab] = useState<V2Tab>('lesson');
  const [v2StepIdx, setV2StepIdx] = useState(0);
  const [v2Animation, setV2Animation] = useState<V2Animation | null>(null);
  // Yes/No answer the student has picked on the current guess step (null
  // until they answer). Resets whenever the displayed step changes.
  const [v2UserGuess, setV2UserGuess] = useState<'yes' | 'no' | null>(null);
  // Factors the student has discovered on an 'explore' dots step. Resets
  // whenever the displayed step changes.
  const [v2ExploreFound, setV2ExploreFound] = useState<Set<number>>(
    () => new Set(),
  );
  // Quiz tests track the denominator the student is being asked to make this
  // round (null when the test is complete or not running).
  const [v2TestCurrentDenom, setV2TestCurrentDenom] = useState<number | null>(null);
  // Denominators the student has already solved this run — drives no-repeats
  // and the question count toward MAX_TEST_QUESTIONS.
  const [v2TestAskedDenoms, setV2TestAskedDenoms] = useState<number[]>([]);
  // True when every round has been completed — chat shows the wrap-up + retry.
  const [v2TestComplete, setV2TestComplete] = useState(false);
  // True when the board's been split in a direction that can no longer reach
  // the current target — triggers a "let's start over" message + reset.
  const [v2TestFailed, setV2TestFailed] = useState(false);
  const v2NextRoundTimer = useRef<number | null>(null);
  const v2FailedTimer = useRef<number | null>(null);
  const [question, setQuestion] = useState<Question>(() =>
    lessonStepToQuestion(V2_LESSONS[INITIAL_V2_CONCEPT][0]),
  );
  const [root, setRoot] = useState<Piece>(question.initialState);
  const [tool, setTool] = useState<Tool>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blockedLeafIds, setBlockedLeafIds] = useState<Set<string>>(() => new Set());
  const [solved, setSolved] = useState(false);
  const blockedTimer = useRef<number | null>(null);

  // Locked while the puzzle is solved or a quiz test has hit an unsolvable state.
  const locked = solved || v2TestFailed;

  const flashBlockedLeaves = (ids: string[]) => {
    if (blockedTimer.current != null) window.clearTimeout(blockedTimer.current);
    setBlockedLeafIds(new Set(ids));
    blockedTimer.current = window.setTimeout(() => setBlockedLeafIds(new Set()), 420);
  };

  // Apply a move's result. Sets root and marks solved if the puzzle's done.
  const applyMove = (newRoot: Piece) => {
    setRoot(newRoot);
    setSelectedId(null);
    if (checkAnswer(question, newRoot).correct) {
      setSolved(true);
    }
  };

  const loadQuestion = (q: Question) => {
    setQuestion(q);
    setRoot(q.initialState);
    setSelectedId(null);
    setBlockedLeafIds(new Set());
    setTool(soleTool(q.allowedOps));
    setSolved(false);
  };

  const handlePieceClick = (id: string) => {
    if (locked) return;
    if (!tool) {
      setSelectedId((curr) => (curr === id ? null : id));
      return;
    }
    if (tool.kind === 'hammer') {
      if (!canDivide(root, id, tool.n)) {
        flashBlockedLeaves([id]);
        return;
      }
      if (v2Tab === 'lesson') {
        const step = V2_LESSONS[v2ConceptId][v2StepIdx];
        if (step?.targetDenominator != null) {
          const f = computeFractions(root).get(id);
          if (f && f.denom * tool.n > step.targetDenominator) {
            flashBlockedLeaves([id]);
            return;
          }
        }
      }
      // V2 test quizzes let the student try any hammer; unsolvable boards
      // are caught by the reachability check and trigger a reset instead.
      const v2TestFreeHammers = v2Tab === 'test' && !!V2_LESSON_TESTS[v2ConceptId]?.pool;
      if (
        !v2TestFreeHammers &&
        !isCorrectMove(question, root, { kind: 'divide', pieceId: id, n: tool.n })
      ) {
        flashBlockedLeaves([id]);
        return;
      }
      applyMove(dividePiece(root, id, tool.n));
    }
  };

  const handleSubCrackClick = (leftLeafId: string, rightLeafId: string) => {
    if (locked) return;
    if (tool?.kind !== 'glue') return;
    if (!isCorrectMove(question, root, { kind: 'glue', leafIdA: leftLeafId, leafIdB: rightLeafId })) {
      flashBlockedLeaves([leftLeafId, rightLeafId]);
      return;
    }
    applyMove(glueLeaves(root, leftLeafId, rightLeafId));
  };

  const handleToolSelect = (next: Tool) => {
    // If only one tool is available, keep it armed — there's nothing to
    // switch to, so deselecting would just trap the student.
    if (next == null && soleTool(question.allowedOps) != null) return;
    setTool(next);
  };

  // Load a fresh test question. Options:
  // - reset: blank the asked-denoms history and start from pool[0]
  // - reuseDenom: rerun the same denom (used after the board became unsolvable)
  // - previousDenom: the denom the student just SOLVED — add it to asked and
  //   pick a new one from what's left in the pool
  const startTestRound = (
    conceptId: V2ConceptId,
    opts: { reset?: boolean; reuseDenom?: number; previousDenom?: number } = {},
  ) => {
    if (v2NextRoundTimer.current != null) {
      window.clearTimeout(v2NextRoundTimer.current);
      v2NextRoundTimer.current = null;
    }
    if (v2FailedTimer.current != null) {
      window.clearTimeout(v2FailedTimer.current);
      v2FailedTimer.current = null;
    }
    setV2TestFailed(false);
    setTool(null);
    const test = V2_LESSON_TESTS[conceptId];

    // Non-quiz tests (free-play or no entry) ignore the asked/complete state.
    if (!test?.pool || test.pool.length === 0) {
      setV2TestCurrentDenom(null);
      setV2TestAskedDenoms([]);
      setV2TestComplete(false);
      if (test) {
        loadQuestion(buildFreePlayQuestion(test));
      } else {
        loadQuestion({
          prompt: '',
          initialState: createRootPiece(),
          allowedOps: [],
        });
      }
      return;
    }

    // Retry after failure — don't touch the asked history.
    if (opts.reuseDenom != null) {
      setV2TestCurrentDenom(opts.reuseDenom);
      setV2TestComplete(false);
      loadQuestion(buildTestQuizQuestion(test, opts.reuseDenom));
      return;
    }

    const asked = opts.reset
      ? []
      : opts.previousDenom != null
        ? [...v2TestAskedDenoms, opts.previousDenom]
        : v2TestAskedDenoms;
    const maxRounds = Math.min(
      test.pool.length,
      test.maxQuestions ?? MAX_TEST_QUESTIONS,
    );

    if (asked.length >= maxRounds) {
      setV2TestAskedDenoms(asked);
      setV2TestCurrentDenom(null);
      setV2TestComplete(true);
      return;
    }

    const denom =
      asked.length === 0 ? test.pool[0] : pickFromRemaining(test.pool, asked);
    setV2TestAskedDenoms(asked);
    setV2TestCurrentDenom(denom);
    setV2TestComplete(false);
    loadQuestion(buildTestQuizQuestion(test, denom));
  };

  const loadV2 = (conceptId: V2ConceptId, tab: V2Tab, stepIdx: number) => {
    if (tab === 'test') {
      setV2Animation(null);
      startTestRound(conceptId, { reset: true });
      return;
    }
    const steps = V2_LESSONS[conceptId];
    const safeIdx = Math.max(0, Math.min(stepIdx, steps.length - 1));
    const step = steps[safeIdx];
    loadQuestion(lessonStepToQuestion(step));
    setV2Animation(step.entryAnimation ?? null);
  };

  const handleV2ConceptChange = (next: V2ConceptId) => {
    setV2ConceptId(next);
    setV2StepIdx(0);
    setV2Tab('lesson');
    loadV2(next, 'lesson', 0);
  };

  const handleV2TabChange = (next: V2Tab) => {
    if (next === v2Tab) return;
    setV2Tab(next);
    loadV2(v2ConceptId, next, v2StepIdx);
  };

  const handleV2Restart = () => {
    setV2StepIdx(0);
    loadV2(v2ConceptId, v2Tab, 0);
  };

  const handleV2Back = () => {
    if (v2StepIdx === 0) return;
    // Skip animation-only steps when going back so we don't replay-and-bounce.
    let prev = v2StepIdx - 1;
    const steps = V2_LESSONS[v2ConceptId];
    while (prev > 0 && steps[prev].entryAnimation) prev--;
    setV2StepIdx(prev);
    loadV2(v2ConceptId, v2Tab, prev);
  };

  const handleV2StepChange = (nextIdx: number) => {
    const steps = V2_LESSONS[v2ConceptId];
    const clamped = Math.max(0, Math.min(nextIdx, steps.length - 1));
    if (clamped === v2StepIdx) return;
    if (v2Animation) setV2Animation(null);
    setV2StepIdx(clamped);
    loadV2(v2ConceptId, v2Tab, clamped);
  };

  const handleV2Next = () => {
    if (v2Animation) return;
    const steps = V2_LESSONS[v2ConceptId];
    if (v2StepIdx >= steps.length - 1) {
      // End of the lesson — chain forward so the student never dead-ends.
      // Route order: test (if this lesson has one) → next concept → stay put.
      if (v2Tab === 'lesson' && V2_LESSON_TABS[v2ConceptId].includes('test')) {
        setV2Tab('test');
        loadV2(v2ConceptId, 'test', v2StepIdx);
        return;
      }
      const idx = V2_CONCEPTS.indexOf(v2ConceptId);
      if (idx >= 0 && idx < V2_CONCEPTS.length - 1) {
        handleV2ConceptChange(V2_CONCEPTS[idx + 1]);
      }
      return;
    }
    const nextIdx = v2StepIdx + 1;
    const nextStep = steps[nextIdx];
    setV2StepIdx(nextIdx);
    if (nextStep.preserveBoard) {
      setQuestion(lessonStepToQuestion(nextStep));
      setSelectedId(null);
      setV2Animation(nextStep.entryAnimation ?? null);
    } else {
      loadV2(v2ConceptId, v2Tab, nextIdx);
    }
  };

  const handleTestRestart = () => {
    if (v2TestCurrentDenom == null) return;
    startTestRound(v2ConceptId, { reuseDenom: v2TestCurrentDenom });
  };

  const handleV2NextLesson = () => {
    const idx = V2_CONCEPTS.indexOf(v2ConceptId);
    if (idx < 0 || idx >= V2_CONCEPTS.length - 1) return;
    handleV2ConceptChange(V2_CONCEPTS[idx + 1]);
  };

  const handleV2Guess = (answer: 'yes' | 'no') => {
    if (v2UserGuess != null) return;
    setV2UserGuess(answer);
  };

  const handleV2AnimationComplete = () => {
    if (!v2Animation) return;
    setV2Animation(null);
    const steps = V2_LESSONS[v2ConceptId];
    if (v2StepIdx >= steps.length - 1) return;
    const nextIdx = v2StepIdx + 1;
    setV2StepIdx(nextIdx);
    loadV2(v2ConceptId, v2Tab, nextIdx);
  };

  const handleReset = () => loadQuestion(question);

  const v2CurrentStep = V2_LESSONS[v2ConceptId][v2StepIdx];
  const v2IsLastStep = v2StepIdx >= V2_LESSONS[v2ConceptId].length - 1;
  const v2ConceptIdxForNav = V2_CONCEPTS.indexOf(v2ConceptId);
  const v2HasNextConcept =
    v2ConceptIdxForNav >= 0 && v2ConceptIdxForNav < V2_CONCEPTS.length - 1;
  const v2NextGoesToTest =
    v2IsLastStep && v2Tab === 'lesson' && V2_LESSON_TABS[v2ConceptId].includes('test');
  const v2NextGoesToNextLesson =
    v2IsLastStep &&
    v2Tab === 'lesson' &&
    !V2_LESSON_TABS[v2ConceptId].includes('test') &&
    v2HasNextConcept;
  // Guess steps wait for the student to answer before unlocking Next.
  const v2GuessPending = v2CurrentStep?.guessAnswer != null && v2UserGuess == null;
  // Strip-slicing steps don't auto-advance — they reveal Next once the
  // student has swung at the strip (success or failure both count).
  const v2StripCompleted =
    (v2CurrentStep?.completeOn === 'strip-divided' ||
      v2CurrentStep?.completeOn === 'strip-attempted') &&
    solved;
  // dots-maxed always shows Next as an escape hatch — auto-advance still
  // fires once the student forms the max possible groups, but Next lets
  // them bail early if they don't realize they're done.
  const v2DotsMaxedShowNext = v2CurrentStep?.completeOn === 'dots-maxed';
  const v2ShowNext =
    (v2CurrentStep?.completeOn === 'next-button' ||
      v2StripCompleted ||
      v2DotsMaxedShowNext) &&
    (!v2IsLastStep || v2NextGoesToTest || v2NextGoesToNextLesson) &&
    !v2GuessPending;

  const v2ActiveTest = v2Tab === 'test' ? V2_LESSON_TESTS[v2ConceptId] : undefined;
  // The lesson is a quiz test whenever it has a pool — even while showing the
  // completion screen (currentDenom is null then but the UI is still the quiz).
  const v2TestQuizActive = !!v2ActiveTest?.pool;
  const v2TestTotalRounds = v2ActiveTest?.pool
    ? Math.min(v2ActiveTest.pool.length, v2ActiveTest.maxQuestions ?? MAX_TEST_QUESTIONS)
    : 0;
  const v2ConceptIdx = V2_CONCEPTS.indexOf(v2ConceptId);
  const v2NextConceptLabel =
    v2ConceptIdx >= 0 && v2ConceptIdx < V2_CONCEPTS.length - 1
      ? V2_CONCEPT_LABELS[V2_CONCEPTS[v2ConceptIdx + 1]]
      : null;

  // Reset the Yes/No guess whenever the displayed step changes, so revisiting
  // a guess step starts fresh.
  useEffect(() => {
    setV2UserGuess(null);
    setV2ExploreFound(new Set());
  }, [v2StepIdx, v2ConceptId, v2Tab]);

  // factorReveal credits the current step and any prior ones. Crediting the
  // current step means the side panel reflects the lesson's narrative as
  // the student reads it ("So 1 and 12 are already on the list"), not after
  // they advance away. Going back to an earlier step uncredits later finds.
  const v2DiscoveredFactors = useMemo(() => {
    const steps = V2_LESSONS[v2ConceptId];
    const found = new Set<number>();
    for (let i = 0; i <= v2StepIdx && i < steps.length; i++) {
      steps[i].factorReveal?.forEach((f) => found.add(f));
    }
    return found;
  }, [v2ConceptId, v2StepIdx]);

  // Auto-advance for steps that complete on the student dividing. Preserves
  // the current root so the divided board carries into the celebratory step
  // — only the prompt and allowedOps swap.
  useEffect(() => {
    if (v2Animation) return;
    if (v2Tab !== 'lesson') return;
    const step = V2_LESSONS[v2ConceptId][v2StepIdx];
    if (!step || step.completeOn !== 'divide') return;
    if (root === step.initialState) return;
    if (root.kind !== 'split') return;
    const nextIdx = v2StepIdx + 1;
    if (nextIdx >= V2_LESSONS[v2ConceptId].length) return;
    const nextStep = V2_LESSONS[v2ConceptId][nextIdx];
    const t = window.setTimeout(() => {
      setV2StepIdx(nextIdx);
      setQuestion(lessonStepToQuestion(nextStep));
      setSelectedId(null);
    }, 600);
    return () => window.clearTimeout(t);
  }, [root, v2ConceptId, v2StepIdx, v2Animation, v2Tab]);

  useEffect(() => {
    if (v2Animation) return;
    if (v2Tab !== 'lesson') return;
    const step = V2_LESSONS[v2ConceptId][v2StepIdx];
    if (!step || step.completeOn !== 'all-pieces-at-target') return;
    if (!step.targetDenominator) return;
    const target = step.targetDenominator;
    const fracs = computeFractions(root);
    if (![...fracs.values()].every((f) => f.denom === target)) return;
    const nextIdx = v2StepIdx + 1;
    if (nextIdx >= V2_LESSONS[v2ConceptId].length) return;
    const nextStep = V2_LESSONS[v2ConceptId][nextIdx];
    const t = window.setTimeout(() => {
      setV2StepIdx(nextIdx);
      setQuestion(lessonStepToQuestion(nextStep));
      setSelectedId(null);
    }, 600);
    return () => window.clearTimeout(t);
  }, [root, v2ConceptId, v2StepIdx, v2Animation, v2Tab]);

  // Explore-mode dots step: once the discovered set covers every factor of
  // the target, mark the step solved so the standard auto-advance fires.
  useEffect(() => {
    if (v2Tab !== 'lesson') return;
    const step = V2_LESSONS[v2ConceptId][v2StepIdx];
    if (!step || step.completeOn !== 'dots-explored') return;
    const target = step.factorTarget;
    if (target == null) return;
    const allFactors = factorsOf(target);
    if (allFactors.every((f) => v2ExploreFound.has(f))) {
      setSolved(true);
    }
  }, [v2ExploreFound, v2Tab, v2ConceptId, v2StepIdx]);

  // Canvas-driven completion modes flip `solved` via a child callback.
  // Pause to let the success state register, then advance to the next step.
  useEffect(() => {
    if (v2Tab !== 'lesson') return;
    const step = V2_LESSONS[v2ConceptId][v2StepIdx];
    const autoAdvanceModes: V2StepCompletion[] = [
      'dots-grouped',
      'dots-explored',
      'dots-maxed',
      'common-moved',
      'venn-placed',
      'worksheet-passed',
    ];
    if (!step || !autoAdvanceModes.includes(step.completeOn)) return;
    if (!solved) return;
    const nextIdx = v2StepIdx + 1;
    if (nextIdx >= V2_LESSONS[v2ConceptId].length) return;
    const t = window.setTimeout(() => {
      setV2StepIdx(nextIdx);
      loadV2(v2ConceptId, v2Tab, nextIdx);
    }, 900);
    return () => window.clearTimeout(t);
  }, [solved, v2Tab, v2ConceptId, v2StepIdx]);

  // Quiz tests: after the student surfaces the target fraction, briefly show
  // the celebration, then auto-roll a new question from the pool.
  useEffect(() => {
    if (!solved) return;
    if (v2Tab !== 'test') return;
    if (!v2TestQuizActive) return;
    const prev = v2TestCurrentDenom;
    if (v2NextRoundTimer.current != null) window.clearTimeout(v2NextRoundTimer.current);
    v2NextRoundTimer.current = window.setTimeout(() => {
      startTestRound(v2ConceptId, { previousDenom: prev ?? undefined });
    }, 1800);
    return () => {
      if (v2NextRoundTimer.current != null) {
        window.clearTimeout(v2NextRoundTimer.current);
        v2NextRoundTimer.current = null;
      }
    };
  }, [solved, v2Tab, v2TestQuizActive, v2TestCurrentDenom, v2ConceptId]);

  // Quiz tests: when the board can no longer reach the target denominator,
  // show the failure message and reset to the same question after a moment.
  useEffect(() => {
    if (v2Tab !== 'test') return;
    if (!v2TestQuizActive || v2TestCurrentDenom == null) return;
    if (solved || v2TestFailed) return;
    const test = V2_LESSON_TESTS[v2ConceptId];
    if (!test) return;
    if (canReachTarget(root, v2TestCurrentDenom, test.allowedOps)) return;
    setV2TestFailed(true);
    const denom = v2TestCurrentDenom;
    if (v2FailedTimer.current != null) window.clearTimeout(v2FailedTimer.current);
    v2FailedTimer.current = window.setTimeout(() => {
      startTestRound(v2ConceptId, { reuseDenom: denom });
    }, 2200);
    return () => {
      if (v2FailedTimer.current != null) {
        window.clearTimeout(v2FailedTimer.current);
        v2FailedTimer.current = null;
      }
    };
  }, [root, v2Tab, v2TestQuizActive, v2TestCurrentDenom, solved, v2TestFailed, v2ConceptId]);

  const renderV2Canvas = () => {
    if (v2Tab !== 'lesson') return null;
    const step = v2CurrentStep;
    if (!step) return null;
    // Lessons that drive the fraction box (the "divide-by-N" arc) fall
    // through to the board when a step has no canvas. Every other lesson
    // is conceptual — show the magnifying-glass placeholder so the canvas
    // panel isn't an empty grid.
    const isBoardLesson = v2ConceptId.startsWith('divide-by-');
    const canvas = step.canvas;
    if (!canvas) return isBoardLesson ? null : <NumberDisplay />;
    const markSolved = () => setSolved(true);
    const markIf = (mode: V2StepCompletion) =>
      step.completeOn === mode ? markSolved : undefined;
    switch (canvas.kind) {
      case 'none':
        return <NumberDisplay />;
      case 'number':
        return <NumberDisplay number={canvas.value} />;
      case 'dots': {
        // Each equal-size arrangement credits only the group SIZE, not its
        // pair — `count / size` is earned by forming that other arrangement.
        const recordSize =
          canvas.mode === 'explore' && step.factorTarget != null
            ? (size: number) => {
                if (canvas.count % size !== 0) return;
                setV2ExploreFound((prev) => {
                  if (prev.has(size)) return prev;
                  const next = new Set(prev);
                  next.add(size);
                  return next;
                });
              }
            : undefined;
        return (
          <DotCluster
            count={canvas.count}
            mode={canvas.mode}
            groupSize={canvas.groupSize}
            resetKey={v2StepIdx}
            onAllGrouped={markIf('dots-grouped')}
            onMaxed={markIf('dots-maxed')}
            onEqualArrangement={recordSize}
          />
        );
      }
      case 'strip': {
        const onAttempt =
          step.completeOn === 'strip-divided'
            ? (success: boolean) => { if (success) markSolved(); }
            : step.completeOn === 'strip-attempted'
              ? () => markSolved()
              : undefined;
        return (
          <StripCanvas
            count={canvas.count}
            resetKey={v2StepIdx}
            activeHammer={tool?.kind === 'hammer' ? tool.n : null}
            onAttempt={onAttempt}
          />
        );
      }
      case 'array':
        return <ArrayCanvas rows={canvas.rows} cols={canvas.cols} total={canvas.total} />;
      case 'common':
        return (
          <CommonFactorsCanvas
            a={canvas.a}
            b={canvas.b}
            resetKey={v2StepIdx}
            mode={canvas.resultView ? 'result' : 'play'}
            onAllMoved={markIf('common-moved')}
          />
        );
      case 'venn':
        return (
          <VennCanvas
            a={canvas.a}
            b={canvas.b}
            resetKey={v2StepIdx}
            mode={canvas.resultView ? 'result' : 'play'}
            highlightGcf={canvas.resultView}
            onAllPlaced={markIf('venn-placed')}
          />
        );
      case 'worksheet':
        return (
          <WorksheetCanvas
            divisor={canvas.divisor}
            count={canvas.count}
            passPct={canvas.passPct}
            yesPool={canvas.yesPool}
            noPool={canvas.noPool}
            emphasis={canvas.emphasis}
            resetKey={v2StepIdx}
            onPassed={markIf('worksheet-passed')}
          />
        );
    }
  };

  // Lesson 7 reveals factors progressively as the student finds them; later
  // lessons in the module display the complete list as a known reference.
  const renderV2SidePanel = () => {
    if (v2Tab !== 'lesson') return null;
    const target = v2CurrentStep?.factorTarget;
    if (target == null) return null;
    const all = factorsOf(target);
    if (v2ConceptId !== 'factors-of-one') {
      return <FactorList target={target} factors={all} discovered={all} />;
    }
    const merged = new Set<number>(v2DiscoveredFactors);
    v2ExploreFound.forEach((f) => merged.add(f));
    return (
      <FactorList target={target} factors={all} discovered={[...merged]} />
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__group">
          <button type="button" className="icon-btn" aria-label="Reset board" onClick={handleReset}>
            ⌂
          </button>
          <button type="button" className="icon-btn" aria-label="Settings">
            ⚙
          </button>
        </div>
        <button type="button" className="icon-btn" aria-label="Pause">
          ❚❚
        </button>
      </header>

      <main className="app-main">
        <section className="chat-panel" aria-label="Question">
          <V2QuestionCard
            conceptId={v2ConceptId}
            tab={v2Tab}
            prompt={question.prompt}
            stepIdx={v2StepIdx}
            stepCount={V2_LESSONS[v2ConceptId].length}
            canGoBack={v2StepIdx > 0}
            showNext={v2ShowNext}
            nextLabel={
              v2NextGoesToTest
                ? 'Take the test'
                : v2NextGoesToNextLesson && v2NextConceptLabel
                  ? `Next lesson: ${v2NextConceptLabel}`
                  : 'Next'
            }
            testQuizActive={v2TestQuizActive}
            testCurrentDenom={v2TestCurrentDenom}
            testSolved={v2Tab === 'test' && solved}
            testFailed={v2TestFailed}
            testComplete={v2TestComplete}
            testTotalRounds={v2TestTotalRounds}
            testAskedCount={v2TestAskedDenoms.length}
            testHint={v2ActiveTest?.hint}
            nextLessonLabel={v2NextConceptLabel}
            guessCorrect={v2CurrentStep?.guessAnswer}
            guessExplanation={v2CurrentStep?.guessExplanation}
            userGuess={v2UserGuess}
            onGuess={handleV2Guess}
            onTestRestart={handleTestRestart}
            onTestNextLesson={handleV2NextLesson}
            onConceptChange={handleV2ConceptChange}
            onTabChange={handleV2TabChange}
            onStepChange={handleV2StepChange}
            onRestart={handleV2Restart}
            onBack={handleV2Back}
            onNext={handleV2Next}
          />
        </section>

        <section className="canvas-panel">
          <div className="canvas-stage">
            {renderV2Canvas() ?? (
              <FractionBox
                root={root}
                selectedId={selectedId}
                glueActive={tool?.kind === 'glue'}
                blockedLeafIds={blockedLeafIds}
                onPieceClick={handlePieceClick}
                onSubCrackClick={handleSubCrackClick}
              />
            )}
          </div>
          {renderV2SidePanel()}
          <div className="tool-stack">
            <ToolPanel
              activeTool={tool}
              allowedOps={question.allowedOps}
              onSelect={handleToolSelect}
            />
          </div>
          {v2Animation && (
            <HammerRevealOverlay
              n={hammerSizeFromAnim(v2Animation)}
              onComplete={handleV2AnimationComplete}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
