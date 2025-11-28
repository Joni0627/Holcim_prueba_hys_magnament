// This service has been neutralized as per user request to remove AI features.
// It returns mock data to ensure no compilation errors occur in components importing it.

export const analyzeRisks = async (description: string, location: string): Promise<{ risks: string[], mitigations: string[] }> => {
  console.log("AI Analysis is disabled. Returning mock data.");
  return Promise.resolve({
    risks: ["Análisis de IA deshabilitado", "Riesgo genérico"],
    mitigations: ["Realizar análisis manual", "Seguir procedimientos estándar"]
  });
};