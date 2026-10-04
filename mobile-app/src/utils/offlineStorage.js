import { Preferences } from '@capacitor/preferences';
import { TEMPORARY_ASSESSMENT_POLICY } from '../config/assessmentPolicy';
import { appendOperationalEvent } from './operationalLedger';

const STORAGE_KEYS = {
  WORKERS_ROSTER: 'suraksha_workers_roster'
};

const INITIAL_ROSTER = [
  {
    id: "JHK-MN-2026-081",
    name: "Budhan Manjhi",
    language: "sat",
    mineSector: "Jharia Coalfield, Dhanbad Cluster",
    orientationDays: 14,
    modulesCompleted: ["Fire Response", "Gas Protocol"],
    score: 92,
    hasTemporaryKnowledgeRecord: true,
    localRecordId: "LOCAL-JH-8F9A7B3C",
    certDate: "2026-09-15"
  },
  {
    id: "JHK-ST-2026-142",
    name: "Rameshwar Singh",
    language: "hi",
    mineSector: "Bokaro Steel Plant Unit 4",
    orientationDays: 8,
    modulesCompleted: ["Fire Response"],
    score: 65,
    hasTemporaryKnowledgeRecord: false,
    localRecordId: null,
    certDate: null
  },
  {
    id: "JHK-MC-2026-049",
    name: "Sombari Tudu",
    language: "sat",
    mineSector: "Giridih Mica Processing Hub",
    orientationDays: 22,
    modulesCompleted: ["Fire Response", "Gas Protocol", "Machinery LOTO"],
    score: 88,
    hasTemporaryKnowledgeRecord: true,
    localRecordId: "LOCAL-JH-3C4D5E6F",
    certDate: "2026-09-18"
  },
  {
    id: "JHK-ST-2026-304",
    name: "Vikram Kumar Mahato",
    language: "hi",
    mineSector: "Tata Steel Colliery, Digwadih",
    orientationDays: 29,
    modulesCompleted: ["Fire Response", "Gas Protocol"],
    score: 90,
    hasTemporaryKnowledgeRecord: true,
    localRecordId: "LOCAL-JH-9E8D7C6B",
    certDate: "2026-09-20"
  }
];

export const getWorkerRoster = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WORKERS_ROSTER);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.WORKERS_ROSTER, JSON.stringify(INITIAL_ROSTER));
      Preferences.set({ key: STORAGE_KEYS.WORKERS_ROSTER, value: JSON.stringify(INITIAL_ROSTER) });
      return INITIAL_ROSTER;
    }
    return JSON.parse(data).map(worker => ({
      ...worker,
      hasTemporaryKnowledgeRecord: worker.hasTemporaryKnowledgeRecord ?? false
    }));
  } catch (err) {
    console.warn('LocalStorage error, using fallback roster:', err);
    return INITIAL_ROSTER;
  }
};

export const saveWorkerEvaluation = (workerData, localRecordId = null) => {
  const roster = getWorkerRoster();
  const existingIndex = roster.findIndex(w => w.id === workerData.id);
  
  const updatedWorker = {
    ...workerData,
    hasTemporaryKnowledgeRecord: workerData.score >= TEMPORARY_ASSESSMENT_POLICY.minimumScore,
    localRecordId: localRecordId || (workerData.score >= TEMPORARY_ASSESSMENT_POLICY.minimumScore ? generateLocalDemoRecordId(workerData.id) : null),
    certDate: new Date().toISOString().split('T')[0]
  };

  if (existingIndex >= 0) {
    roster[existingIndex] = updatedWorker;
  } else {
    roster.unshift(updatedWorker);
  }

  const jsonStr = JSON.stringify(roster);
  localStorage.setItem(STORAGE_KEYS.WORKERS_ROSTER, jsonStr);
  Preferences.set({ key: STORAGE_KEYS.WORKERS_ROSTER, value: jsonStr });
  
  appendOperationalEvent('KNOWLEDGE_CHECK_RECORDED', {
    workerId: updatedWorker.id,
    score: updatedWorker.score,
    recordId: updatedWorker.localRecordId,
    status: updatedWorker.hasTemporaryKnowledgeRecord ? 'REVIEWABLE' : 'REQUIRES_RETRAINING'
  });
  return updatedWorker;
};

// Persists demonstrated practical drills separately from the written assessment.
// This lets the app enforce competency flow even while the device is offline.
export const saveTrainingProgress = (workerData, completedModule, result = null) => {
  const roster = getWorkerRoster();
  const existingIndex = roster.findIndex(w => w.id === workerData.id);
  const existing = existingIndex >= 0 ? roster[existingIndex] : workerData;
  const completed = Array.from(new Set([...(existing.modulesCompleted || []), completedModule]));
  const practicalResults = { ...(existing.practicalResults || workerData.practicalResults || {}) };
  if (result?.score != null) practicalResults[completedModule] = {
    score: result.score,
    status: result.passed === false ? 'FAIL' : result.passed === true ? 'PASS' : result.status || 'PASS',
    recordedAt: new Date().toISOString()
  };
  const updatedWorker = { ...existing, ...workerData, modulesCompleted: completed, practicalResults };

  if (existingIndex >= 0) {
    roster[existingIndex] = updatedWorker;
  } else {
    roster.unshift(updatedWorker);
  }

  const jsonStr = JSON.stringify(roster);
  localStorage.setItem(STORAGE_KEYS.WORKERS_ROSTER, jsonStr);
  Preferences.set({ key: STORAGE_KEYS.WORKERS_ROSTER, value: jsonStr });
  appendOperationalEvent('PRACTICAL_DRILL_COMPLETED', { workerId: updatedWorker.id, module: completedModule, score: result?.score ?? null, status: practicalResults[completedModule]?.status || 'PASS' });
  return updatedWorker;
};

export const generateLocalDemoRecordId = (workerId) => {
  const str = workerId + '_' + Date.now() + '_LOCAL_DEMO';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'LOCAL-JH-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export const findLocalDemoRecord = (recordIdOrWorkerId) => {
  const roster = getWorkerRoster();
  const cleanInput = recordIdOrWorkerId.trim().toUpperCase();
  return roster.find(w => 
    (w.localRecordId && w.localRecordId.toUpperCase() === cleanInput) ||
    w.id.toUpperCase() === cleanInput
  );
};
