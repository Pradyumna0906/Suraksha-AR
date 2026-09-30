export function createActionEvent({ id, type, timestamp, scenario, actor = 'trainee', payload = {}, state, outcome, competencyIds = [] }) {
  return Object.freeze({
    id,
    type,
    timestamp,
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    actor,
    payload: Object.freeze({ ...payload }),
    state,
    outcome,
    valid: outcome === 'VALID',
    unsafe: outcome === 'CRITICAL_FAILURE',
    competencyIds: Object.freeze([...competencyIds])
  });
}
