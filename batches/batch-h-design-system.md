# Batch H — Design system

**Status:** P3 (post-ship) | **Reverses:** T28 (Pass 5 design review)

## Goal

The project has an implicit visual system in `styles.css` but no `DESIGN.md`. The design review surfaced several deferred items:
- Full color token system (`--space-*`, `--radius-*`, `--font-*` formalization)
- Light-mode support (`prefers-color-scheme: light`)
- Typeface validation (Batch D installed Nunito; this batch validates it works at scale and considers alternatives if needed)
- Spacing scale formalization
- Glue tool icon (Lane A's hand-drawn replacement is shipping — re-evaluate if needed)

The right vehicle for this batch is the `/design-consultation` gstack skill, which produces a full DESIGN.md.

## Read first

- `STRATEGY.md` — for product positioning context the design system should serve
- `src/styles.css` — current implicit system
- The eng + design review entries in `LESSONS.md` — for what was deferred and why

## Tasks

### Run `/design-consultation`

The skill walks through:
1. Product understanding (audience: tablets, kids ~grade 4–6 learning fractions)
2. Aesthetic direction (current vibe is dark theme + hand-drawn mushrooms — keep or pivot?)
3. Typography validation (Nunito vs alternatives — Fraunces for warmer, Sour Gummy for more playful)
4. Color system (currently single yellow accent — expand or stay minimal?)
5. Layout grid + spacing scale
6. Motion principles (transitions, micro-animations)
7. Generates DESIGN.md as the canonical source of truth

### Apply learnings to `styles.css`

After DESIGN.md is written:
- Formalize tokens: `--space-1`/`-2`/`-3`/etc., `--radius-sm`/`-md`/`-lg`, `--font-size-*`
- Replace ad-hoc px and clamp values with token references
- Add `prefers-color-scheme: light` overrides (CEO/design review flagged this; school-issued tablets sometimes enforce light mode)

### Light-mode support

A light-mode variant of the existing dark palette. Suggested mapping:
- `--bg-outer: #000` → `--bg-outer: #f7f7f7`
- `--bg-canvas: #0c1a30` → `--bg-canvas: #e8edf3` (or similar warm light)
- `--text: #fff` → `--text: #1a1a1a`
- Mushroom colors stay the same; their contrast against the new background needs checking

Apply via `@media (prefers-color-scheme: light) { :root { /* ... */ } }`.

### Token migration

This is grunt work but small with CC. Find every literal color/spacing value in `styles.css` and replace with a token reference. After this batch the file should have approximately zero raw hex codes outside the `:root` block.

## Hard constraints

- **DO NOT** ship a redesign that changes the existing dark-theme look-and-feel. The product just shipped to users; whatever palette and aesthetic they're using now is the baseline. Light mode is additive, not a replacement.
- **DO NOT** rename existing CSS classes. Keep the BEM-ish convention. New tokens are additive; renames are out of scope.

## Verify

- Toggle OS-level light/dark mode (System Preferences > Appearance) and confirm both modes render legibly
- Sample contrast ratios on the most important text (lesson prompt, score number, button labels) in both modes — WCAG AA wants 4.5:1 for body text
- Walk through a lesson in light mode to spot any hard-coded dark-theme assumptions that bled past the tokens

## Commit

```bash
git commit -m "Batch H: DESIGN.md, full token system, light-mode support (reverses T28 deferral)"
```
