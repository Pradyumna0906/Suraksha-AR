export function appendEvent(events, event) {
  return Object.freeze([...events, event]);
}

export function actionEvents(events) {
  return events.filter(event => event.type !== 'SCENARIO_STARTED' && event.type !== 'SCENARIO_COMPLETED');
}
