import { PRACTICAL_COMPETENCY_POLICY } from '../../competency/CompetencyPolicy.js';

export const fireScenario = Object.freeze({
  id: 'FIRE_RESPONSE_001', version: '1.0', title: 'Fire response practice drill', module: 'fire', mode: 'PRACTICE',
  initialState: 'INTRO',
  states: [
    { id: 'INTRO', displayStep: 1 }, { id: 'EXIT_B_SELECTED', displayStep: 2 },
    { id: 'EXTINGUISHER_SELECTED', displayStep: 3 }, { id: 'COMPLETED', displayStep: 3 }
  ],
  actions: ['SELECT_EXIT', 'SELECT_EXTINGUISHER', 'FOLLOW_EVACUATION_ROUTE'],
  transitions: [
    { from: 'INTRO', action: 'SELECT_EXIT', payload: { exit: 'B' }, to: 'EXIT_B_SELECTED', competencyIds: ['EVACUATION_DECISION'], feedback: 'Correct — Exit B is clear. Now choose the training extinguisher.' },
    { from: 'EXIT_B_SELECTED', action: 'SELECT_EXTINGUISHER', payload: { equipment: 'dcp' }, to: 'EXTINGUISHER_SELECTED', competencyIds: ['EQUIPMENT_SELECTION'], feedback: 'Correct — dry powder is selected for this simulated fire.' },
    { from: 'EXTINGUISHER_SELECTED', action: 'FOLLOW_EVACUATION_ROUTE', payload: { route: 'B' }, to: 'COMPLETED', competencyIds: ['EVACUATION_DECISION'], feedback: 'Correct — follow the green Exit B route and report to muster point.', complete: true }
  ],
  invalidFeedback: [
    { from: 'INTRO', action: 'SELECT_EXIT', payload: { exit: 'A' }, feedback: 'Wrong — use Exit B. Exit A is part of the simulated hazard zone.' },
    { from: 'EXIT_B_SELECTED', action: 'SELECT_EXTINGUISHER', payload: { equipment: 'water' }, feedback: 'Wrong — do not select water for this simulated fire. Choose dry powder.' },
    { from: 'EXTINGUISHER_SELECTED', action: 'FOLLOW_EVACUATION_ROUTE', payload: { route: 'hazard' }, feedback: 'Wrong — do not return through the hazard zone. Follow Exit B.' }
  ],
  competencies: [
    { id: 'EQUIPMENT_SELECTION', requiredActions: ['SELECT_EXTINGUISHER'], relatedActions: ['SELECT_EXTINGUISHER'] },
    { id: 'EVACUATION_DECISION', requiredActions: ['SELECT_EXIT', 'FOLLOW_EVACUATION_ROUTE'], relatedActions: ['SELECT_EXIT', 'FOLLOW_EVACUATION_ROUTE'] }
  ],
  policy: PRACTICAL_COMPETENCY_POLICY,
  safetyReview: { requiresSafetyReview: true, note: 'Prototype procedure semantics require safety-officer review before operational use.' },
  criticalFailures: []
});
