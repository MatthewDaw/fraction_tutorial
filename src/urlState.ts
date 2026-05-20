import { V2ConceptId, V2Tab, V2_CONCEPTS, V2_LESSONS } from './v2lessons';

export type UrlState = {
  conceptId: V2ConceptId;
  tab: V2Tab;
  stepIdx: number;
};

const isConceptId = (s: string): s is V2ConceptId =>
  (V2_CONCEPTS as readonly string[]).includes(s);

const isTab = (s: string): s is V2Tab => s === 'lesson' || s === 'test';

// Hash forms: "#/divide-by-2/lesson/3" or "#/divide-by-2/test".
export const parseHash = (hash: string): Partial<UrlState> => {
  const [concept, tab, step] = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const out: Partial<UrlState> = {};
  if (concept && isConceptId(concept)) out.conceptId = concept;
  if (tab && isTab(tab)) out.tab = tab;
  if (step != null && /^\d+$/.test(step)) {
    const idx = Number(step);
    const cap = out.conceptId ? V2_LESSONS[out.conceptId].length - 1 : idx;
    out.stepIdx = Math.max(0, Math.min(idx, cap));
  }
  return out;
};

export const formatHash = ({ conceptId, tab, stepIdx }: UrlState): string =>
  tab === 'test' ? `#/${conceptId}/test` : `#/${conceptId}/lesson/${stepIdx}`;
