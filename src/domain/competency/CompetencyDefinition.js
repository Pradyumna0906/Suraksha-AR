export function getCompetencyDefinition(scenario, competencyId) {
  return scenario.competencies.find(competency => competency.id === competencyId);
}
