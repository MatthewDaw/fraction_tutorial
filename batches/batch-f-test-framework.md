# Batch F — Test framework

**Status:** anytime | **Priority:** P2 | **Reverses:** D10 (eng review)

## Goal

The eng review's D10 deferred adding tests. This batch picks up that deferred work. Per the user's stated preference ("well-tested code is non-negotiable"), this is the right time to do it once the v1 product surfaces are stable.

## Read first

- `LESSONS.md` — "Deferred test debt (per D10)" section. Lists the seven backfill targets.
- `LESSONS.md` — the eng review's test-coverage diagram showing the 27 untested paths.

## Tasks

### Install Vitest + Testing Library

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui"
```

Add `vitest.config.ts` at repo root:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

Create `src/test-setup.ts` importing `@testing-library/jest-dom`.

### Backfill `fractions.ts` (highest leverage)

Every export gets a test. The pure functions are unit-testable end-to-end:
- `createRootPiece` — returns a leaf with a unique ID
- `dividePiece` — replaces a leaf with N children; max-denominator cap blocks deep splits
- `glueLeaves` — joins two leaves into a shared groupId; handles transitive groups; handles same-id, missing-id
- `computeFractions` — leaf → fraction map; verifies the denom-multiplication math is correct under nested splits
- `computeGroupFractions` — aggregates leaves within a group; verifies the LCD math
- `addMultiplier` / `decrementMultiplier` — additive vs. subtractive; floor-at-zero behavior
- `multiplierFactor` — product of primes^exponents
- `pruneMultipliers` — drops keys for groups that no longer exist after a board change
- `transferGlueMultipliers` — multipliers survive a glue operation
- `getEdgeLeaves` + `computeSubCracks` — geometry helpers; test against known small boards
- `simplify` (internal) — exposed indirectly via `computeFractions`; tested via integration

Write tests in `src/fractions.test.ts`. Aim for `★★★` quality per the eng review rubric (behavior + edge + error paths).

### Tests for new code (Lane A + Batch C+E surfaces)

- `src/TwoFractionsCanvas.test.tsx` — match-bases cue triggers correctly, drag is gated by match, drop produces correct combined fraction, snap-back fires on drop outside zone
- `src/CapstoneEndCard.test.tsx` — renders score correctly, "Try another set" callback fires, accepts `passed` boolean
- `src/PhaseIndicator.test.tsx` — three chips, only one active, advances when prop changes
- `src/mastery.test.ts` — localStorage round-trip, attempt-count semantics, status transitions
- Capstone generator (in `src/v2lessons.ts`): test the constraint enforcement (denom range, dedup, complexity cap, generator-loop termination with the 100-attempt cap)
- Regression test for the divisibility-7 and divisibility-11 worksheet pools — every number in `yesPool` IS divisible, every number in `noPool` is NOT (Lane B verified this by hand; the test makes it a forever-check)

### Tests for `MultiplierPanel` rendering

`src/MultiplierPanel.test.tsx` — renders 5 mushroom buttons, each has the correct prime label, click fires `onSelect` with the right Tool payload, active state styling applies, prime-count spots match the prime number for each cap.

## Stretch targets (P3, do if time permits)

- E2E test via Playwright that walks through the divide-by-2 lesson end-to-end on a real DOM
- A "regression suite" that asserts the existing 9 concepts (divide-by-2 through gcf-venn) all reach completion when driven programmatically

## Verify

```bash
npm run test:run
```

Should pass with high coverage on `fractions.ts` (target: 95%+).

## Commit

```bash
git commit -m "Batch F: Vitest + Testing Library + backfill fractions.ts + tests for new code (reverses D10)"
```
