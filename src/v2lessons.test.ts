import { V2_LESSONS, V2ConceptId, V2LessonStep } from './v2lessons';

// Pull every worksheet step out of every concept's lesson, so the divisibility
// pools (and any future worksheet) get auto-checked here without test updates.
const worksheetStepsFor = (concept: V2ConceptId): Array<Extract<V2LessonStep['canvas'], { kind: 'worksheet' }>> => {
  const out: Array<Extract<V2LessonStep['canvas'], { kind: 'worksheet' }>> = [];
  for (const step of V2_LESSONS[concept]) {
    if (step.canvas && step.canvas.kind === 'worksheet') out.push(step.canvas);
  }
  return out;
};

const DIVISIBILITY_CONCEPTS: V2ConceptId[] = [
  'divisibility-2',
  'divisibility-3',
  'divisibility-5',
  'divisibility-7',
  'divisibility-11',
];

describe('worksheet pool integrity (source-of-truth divisibility numbers)', () => {
  for (const concept of DIVISIBILITY_CONCEPTS) {
    describe(concept, () => {
      const sheets = worksheetStepsFor(concept);

      it('has at least one worksheet step', () => {
        expect(sheets.length).toBeGreaterThan(0);
      });

      for (const [i, sheet] of sheets.entries()) {
        it(`worksheet #${i + 1}: every yesPool number is divisible by ${sheet.divisor}`, () => {
          const bad = sheet.yesPool.filter((n) => n % sheet.divisor !== 0);
          expect(bad).toEqual([]);
        });

        it(`worksheet #${i + 1}: every noPool number is NOT divisible by ${sheet.divisor}`, () => {
          const bad = sheet.noPool.filter((n) => n % sheet.divisor === 0);
          expect(bad).toEqual([]);
        });

        it(`worksheet #${i + 1}: pools are non-empty and contain only positive integers`, () => {
          expect(sheet.yesPool.length).toBeGreaterThan(0);
          expect(sheet.noPool.length).toBeGreaterThan(0);
          for (const n of [...sheet.yesPool, ...sheet.noPool]) {
            expect(Number.isInteger(n)).toBe(true);
            expect(n).toBeGreaterThan(0);
          }
        });
      }
    });
  }
});

describe('capstone generator', () => {
  it.todo(
    'capstone generator dedup + denom-differ + complexity cap — wire when Batch C lands',
  );
});
