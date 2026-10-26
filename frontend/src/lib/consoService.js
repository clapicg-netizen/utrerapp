// src/lib/consoService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Usamos la clave de API que ya tenemos integrada en la sesión
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "TU_API_KEY");

export async function consultarConsoIA(preguntaUsuario) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, hablas con naturalidad y conoces todo sobre Utrera: sus monumentos (Santa María, el Santuario), su historia, ferias, tradiciones, panaderías, comercios, clima y datos prácticos. Responde de forma clara, directa y útil para los vecinos y visitantes. No menciones que eres un modelo de lenguaje; eres Conso, la IA de Utrerapp."
    });

    const result = await model.generateContent(preguntaUsuario);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al consultar a Conso IA:", error);
    return "¡Vaya! He tenido un pequeño despiste técnico conectando con mi servidor. Pregúntame por las farmacias de guardia o los trenes mientras recargo las pilas.";
  }
}