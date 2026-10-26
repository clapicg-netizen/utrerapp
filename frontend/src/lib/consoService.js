// src/lib/consoService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAzVp6-6Pq2hT1G_mX4vL9k8nJ3sR5yW7x";
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
    
    const p = preguntaUsuario.toLowerCase();
    if (p.includes('lluvia') || p.includes('llover') || p.includes('tiempo')) {
      return "☁️ Para consultar la previsión de lluvia al minuto en Utrera, te recomiendo revisar el radar meteorológico o la aplicación del tiempo de tu dispositivo.";
    }
    
    return `ℹ️ Entendido sobre "${preguntaUsuario}". Recuerda que también puedes consultarme de forma inmediata por las farmacias de guardia, los horarios de trenes o los aparcamientos. ¡Dime!`;
  }
}