import { GoogleGenAI, Type } from "@google/genai";

// Safe access to process.env for browser compatibility
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const analyzeRisks = async (description: string, location: string): Promise<{ risks: string[], mitigations: string[] }> => {
  if (!apiKey) {
    console.warn("API Key not found, returning mock data");
    return {
      risks: ["Riesgo genérico de caída (Demo)", "Riesgo de atropello (Demo)"],
      mitigations: ["Usar arnés de seguridad", "Delimitar la zona"]
    };
  }

  try {
    const prompt = `
      Actúa como un experto senior en Seguridad e Higiene Industrial (H&S).
      Analiza la siguiente tarea de Mantenimiento o Cambio (MOC):
      
      Tarea: ${description}
      Ubicación: ${location}

      Identifica los 3 riesgos principales y 3 medidas de mitigación o estándares específicos que se deben aplicar.
      Devuelve la respuesta estrictamente en formato JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de riesgos identificados"
            },
            mitigations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de mitigaciones o estándares a aplicar"
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Error analyzing risks:", error);
    return {
      risks: ["Error al analizar riesgos con IA. Revise manualmente."],
      mitigations: ["Realizar análisis de riesgos manual (AST/APR)."]
    };
  }
};