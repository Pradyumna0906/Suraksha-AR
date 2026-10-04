const LEDGER_KEY = 'raksha360_operational_ledger';
const QUEUE_KEY = 'raksha360_sync_queue';

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export function appendOperationalEvent(type, payload = {}) {
  const entry = Object.freeze({
    id: crypto.randomUUID?.() || `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    payload,
    recordedAt: new Date().toISOString(),
    syncState: navigator.onLine ? 'PENDING_SYNC' : 'QUEUED_OFFLINE'
  });
  const ledger = read(LEDGER_KEY);
  const queue = read(QUEUE_KEY);
  write(LEDGER_KEY, [...ledger, entry].slice(-500));
  write(QUEUE_KEY, [...queue, entry].slice(-200));
  return entry;
}

export const getOperationalEvents = () => read(LEDGER_KEY);
export const getPendingSyncEvents = () => read(QUEUE_KEY);

// Deliberately does not send data anywhere. A deployed version must replace this
// adapter with authenticated, encrypted API transport and server acknowledgement.
export function markServerAcknowledged(eventIds) {
  const ids = new Set(eventIds);
  write(QUEUE_KEY, read(QUEUE_KEY).filter(event => !ids.has(event.id)));
}
