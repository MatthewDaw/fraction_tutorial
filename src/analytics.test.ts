import {
  AnalyticsEvent,
  clearEvents,
  exportEventsAsCSV,
  getAllEvents,
  recordAnalyticsEvent,
} from './analytics';

const STORAGE_KEY = 'fractical:analytics:events';

// Every test starts from an empty store — analytics writes to localStorage,
// which jsdom persists across tests in the same file.
beforeEach(() => {
  clearEvents();
});

const evt = (overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent => ({
  ts: 1_700_000_000_000,
  type: 'lesson_started',
  ...overrides,
});

describe('recordAnalyticsEvent', () => {
  it('round-trips a single event through localStorage', () => {
    const event = evt({ type: 'lesson_completed', conceptId: 'primes' });
    recordAnalyticsEvent(event);
    expect(getAllEvents()).toEqual([event]);
  });

  it('accumulates multiple events in insertion order', () => {
    const a = evt({ ts: 1, type: 'lesson_started', conceptId: 'primes' });
    const b = evt({ ts: 2, type: 'lesson_completed', conceptId: 'primes' });
    const c = evt({ ts: 3, type: 'capstone_attempted', score: 4, attemptCount: 1 });
    recordAnalyticsEvent(a);
    recordAnalyticsEvent(b);
    recordAnalyticsEvent(c);
    expect(getAllEvents()).toEqual([a, b, c]);
  });

  it('drops oldest events when MAX_EVENTS (10_000) would be exceeded', () => {
    // Write 10_001 events; the first one should be evicted.
    for (let i = 0; i < 10_001; i += 1) {
      recordAnalyticsEvent(evt({ ts: i, type: 'lesson_started' }));
    }
    const all = getAllEvents();
    expect(all).toHaveLength(10_000);
    // The earliest surviving event is ts=1, since ts=0 was dropped.
    expect(all[0].ts).toBe(1);
    expect(all[all.length - 1].ts).toBe(10_000);
  });
});

describe('exportEventsAsCSV', () => {
  it('returns only the header row when there are no events', () => {
    expect(exportEventsAsCSV()).toBe('ts,type,conceptId,score,attemptCount');
  });

  it('writes one data row per event with fields in header order', () => {
    recordAnalyticsEvent(evt({ ts: 100, type: 'lesson_started', conceptId: 'primes' }));
    recordAnalyticsEvent(
      evt({ ts: 200, type: 'capstone_attempted', score: 3, attemptCount: 2 }),
    );
    expect(exportEventsAsCSV()).toBe(
      [
        'ts,type,conceptId,score,attemptCount',
        '100,lesson_started,primes,,',
        '200,capstone_attempted,,3,2',
      ].join('\n'),
    );
  });

  it('quotes values containing commas, quotes, or newlines (RFC-4180)', () => {
    recordAnalyticsEvent(evt({ ts: 1, type: 'lesson_started', conceptId: 'a,b' }));
    recordAnalyticsEvent(evt({ ts: 2, type: 'lesson_started', conceptId: 'has "quote"' }));
    recordAnalyticsEvent(evt({ ts: 3, type: 'lesson_started', conceptId: 'line\nbreak' }));
    const csv = exportEventsAsCSV();
    expect(csv).toContain('1,lesson_started,"a,b",,');
    expect(csv).toContain('2,lesson_started,"has ""quote""",,');
    expect(csv).toContain('3,lesson_started,"line\nbreak",,');
  });

  it('neutralizes leading =, +, -, @ to block CSV formula injection in Excel', () => {
    recordAnalyticsEvent(evt({ ts: 1, type: 'lesson_started', conceptId: '=cmd|"/c calc"!A0' }));
    recordAnalyticsEvent(evt({ ts: 2, type: 'lesson_started', conceptId: '+danger' }));
    recordAnalyticsEvent(evt({ ts: 3, type: 'lesson_started', conceptId: '-1+1' }));
    recordAnalyticsEvent(evt({ ts: 4, type: 'lesson_started', conceptId: '@cmd' }));
    const csv = exportEventsAsCSV();
    // Leading formula chars get a ' prefix; commas/quotes in the payload still
    // trigger normal RFC-4180 quoting, so the =cmd payload ends up double-wrapped.
    expect(csv).toContain(`1,lesson_started,"'=cmd|""/c calc""!A0",,`);
    expect(csv).toContain('2,lesson_started,\'+danger,,');
    expect(csv).toContain("3,lesson_started,'-1+1,,");
    expect(csv).toContain("4,lesson_started,'@cmd,,");
  });
});

describe('clearEvents', () => {
  it('empties the store', () => {
    recordAnalyticsEvent(evt());
    expect(getAllEvents()).toHaveLength(1);
    clearEvents();
    expect(getAllEvents()).toEqual([]);
  });
});

describe('localStorage failure handling', () => {
  // Swap the global localStorage for a throwing stub so we can prove no public
  // function escalates the failure to the caller.
  const realStorage = globalThis.localStorage;
  const boom = () => {
    throw new Error('boom');
  };
  const throwingStorage: Storage = {
    length: 0,
    clear: boom,
    getItem: boom,
    setItem: boom,
    removeItem: boom,
    key: boom,
  };

  const setStorage = (value: Storage) => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value });
  };

  beforeEach(() => setStorage(throwingStorage));
  afterEach(() => setStorage(realStorage));

  it('recordAnalyticsEvent does not throw when storage is unavailable', () => {
    expect(() => recordAnalyticsEvent(evt())).not.toThrow();
  });

  it('getAllEvents returns an empty list when storage is unavailable', () => {
    expect(getAllEvents()).toEqual([]);
  });

  it('exportEventsAsCSV returns just the header when storage is unavailable', () => {
    expect(exportEventsAsCSV()).toBe('ts,type,conceptId,score,attemptCount');
  });

  it('clearEvents does not throw when storage is unavailable', () => {
    expect(() => clearEvents()).not.toThrow();
  });
});

describe('storage hygiene', () => {
  it('writes under the documented STORAGE_KEY so admin tools can find it', () => {
    recordAnalyticsEvent(evt({ ts: 42 }));
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual([evt({ ts: 42 })]);
  });

  it('treats a non-array stored value as empty (defensive against tampering)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
    expect(getAllEvents()).toEqual([]);
  });

  it('treats malformed JSON as empty', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(getAllEvents()).toEqual([]);
  });
});
