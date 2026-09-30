export function createCompetencyResult(result) {
  return Object.freeze({
    ...result,
    evidence: Object.freeze([...result.evidence]),
    missingActions: Object.freeze([...result.missingActions])
  });
}
