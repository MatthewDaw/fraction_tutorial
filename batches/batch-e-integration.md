# Batch E — Integration, reorder, and mastery tracking

**Status:** sequential after Batch C and Batch D merge | **Priority:** P1 | **Blocks:** v1 ship

## Goal

Wire the parts together. Lanes A and B and Batches C/D each built isolated pieces; this batch makes them function as one app.

## Read first

- `LESSONS.md` — D2 (module reorder), D7 (Multipliers reuse), eng-review note about the merge integration gaps.
- `batches/README.md` — the "Integration gaps" notes at the bottom.
- `src/MultiplierPanel.tsx` (Lane B's version) — the canonical mushroom toolbar.
- `src/TwoFractionsCanvas.tsx` — the inline stub mushroom toolbar that needs replacing.
- `src/App.tsx` — the mushroom-toolbar render site that got removed when MultiplierPanel went missing.

## Tasks (from `LESSONS.md` implementation table + merge follow-up)

### T8 — Module reorder per D2

In `src/v2lessons.ts`, change `V2_MODULES` from:
```ts
['prime-dividing', 'common-factors']
```
to (after Batch C lands the new module concepts):
```ts
['prime-dividing', 'base-equating', 'common-factors', 'simplification', 'add-fractions']
```
Update `V2_MODULE_LABELS` and `V2_MODULE_CONCEPTS` to match. Renumber concept labels (e.g. `divide-by-2` is concept #1, the new `base-equating` concepts slot in next, then `common-factors` concepts pick up after that).

### T9 — Recap retouch per D2 (mostly done by Lane B; verify)

Lane B already updated the `divisibility-5` recap to point to divisibility-7. After the module reorder, also retouch:
- `gcf-venn` final concept's recap (currently closes with "you can simplify any fraction"; now teases `simplification` as the next module)
- Welcome step of `factors-of-one` (positions itself after prime-dividing; now positions after base-equating)
- The new `divisibility-11` recap (which currently teases factors-of-one) — check that's still accurate after reorder

### Integration: wire Lane B's `MultiplierPanel` back into `App.tsx`

The original `App.tsx` had:
```ts
import MultiplierPanel from './MultiplierPanel';
// ...
<MultiplierPanel activeTool={tool} onSelect={handleToolSelect} />
```
That import was removed when the file went missing. Restore the import. Re-render `<MultiplierPanel>` in the appropriate place — historically alongside the hammer toolbar.

### Integration: refactor `TwoFractionsCanvas` to use the canonical `MultiplierPanel`

`TwoFractionsCanvas.tsx` has a local inline stub mushroom toolbar (`SideMultipliers` and inline buttons). Replace each side's inline toolbar with `<MultiplierPanel>` instances. Each side keeps its own `activeTool` and `onSelect` callback.

This is the most error-prone step. Test that:
- The mushroom click still adds the right prime to that side's multipliers
- Decrementing still works (via the existing `onDecrementMultiplier` on the FractionBox underneath)
- The Lane B mushroom palette (5 primes, prime-count spots, per-prime cap silhouette) renders correctly

### T15 — Per-concept mastery tracking

Strategy doc commits to "per-concept mastery rate" as a metric. For new concepts, the definition (per LESSONS.md concept 5.4 spec):
- Lesson concepts (3.1–3.3, 4.1–4.3, 5.1–5.3): completion = mastery
- `final-assessment`: mastery = passed within first 2 attempts. Students who eventually pass after 3+ attempts are tracked separately as "passed with reps."

This is per-student state. For v1, use `localStorage` keyed by concept-ID. Write a small `src/mastery.ts` module exporting:
- `recordMastery(conceptId: V2ConceptId, attemptCount: number): void`
- `getMasteryStatus(conceptId): 'unstarted' | 'in-progress' | 'mastered' | 'passed-with-reps'`

Wire calls into App.tsx at the right transitions (concept completion fires `recordMastery(id, 1)`; capstone end-card fires `recordMastery('final-assessment', attemptCount)`).

(Analytics emission — sending this data anywhere — is Batch G, not this batch.)

### Capstone test wiring (final piece)

Batch C added the `V2_LESSON_TESTS['add-fractions']` entry with `kind: 'multiPhase'` and a generator. Wire that into the test-runner loop in App.tsx that Lane A added — verify the phases advance, the PhaseIndicator updates, and the CapstoneEndCard renders after problem 10.

## Hard constraints

- **DO NOT** modify `src/fractions.ts` (D7 still applies).
- **DO NOT** add new lesson content. That was Batch C.
- After this batch, `LESSONS.md`'s implementation table should have every P1 task checked.

## Verify before commit

```bash
npx tsc --noEmit
npm run build
npm run dev
```

In the browser, walk the full critical path: pick `divide-by-2` (existing), confirm mushroom toolbar renders. Switch to a new module concept, confirm it loads. Click through the capstone test for ~3 problems, confirm phase advancement works. Trigger an end-card by completing 10 problems.

If anything regresses on the existing modules (prime-dividing, common-factors), the integration broke something — likely the MultiplierPanel re-wire. Roll back and isolate.

## Commit

```bash
git commit -m "Batch E: module reorder per D2, MultiplierPanel rewired into App.tsx and TwoFractionsCanvas, per-concept mastery tracking with localStorage"
```

## After this batch ships

LESSONS.md's status table can mark every module as `✅ built`. STRATEGY.md's three metrics become measurable (analytics emission is still Batch G, but the per-attempt data is being recorded).
