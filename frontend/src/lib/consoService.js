// src/lib/consoService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Usamos el formato compatible con CRACO (process.env)
const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
console.log("ESTADO API KEY GEMINI:", apiKey ? "¡Clave cargada correctamente!" : "¡ADVERTENCIA: La clave está vacía!");

// Inicializamos con el SDK correcto
const genAI = new GoogleGenerativeAI(apiKey);

export async function obtenerRespuestaConso(mensajeUsuario, historialMensajes = []) {
  try {
    // Usamos gemini-1.5-flash con la estructura estándar de la librería
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: 'Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, servicial y utilizas expresiones locales o un tono muy cordial de pueblo ("vecino", "por Utrera"). Ayudas con información sobre farmacias de guardia, trenes de cercanías de la línea C-1, aparcamientos, autobuses y cualquier duda sobre la localidad.',
    });

    // Transformamos el historial al formato que espera startChat o generateContent
    // Para simplificar y evitar errores de estructura con el SDK, pasamos el historial como bloques de contenido o usamos chat si lo prefieres.
    // Vamos a mantener la compatibilidad exacta de tus contents:
    const contents = historialMensajes.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: mensajeUsuario }]
    });

    const result = await model.generateContent({
      contents: contents,
    });

    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error al conectar con Gemini:", error);
    return "Lo siento, vecino, en este momento no puedo conectar con el servicio.";
  }
}