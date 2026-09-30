export function getStateDefinition(scenario, stateId) {
  return scenario.states.find(state => state.id === stateId);
}

export function getDisplayStep(scenario, stateId) {
  return getStateDefinition(scenario, stateId)?.displayStep || 1;
}
