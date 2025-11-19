
import { GoogleGenAI, Type } from "@google/genai";
import { DeliveryStop, RoutePlan } from "../types";

// Initialize the Gemini API client
// The API key is injected via the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const parseAndOptimizeRoute = async (fileContent: string): Promise<RoutePlan> => {
  try {
    // We use a schema to force Gemini to return a strictly structured JSON object
    // This handles both the parsing of the CSV/Text AND the logical routing optimization in one step.
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        Você é um especialista em logística e roteirização.
        Analise o seguinte conteúdo de um arquivo de entregas.
        
        ATENÇÃO AOS DADOS: O usuário informou que a planilha contém as colunas: "Código do cliente", "Nome do Cliente" e "CEP".
        O CEP é o último campo crucial para a localização se o endereço não estiver explícito.

        Tarefas:
        1. Extraia as paradas de entrega identificando o CÓDIGO DO CLIENTE, NOME DO CLIENTE e CEP.
        2. Se houver endereço, use-o. Se não houver, USE O CEP para estimar a localização (Latitude/Longitude) e preencha o campo endereço com uma descrição baseada no CEP (ex: "Região do CEP X").
        3. Organize-as em uma ordem lógica de rota otimizada (Problema do Caixeiro Viajante), minimizando a distância total.
        4. Estime a distância total e o tempo total considerando trânsito urbano médio.

        Conteúdo do Arquivo:
        ${fileContent}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stops: {
              type: Type.ARRAY,
              description: "Lista ordenada de paradas otimizadas.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  clientCode: { type: Type.STRING, description: "Código identificador do cliente" },
                  customerName: { type: Type.STRING, description: "Nome do cliente" },
                  zipCode: { type: Type.STRING, description: "CEP da entrega" },
                  address: { type: Type.STRING, description: "Endereço completo ou descrição da região do CEP" },
                  city: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["Alta", "Normal", "Baixa"] },
                  estimatedLat: { type: Type.NUMBER, description: "Latitude estimada" },
                  estimatedLng: { type: Type.NUMBER, description: "Longitude estimada" },
                  notes: { type: Type.STRING },
                  orderIndex: { type: Type.INTEGER },
                  // assignedFleetId is not parsed from Gemini, handled by Frontend, so not required in schema
                },
                required: ["id", "customerName", "orderIndex", "estimatedLat", "estimatedLng"]
              }
            },
            totalDistanceKm: { type: Type.NUMBER },
            totalTimeMinutes: { type: Type.NUMBER },
            summary: { type: Type.STRING, description: "Um breve resumo da rota gerada." }
          },
          required: ["stops", "totalDistanceKm", "totalTimeMinutes", "summary"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from Gemini");
    }

    const result = JSON.parse(jsonText) as RoutePlan;
    return result;

  } catch (error) {
    console.error("Error parsing route with Gemini:", error);
    throw error;
  }
};

export const parseTeamAvailability = async (rosterContent: string): Promise<{name: string, status: string}[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        Analise o texto abaixo, que representa uma escala de trabalho ou lista de funcionários.
        Identifique os funcionários que estão marcados como INDISPONÍVEIS para o dia de hoje (Ex: Folga, Férias, Atestado, Off, DSR, Ausente).
        
        Ignore quem está trabalhando ou "Normal". Retorne apenas quem NÃO VAI TRABALHAR.
        
        Texto da Escala:
        ${rosterContent}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nome do funcionário indisponível" },
              status: { type: Type.STRING, description: "O motivo da indisponibilidade (ex: Folga, Férias)" }
            },
            required: ["name", "status"]
          }
        }
      }
    });

    const jsonText = response.text;
    if(!jsonText) return [];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing roster:", error);
    return [];
  }
};

export const generateMockData = (): string => {
  return `
Código do Cliente;Nome do Cliente;CEP;Endereço;Prioridade
C001;Padaria do João;01310-100;Av. Paulista, 1000;Alta
C002;Mercado da Esquina;01302-000;Rua da Consolação, 500;Normal
C003;Tech Solutions;04551-060;Rua Funchal, 200;Normal
C004;Dona Maria;01304-001;Rua Augusta, 1500;Normal
C005;Escritório Central;01451-000;Av. Brigadeiro Faria Lima, 3000;Baixa
C006;Loja de Games;05425-070;Shopping Eldorado;Baixa
  `;
};
