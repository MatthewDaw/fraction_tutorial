import { beforeEach, describe, expect, it } from 'vitest';
import { clearEvents, getAllEvents } from './analytics';
import {
  clearMastery,
  getMasteryStatus,
  recordMastery,
} from './mastery';

describe('mastery module', () => {
  beforeEach(() => {
    clearMastery();
    clearEvents();
  });

  describe('getMasteryStatus', () => {
    it('returns "unstarted" for a concept never recorded', () => {
      expect(getMasteryStatus('divide-by-2')).toBe('unstarted');
    });

    it('returns "mastered" after a single recordMastery for a lesson concept', () => {
      recordMastery('divide-by-2', 1);
      expect(getMasteryStatus('divide-by-2')).toBe('mastered');
    });

    it('treats final-assessment passed on attempt 1 as "mastered"', () => {
      recordMastery('final-assessment', 1);
      expect(getMasteryStatus('final-assessment')).toBe('mastered');
    });

    it('treats final-assessment passed on attempt 2 as "mastered"', () => {
      recordMastery('final-assessment', 2);
      expect(getMasteryStatus('final-assessment')).toBe('mastered');
    });

    it('treats final-assessment passed on attempt 3 as "passed-with-reps"', () => {
      recordMastery('final-assessment', 3);
      expect(getMasteryStatus('final-assessment')).toBe('passed-with-reps');
    });

    it('treats final-assessment passed on attempt 5 as "passed-with-reps"', () => {
      recordMastery('final-assessment', 5);
      expect(getMasteryStatus('final-assessment')).toBe('passed-with-reps');
    });
  });

  describe('recordMastery persistence', () => {
    it('writes to localStorage and round-trips via getMasteryStatus', () => {
      recordMastery('divisibility-7', 1);
      const raw = localStorage.getItem('fractical:mastery');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed['divisibility-7']).toBeDefined();
      expect(parsed['divisibility-7'].attempts).toBe(1);
      expect(typeof parsed['divisibility-7'].firstCompletedAt).toBe('number');
      expect(getMasteryStatus('divisibility-7')).toBe('mastered');
    });

    it('preserves the original firstCompletedAt on subsequent recordMastery calls', () => {
      recordMastery('final-assessment', 1);
      const firstAt = JSON.parse(localStorage.getItem('fractical:mastery')!)[
        'final-assessment'
      ].firstCompletedAt;
      // Force the clock to advance so a naive re-stamp would differ.
      const later = firstAt + 10_000;
      const realNow = Date.now;
      Date.now = () => later;
      try {
        recordMastery('final-assessment', 3);
      } finally {
        Date.now = realNow;
      }
      const after = JSON.parse(localStorage.getItem('fractical:mastery')!)[
        'final-assessment'
      ];
      expect(after.firstCompletedAt).toBe(firstAt);
      expect(after.attempts).toBe(3);
      expect(getMasteryStatus('final-assessment')).toBe('passed-with-reps');
    });

    it('tracks multiple concepts independently', () => {
      recordMastery('divide-by-2', 1);
      recordMastery('divisibility-5', 1);
      expect(getMasteryStatus('divide-by-2')).toBe('mastered');
      expect(getMasteryStatus('divisibility-5')).toBe('mastered');
      expect(getMasteryStatus('divide-by-3')).toBe('unstarted');
    });
  });

  describe('clearMastery', () => {
    it('resets every recorded concept back to "unstarted"', () => {
      recordMastery('divide-by-2', 1);
      recordMastery('final-assessment', 1);
      clearMastery();
      expect(getMasteryStatus('divide-by-2')).toBe('unstarted');
      expect(getMasteryStatus('final-assessment')).toBe('unstarted');
      expect(localStorage.getItem('fractical:mastery')).toBeNull();
    });
  });

  describe('corrupt localStorage', () => {
    it('treats malformed JSON as empty state (no throw)', () => {
      localStorage.setItem('fractical:mastery', '{not json');
      expect(getMasteryStatus('divide-by-2')).toBe('unstarted');
    });
  });

  describe('analytics wire', () => {
    it('emits a lesson_completed event for a lesson concept', () => {
      recordMastery('divide-by-2', 1);
      const events = getAllEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ type: 'lesson_completed', conceptId: 'divide-by-2' });
    });

    it('emits a capstone_attempted event with attemptCount for final-assessment', () => {
      recordMastery('final-assessment', 3);
      const events = getAllEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ type: 'capstone_attempted', attemptCount: 3 });
    });
  });
});
