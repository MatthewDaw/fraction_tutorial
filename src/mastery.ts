// Per-concept mastery tracking.
//
// Lesson concepts: completing once = mastered.
// `final-assessment`: passed within the first 2 attempts = mastered;
//                     passed on attempt 3+ = passed-with-reps.
//
// The capstone attempt counter persists separately so a student who reloads
// mid-capstone stays on attempt N.

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

// localStorage may be unavailable (SSR), full, or disabled. Mastery is
// best-effort: read failures yield the fallback, writes silently no-op.
const safely = <T>(fn: () => T, fallback: T): T => {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
};

const readState = (): MasteryState =>
  safely(() => {
    const raw = localStorage.getItem(MASTERY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as MasteryState) : {};
  }, {});

const writeState = (state: MasteryState): void => {
  safely(() => localStorage.setItem(MASTERY_KEY, JSON.stringify(state)), undefined);
};

// firstCompletedAt is sticky across re-recordings so the first-completion
// timestamp survives reps. Lesson concepts pass attemptCount = 1;
// final-assessment passes the running capstone attempt count.
export const recordMastery = (
  conceptId: V2ConceptId,
  attemptCount: number,
): void => {
  const state = readState();
  const firstCompletedAt = state[conceptId]?.firstCompletedAt ?? Date.now();
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
  safely(() => {
    localStorage.removeItem(MASTERY_KEY);
    localStorage.removeItem(CAPSTONE_ATTEMPTS_KEY);
  }, undefined);
};

const readCapstoneAttempts = (): number =>
  safely(() => {
    const raw = localStorage.getItem(CAPSTONE_ATTEMPTS_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }, 0);

// Call exactly once per capstone completion so the next try is recorded
// as attempt N+1.
export const incrementCapstoneAttempts = (): number => {
  const next = readCapstoneAttempts() + 1;
  safely(() => localStorage.setItem(CAPSTONE_ATTEMPTS_KEY, String(next)), undefined);
  return next;
};

export const getCapstoneAttempts = (): number => readCapstoneAttempts();
