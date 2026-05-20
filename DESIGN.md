---
name: fraction-tutorial-ui
last_updated: 2026-05-20
status: working doc (Batch H baseline)
---

# fraction-tutorial-ui Design System

This is the working source of truth for visual decisions in
fraction-tutorial-ui. It formalizes the implicit system that grew
inside `src/styles.css` so future work has a stable reference.

> **Scope of this baseline.** Batch H is a **token-extraction +
> light-mode-additive** pass. It did NOT redesign the look-and-feel;
> the dark theme that just shipped is the baseline. Everything below
> describes what's actually in the file today plus the light-mode
> overlay that ships with Batch H.

---

## Aesthetic baseline

- **Dark theme primary.** Near-black outer frame, deep navy canvas
  (`#0c1a30`), warm yellow accent (`#ffd24a`). The yellow drives almost
  every CTA, focus ring, and "active" state.
- **Hand-drawn mushrooms as the playful counterweight.** Prime-factor
  multipliers are rendered as cartoon mushrooms (red `×2`, green `×3`,
  yellow `×5`, cyan `×7`, purple `×11`). The mushroom palette is the
  product's character — it stays identical in both light and dark mode
  because the mushrooms are objects, not theme chrome.
- **Friendly, curious tone.** Animations are bouncy (cubic-bezier
  overshoots), copy is conversational, errors shake rather than scold.

---

## Audience

- **Tablet-first, touch-only.** No keyboard assumptions. WCAG 2.5.5
  touch-target floor (44px) enforced on every interactive control.
- **Grades 4–6 learning fraction addition.** Self-paced learners
  hiring the app to work through prime → common-factor → base-equating
  → addition. The visual system has to feel like a game, not a
  worksheet, while staying legible enough that a parent or teacher
  watching over the shoulder reads it as "real".
- **Sometimes school-issued tablets force light mode.** Hence the
  light-mode override (additive, not a redesign).

---

## Typography

- **Family:** Nunito (installed by Batch D via `@fontsource/nunito`),
  fallback to system stacks.
- **Weights in use:**
  - `400` — body text, button labels.
  - `600` — captions, tabs, secondary headings, button text in chrome.
  - `700` / `800` / `900` — prompts, scores, mushroom-tag numerals.
- **Why Nunito stays.** It reads well at the wide font-size range
  (9px–64px) the lessons demand, has a rounded geometric character
  that pairs with the mushrooms, and is variable so the build is
  cheap. The `/design-consultation` skill recommends re-evaluating
  alternatives (Fraunces for warmer, Sour Gummy for more playful)
  as future work — see *Open questions*.

---

## Spacing scale

Defined in `:root` as `--space-1`…`--space-13`. Covers every padding,
margin, and gap value currently in the file with **one snap**: a 22px
chip min-height was rounded up to 24px (`--space-11`) to avoid adding
a single-use token. Visual delta: 2px taller hit area, no other
effect.

| Token         | Value | Primary uses |
|---------------|-------|--------------|
| `--space-1`   | 2px   | Tightest gap; tiny micro-margins. |
| `--space-2`   | 4px   | Inline gaps; tag→letter spacing; small offsets. |
| `--space-3`   | 6px   | Chip gaps; mushroom-button padding. |
| `--space-4`   | 8px   | Standard inline gap; button gap; chip column gap. |
| `--space-5`   | 10px  | Small padding; question-card concept select padding. |
| `--space-6`   | 12px  | Default block padding; component gap baseline. |
| `--space-7`   | 14px  | Larger block padding; lesson-guess choices. |
| `--space-8`   | 16px  | Body container padding; common-canvas side padding. |
| `--space-9`   | 18px  | Question-card stack gap; strip-canvas target padding. |
| `--space-10`  | 20px  | Worksheet horizontal padding. |
| `--space-11`  | 24px  | Canvas-panel padding; section spacing; (22px snaps here). |
| `--space-12`  | 28px  | Capstone card horizontal padding; strip-row split gap. |
| `--space-13`  | 32px  | Capstone card vertical padding; hero spacing. |

**Snap policy.** If you find yourself reaching for a value that isn't
on the scale, ask: would adding the token be honest (it really IS a
distinct visual rhythm), or am I avoiding a 2px delta that doesn't
matter? Lean toward snapping; only add tokens when the value reflects
a real intent.

---

## Radius scale

`--radius-xs`…`--radius-4xl` + `--radius-pill`. Snaps from the
original literals:
- 7px → 8px (`--radius-lg`) on `.app-tab`
- 9px → 8px (`--radius-lg`) on the mushroom cap context — N/A, exempted
- 11px → 12px (`--radius-2xl`) on the mushroom cap context — N/A, exempted

The mushroom cap silhouettes (`border-radius: 9px 9px 3px 3px / 12px
12px 2px 2px`) and stem (`2px 2px 3px 3px`) keep their literal
elliptical values. These are illustration paint — snapping them to
the radius scale would deform the icon. See *Illustration exception*.

| Token          | Value | Primary uses |
|----------------|-------|--------------|
| `--radius-xs`  | 2px   | Hairline rounding (e.g., the operator-bar). |
| `--radius-sm`  | 4px   | Tight chips, tag inner pill, fraction-box. |
| `--radius-md`  | 6px   | Inputs (select), two-fraction box. |
| `--radius-lg`  | 8px   | Default button radius; most controls. |
| `--radius-xl`  | 10px  | Medium card surfaces (fraction-pad display, lesson-next). |
| `--radius-2xl` | 12px  | Tool panel, factor-list panel, common-canvas zones. |
| `--radius-3xl` | 14px  | Test-choice tiles, worksheet container. |
| `--radius-4xl` | 16px  | Capstone end-card. |
| `--radius-pill`| 999px | Worksheet submit, phase chips, prime-chip. |

---

## Font-size scale

Numeric token names (`--font-size-9`…`--font-size-64`) intentionally
mirror their px values. We considered t-shirt names (xs/sm/md/…) but
the range (9..64) and the high variance (15 vs 16 vs 17 all in use)
meant snapping would create visible deltas on text. Honest numeric
tokens preserve pixel-parity in dark mode.

Primary use cases:

| Token              | Value | Primary uses |
|--------------------|-------|--------------|
| `--font-size-9`    | 9px   | Mushroom-chip exponent superscript. |
| `--font-size-10`   | 10px  | Piece-tag exponent label. |
| `--font-size-11`   | 11px  | Step-label; mushroom-btn label. |
| `--font-size-12`   | 12px  | Concept label, badges, chips. |
| `--font-size-13`   | 13px  | Tabs, captions, factor-list title. |
| `--font-size-14`   | 14px  | Button text, body in chrome. |
| `--font-size-15`   | 15px  | Worksheet title, test-choice, primary chips. |
| `--font-size-16`   | 16px  | Default body. |
| `--font-size-17`   | 17px  | Lesson-guess choice (yes/no). |
| `--font-size-18`   | 18px  | Larger body; explanation text. |
| `--font-size-20`   | 20px  | Worksheet mark; fraction-pad keys. |
| `--font-size-22`   | 22px  | Question prompt. |
| `--font-size-28`   | 28px  | Fraction-pad slot. |
| `--font-size-38`   | 38px  | Worksheet number. |
| `--font-size-40`   | 40px  | Capstone score separator/denominator. |
| `--font-size-64`   | 64px  | Capstone hero score numerator. |

`clamp()` font-sizes (responsive heroes like the number-display digit)
are intentionally left as inline `clamp(min, vw, max)` — they describe
responsive behavior, not a discrete scale step. Same for the
sometimes-tokenless tile dimensions (`clamp(28px, 5.6vmin, 56px)`).

---

## Color tokens

### Existing 10 (unchanged in dark mode)

| Token           | Dark      | Light      | Use |
|-----------------|-----------|------------|-----|
| `--bg-outer`    | `#000`    | `#f7f7f7`  | App frame / header. |
| `--bg-canvas`   | `#0c1a30` | `#e8edf3`  | Lesson canvas. |
| `--bg-chat`     | `#050505` | `#ffffff`  | Chat panel. |
| `--text`        | `#fff`    | `#1a1a1a`  | Primary body color. |
| `--tool-bg`     | `#f7f7f7` | `#eaeaea`  | Tool panel surface. |
| `--tool-fg`     | `#1a1a1a` | `#1a1a1a`  | Tool icon/text color (same in both). |
| `--tool-active` | `#ffd24a` | `#ffd24a`  | Yellow accent (same in both). |
| `--piece-border`| white-85% | black-55%  | Outline on fraction pieces. |
| `--selected-ring`| `#ffd24a`| `#ffd24a`  | Selection halo (same in both). |

### Grayscale ramp (flips in light mode)

`--gray-100` through `--gray-950`. In dark mode this ramps light-to-dark
(`#eee` … `#1a1a1a`). In light mode it inverts so secondary text
stays readable on light surfaces.

### Semantic feedback colors (same in both modes)

- `--success` `#4ade80`, plus `-deep`/`-shade`/`-ink`/`-pale`/`-soft`/`-mint`
- `--warning` `#ffa657`, plus `-deep`/`-ink`
- `--danger` `#ef4444`, plus `-mid`/`-pink`/`-pink-soft`/`-deep`/`-pale`
- `--info` `#7dd3fc`, plus `-strong`/`-light`/`-mute`/`-cool`/`-text` and
  surface variants (`-surface`, `-surface-strong`, `-border`, `-ink`).

These have been verified contrasting on both palettes for the most
common surfaces. The info family is re-balanced in light mode (lighter
backgrounds, darker text) so the factor-list chips and common-canvas
headings stay legible.

### Brand accents (same in both modes)

- `--accent-yellow` `#ffd24a`, `--accent-yellow-hover`, `--accent-yellow-pale`
- `--accent-orange` `#ff8e3c`, `--accent-orange-deep` `#ff5d8f` (the
  pink end of the lesson-next CTA gradient)
- `--ink-on-light` `#1a1a1a` — stable ink for content sitting ON
  saturated brand colors (yellow CTA, orange-pink gradient). Never
  flips because the surface doesn't flip.
- `--ink-on-dark` `#fff` — stable white ink for content on dark
  saturated surfaces (lesson-next gradient text).

### Mushroom palette (same in both modes)

The product's playful accent system. Each prime has a `cap` color and
a `cap-shade` for the inner shadow:

| Prime | Cap        | Cap shade  | Character |
|-------|------------|------------|-----------|
| `×2`  | `#e63946`  | `#a31726`  | Red — the most common multiplier. |
| `×3`  | `#2ecc71`  | `#1f8a4d`  | Green — second most common. |
| `×5`  | `#ffcb05`  | `#c79a00`  | Yellow — matches the brand accent. |
| `×7`  | `#4cc9f0`  | `#1f8db0`  | Cyan — Lane B addition. |
| `×11` | `#a259ff`  | `#6a2eb8`  | Purple — Lane B addition. |

Shared mushroom stem: `--mushroom-stem` `#fff4d6` with
`--mushroom-stem-shade` `#e0c98a`. These read fine on both backgrounds.

### Illustration paint exception

A handful of literals are explicitly NOT tokenized:

- **Mushroom cap silhouettes** — elliptical `border-radius: 9px 9px 3px
  3px / 12px 12px 2px 2px` and `2px 2px 3px 3px` shape the cap and stem.
  Snapping these to the radius scale would deform the icon. Same logic
  for spot dimensions (`width: 4px; height: 3px`) — pixel art.
- **Shadow offsets/blurs** in `box-shadow`, `text-shadow`,
  `filter: drop-shadow()` — micro-effects, not structural spacing.
- **Keyframe `translate(...)`** offsets — animation paint, not layout.
- **1px hairline margins** like `margin-bottom: 1px` on the piece-tag
  exp — decorative micro-offsets that don't belong on the spacing
  scale.

If you find yourself adding a new literal of these kinds, follow the
same logic; if you're tempted to add a new tokenizable size or color,
extend `:root` instead.

---

## Component dimensions

Pixel sizes that aren't on the spacing scale (icon button widths,
hammer-reveal flourishes, etc.) live in `--size-*` tokens named by
their numeric value. This makes them easy to find and audit but
doesn't pretend they fall on a unified rhythm.

| Token       | Value | Notes |
|-------------|-------|-------|
| `--size-3`  | 3px   | Bar/rule thickness (fraction bar, two-fraction bar). |
| `--size-12` | 12px  | Mushroom-stem width; mushroom-cap height. |
| `--size-18` | 18px  | Mushroom-icon width; capstone bar min-width; venn-tile half-offset. |
| `--size-20` | 20px  | Phase-chip number circle. |
| `--size-22` | 22px  | Piece-tag width. |
| `--size-24` | 24px  | Worksheet check square. |
| `--size-32` | 32px  | Factor-chip size; phase-chip min-height. |
| `--size-36` | 36px  | Icon button; venn-tile. |
| `--size-40` | 40px  | Piece-crack hit strip. |
| `--size-44` | 44px  | WCAG 2.5.5 touch target floor. |
| `--size-64` | 64px  | Fraction-pad bar width. |
| `--size-80` | 80px  | Fraction-pad slot min-width. |
| `--size-84` | 84px  | Tool-panel width. |
| `--size-120`–`--size-760` | various | Hero canvas dimensions (hammer-reveal, common-canvas max sizes). |

Stroke widths get their own scale: `--stroke-1` (1px), `--stroke-1-5`
(1.5px), `--stroke-2`, `--stroke-3`, `--stroke-4`.

---

## Motion

Hand-tuned per component; no global motion system yet. Existing
transition durations:

- **80ms** — tactile press feedback (worksheet cell, capstone CTA active).
- **100ms / 120ms** — hover state transitions on most chips/buttons.
- **140ms / 150ms** — color/border-color transitions.
- **180ms** — gradient/box-shadow transitions on bigger pieces.
- **200ms** — snap-back (two-fraction drag), color flip (operator).
- **320ms / 360ms** — bounce-in (piece-split crack-grow, factor-chip pop).
- **380ms** — shake (incorrect feedback, piece-leaf--blocked).
- **600ms** — smash-text letter bounce loop.
- **1400ms / 1600ms / 1800ms** — ambient pulses (dot-valid-pulse,
  strip-armed-pulse, highlighted-pulse, dot-cluster-badge-pop, etc.).

**`prefers-reduced-motion` support** is consistent across the file:
every animation has a corresponding `@media (prefers-reduced-motion:
reduce)` block that either drops the animation entirely or keeps the
informative end-state without the motion. Maintain this discipline
when adding new animations.

---

## Open questions

These are deferred to a future `/design-consultation` pass:

1. **Typeface re-evaluation.** Nunito is solid but the design review
   surfaced Fraunces (warmer serif) and Sour Gummy (more playful) as
   contenders. The "what aesthetic do tablet-bound 4th-graders respond
   to?" question deserves its own consultation, not a coordinator
   default.
2. **Light-mode color contrast verification.** The light-mode palette
   in Batch H was derived defensively (inverting the gray ramp, picking
   blue-tinted info surfaces). It has not been measured against WCAG
   AA on every text/background pair, and the mushroom palette has not
   been re-checked on `#e8edf3` canvas.
3. **Tool-panel width 84px.** A one-off; not on any scale. Should we
   reflow tool buttons so the panel can pick a tokenized width?
4. **Spacing snap @ 22→24.** Acceptable today (chip min-height); revisit
   if the chip needs to actually clamp at 22.
5. **Glue tool icon.** Lane A's hand-drawn replacement shipping
   separately. After it lands, audit whether `.fraction-box--glue
   .piece-crack` colors still feel right.
6. **Motion system.** Durations are hand-tuned per component. A future
   pass could collapse them into ~3 named timing tokens with explicit
   curves.

---

## File map

- `src/styles.css` — single source for CSS. All tokens live in the
  `:root` block at the top; the light-mode override sits immediately
  below it. Component rules below that reference tokens only (with
  the illustration-paint exception noted above).
- `DESIGN.md` — this doc.
