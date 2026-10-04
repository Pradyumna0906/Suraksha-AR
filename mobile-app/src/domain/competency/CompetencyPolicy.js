import { TEMPORARY_ASSESSMENT_POLICY } from '../../config/assessmentPolicy.js';

export const PRACTICAL_COMPETENCY_POLICY = Object.freeze({
  policyVersion: '1.0',
  knowledgePassPercentage: TEMPORARY_ASSESSMENT_POLICY.minimumScore,
  criticalFailuresAllowed: 0,
  retriesAllowed: true,
  maxAttempts: null
});
