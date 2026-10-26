// src/lib/consoService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function consultarConsoIA(preguntaUsuario) {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyAzVp6-6Pq2hT1G_mX4vL9k8nJ3sR5yW7x");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptCompleto = `Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, hablas con naturalidad y conoces todo sobre Utrera: sus monumentos, su historia, ferias, tradiciones, panaderías, comercios, clima actual y datos prácticos. Responde de forma clara, directa y útil en tiempo real para los vecinos y visitantes. No menciones que eres un modelo de lenguaje; eres Conso, la IA en tiempo real de Utrerapp.\n\nPregunta del vecino: ${preguntaUsuario}`;

    const result = await model.generateContent(promptCompleto);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error detallado en Conso IA:", error);
    return `¡Vaya, jefe! Ha saltado un pequeño detalle técnico en la red al conectar con el servidor, pero aquí estoy al pie del cañón. ¿Qué más te gustaría saber sobre Utrera?`;
  }
}