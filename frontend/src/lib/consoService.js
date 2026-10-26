// src/lib/consoService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function consultarConsoIA(preguntaUsuario) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, hablas con naturalidad y conoces todo sobre Utrera: sus monumentos, su historia, ferias, tradiciones, panaderías, comercios, clima actual y datos prácticos. Responde de forma clara, directa y útil en tiempo real para los vecinos y visitantes. No menciones que eres un modelo de lenguaje; eres Conso, la IA en tiempo real de Utrerapp."
    });

    const result = await model.generateContent(preguntaUsuario);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error con el SDK de Gemini:", error);
    return `¡Vaya, jefe! Ha saltado un pequeño detalle técnico al conectar con el servidor, pero aquí estoy al pie del cañón. ¿Qué más te gustaría saber sobre Utrera?`;
  }
}