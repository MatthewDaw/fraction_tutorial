# Batches

Each file in this directory is a self-contained brief for one agent run (or one focused human session). Batches are designed to be parallelizable where possible.

## Status

| Batch | Status | What it builds | Blocks |
|-------|--------|----------------|--------|
| ~~A~~ | ✅ shipped (`2b495a4`) | TwoFractionsCanvas, drag-combine, capstone end-card, phase indicator, multi-phase test harness, glue SVG | — |
| ~~B~~ | ✅ shipped (`8023190`) | divisibility-7 + divisibility-11 lessons, MultiplierPanel rewrite with `{2,3,5,7,11}` palette | — |
| [C](batch-c-lesson-content.md) | 🚧 next | base-equating + simplification + add-fractions module content + capstone generator | E |
| [D](batch-d-design-polish.md) | 🚧 next | Nunito typography, 44px touch target floor, focus-visible | E (loosely) |
| [E](batch-e-integration.md) | 🚧 after C+D | Module reorder, MultiplierPanel rewire, TwoFractionsCanvas refactor, per-concept mastery | — (final P1 work) |
| [F](batch-f-test-framework.md) | 🚧 anytime | Vitest + Testing Library + backfill `fractions.ts` + new-code tests | — |
| [G](batch-g-analytics.md) | 🚧 P3 | v1 analytics for the three strategy metrics | — |
| [H](batch-h-design-system.md) | 🚧 P3 | `DESIGN.md` establishment, light-mode, token formalization | — |

## Critical path to ship

```
[C  lesson content]   ─┐
                       ├──▶ [E  integration + reorder + tracking] ──▶ SHIP v1
[D  design polish]    ─┘
```

C and D run in parallel (different files). E waits for both because it needs the lesson concepts in place AND the styles to anchor against.

F/G/H are post-ship maturity work that the strategy doc cares about but doesn't block first launch. The user explicitly deferred F (D10) during the eng review.

## How to run a batch

If you have `/batch` available and a git repo, point it at the batch file and it'll spawn an isolated worktree per batch. Without `/batch`, manually:

```bash
git worktree add -b batch-c-lesson-content ../fraction_tutorial-batch-c
ln -s /Users/matthewdaw/Documents/gauntlet/fraction_tutorial_ui/node_modules /Users/matthewdaw/Documents/gauntlet/fraction_tutorial-batch-c/node_modules
# then dispatch an agent with the batch file as its prompt
```

After the agent commits, `git merge --no-ff batch-X-...` from main, resolve any styles.css sentinel-block conflicts, push.

## Coordination rules (universal)

- **styles.css conflicts:** every batch that touches styles.css appends in a sentinel-delimited block: `/* === Batch X: <name> === */ ... /* === END Batch X === */`. Merge is mechanical.
- **v2lessons.ts conflicts:** if two batches touch this file, run them sequentially. Module/concept additions go at the end of the existing pattern.
- **App.tsx conflicts:** only Batch E touches App.tsx structurally. Other batches don't.
- **`fractions.ts`:** off-limits to all batches. Eng review D7 locked this — no new tree ops; reuse the existing Multipliers system.
