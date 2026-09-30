import { ACTION_OUTCOME, SCENARIO_STATUS } from './scenarioTypes.js';
import { createActionEvent } from '../events/ActionEvent.js';
import { appendEvent } from '../events/EventLog.js';

export function createScenarioSession(scenario, { attempt = 1, startedAt = 0, actor = 'trainee' } = {}) {
  const startEvent = createActionEvent({
    id: `${scenario.id}:${attempt}:0`,
    type: 'SCENARIO_STARTED',
    timestamp: startedAt,
    scenario,
    actor,
    state: scenario.initialState,
    outcome: ACTION_OUTCOME.VALID
  });

  return Object.freeze({
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    attempt,
    actor,
    state: scenario.initialState,
    status: SCENARIO_STATUS.IN_PROGRESS,
    events: Object.freeze([startEvent])
  });
}

export function withEvent(session, event, { state = session.state, status = session.status } = {}) {
  return Object.freeze({ ...session, state, status, events: appendEvent(session.events, event) });
}
