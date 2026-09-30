import { createActionEvent } from '../events/ActionEvent.js';
import { actionEvents } from '../events/EventLog.js';
import { createScenarioSession, withEvent } from './ScenarioState.js';
import { ACTION_OUTCOME, SCENARIO_STATUS } from './scenarioTypes.js';

function transitionMatches(transition, session, action) {
  if (transition.from !== session.state || transition.action !== action.type) return false;
  return Object.entries(transition.payload || {}).every(([key, value]) => action.payload?.[key] === value);
}

function eventId(session) {
  return `${session.scenarioId}:${session.attempt}:${session.events.length}`;
}

export function dispatchScenarioAction(scenario, session, action) {
  if (session.status !== SCENARIO_STATUS.IN_PROGRESS) {
    const event = createActionEvent({
      id: eventId(session), type: action.type, timestamp: action.timestamp, scenario, actor: action.actor || session.actor,
      payload: action.payload, state: session.state, outcome: ACTION_OUTCOME.INVALID_SEQUENCE
    });
    return { session: withEvent(session, event), outcome: ACTION_OUTCOME.INVALID_SEQUENCE, feedback: 'Scenario is no longer in progress.' };
  }

  const transition = scenario.transitions.find(candidate => transitionMatches(candidate, session, action));
  const configuredFailure = scenario.criticalFailures?.find(candidate => transitionMatches(candidate, session, action));
  const outcome = configuredFailure ? ACTION_OUTCOME.CRITICAL_FAILURE : transition ? ACTION_OUTCOME.VALID : ACTION_OUTCOME.INVALID_SEQUENCE;
  const competencyIds = transition?.competencyIds || configuredFailure?.competencyIds || [];
  const event = createActionEvent({
    id: eventId(session), type: action.type, timestamp: action.timestamp, scenario, actor: action.actor || session.actor,
    payload: action.payload, state: session.state, outcome, competencyIds
  });

  if (outcome !== ACTION_OUTCOME.VALID) {
    const status = outcome === ACTION_OUTCOME.CRITICAL_FAILURE && scenario.policy.criticalFailuresAllowed === 0
      ? SCENARIO_STATUS.FAILED
      : session.status;
    return {
      session: withEvent(session, event, { status }), outcome,
      feedback: outcome === ACTION_OUTCOME.CRITICAL_FAILURE
        ? 'Critical failure recorded.'
        : scenario.invalidFeedback?.find(candidate => transitionMatches(candidate, session, action))?.feedback || 'Action is out of sequence.'
    };
  }

  let nextSession = withEvent(session, event, { state: transition.to });
  if (transition.complete) {
    const completeEvent = createActionEvent({
      id: eventId(nextSession), type: 'SCENARIO_COMPLETED', timestamp: action.timestamp, scenario,
      actor: action.actor || session.actor, state: transition.to, outcome: ACTION_OUTCOME.VALID
    });
    nextSession = withEvent(nextSession, completeEvent, { status: SCENARIO_STATUS.COMPLETED });
  }

  return { session: nextSession, outcome, feedback: transition.feedback || 'Action complete.', justCompleted: transition.complete === true };
}

export function replayScenario(scenario, events, options = {}) {
  let session = createScenarioSession(scenario, options);
  for (const event of actionEvents(events)) {
    session = dispatchScenarioAction(scenario, session, event).session;
  }
  return session;
}
