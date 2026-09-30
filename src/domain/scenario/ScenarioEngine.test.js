import assert from 'node:assert/strict';
import test from 'node:test';
import { TEMPORARY_ASSESSMENT_POLICY } from '../../config/assessmentPolicy.js';
import { PRACTICAL_COMPETENCY_POLICY } from '../competency/CompetencyPolicy.js';
import { evaluateCompetencies } from '../competency/CompetencyEvaluator.js';
import { fireScenario } from '../content/fire/fireScenario.js';
import { dispatchScenarioAction, replayScenario } from './ScenarioEngine.js';
import { createScenarioSession } from './ScenarioState.js';
import { ACTION_OUTCOME, SCENARIO_STATUS } from './scenarioTypes.js';

const fireActions = [
  ['SELECT_EXIT', { exit: 'B' }],
  ['SELECT_EXTINGUISHER', { equipment: 'dcp' }],
  ['FOLLOW_EVACUATION_ROUTE', { route: 'B' }]
];

function play(scenario, sequence, startedAt = 1000) {
  return sequence.reduce((session, [type, payload = {}], index) => (
    dispatchScenarioAction(scenario, session, { type, payload, timestamp: startedAt + ((index + 1) * 100) }).session
  ), createScenarioSession(scenario, { startedAt }));
}

test('correct Fire sequence reaches completion with immutable event order', () => {
  const session = play(fireScenario, fireActions);

  assert.equal(session.status, SCENARIO_STATUS.COMPLETED);
  assert.deepEqual(session.events.map(event => event.type), [
    'SCENARIO_STARTED', ...fireActions.map(([type]) => type), 'SCENARIO_COMPLETED'
  ]);
  assert.equal(evaluateCompetencies(fireScenario, session).every(result => result.status === 'PASS'), true);
  assert.equal(Object.isFrozen(session.events), true);
  assert.equal(Object.isFrozen(session.events[1]), true);
});

test('an invalid sequence is preserved and cannot complete the Fire scenario', () => {
  let session = createScenarioSession(fireScenario, { startedAt: 0 });
  const invalid = dispatchScenarioAction(fireScenario, session, { type: 'SWEEP', timestamp: 10 });
  session = invalid.session;

  assert.equal(invalid.outcome, ACTION_OUTCOME.INVALID_SEQUENCE);
  assert.equal(session.state, 'INTRO');
  assert.equal(session.status, SCENARIO_STATUS.IN_PROGRESS);
  assert.equal(session.events.at(-1).valid, false);
  assert.equal(session.events.at(-1).outcome, ACTION_OUTCOME.INVALID_SEQUENCE);
});

test('a configured critical failure is recorded distinctly and ends the attempt under policy', () => {
  const scenario = {
    ...fireScenario,
    criticalFailures: [{ from: 'INTRO', action: 'UNSAFE_ACTION', competencyIds: ['HAZARD_RECOGNITION'] }]
  };
  const session = createScenarioSession(scenario, { startedAt: 0 });
  const result = dispatchScenarioAction(scenario, session, { type: 'UNSAFE_ACTION', timestamp: 10 });

  assert.equal(result.outcome, ACTION_OUTCOME.CRITICAL_FAILURE);
  assert.equal(result.session.status, SCENARIO_STATUS.FAILED);
  assert.equal(result.session.events.at(-1).unsafe, true);
});

test('replay of the same Fire event sequence has the same state, outcomes, and competency results', () => {
  const original = play(fireScenario, fireActions, 500);
  const replayed = replayScenario(fireScenario, original.events, { startedAt: 500 });

  assert.equal(replayed.status, original.status);
  assert.deepEqual(replayed.events.map(event => [event.type, event.outcome, event.state]), original.events.map(event => [event.type, event.outcome, event.state]));
  assert.deepEqual(evaluateCompetencies(fireScenario, replayed), evaluateCompetencies(fireScenario, original));
});

test('competencies derive from evidence, missing actions, invalid actions, and supplied timestamps', () => {
  let session = createScenarioSession(fireScenario, { startedAt: 100 });
  session = dispatchScenarioAction(fireScenario, session, { type: 'SELECT_EXTINGUISHER', payload: { equipment: 'dcp' }, timestamp: 120 }).session;
  session = dispatchScenarioAction(fireScenario, session, { type: 'SELECT_EXIT', payload: { exit: 'B' }, timestamp: 200 }).session;
  const results = evaluateCompetencies(fireScenario, session);
  const evacuation = results.find(result => result.competencyId === 'EVACUATION_DECISION');
  const equipment = results.find(result => result.competencyId === 'EQUIPMENT_SELECTION');

  assert.equal(evacuation.status, 'FAIL');
  assert.equal(evacuation.responseTimeMs, 100);
  assert.equal(evacuation.missingActions.includes('FOLLOW_EVACUATION_ROUTE'), true);
  assert.equal(equipment.invalidActions, 1);
});

test('critical failure prevents competency PASS when policy allows none', () => {
  const scenario = {
    ...fireScenario,
    criticalFailures: [{ from: 'EXIT_B_SELECTED', action: 'UNSAFE_ACTION', competencyIds: ['EVACUATION_DECISION'] }]
  };
  let session = createScenarioSession(scenario, { startedAt: 0 });
  session = dispatchScenarioAction(scenario, session, { type: 'SELECT_EXIT', payload: { exit: 'B' }, timestamp: 1 }).session;
  session = dispatchScenarioAction(scenario, session, { type: 'UNSAFE_ACTION', timestamp: 2 }).session;
  const results = evaluateCompetencies(scenario, session);

  assert.equal(results.find(result => result.competencyId === 'EVACUATION_DECISION').evidence.length, 1);
  assert.equal(results.every(result => result.status === 'FAIL'), true);
});

test('the practical policy reads the single knowledge threshold configuration', () => {
  assert.equal(PRACTICAL_COMPETENCY_POLICY.knowledgePassPercentage, TEMPORARY_ASSESSMENT_POLICY.minimumScore);
  assert.equal(TEMPORARY_ASSESSMENT_POLICY.minimumScore, 80);
});
