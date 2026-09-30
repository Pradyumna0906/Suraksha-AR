import { createCompetencyResult } from './CompetencyResult.js';
import { ACTION_OUTCOME } from '../scenario/scenarioTypes.js';

export function evaluateCompetencies(scenario, session) {
  const startTimestamp = session.events[0]?.timestamp ?? 0;
  const criticalFailures = session.events.filter(event => event.outcome === ACTION_OUTCOME.CRITICAL_FAILURE);

  return Object.freeze(scenario.competencies.map(competency => {
    const evidence = session.events.filter(event => event.valid && competency.requiredActions.includes(event.type));
    const validActions = new Set(evidence.map(event => event.type));
    const missingActions = competency.requiredActions.filter(type => !validActions.has(type));
    const invalidActions = session.events.filter(event => event.outcome === ACTION_OUTCOME.INVALID_SEQUENCE && competency.relatedActions?.includes(event.type));
    const competencyCriticalFailures = criticalFailures.filter(event => competency.relatedActions?.includes(event.type));
    const responseTimeMs = evidence.length ? evidence[0].timestamp - startTimestamp : null;
    const score = Math.max(0, 100 - (missingActions.length * 50) - (invalidActions.length * 10) - (competencyCriticalFailures.length * 100));
    const preventedByPolicy = criticalFailures.length > scenario.policy.criticalFailuresAllowed;

    return createCompetencyResult({
      competencyId: competency.id,
      status: missingActions.length === 0 && !preventedByPolicy ? 'PASS' : 'FAIL',
      score,
      evidence,
      missingActions,
      invalidActions: invalidActions.length,
      criticalFailures: competencyCriticalFailures.length,
      attempts: session.attempt,
      responseTimeMs,
      scenarioId: scenario.id,
      scenarioVersion: scenario.version
    });
  }));
}
