# Batch D — Design polish

**Status:** next | **Priority:** P1 | **Blocks:** Batch E (loosely) | **Parallel with:** Batch C

## Goal

Three design-system fixes that landed in the `/plan-design-review` decisions but didn't get implemented in Lanes A or B. None touch lesson content; all are CSS/dependency changes.

## Read first

- `LESSONS.md` — D15 (typography), Pass 6 derived items (touch targets, focus-visible).
- `src/styles.css` lines 1–30 — current `:root` tokens and the system font stack to replace.
- `package.json` — for the @fontsource dep add.

## Tasks (from `LESSONS.md` implementation table)

### T22 — Nunito typography (per D15)

1. Install `@fontsource/nunito` (weights 400, 600, 700). Optional: `@fontsource/source-code-pro` (weight 400) for math-feel fraction numerals.
   ```bash
   npm install @fontsource/nunito
   ```
2. Import in `src/main.tsx`:
   ```ts
   import '@fontsource/nunito/400.css';
   import '@fontsource/nunito/600.css';
   import '@fontsource/nunito/700.css';
   ```
3. In `src/styles.css:22`, replace the system font stack:
   ```css
   /* before */
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   /* after */
   font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   ```
   (Keep the fallback chain so the page renders before the @fontsource CSS resolves.)

### T26 — Touch target floor (per Pass 6 finding 6.1)

In `src/styles.css`, find every `clamp(..., 4vmin, 44px)` (or similar) and raise the minimum to 44px. The `.tool-btn`-family classes are the priority. New value:
```css
clamp(44px, 5vmin, 56px)
```
WCAG 2.5.5 requires 44×44 minimum. The product is tablet-first per the saved memory; every tap target matters.

### T27 — Focus-visible outlines (per Pass 6 finding 6.2)

In `src/styles.css`, add a global focus-visible style for interactive elements:
```css
/* === Batch D: focus rings === */
:focus-visible {
  outline: 2px solid var(--tool-active);
  outline-offset: 2px;
}
button:focus-visible,
[role="button"]:focus-visible {
  outline-offset: 3px;
}
/* === END Batch D: focus rings === */
```
Low priority on a tablet-first product but cheap to include; some kids use Bluetooth keyboards occasionally.

## Hard constraints

- **DO NOT** touch `src/v2lessons.ts`, `src/App.tsx`, `src/TwoFractionsCanvas.tsx`, `src/MultiplierPanel.tsx`, `src/fractions.ts`. Lesson content is Batch C's territory; integration is Batch E's.
- **styles.css coordination:** if you add new top-level rules, wrap them in `/* === Batch D: <topic> === */ ... /* === END Batch D === */` to keep merges mechanical. Edits to existing rules (like swapping the font stack or raising touch targets) don't need sentinels — they're in-place.

## Verify before commit

```bash
npx tsc --noEmit
npm run build
```

Visit the dev server. Nunito should be rendering. Touch a button on a real tablet (or simulate touch) — the target should feel right-sized. Tab through interactive elements with a real keyboard — every focused element should have a visible yellow ring.

## Commit

```bash
git commit -m "Batch D: Nunito typography (D15), 44px touch target floor (Pass 6 a11y), focus-visible outlines"
```
