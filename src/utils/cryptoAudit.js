// Legacy helper retained for the experimental pre-shift demonstration. It creates
// a local display note only; it does not validate identity or work readiness.
export function createLocalDemoNote(dataObj) {
  const workerId = dataObj?.workerId || dataObj?.id || 'WORKER';
  return `LOCAL-DEMO-${workerId}-${Date.now()}`;
}
