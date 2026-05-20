# Batch G — Analytics

**Status:** P3 (post-ship) | **Reverses:** Section 8 deferral from CEO review

## Goal

`STRATEGY.md` commits to three metrics:
- Final-assessment pass rate
- Per-concept mastery rate
- Lesson completion rate

The app has no analytics today. Batch E added local per-concept mastery recording via `localStorage` (so a single device knows its own state). This batch wires it up so the team can actually read the metric numbers across all students.

This is a STRATEGY-level decision, not a LESSONS-level one — the right answer depends on context the doc doesn't pin down: is there a backend? Is this product going through a teacher dashboard? Is each tablet anonymous? The first part of this batch is **deciding the path**.

## Read first

- `STRATEGY.md` — the three key metrics + the "assessment & weakness tracking" track
- `LESSONS.md` — "Out of scope for LESSONS.md" item #6 (analytics infrastructure)
- `src/mastery.ts` (from Batch E) — what's being recorded locally today

## Decisions to make first

Before any code, decide:

1. **Where does the data go?**
   - **Local-only** with an export button: simplest; teacher emails CSVs to admin; no infra. Right for v1 single-tablet pilots.
   - **Backend** (Supabase, Firebase, custom): centralized; teacher dashboard possible; needs auth/identity model.
   - **Hybrid**: local primary, periodic upload to a backend when network is available. Right for classroom tablets with intermittent wifi.

2. **What identity model?**
   - Anonymous (per-device only)
   - Pseudonymous (student picks a name / avatar at start)
   - Authenticated (teacher provisions accounts)

3. **What events get emitted?**
   - Minimum: lesson_started, lesson_completed, capstone_attempted (with score)
   - Optional: per-step events (each split, each scale, each merge) — much higher volume

These are STRATEGY decisions; recommend running `/plan-ceo-review` against this batch's pre-spec instead of brainstorming inline.

## Once decisions are made

### Path: Local-only with CSV export (simplest)

- Extend `src/mastery.ts` to record events as `localStorage` entries: `{ ts, type, conceptId, attemptCount, score }`
- Add a hidden admin route (e.g. triple-tap on the header) that opens an "Export progress" button
- Export downloads a CSV
- Teacher runs the export at the end of class

### Path: Backend (Supabase)

- `npm install @supabase/supabase-js`
- Create a `students`, `attempts`, `concept_mastery` schema in Supabase
- Add a thin `src/analytics.ts` wrapping the Supabase client
- Fire-and-forget event emission from the same call sites as `recordMastery`
- Build a minimal teacher dashboard page (Supabase Auth + a table view)

### Path: Hybrid

- Both of the above, with a sync job that POSTs `localStorage` events to the backend when `navigator.onLine` is true

## Hard constraints

- **PII / FERPA:** if students are identifiable, the data is education records. Adding a backend requires thinking about parental consent, data retention, and (in many districts) FERPA compliance. Local-only sidesteps almost all of this for v1.
- **Tablet-first env:** the app runs on tablets with intermittent network. Don't rely on synchronous event posting in the critical path of a lesson interaction.

## Verify

- Walk through a full concept; confirm an event was recorded
- (Backend) Confirm an event arrived server-side within ~5s
- (Local) Confirm the CSV export contains the expected event for the walk-through

## Commit

```bash
git commit -m "Batch G: v1 analytics for the three strategy metrics (<chosen-path>)"
```
