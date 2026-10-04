import { PRACTICAL_COMPETENCY_POLICY } from '../../competency/CompetencyPolicy.js';

export const lotoScenario = Object.freeze({
  id: 'LOTO_MACHINERY_001', version: '1.0', title: 'Machinery LOTO practice drill', module: 'machinery', mode: 'PRACTICE',
  initialState: 'INTRO',
  states: [{ id: 'INTRO', displayStep: 1 }, { id: 'BOUNDARY_IDENTIFIED', displayStep: 2 }, { id: 'BREAKER_ISOLATED', displayStep: 3 }, { id: 'LOCK_APPLIED', displayStep: 4 }, { id: 'COMPLETED', displayStep: 4 }],
  actions: ['HAZARD_IDENTIFIED', 'BREAKER_ISOLATED', 'LOCK_APPLIED', 'ZERO_ENERGY_VERIFIED'],
  transitions: [
    { from: 'INTRO', action: 'HAZARD_IDENTIFIED', to: 'BOUNDARY_IDENTIFIED', competencyIds: ['HAZARD_RECOGNITION'] },
    { from: 'BOUNDARY_IDENTIFIED', action: 'BREAKER_ISOLATED', to: 'BREAKER_ISOLATED', competencyIds: ['ISOLATION_SEQUENCE'] },
    { from: 'BREAKER_ISOLATED', action: 'LOCK_APPLIED', to: 'LOCK_APPLIED', competencyIds: ['ISOLATION_SEQUENCE'] },
    { from: 'LOCK_APPLIED', action: 'ZERO_ENERGY_VERIFIED', to: 'COMPLETED', competencyIds: ['ZERO_ENERGY_VERIFICATION'], complete: true }
  ],
  competencies: [
    { id: 'HAZARD_RECOGNITION', requiredActions: ['HAZARD_IDENTIFIED'], relatedActions: ['HAZARD_IDENTIFIED'] },
    { id: 'ISOLATION_SEQUENCE', requiredActions: ['BREAKER_ISOLATED', 'LOCK_APPLIED'], relatedActions: ['BREAKER_ISOLATED', 'LOCK_APPLIED'] },
    { id: 'ZERO_ENERGY_VERIFICATION', requiredActions: ['ZERO_ENERGY_VERIFIED'], relatedActions: ['ZERO_ENERGY_VERIFIED'] }
  ],
  policy: PRACTICAL_COMPETENCY_POLICY,
  safetyReview: { requiresSafetyReview: true, note: 'Prototype LOTO semantics require safety-officer review before operational use.' },
  criticalFailures: []
});
