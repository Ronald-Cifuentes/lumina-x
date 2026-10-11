import type { Property } from './domain';

export type SimilarityInput = Pick<Property, 'id' | 'type' | 'zone' | 'municipality' | 'monthlyRent'>;

const TYPE_WEIGHT = 3;
const ZONE_WEIGHT = 2;
const MUNICIPALITY_WEIGHT = 1;
const BUDGET_WEIGHT = 2;
const BUDGET_TOLERANCE = 0.5;

/** Higher is more similar: same type first, then same area, then a comparable budget. */
export const similarityScore = (base: SimilarityInput, candidate: SimilarityInput): number => {
  let score = 0;
  if (candidate.type === base.type) score += TYPE_WEIGHT;
  if (candidate.zone === base.zone) score += ZONE_WEIGHT;
  else if (candidate.municipality === base.municipality) score += MUNICIPALITY_WEIGHT;
  const budgetGap = Math.abs(candidate.monthlyRent - base.monthlyRent) / base.monthlyRent;
  score += BUDGET_WEIGHT * Math.max(0, 1 - budgetGap / BUDGET_TOLERANCE);
  return score;
};

export const rankSimilar = <T extends SimilarityInput>(base: SimilarityInput, candidates: readonly T[], limit = 3): T[] =>
  candidates
    .filter((candidate) => candidate.id !== base.id)
    .map((candidate) => ({ candidate, score: similarityScore(base, candidate) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Math.abs(a.candidate.monthlyRent - base.monthlyRent) - Math.abs(b.candidate.monthlyRent - base.monthlyRent) ||
        a.candidate.id.localeCompare(b.candidate.id),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
