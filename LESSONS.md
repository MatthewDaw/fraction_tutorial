# Lessons — Plan for Unbuilt Modules

This is the design spec for the three modules that still need to be built. The two existing modules (`prime-dividing`, `common-factors`) are implemented in `src/v2lessons.ts`; treat that file as the canonical reference for shape, voice, and pacing. This doc designs what comes next so it slots into the same data structure.

## Where these fit

| # | Module                        | Status                                                  |
| - | ----------------------------- | ------------------------------------------------------- |
| 1 | `prime-dividing`              | ✅ built                                                |
| 2 | `base-equating`               | 🚧 spec'd below — slots in BEFORE `common-factors`      |
| 3 | `common-factors`              | ✅ built — recap text needs minor retouch after reorder |
| 4 | `simplification`              | 🚧 spec'd below                                         |
| 5 | `add-fractions` (capstone)    | 🚧 spec'd below                                         |

The module order was swapped in CEO review (decision D2). `base-equating` now precedes `common-factors` so the student never sees a technique that ignores GCF immediately after learning GCF. The two pieces of code work to make this real:

1. Reorder `V2_MODULES` in `src/v2lessons.ts`.
2. Retouch the recap in the last `prime-dividing` concept (currently teases factors → now teases "adding fractions with different bases"). Retouch the welcome in `common-factors` (positions itself after prime-dividing → now positions after base-equating). Retouch the recap in `gcf-venn` (currently closes with "you can simplify any fraction" → now teases simplification as the next module).

`base-equating` teaches the simpler "multiply by the opposite denominator" technique. `simplification` is where GCF knowledge is cashed in to reduce results.

## Decisions from CEO review (2026-05-19)

Locked in via `/plan-ceo-review`:

- **D1 — Implementation approach: Build primitives first.** Phase 1 ships the `twoFractions` canvas as a standalone playground (D7 revised the rest). Phase 2 playtests it. Phase 3 revises this spec against playtest evidence and ships the lessons.
- **D2 — Premise: Module reorder (above).** `base-equating` before `common-factors`.
- **D3 — Review mode: HOLD SCOPE.** No new modules or concepts beyond what's spec'd here — except the two new divisibility concepts unlocked by D8 (still in service of the existing capstone scope).
- **D4 — Op design: SUPERSEDED by D7.** Original CEO decision was "two distinct ops, shared internal helper." Eng review found the scale and merge ops already exist via the Multipliers system.
- **D5 — Capstone assessment: Full random within constraints.** Generator picks two fractions on the fly; no fixed pool. Constraints: denominators ∈ [2, 12], operands deduplicated, no same-denom pairs, result complexity bounded. (Generator now safe for full [2,12] range per D8.)
- **D6 — Combine UX: Drag right onto left.** Once both sides of the two-fraction board reach the same displayed denominator, the student drags the right fraction onto the left to combine.

## Decisions from design review (2026-05-19)

Locked in via `/plan-design-review`. Target environment: **tablet-first, no physical keyboard.**

- **D11 — Review focus: Full 7-pass including existing UI patterns.** Initial design completeness rated 5/10 → final 8/10 across the new surfaces.
- **D12 — Two-fraction board layout: Side-by-side horizontal, equation form.** Left fraction | + | Right fraction, with per-side mushroom toolbars BELOW each fraction (not floating). The "+" is a real composition element, not punctuation. Portrait/below-768px stacks vertically with "+" rotating 90° to sit between rows.
- **D13 — Matched-bases cue + drag affordance: Compound three-layer cue.** When displayed denominators match: (a) the "+" pulses yellow, (b) the right fraction lifts with a 2px yellow glow ring + 4px shadow, (c) on touch-start of the right side, the left fraction reveals a dashed yellow drop-zone border. All three fire together. All three honor `prefers-reduced-motion` by switching to instant state changes.
- **D14 — Capstone celebration: Meaningful end-card.** After the 10th capstone problem, the canvas zooms out to a centered card. Score is the typographic anchor (e.g., "9/10 on your first try" in large Nunito Bold). Small fraction proof at bottom showing problems solved. Single primary action: "Try another set." No confetti, no sound, no trophy. Honors the achievement as real progress.
- **D15 — Typography: Nunito as primary typeface.** Add `@fontsource/nunito` (weights 400, 600, 700) and replace the system stack in `styles.css:22`. Optional: Source Code Pro for fraction numerals to give the math a contrasted feel. Implies bundle weight ~80-120 KB.
- **D16 — Mushroom palette extension: Purple ×11 + prime-count spots + shape-per-prime.** ×11 cap color = `#a259ff`. Each mushroom cap gets N spots where N = the prime (2 spots on ×2, 3 on ×3, 5 on ×5, 7 on ×7, 11 on ×11). Each prime also gets its own cap silhouette (round/oval/tall/wide/dome). This gives colorblind students a non-color distinguisher AND surfaces a delightful math easter egg (spot count = prime). Note: 11-spot ×11 icon needs careful sketching to avoid noise.
- **D17 — Touch drag mechanics: Immediate drag, match-gated.** Drag starts the instant a finger moves on the right fraction, BUT only when displayed denominators match (D13 cue is active). Before match: right fraction is non-draggable; touch does nothing. `touch-action: none` on the draggable element to prevent scroll-during-drag. Snap-back (200ms ease-out) if dropped outside left's drop-zone.

### Design spec details (derived from D11–D17, no separate decision required)

- **Phase indicator:** 3 numbered chips above the two-fraction canvas. Active chip uses `--tool-active` yellow background. Inactive chips use `--tool-bg` gray. Class names: `.phase-indicator`, `.phase-chip`, `.phase-chip--active`.
- **New CSS classes:** `.two-fraction`, `.two-fraction__side`, `.two-fraction__operator`, `.two-fraction__drop-zone`, `.phase-indicator`, `.phase-chip`, `.phase-chip--active`, `.capstone-end-card`. Follow existing BEM-ish convention.
- **Combine animation:** on drop, right fraction slides leftward into "+", "+" fades to 0 opacity (200ms), single-fraction board appears at the center where "+" was (300ms fade-in).
- **Glue tool icon (existing UI):** replace `🧴` emoji in `ToolPanel.tsx:97` with a hand-drawn SVG glue-pot icon matching the mushroom illustration aesthetic.
- **Touch target floor:** change `.tool-btn` etc. from `clamp(20px, 4vmin, 44px)` to `clamp(44px, 5vmin, 56px)`. Never below 44px (WCAG 2.5.5).
- **Focus ring:** add a `:focus-visible` outline using `--tool-active` yellow, 2px solid + 2px offset. Low priority but cheap.
- **Capstone end-card layout:** centered card, max-width 480px, dark canvas background (`--bg-canvas`), single primary action button using `--tool-active`. No decorative icon. Score number as the visual anchor (Nunito Bold 48px). Score subtext smaller. Fraction-proof row at bottom in 24px Nunito Regular.
- **Responsive breakpoint:** 768px. Below, the two-fraction layout stacks; above, equation form.

## Decisions from eng review (2026-05-19)

Locked in via `/plan-eng-review`:

- **D7 — Reuse existing Multipliers system; do NOT build new scale:K / merge:K AllowedOps.** `addMultiplier` + the `mushroom` tool already implement scale. `decrementMultiplier` + the existing UI affordance in `FractionBox` already implement merge. The lesson prompts will use the "multiply by primes one at a time" framing (1/3 × 8/8 becomes three ×2 mushroom clicks: 1/3 → 2/6 → 4/12 → 8/24). Pedagogically this reinforces the prime-factor decomposition the curriculum already teaches.
- **D8 — Expand mushroom palette to {2, 3, 5, 7, 11}, add two new divisibility concepts.** New buttons in `MultiplierPanel.tsx`. New concepts `divisibility-7` and `divisibility-11` slot into the `prime-dividing` module after `divisibility-5`. Divisibility-by-7: "double the last digit, subtract from the rest, check ÷7." Divisibility-by-11: "alternating sum of digits, check ÷11." Both genuinely harder than 2/3/5 — playtest pacing carefully.
- **D9 — Combine collapses to single-fraction state.** On drop (after D6 drag), compute `numerator_sum / shared_denom`, seed a fresh Piece tree at that denominator with the summed numerator highlighted, and switch the canvas kind from `twoFractions` to the existing single-fraction board. Both source trees are discarded. The simplification phase that follows reuses the single-fraction board verbatim.
- **D10 — DEFERRED: Test framework.** No Vitest, no tests for the new code, no backfill for `fractions.ts`. Logged as unresolved-decision-that-may-bite-you-later. This contradicts the stated "well-tested code is non-negotiable" preference; revisit when post-ship velocity allows. See "Deferred test debt" below.

## Pattern reminders (from existing modules)

- **Module → concept → step.** Each concept is one lesson on the sidebar; each step is one screen.
- **Arc per concept:** welcome → guided exploration with concrete examples → pattern observation → trick or rule → drill → recap.
- **Voice:** second person, short paragraphs separated by blank lines, occasional ✓/✗ and emoji for celebration.
- **Each step needs:** `prompt`, `initialState`, `allowedOps`, `completeOn`, and (optionally) `canvas`, `entryAnimation`, `targetDenominator`, `factorTarget`/`factorReveal`, `guessAnswer`.
- **Default canvas** is the fraction-box board; non-board screens specify `canvas: { kind: ... }`. Pure-text intros/recaps use `canvas: { kind: 'none' }` *or* simply omit the canvas (the existing modules do both — see `divisibility-2`).

---

## New primitives required before these lessons can ship

Eng review revised this list down significantly. Only **one** primitive is genuinely new.

### 1. A two-fraction board (canvas) — GENUINELY NEW

Existing `FractionBox` shows one fraction at a time. Base-equating and the capstone need two fractions visible side by side, each independently scalable, both ending at the same displayed denominator. Proposed:

```ts
| { kind: 'twoFractions'; left: { num: number; denom: number }; right: { num: number; denom: number } }
```

State shape (per eng review 1.1): two independent state slots `{ leftRoot, leftMultipliers, rightRoot, rightMultipliers }` mirroring the existing single-fraction pattern. Each side gets its own mushroom-toolbar interaction. The renderer should make it visually obvious when both sides reach the same *displayed* denominator (denom × multiplierFactor on each side).

**Combine drop (per D9):** when the right fraction is dragged onto the left after displayed denominators match, the drop handler computes `numerator_sum / shared_denom`, seeds a fresh single-fraction Piece tree, and switches `canvas.kind` from `twoFractions` to undefined (default fraction-box). Both source trees are discarded. The simplification phase that follows works on the existing single-fraction board with no further changes.

### 2. ~~A "multiply by N/N" operation~~ — ALREADY EXISTS (per D7)

The existing `mushroom` tool + `addMultiplier` in `fractions.ts:283` already implements this. A mushroom with prime P clicked on a group adds P to its display multiplier, so the group's fraction visually becomes `(num × P) / (denom × P)` without touching the Piece tree.

Lesson prompts that originally said "scale 1/3 by 8/8" now say "multiply 1/3 by 2, then by 2, then by 2" (three mushroom clicks: 1/3 → 2/6 → 4/12 → 8/24). The student visually sees each ×2 step, which reinforces prime-factor reasoning rather than hiding it behind a single jump.

**Per D8:** mushroom palette extends from `{2, 3, 5}` to `{2, 3, 5, 7, 11}` to cover the full [2,12] denominator range of the D5 capstone generator. Add two buttons to `MultiplierPanel.tsx`.

### 3. ~~A "merge / un-split" operation~~ — ALREADY EXISTS (per D7)

The existing `decrementMultiplier` in `fractions.ts:291` + the per-multiplier decrement UI already wired into `FractionBox` (via the `onDecrementMultiplier` callback) already implements this. To simplify 8/24 → 1/3, the student removes the {2: 3} multiplier one prime at a time (8/24 → 4/12 → 2/6 → 1/3).

A new completion criterion `'simplest-form'` is added that checks `simplify(displayedNum, displayedDenom)` equals the current displayed pair — i.e., no further decrement is legal. Reuses `simplify` in `fractions.ts:28`.

### 4. Multi-phase test harness — GENUINELY NEW (per eng review 1.3)

The current `V2_LESSON_TESTS` shape only supports single-step quizzes. The capstone needs 3-phase problems (equate → combine → simplify) on a single problem. Extend `V2LessonTest` with a `kind: 'multiPhase'` discriminated variant carrying `{ phases: Array<{ canvasKind, completeOn }>, generator: () => ProblemInstance }`. The test runner in `App.tsx` advances phases as each completion check fires on the live state.

### 4. Optional: a "stacked fractions" canvas for showing equivalence

For the early "1/2 = 2/4 = 4/8" intuition step, a vertical stack of equal-length bars with progressively finer divisions reads more clearly than the standard board. Could be served by extending `StripCanvas` or by a new `kind: 'equivalent-stack'`. Defer until the lesson is built and judged.

---

## Module 3: `base-equating`

**Goal:** Given two fractions with different denominators, raise them to a shared denominator by multiplying each by the *opposite* denominator over itself.

**Why this approach (vs LCD):** The student already knows what GCF is, but the LCD-via-GCF technique adds a layer of indirection ("find LCM, divide, multiply by that") that obscures *why* you can change a fraction's form without changing its value. The "multiply by opposite/opposite" technique is mechanically simple and always works — slower for some cases, but every step is justified by something the student can see.

**Module label:** `Base Equating`

### Concept 3.1 — `equivalent-fractions`

The big idea: a fraction has infinite equivalent forms. 1/2 = 2/4 = 4/8 = 8/16 — same amount, different number of pieces.

Steps:

1. **Welcome.** "A fraction can wear lots of different outfits. 1/2 and 2/4 and 4/8 all name the same amount — they just slice the whole into more pieces." Canvas: `none`. Completion: `next-button`.
2. **Watch 1/2 become 2/4.** Start with one piece highlighted out of two. Student smashes with 2-hammer. Now 2 pieces highlighted out of 4. Prompt: "Same shaded region. The pieces got smaller, but you doubled how many you have. 1/2 = 2/4." Canvas: fraction-box. Allowed: `split:2`. Completion: `divide`.
3. **Keep going: 2/4 → 4/8.** Smash again. Prompt: "Same shaded region again. 2/4 = 4/8. The bottom number doubled; the top number doubled too." Allowed: `split:2`. Completion: `divide`.
4. **One more: 4/8 → 8/16.** Smash again. Reinforce the rhythm. Allowed: `split:2`. Completion: `divide`.
5. **Pattern reveal.** "1/2 = 2/4 = 4/8 = 8/16. Every time you split each piece into K, both the top and bottom multiply by K. The amount you have doesn't change — you just describe it in smaller pieces." Canvas: `none`. Completion: `next-button`.
6. **Same trick with 3s.** Start with 1/3. Two `split:3` rounds → 3/9 → 9/27. "Splitting by 3 multiplies both top and bottom by 3 each time." Canvas: fraction-box. Allowed: `split:3`. Completion: `all-pieces-at-target`, `targetDenominator: 27`.
7. **Recap.** "Any fraction equals itself when you multiply BOTH the top and the bottom by the same number. That's the rule we'll use next to make two different fractions match up." Canvas: `none`. Completion: `next-button`.

### Concept 3.2 — `multiply-by-one`

Why "multiplying both top and bottom by K" works: because K/K = 1, and multiplying by 1 doesn't change anything.

Steps:

1. **Welcome.** "Here's why that trick works. Watch this: 8 divided by 8 is 1. So is 3 divided by 3. So is 247 divided by 247. Any number over itself is 1." Canvas: `none`. Completion: `next-button`.
2. **Spot the ones.** Three flashcards in sequence: 8/8, 3/3, 24/24. For each: "What does this equal?" with a yes/no on "Is this equal to 1?". Use existing `guessAnswer: 'yes'` pattern. Canvas: `number` (extend with optional fraction display) OR a new `kind: 'fraction-flashcard'`. If neither exists yet, build the minimum.
3. **Multiplying by 1 changes nothing.** "1/3 × 1 = 1/3. Obvious, right? But here's the twist: 1 can wear different outfits too. 1 = 8/8. So 1/3 × 8/8 also equals 1/3 — just in a different form." Canvas: `none`. Completion: `next-button`.
4. **Watch it happen.** Show 1/3 as a fraction box. Apply `scale:8`. The single shaded third splits into 8 sub-slivers; the two unshaded thirds each split into 8 too. Result: 8/24. Prompt: "Multiplied 1/3 by 8/8. Each old piece became 8 new pieces — but you still have the same shaded chunk." Canvas: fraction-box. Allowed: `scale:8`. Completion: a new `'scaled'` criterion *or* reuse `divide` if the scale op is implemented as a kind of split.
5. **Try it with a 3.** Show 1/8 → `scale:3` → 3/24. "Now you've turned 1/8 into 3/24 the same way." Canvas: fraction-box. Allowed: `scale:3`. Completion: `'scaled'`.
6. **The key observation.** "Both 1/3 and 1/8 now share the same bottom number: 24. That's no accident — we picked the multipliers on purpose." Canvas: `none`. Completion: `next-button`.

### Concept 3.3 — `equate-two-bases`

The full move: given two fractions with different denominators, scale each by the OPPOSITE denominator over itself.

Steps:

1. **Welcome.** "Time to put it together. Given 1/3 and 1/8, how do we make their bottoms match?" Canvas: `none`. Completion: `next-button`.
2. **The recipe.** "Take 1/3 and multiply by 8/8. Take 1/8 and multiply by 3/3. Both end at /24." Two-fraction board showing 1/3 on the left, 1/8 on the right. Student applies `scale:8` to left and `scale:3` to right. Completion: `both-sides-same-denom`.
3. **Why opposite?** "Each fraction gets multiplied by the OTHER fraction's denominator. That's what guarantees their bottoms end up the same — both bottoms become 3 × 8 = 24." Canvas: `none`. Completion: `next-button`.
4. **Another pair: 1/2 and 1/5.** Two-fraction board. Student applies `scale:5` to left, `scale:2` to right. Both reach /10. Completion: `both-sides-same-denom`.
5. **One more: 2/3 and 1/4.** Numerators aren't both 1 this time. Apply `scale:4` to left (→ 8/12), `scale:3` to right (→ 3/12). Reinforces that the numerator scales by the same multiplier as the denominator. Completion: `both-sides-same-denom`.
6. **Quick drill.** Three or four pairs in succession with reduced hand-holding. Same canvas, no narration between rounds.
7. **Recap.** "Two fractions, two scale moves, one shared base. Next up: now that they share a base, how do you actually combine them?" Canvas: `none`. Completion: `next-button`.

---

## Module 4: `simplification`

**Goal:** Reduce a fraction to its simplest form by dividing both numerator and denominator by their common factors — using the GCF as the one-shot shortcut.

**Why it comes after common-factors:** The student needs to recognize shared factors (and ideally the GCF) before they can reduce in one step. Without GCF, simplification works but takes multiple passes.

**Module label:** `Simplification`

### Concept 4.1 — `reduce-by-shared-factor`

A fraction can shrink in description (fewer, bigger pieces) without shrinking in value — the inverse of equivalent-fractions.

Steps:

1. **Welcome.** "Last module taught you how to make pieces SMALLER while keeping the same amount. Now we go the other way: make pieces BIGGER while keeping the same amount. This is called simplifying." Canvas: `none`. Completion: `next-button`.
2. **Start with 4/8.** Fraction box showing 4 of 8 pieces shaded. Prompt: "4/8 — four pieces out of eight. But look at the picture: that's literally half the block. So 4/8 = 1/2." Canvas: fraction-box. Completion: `next-button`.
3. **Do the merge.** Same board, student applies `merge:2` — every two adjacent pieces collapse into one. Now 2 of 4 pieces shaded. Prompt: "Merged each pair of pieces. 4/8 became 2/4. Same shaded region." Allowed: `merge:2`. Completion: a new `'merged'` criterion.
4. **One more merge.** Apply `merge:2` again → 1/2. "Two more pieces collapsed into one. Now you're at 1/2 — the simplest version." Allowed: `merge:2`. Completion: `'merged'`.
5. **Why this is allowed.** "Merging pieces by K is the same as dividing both the top and bottom by K. 4 ÷ 2 = 2, and 8 ÷ 2 = 4 — that's how 4/8 becomes 2/4." Canvas: `none`. Completion: `next-button`.
6. **Try it with 6/9.** Board shows 6 of 9 shaded. Student applies `merge:3` → 2/3. Allowed: `merge:3`. Completion: `'merged'`.
7. **Recap.** "Whenever the top and bottom share a factor, you can divide both by it — the fraction looks simpler, but the value doesn't change." Canvas: `none`. Completion: `next-button`.

### Concept 4.2 — `simplest-form`

A fraction is in simplest form when its numerator and denominator share no factor > 1 — i.e. GCF(num, denom) = 1.

Steps:

1. **Welcome.** "When can you stop simplifying? When the top and bottom share no factors except 1." Canvas: `none`. Completion: `next-button`.
2. **A fraction with more to give.** Show 8/12. Prompt: "Is 8/12 in simplest form? What do 8 and 12 share?" Yes/no quiz: `guessAnswer: 'no'`, explanation references factors 2 and 4. Canvas: fraction-box. Completion: `next-button` (after guess).
3. **Reduce it step by step.** Same 8/12 board. Student applies `merge:2` → 4/6 → applies `merge:2` again → 2/3. Allowed: `merge:2`. Completion: `'simplest-form'` (the new criterion — no further merges possible).
4. **Or: do it in one shot.** Reset to 8/12. "GCF(8, 12) = 4. If you'd grabbed the 4-merger first, you'd reach 2/3 in one move." Allowed: `merge:4`. Completion: `'simplest-form'`.
5. **A fraction already simple.** Show 5/9. Yes/no quiz on "Is 5/9 in simplest form?". `guessAnswer: 'yes'`, explanation: "5 and 9 share no factors except 1, so 5/9 can't be simplified." Canvas: fraction-box. Completion: `next-button`.
6. **A trickier one.** Show 9/24. Student first identifies GCF(9, 24) = 3 (use the `venn` canvas like in `gcf-venn`, or a quick yes/no on candidate factors), then applies `merge:3` → 3/8. Mixed canvases across two sub-steps.
7. **Recap.** "Simplest form means GCF(top, bottom) = 1. To get there fastest, find the GCF and merge by it once." Canvas: `none`. Completion: `next-button`.

### Concept 4.3 — `simplification-drill`

Practice. No new ideas, just reps.

Steps:

1. **Welcome.** "Your turn. Several fractions in a row — simplify each one." Canvas: `none`. Completion: `next-button`.
2–6. **Five rounds.** Each: a fraction shown on the fraction-box board, all `merge:K` ops enabled for K ∈ {2, 3, 5}. Completion: `'simplest-form'`. Suggested set: 4/10, 6/15, 12/18, 10/25, 9/12. Pick the seed list once it's playtested.
7. **Recap.** "You can take any fraction and find its simplest form. Next module: combining this with base-equating to add ANY two fractions together." Canvas: `none`. Completion: `next-button`.

### Test tab for `simplification`

Add a `V2_LESSON_TESTS` entry for the third concept: random fractions drawn from a pool of (num, denom) pairs known to reduce, student simplifies. Mirrors the existing quiz-mode shape — define a `pool` of denominators or extend the type to accept full fraction pairs.

---

## Module 5: `add-fractions` (capstone)

**Goal:** Combine two arbitrary fractions: equate bases, add numerators, simplify the result. This is the destination the whole product is aimed at.

**Module label:** `Adding Fractions`

### Concept 5.1 — `add-same-base`

When the denominators already match, addition is trivial: add the numerators, keep the denominator.

Steps:

1. **Welcome.** "Final stretch. Let's actually ADD fractions. We'll start with the easy case: same denominator." Canvas: `none`. Completion: `next-button`.
2. **2/8 + 3/8.** Two-fraction board. Both already at /8. Prompt: "Both fractions are eighths. Drag the right side onto the left to combine them." Once bases match, the right-side fraction becomes draggable (per D6). On drop, both merge into a single fraction (numerators sum, denominator unchanged). Completion: `'combined'` criterion. Result: 5/8 on a single board.
3. **Why it works.** "You had 2 eighths plus 3 more eighths. That's 5 eighths total. The pieces are the same size — you just have more of them now." Canvas: `none`. Completion: `next-button`.
4. **Try: 1/5 + 2/5.** Same flow. Result: 3/5.
5. **Try: 2/6 + 3/6.** Result: 5/6. Resist the urge to simplify yet — that's the next concept's job.
6. **The rule.** "Same denominator: add the tops, keep the bottom. That's it." Canvas: `none`. Completion: `next-button`.

### Concept 5.2 — `add-different-bases`

When denominators don't match, equate first (Module 3), then add (Concept 5.1).

Steps:

1. **Welcome.** "What if the bottoms DON'T match? You already know the answer: equate first, then add." Canvas: `none`. Completion: `next-button`.
2. **1/3 + 1/8 — equate.** Two-fraction board with 1/3 and 1/8. Student applies `scale:8` to left, `scale:3` to right → 8/24 and 3/24. Completion: `both-sides-same-denom`. (`preserveBoard: true` for the next step so we don't reset.)
3. **1/3 + 1/8 — add.** Same board, both now at /24. Student combines → 11/24. Completion: `'combined'`.
4. **1/2 + 1/4.** Equate (only the right side needs scaling — `scale:2` gives 2/4) → add → 3/4. This subcase (one denominator already divides the other) is worth flagging because both-sides scaling isn't strictly necessary, but the algorithm still works.
5. **2/3 + 1/4.** Non-unit numerators. Equate → 8/12 and 3/12 → add → 11/12.
6. **3/5 + 1/2.** Equate → 6/10 and 5/10 → add → 11/10. Improper result. Briefly note "more than a whole" without making it the lesson topic.
7. **Recap.** "Equate the bases, add the tops, keep the shared bottom. Two moves, every time." Canvas: `none`. Completion: `next-button`.

### Concept 5.3 — `add-and-simplify`

The full pipeline. Equate, add, simplify.

Steps:

1. **Welcome.** "One last polish. After adding, the result is often not in simplest form. Always finish by simplifying." Canvas: `none`. Completion: `next-button`.
2. **1/6 + 1/3 walk-through.** Equate: left needs nothing if we pick /6, but using the standard recipe → 3/18 + 6/18 = 9/18. Then simplify with `merge:9` → 1/2. Three phases on one preserved board.
3. **1/4 + 1/12.** Equate → 12/48 + 4/48 = 16/48 → simplify → 1/3.
4. **2/3 + 4/9.** Equate → 18/27 + 12/27 = 30/27. Improper, but simplify (÷3) → 10/9. Improper-form simplification is fine here.
5. **The full recipe — every fraction addition, every time.** Canvas: `none`. Prompt:
   > 1. **Equate** — multiply each fraction by the opposite denominator over itself, so both share a base.
   > 2. **Add** — add the numerators; keep the shared base.
   > 3. **Simplify** — divide top and bottom by their GCF.
   Completion: `next-button`.

### Concept 5.4 — `final-assessment` (capstone test)

The metric named in `STRATEGY.md` — "% of students who can correctly add two arbitrary fractions in a final assessment" — lives here.

**Format (per D5: full random within constraints).** Each problem is generated on the fly by a constrained random generator. No fixed pool, so the student can't memorize their way to passing.

Generator constraints (all required):
- Both denominators ∈ [2, 12].
- Numerators ∈ [1, denominator − 1] (proper fractions only as inputs).
- Denominators must differ (otherwise the problem skips base-equating, which the test is meant to verify).
- Operands deduplicated within a 10-problem run (no fraction appears twice).
- Result complexity bounded: if num + (other denom × num) overflows what fits cleanly on the board, reroll.
- Improper-result handling: leave as `n/d` with n ≥ d (consistent with concepts 5.2 step 6 and 5.3 step 4). No mixed-number conversion in v1.

**Pass rules.** 10 problems per attempt. ≥ 8 correct passes. Below 8 → student can retry with a fresh random set.

**Per-attempt scoring.** Each problem is graded on three checks (equate, combine, simplify); all three must be correct to count the problem correct. Partial-credit is not exposed to the student in v1.

**Per-concept mastery rate** (strategy doc metric, for the new concepts):
- For lesson concepts (5.1, 5.2, 5.3, and the same in modules 3 and 4): completion = mastery in v1. Step-completion already gates progression.
- For `5.4 final-assessment`: mastery = passed within first 2 attempts. Students who eventually pass after 3+ attempts are tracked separately as "passed with reps."

**Test harness changes.** This is the first test that spans multiple board operations (`scale`, `combine`, `merge`) in a single problem. The existing `V2_LESSON_TESTS` shape only supports single-step quizzes. Extend `V2LessonTest` with a discriminated variant (`kind: 'multiPhase'`) that takes a generator function and a per-phase completion check. The test runner in `App.tsx` advances phases as each completion check fires on the live board state.

---

## Open questions

### Resolved in CEO review
- ~~Combine gesture~~ → **drag right onto left** (D6).
- ~~`scale:K` op family~~ → **distinct from `split:K`, shared internal helper** (D4).
- ~~Capstone assessment format~~ → **full random within constraints** (D5).
- ~~Improper fractions in v1~~ → **leave as-is, no mixed-number conversion in v1** (per D5 generator constraints).

### To resolve during Phase 1 (primitive playgrounds)
1. **`scale:K` op visualization.** Visibly subdivide pieces (animated) vs. board-redraw at the new denominator? Build both as toggles in the playground; pick after touch testing.
2. **`merge:K` op selection.** New merger toolbar (parallel to hammer toolbar) vs. drag-to-group? Playground experiment.
3. **Two-fraction board toolbar layout.** Independent per-side toolbars vs. one global toolbar with side-targeting? Lean toward independent for the simpler conceptual model; verify the layout doesn't crowd.

### To resolve during Phase 2 (playtest with lesson wrappers)
4. **Misuse handling for each new completion criterion.** What happens when a student scales by the wrong K, tries to combine before bases match, partial-merges and stops? Default behavior: action allowed but criterion not met; advance gated by criterion. Playtest may show a need for inline nudges.
5. **Step pacing.** Some concepts (esp. 5.2 with 7 steps) may be step-heavy. Split if playtest shows attrition.

### Out of scope for `LESSONS.md` (flagged separately)
6. **Analytics infrastructure.** `STRATEGY.md` commits to three metrics (capstone pass rate, per-concept mastery, completion rate). The app has no analytics today. Needs its own design pass; not a lesson-content decision.
7. **Persistence migration for module reorder.** If `App.tsx` saves per-student progress, swapping `V2_MODULES` order may leave existing students in an inconsistent state. Check during implementation.

---

## Implementation tasks

Synthesized from CEO review + eng review. Each task derives from a specific decision or finding. Check off as shipped.

**Grouped into batches in [`batches/`](batches/README.md).** Lanes A and B already shipped via parallel agents (commits `2b495a4` and `8023190`, merged into `b4104cf`). Remaining work is split into batches C through H. The critical path to ship is C + D in parallel, then E. F/G/H are post-ship maturity.

### Phase 1 — Primitive playground (per D1, revised after D7)

- [ ] ~~**T1**~~ **CUT (per D7)** — No `rewriteLeaves` helper needed. The existing Multipliers system covers scale/merge.
- [ ] ~~**T2**~~ **CUT (per D7)** — No new `scale:K` AllowedOp. Use existing `mushroom` tool.
- [ ] ~~**T3**~~ **CUT (per D7)** — No new `merge:K` AllowedOp. Use existing `decrementMultiplier` UI in `FractionBox`.
- [ ] **T4 (P1)** — `TwoFractionsCanvas.tsx` (new) + types — Implement `kind: 'twoFractions'` canvas with two independent state slots (`leftRoot`, `leftMultipliers`, `rightRoot`, `rightMultipliers`) and per-side mushroom toolbars.
  - Source: spec primitive 1, eng review 1.1.
  - Verify: each side independently scalable via existing mushrooms; visual cue fires when displayed denominators match (`denom × multiplierFactor` equality).
- [ ] **T5 (P1)** — `TwoFractionsCanvas.tsx` — Drag-combine interaction (per D6 + D9): once displayed denominators match, right fraction becomes draggable; on drop onto left, compute `numerator_sum / shared_denom`, seed a fresh single-fraction Piece tree, switch `canvas.kind` away from `twoFractions`.
  - Source: D6, D9.
  - Verify: drag gated on displayed-denom match; drop produces correct summed fraction; works on mouse and touch; state cleanly collapses to single-fraction.

### Phase 2 — Playtest (per D1)

- [ ] **T6 (P2)** — Standalone test route (`/playground/two-fractions`) so the new canvas can be exercised without a lesson wrapper.
  - Source: D1. (Mushroom playground unneeded — already exercisable in existing lessons.)
- [ ] **T7 (P2)** — Playtest the remaining open Phase-1 question in `LESSONS.md` (two-fraction board toolbar layout — independent vs. side-targeting global). Document pick.

### Phase 3 — Module reorder + lesson content (per D1 + D2 + D8)

- [ ] **T8 (P1)** — `v2lessons.ts` — Reorder `V2_MODULES` to `['prime-dividing', 'base-equating', 'common-factors']` (existing) then add `'simplification', 'add-fractions'`.
  - Source: D2. Update `V2_MODULE_LABELS`, `V2_MODULE_CONCEPTS` accordingly.
- [ ] **T9 (P1)** — `v2lessons.ts` — Retouch recap text in `divisibility-5` (last step's "Up next" line), welcome in `factors-of-one`, and recap in `gcf-venn` to reflect the new module order.
  - Source: D2.
- [ ] **T9b (P1)** — `v2lessons.ts` — Add `divisibility-7` and `divisibility-11` concepts to the `prime-dividing` module (after `divisibility-5`). Reuse `dots` and `worksheet` canvases. Slot into `V2_CONCEPTS`, `V2_CONCEPT_LABELS`, and `V2_MODULE_CONCEPTS['prime-dividing']`.
  - Source: D8.
  - Verify: divisibility-7 lesson teaches "double last digit, subtract from rest, check ÷7." Divisibility-11 teaches alternating-sum rule. Worksheets pass at 100%.
- [ ] **T9c (P1)** — `MultiplierPanel.tsx` — Extend `MUSHROOM_PRIMES` to `[2, 3, 5, 7, 11]`. Add color entries for 7 and 11 in `MUSHROOM_COLORS`. Per-concept mushroom-availability gating so ×7 and ×11 only appear after their divisibility lessons.
  - Source: D8.
- [ ] **T10 (P1)** — `v2lessons.ts` — Implement `base-equating` module: concepts `equivalent-fractions`, `multiply-by-one`, `equate-two-bases`. Lesson prompts use the mushroom framing ("multiply by 2, then 2, then 2 to scale by 8") per D7.
  - Source: LESSONS.md Module 3, D7.
- [ ] **T11 (P1)** — `v2lessons.ts` — Implement `simplification` module: concepts `reduce-by-shared-factor`, `simplest-form`, `simplification-drill`. Reduction is via decrementing mushroom multipliers (existing UI), not via a new merge op.
  - Source: LESSONS.md Module 4, D7.
- [ ] **T12 (P1)** — `v2lessons.ts` — Implement `add-fractions` module: concepts `add-same-base`, `add-different-bases`, `add-and-simplify`.
  - Source: LESSONS.md Module 5.

### Phase 4 — Capstone assessment (per D5)

- [ ] **T13 (P1)** — Types + `App.tsx` — Extend `V2LessonTest` with `kind: 'multiPhase'` variant supporting a generator function and per-phase completion checks.
  - Source: D5. Existing `V2LessonTest` shape only supports single-step quizzes.
- [ ] **T14 (P1)** — `v2lessons.ts` — Implement the random capstone generator with the constraints in concept 5.4 (denominators 2–12, dedup, different denominators, complexity cap).
  - Source: D5.
- [ ] **T15 (P2)** — `v2lessons.ts` — Per-concept mastery tracking for the new concepts (completion = mastery for lesson concepts; "passed within first 2 attempts" for `final-assessment`).
  - Source: D5 plus strategy doc.

### Phase 5 — Design implementation (per D11–D17)

- [ ] **T18 (P1)** — `TwoFractionsCanvas.tsx` + `styles.css` — Implement D12 equation-form layout: side-by-side fractions, large "+", per-side mushroom toolbars below. Stack vertically below 768px breakpoint.
  - Source: D12.
  - Verify: looks like an equation on landscape tablet; stacks cleanly on portrait.
- [ ] **T19 (P1)** — `TwoFractionsCanvas.tsx` + `styles.css` — Implement D13 compound match cue: "+" pulse animation, right-fraction lift+glow on matched-bases, drop-zone reveal on drag-start. All three honor `prefers-reduced-motion`.
  - Source: D13, D17.
  - Verify: matched-bases moment is unmissable; reduced-motion downgrades to instant states.
- [ ] **T20 (P1)** — `TwoFractionsCanvas.tsx` — D17 immediate-drag-with-match-gating + 200ms snap-back if dropped outside drop-zone. `touch-action: none` on the draggable element.
  - Source: D17. Tablet-first; no keyboard alternative needed.
  - Verify: drag works on touch only when bases match; snap-back works; no accidental scroll during drag.
- [ ] **T21 (P1)** — `CapstoneEndCard.tsx` (new) + `styles.css` — D14 end-card: zoom-out animation after problem 10, score as typographic anchor, fraction proof at bottom, single primary action.
  - Source: D14.
  - Verify: end-card renders correctly at landscape/portrait; "Try another set" cleanly resets capstone state.
- [ ] **T22 (P1)** — `package.json` + `styles.css` — D15 typography: add `@fontsource/nunito` (400/600/700), replace system stack on line 22.
  - Source: D15.
  - Verify: app renders in Nunito; bundle size delta acceptable (~80-120 KB).
- [ ] **T23 (P1)** — `MultiplierPanel.tsx` + `styles.css` — D16 mushroom expansion: add ×11 with purple `#a259ff`, add prime-count spot SVGs (2/3/5/7/11 spots), per-prime cap silhouettes.
  - Source: D16. Already-styled `mushroom-icon--p7` needs ×11 companion.
  - Verify: all 5 mushrooms distinguishable in normal AND deuteranopia simulation; 11-spot icon doesn't read as noise.
- [ ] **T24 (P1)** — `App.tsx` — `PhaseIndicator.tsx` (new) + `styles.css` — 3 numbered chips for capstone problem phases (equate → combine → simplify), active chip uses `--tool-active` yellow.
  - Source: D12 derived (Pass 1 finding 1.2).
  - Verify: phase advances visually as each completion check fires.
- [ ] **T25 (P2)** — `ToolPanel.tsx` + `styles.css` — Replace `🧴` emoji glue icon with a hand-drawn SVG matching mushroom aesthetic.
  - Source: Design Pass 4, finding 4.2.
  - Verify: glue tool icon style-matches mushrooms; no emoji in the toolbar.
- [ ] **T26 (P2)** — `styles.css` (existing) — Raise touch target floor: change `clamp(20px, 4vmin, 44px)` → `clamp(44px, 5vmin, 56px)` across `.tool-btn` and similar. WCAG 2.5.5 compliance.
  - Source: Design Pass 6, finding 6.1. Tablet-first product.
  - Verify: every tool/button is ≥44px on the smallest target viewport.
- [ ] **T27 (P3)** — `styles.css` — Add `:focus-visible` outline (2px `--tool-active`, 2px offset) across interactive elements.
  - Source: Design Pass 6, finding 6.2. Low priority on tablet-first product.

### Flagged but out of scope here

- [ ] **T16 (P3)** — Separate spec — Decide v1 analytics strategy for the three strategy-doc metrics.
- [ ] **T17 (P3)** — Implementation-time — Verify whether `App.tsx` persists module progress; if yes, plan migration for T8.
- [ ] **T28 (P3)** — Future `/design-consultation` pass — Establish DESIGN.md with full token system (`--space-*`, `--radius-*`, `--font-*`), `prefers-color-scheme: light` support, and any typeface validation/swap.

---

## Deferred test debt (per D10)

D10 deferred adding a test framework. The following coverage gaps are logged so the work can be picked up cleanly when test infra lands:

- **fractions.ts:** every exported function is currently un-asserted (~360 LOC of pure math). Highest leverage backfill target.
- **TwoFractionsCanvas (new):** independent toolbars, displayed-denom equality, drag-handle gating, drop → collapse.
- **Capstone random generator (D5):** dedup, denom-difference, complexity cap, generator-loop termination (100-attempt cap).
- **Multi-phase test harness:** per-phase advancement, completion check firing, state cleanup between problems.
- **`'simplest-form'` detector:** guard against num=0 / denom=0.
- **Mushroom gating per concept:** ×7 and ×11 hidden in lessons that haven't unlocked them.
- **Cross-lesson regression:** changing the prime-dividing module (to add divisibility-7/11) shouldn't break `gcf-venn` or `factors-of-one`.

Suggested framework when picked up: **Vitest + @testing-library/react** (boring default for Vite projects, zero innovation token spent).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR (HOLD) | 6 decisions made, 0 unresolved, 0 critical gaps. |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | Not run (no codex tooling locally). |
| Eng Review | `/plan-eng-review` | Architecture & tests | 1 | CLEAR with 1 deferred | 4 decisions made (D7–D10). D7 revised D4 (reuse Multipliers, drop new ops); D8 expanded palette + added divisibility-7/11; D9 picked single-fraction collapse for combine; D10 DEFERRED tests. Test coverage diagram produced as deferred-debt registry (0/27 paths). |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | Initial 5/10 → final 8/10. 7 design decisions made (D11–D17). Tablet-first product confirmed; new memory saved. Two-fraction layout = equation form; compound matched-bases cue; meaningful end-card; Nunito typography; ×11 purple + spot-count + shape-per-prime; immediate touch drag with match-gating. 11 new implementation tasks (T18–T28). Zero critical gaps. |
| DX Review | `/plan-devex-review` | Developer experience | 0 | — | N/A — student-facing product. |

**UNRESOLVED:** 1 — D10 (test framework) deferred against stated "well-tested code is non-negotiable" preference. Revisit post-ship.
**VERDICT:** CEO + ENG + DESIGN CLEARED — spec is ready for implementation. T18–T24 (P1 design tasks) plus T4/T5 (P1 canvas+drag tasks) plus T8–T12 (P1 lesson content) form the critical path to ship.
