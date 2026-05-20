// Local-only analytics for the three STRATEGY.md metrics:
//   - final-assessment pass rate     ← capstone_attempted (score)
//   - per-concept mastery rate       ← lesson_completed   (conceptId)
//   - lesson completion rate         ← lesson_started + lesson_completed
//
// Design choices (decided by coordinator, see batch-g-analytics.md):
//   - LOCAL-ONLY with CSV export — FERPA-safest for a single-device pilot.
//   - ANONYMOUS per-device — matches localStorage scope, no PII, no consent.
//   - MINIMUM event set — per-step events deferred.
//
// Every public function is fire-and-forget: if localStorage is unavailable
// (Safari private mode, SSR, quota exceeded, security errors), the call
// silently no-ops. Analytics must never crash a lesson interaction.

export type AnalyticsEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'capstone_attempted';

export type AnalyticsEvent = {
  ts: number;
  type: AnalyticsEventType;
  conceptId?: string;
  score?: number; // capstone: problems correct out of total
  attemptCount?: number; // capstone: which attempt (1, 2, 3...)
};

const STORAGE_KEY = 'fractical:analytics:events';
const MAX_EVENTS = 10_000;
const CSV_FIELDS = ['ts', 'type', 'conceptId', 'score', 'attemptCount'] as const;

// Every storage touch is wrapped: localStorage can throw in Safari private
// mode, on quota exceeded, or in non-DOM contexts. Analytics is fire-and-
// forget, so swallow and fall back rather than escalate to the caller.
function swallow<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function safeRead(): AnalyticsEvent[] {
  return swallow(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  }, []);
}

function safeWrite(events: AnalyticsEvent[]): void {
  swallow(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(events)), undefined);
}

export function recordAnalyticsEvent(event: AnalyticsEvent): void {
  const events = safeRead();
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  safeWrite(events);
}

export function getAllEvents(): AnalyticsEvent[] {
  return safeRead();
}

export function clearEvents(): void {
  swallow(() => localStorage.removeItem(STORAGE_KEY), undefined);
}

// RFC-4180-ish: quote only when the value contains a comma, quote, CR, or LF;
// inside a quoted value, double the embedded quote.
function csvCell(value: string | number | undefined): string {
  if (value === undefined) return '';
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportEventsAsCSV(): string {
  const rows = [CSV_FIELDS.join(',')];
  for (const event of safeRead()) {
    rows.push(CSV_FIELDS.map((field) => csvCell(event[field])).join(','));
  }
  return rows.join('\n');
}

export function downloadCSV(filename = 'fractical-analytics.csv'): void {
  swallow(() => {
    const blob = new Blob([exportEventsAsCSV()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, undefined);
}
