// Per-concept mastery tracking (Batch E / T15).
//
// Lesson concepts: completing once = mastered.
// `final-assessment`: passed within the first 2 attempts = mastered;
//                     passed on attempt 3+ = passed-with-reps.
//
// Mastery state shape: { [conceptId]: { firstCompletedAt, attempts } } under
// MASTERY_KEY. The capstone attempt counter persists separately under
// CAPSTONE_ATTEMPTS_KEY so a student who reloads mid-capstone stays on
// attempt N. Analytics emission is Batch G, not this module.

import { V2ConceptId } from './v2lessons';

const MASTERY_KEY = 'fractical:mastery';
const CAPSTONE_ATTEMPTS_KEY = 'fractical:capstoneAttempts';
const MASTERY_ATTEMPT_LIMIT = 2;

export type MasteryStatus =
  | 'unstarted'
  | 'in-progress'
  | 'mastered'
  | 'passed-with-reps';

type MasteryEntry = { firstCompletedAt: number; attempts: number };
type MasteryState = Partial<Record<V2ConceptId, MasteryEntry>>;

const readState = (): MasteryState => {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as MasteryState) : {};
  } catch {
    return {};
  }
};

const writeState = (state: MasteryState): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be full or disabled; mastery is best-effort.
  }
};

// Record that a concept was just completed on the given attempt number.
// Lesson concepts pass attemptCount = 1. final-assessment passes the running
// capstone attempt count (1 = first try). firstCompletedAt is sticky across
// re-recordings so the first-completion timestamp survives reps.
export const recordMastery = (
  conceptId: V2ConceptId,
  attemptCount: number,
): void => {
  const state = readState();
  const existing = state[conceptId];
  const firstCompletedAt = existing?.firstCompletedAt ?? Date.now();
  state[conceptId] = { firstCompletedAt, attempts: attemptCount };
  writeState(state);
};

export const getMasteryStatus = (conceptId: V2ConceptId): MasteryStatus => {
  const entry = readState()[conceptId];
  if (!entry) return 'unstarted';
  if (conceptId === 'final-assessment') {
    return entry.attempts <= MASTERY_ATTEMPT_LIMIT ? 'mastered' : 'passed-with-reps';
  }
  return 'mastered';
};

export const clearMastery = (): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(MASTERY_KEY);
    localStorage.removeItem(CAPSTONE_ATTEMPTS_KEY);
  } catch {
    // Ignore — best-effort cleanup.
  }
};

// ---- Capstone attempt counter ---------------------------------------------

const readCapstoneAttempts = (): number => {
  if (typeof localStorage === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(CAPSTONE_ATTEMPTS_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
};

// Bump the capstone attempt counter and return the new value. Call exactly
// once per capstone completion so the next try is recorded as attempt N+1.
export const incrementCapstoneAttempts = (): number => {
  const next = readCapstoneAttempts() + 1;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CAPSTONE_ATTEMPTS_KEY, String(next));
    } catch {
      // Ignore — best-effort.
    }
  }
  return next;
};

export const getCapstoneAttempts = (): number => readCapstoneAttempts();
