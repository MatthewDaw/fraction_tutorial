# Batch C — Lesson content

**Status:** next | **Priority:** P1 | **Blocks:** Batch E | **Parallel with:** Batch D

## Goal

Implement the three new modules' full lesson content per `LESSONS.md`: `base-equating`, `simplification`, `add-fractions` (capstone). Plus the random capstone generator from D5.

## What's already in place (from Lanes A + B)

- `V2StepCanvas` already has the `twoFractions` variant.
- `V2StepCompletion` already includes `combined`, `both-sides-same-denom`, `simplest-form`.
- `V2LessonTest` already supports the `multiPhase` variant.
- `TwoFractionsCanvas`, `CapstoneEndCard`, `PhaseIndicator` exist and are wired into App.tsx.
- Divisibility-7 and divisibility-11 concepts and the `{2,3,5,7,11}` mushroom palette ship.

This batch fills in the concept data only.

## Read first

- `LESSONS.md` — Module 3 (`base-equating`), Module 4 (`simplification`), Module 5 (`add-fractions`) sections plus the spec details derived from D11–D17.
- `src/v2lessons.ts` — existing module patterns. The `prime-dividing` module is the right template for stepped progression; the `common-factors` module is the right template for canvas-rich concepts.
- `src/TwoFractionsCanvas.tsx` — to understand the data shape your `twoFractions` canvas steps need to provide.

## Tasks (from `LESSONS.md` implementation table)

- **T10** — `base-equating` module: concepts `equivalent-fractions`, `multiply-by-one`, `equate-two-bases`. Use the mushroom framing per D7 ("multiply by 2, then 2, then 2 to scale by 8" — three ×2 mushroom clicks, not a single ×8).
- **T11** — `simplification` module: concepts `reduce-by-shared-factor`, `simplest-form`, `simplification-drill`. Reduction is via decrementing mushroom multipliers, not via a new merge op (per D7).
- **T12** — `add-fractions` module: concepts `add-same-base`, `add-different-bases`, `add-and-simplify`, plus the capstone `final-assessment`.
- **T14** — Random capstone generator per D5. Constraints: denominators ∈ [2, 12], operands deduplicated, no same-denominator pairs, result complexity bounded. Per D8, denominators can now include 7 and 11 (mushroom palette supports them).

## Add to `v2lessons.ts`

For each new module:
- Concept IDs in `V2ConceptId`
- Entries in `V2_CONCEPTS`, `V2_CONCEPT_LABELS`
- Entry in `V2_MODULES`, `V2_MODULE_LABELS`, `V2_MODULE_CONCEPTS`
- Concept-by-concept step arrays in `V2_LESSONS`
- Tab entries in `V2_LESSON_TABS` (`['lesson']` for non-test concepts; `['lesson', 'test']` for `final-assessment`)
- For `final-assessment`: a `V2_LESSON_TESTS` entry with `kind: 'multiPhase'`, a generator function, and three phases (`twoFractions` canvas with `both-sides-same-denom` → `twoFractions` with `combined` → single-fraction with `simplest-form`)

Step prompts should match the existing modules' voice (warm, "Wow!"-occasional, blank-line-separated short paragraphs). Number the concepts in `V2_CONCEPT_LABELS` sequentially from where Lane B left off.

## Hard constraints

- **DO NOT** modify `src/App.tsx`, `src/TwoFractionsCanvas.tsx`, `src/MultiplierPanel.tsx`, `src/fractions.ts`. These are integration territory.
- **DO NOT** modify the existing modules (`prime-dividing`, `common-factors`). Module reorder is Batch E's job.
- **DO NOT** add new completion criteria or canvas variants. Use the ones already shipped.
- The capstone generator must include `7` and `11` in legal denominators (per D8 expansion).

## Verify before commit

```bash
npx tsc --noEmit
npm run build
```

Visit the dev server, walk through one concept of each new module, confirm prompts render and steps advance.

## Commit

```bash
git commit -m "Batch C: base-equating + simplification + add-fractions module content; capstone generator"
```

## Open questions to resolve during writing

These were flagged in `LESSONS.md` "Open questions / To resolve during Phase 2 (playtest with lesson wrappers)" — make a judgment call inline and note it in the commit body:

- Misuse handling for new completion criteria (e.g. student scales wrong K). Default: action allowed but criterion not met; advance gated by criterion.
- Step pacing for concepts that landed at 7+ steps. Split if it feels too long.
