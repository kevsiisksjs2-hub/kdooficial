
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  // Check offline status immediately
  if (!navigator.onLine) {
    throw new Error('OFFLINE_MODE');
  }

  try {
    return await operation();
  } catch (error: any) {
    if (error.message === 'OFFLINE_MODE') throw error;

    const isUnavailable = 
      error?.status === 503 || 
      error?.code === 503 || 
      error?.message?.includes('503') ||
      error?.message?.includes('UNAVAILABLE');

    if (retries > 0 && isUnavailable) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

const getOfflineMessage = () => "Modo Offline: Función IA no disponible sin conexión.";

export const aiService = {
  async chatMessage(history: any[], message: string) {
    if (!navigator.onLine) return getOfflineMessage();
    
    try {
      return await retryOperation(async () => {
        const formattedContents = history.map(h => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: h.parts
        }));
        formattedContents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: formattedContents,
          config: { 
            systemInstruction: 'Eres el Oficial de Enlace Institucional de KDO. Ayudas con reglamentos, historia del campeonato y logística de circuitos. No hablas de ingeniería ni telemetría. Tu tono es solemne pero cercano.' 
          }
        });
        return response.text;
      });
    } catch (e) {
      return getOfflineMessage();
    }
  },

  async generateNewsDigest() {
    if (!navigator.onLine) return "KDO SYSTEM - MODO OFFLINE ACTIVADO";
    try {
      return await retryOperation(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Genera un titular emocionante para un ticker de noticias de Karting sobre el inicio de la temporada 2026 de KDO. Máximo 15 palabras.',
        });
        return response.text;
      });
    } catch (e) {
      return "KDO SYSTEM - MODO OFFLINE ACTIVADO";
    }
  },

  async getPilotProfileBio(pilotData: any) {
    if (!navigator.onLine) return "Perfil no disponible en modo offline.";
    try {
      return await retryOperation(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Redacta un perfil heroico del piloto ${pilotData.name} (#${pilotData.number}) para el sitio web. Menciona sus victorias y sus puntos de conducta ${pilotData.conductPoints}/10 como prueba de deportividad. Máximo 50 palabras.`,
        });
        return response.text;
      });
    } catch (e) {
      return "Perfil no disponible en modo offline.";
    }
  },

  async analyzeCircuitTips(circuitName: string, conditions: string) {
    if (!navigator.onLine) return "Consejos de IA no disponibles sin conexión.";
    try {
      return await retryOperation(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Como instructor experto de KDO, dame un consejo breve de trayectoria para ${circuitName} sobre tierra en estado ${conditions}. Máximo 30 palabras.`,
        });
        return response.text;
      });
    } catch (e) {
      return "Consejos de IA no disponibles sin conexión.";
    }
  },

  async analyzeAuditLogs(logs: any[]) {
    if (!navigator.onLine) return "Análisis forense requiere conexión al servidor central.";
    try {
      return await retryOperation(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analiza estos registros de auditoría administrativa: ${JSON.stringify(logs.slice(0, 10))}. Resume las 3 acciones más importantes y confirma si la integridad del sistema parece correcta.`,
        });
        return response.text;
      });
    } catch (e) {
      return "Análisis forense requiere conexión al servidor central.";
    }
  },

  async extractLicenseData(base64: string, mimeType: string) {
    if (!navigator.onLine) throw new Error('OFFLINE');
    return retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: "Extract the pilot name, medical license number, sports license number, and kart number from this image. Return as JSON with keys: name, medicalLicense, sportsLicense, number." }
          ]
        },
        config: { responseMimeType: "application/json" }
      });
      try {
        return JSON.parse(response.text || '{}');
      } catch {
        return null;
      }
    });
  },

  async parseRankingData(rawText: string) {
    if (!navigator.onLine) return [];
    return retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza el siguiente texto que contiene datos de pilotos de karting (nombre, número de kart, categoría, puntos). Extrae la información y devuélvela en formato JSON como un arreglo de objetos con las llaves: name, number, category, points. Texto: "${rawText}"`,
        config: { responseMimeType: "application/json" }
      });
      try {
        return JSON.parse(response.text || '[]');
      } catch {
        return [];
      }
    });
  },

  async analyzeStandings(category: string, data: any[]) {
    if (!navigator.onLine) return "Análisis estratégico no disponible offline.";
    try {
      return await retryOperation(async () => {
         const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyze the current standings for category ${category}: ${JSON.stringify(data)}. Provide a brief strategic insight for the championship. Max 40 words.`,
        });
        return response.text;
      });
    } catch (e) {
      return "Análisis estratégico no disponible offline.";
    }
  },

  async regulationSearch(query: string, regulations: any[]) {
    if (!navigator.onLine) return "Búsqueda inteligente desactivada en modo offline.";
    try {
      return await retryOperation(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Based on these regulations: ${JSON.stringify(regulations)}. Answer this query: ${query}. Max 50 words.`,
        });
        return response.text;
      });
    } catch (e) {
      return "Búsqueda inteligente desactivada en modo offline.";
    }
  },

  async processRaceDataForPublishing(category: string, rawResults: any[]) {
    if (!navigator.onLine) return "Resultados procesados sin resumen IA (Modo Offline).";
    try {
        return await retryOperation(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a very short, professional race summary (max 1 sentence) for category ${category} based on these results: ${JSON.stringify(rawResults)}. E.g. "Juan Acosta dominates in wet conditions."`,
            });
            return response.text;
        });
    } catch (e) {
        return "Resultados procesados automáticamente.";
    }
  }
};
