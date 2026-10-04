import { evaluateCompetencies } from '../competency/CompetencyEvaluator.js';

export function evaluateScenario(scenario, session) {
  return Object.freeze({
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    attempt: session.attempt,
    status: session.status,
    events: session.events,
    competencies: evaluateCompetencies(scenario, session)
  });
}
