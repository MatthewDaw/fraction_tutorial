# Batches

Each file in this directory is a self-contained brief for one agent run (or one focused human session). Batches are designed to be parallelizable where possible.

## Status

All eight batches (A–H) have shipped to `main`. The post-merge cross-batch wire-up between G's analytics and E's mastery (`9039345`) is also in.

| Batch | Status | What it built | Shipped commit | Merged to main |
|-------|--------|---------------|----------------|----------------|
| ~~A~~ | ✅ shipped | TwoFractionsCanvas, drag-combine, capstone end-card, phase indicator, multi-phase test harness, glue SVG | `2b495a4` | (pre-batch run) |
| ~~B~~ | ✅ shipped | divisibility-7 + divisibility-11 lessons, MultiplierPanel rewrite with `{2,3,5,7,11}` palette | `8023190` | (pre-batch run) |
| ~~[C](batch-c-lesson-content.md)~~ | ✅ shipped | base-equating + simplification + add-fractions module content + capstone generator | `a6e5d94` | `5f333a9` |
| ~~[D](batch-d-design-polish.md)~~ | ✅ shipped | Nunito typography, 44px touch target floor, focus-visible | `608ae9b` | `ba03f44` |
| ~~[E](batch-e-integration.md)~~ | ✅ shipped | MultiplierPanel rewire, TwoFractionsCanvas refactor, per-concept mastery + capstone-attempts tracking | `50b08ef` | `6620380` |
| ~~[F](batch-f-test-framework.md)~~ | ✅ shipped (reverses D10) | Vitest + Testing Library + 100% line coverage on `fractions.ts` + tests for new code | `8239249` | `031fa6e` |
| ~~[G](batch-g-analytics.md)~~ | ✅ shipped | Local-only analytics module with CSV export (anonymous per-device, FERPA-safe) | `07ca177` | `049b33c` |
| ~~[H](batch-h-design-system.md)~~ | ✅ shipped (reverses T28) | `DESIGN.md`, full token system, `@media (prefers-color-scheme: light)` overrides | `b882a3c` | `1213e60` |

## Deferred sub-items (not done by the batches that shipped above)

Worth a small follow-up batch when prioritized:

- **E — T8 module reorder per D2.** `V2_MODULES` on main is `[prime-dividing, common-factors, base-equating, simplification, add-fractions]`, not D2's `[prime-dividing, base-equating, common-factors, ...]`. The E worker declined because lesson-number labels are baked into welcome strings and reordering would re-break Lane B's numbering fixes (commit `7a922e0`). Doing the reorder properly means retouching every welcome/recap that mentions a lesson number.
- **G — admin export UI.** `exportEventsAsCSV()` and `downloadCSV()` are callable from devtools today. The triple-tap-header or dedicated admin route is not built.
- **G — `lesson_started` event.** Not wired. App.tsx has no lesson-entry hook; completion-rate denominators won't work until that's added.
- **H — full `/design-consultation` interactive pass.** The worker picked defensible defaults; aesthetic-direction questions are listed in `DESIGN.md`'s "Open questions" section.
- **F — capstone generator test.** One `it.todo` left in `src/v2lessons.test.ts` (was a placeholder because Batch C hadn't shipped when F was authored — could now be turned into real tests of `generateCapstoneProblem`).

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
