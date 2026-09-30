import { PRACTICAL_COMPETENCY_POLICY } from '../../competency/CompetencyPolicy.js';

export const gasScenario = Object.freeze({
  id: 'GAS_CONFINED_SPACE_001', version: '1.0', title: 'Gas and confined-space practice drill', module: 'gas', mode: 'PRACTICE',
  initialState: 'INTRO',
  states: [{ id: 'INTRO', displayStep: 1 }, { id: 'PPE_READY', displayStep: 2 }, { id: 'SAFE_DISTANCE', displayStep: 3 }, { id: 'BUDDY_ALERTED', displayStep: 4 }, { id: 'COMPLETED', displayStep: 4 }],
  actions: ['SELECT_PPE', 'MOVE_TO_SAFE_BOUNDARY', 'ALERT_BUDDY', 'FOLLOW_SAFE_EXIT'],
  transitions: [
    { from: 'INTRO', action: 'SELECT_PPE', payload: { ppe: 'scba' }, to: 'PPE_READY', competencyIds: ['PPE_SELECTION'], feedback: 'Correct — approved respiratory PPE is selected for this simulation.' },
    { from: 'PPE_READY', action: 'MOVE_TO_SAFE_BOUNDARY', payload: { boundary: 'safe' }, to: 'SAFE_DISTANCE', competencyIds: ['SAFE_DISTANCE_ACTION'], feedback: 'Correct — remain behind the marked safe boundary.' },
    { from: 'SAFE_DISTANCE', action: 'ALERT_BUDDY', payload: { buddy: 'alerted' }, to: 'BUDDY_ALERTED', competencyIds: ['BUDDY_SYSTEM_ACTION'], feedback: 'Correct — buddy alert sent. Do not enter alone.' },
    { from: 'BUDDY_ALERTED', action: 'FOLLOW_SAFE_EXIT', payload: { exit: 'safe' }, to: 'COMPLETED', competencyIds: ['EVACUATION_DECISION'], feedback: 'Correct — follow the green safe-exit marker.', complete: true }
  ],
  invalidFeedback: [
    { from: 'INTRO', action: 'SELECT_PPE', payload: { ppe: 'cloth_mask' }, feedback: 'Wrong — a cloth mask is not the selected PPE in this simulation. Choose approved respiratory PPE.' },
    { from: 'PPE_READY', action: 'MOVE_TO_SAFE_BOUNDARY', payload: { boundary: 'near_pipe' }, feedback: 'Wrong — do not move closer. Stay behind the marked safe boundary.' },
    { from: 'SAFE_DISTANCE', action: 'ALERT_BUDDY', payload: { buddy: 'none' }, feedback: 'Wrong — do not continue alone. Alert your buddy.' },
    { from: 'BUDDY_ALERTED', action: 'FOLLOW_SAFE_EXIT', payload: { exit: 'hazard' }, feedback: 'Wrong — do not cross the marked hazard area. Follow the green exit.' }
  ],
  competencies: [
    { id: 'PPE_SELECTION', requiredActions: ['SELECT_PPE'], relatedActions: ['SELECT_PPE'] },
    { id: 'SAFE_DISTANCE_ACTION', requiredActions: ['MOVE_TO_SAFE_BOUNDARY'], relatedActions: ['MOVE_TO_SAFE_BOUNDARY'] },
    { id: 'BUDDY_SYSTEM_ACTION', requiredActions: ['ALERT_BUDDY'], relatedActions: ['ALERT_BUDDY'] },
    { id: 'EVACUATION_DECISION', requiredActions: ['FOLLOW_SAFE_EXIT'], relatedActions: ['FOLLOW_SAFE_EXIT'] }
  ],
  policy: PRACTICAL_COMPETENCY_POLICY,
  safetyReview: { requiresSafetyReview: true, note: 'Prototype gas-response semantics require safety-officer review before operational use.' },
  criticalFailures: []
});
