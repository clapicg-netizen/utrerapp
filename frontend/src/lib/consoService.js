// src/lib/consoService.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.REACT_APP_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "" 
});

export async function consultarConsoIA(preguntaUsuario) {
  const texto = preguntaUsuario.toLowerCase();

  // 1. Accesos rápidos exclusivos para botones
  if (texto.includes("farmacia") || texto.includes("guardia") || texto.includes("medicamento")) {
    return "💊 **Farmacias de Guardia en Utrera:** Puedes consultar el listado completo y actualizado de farmacias de guardia para hoy mismo en la sección de Farmacias de Utrerapp o pulsando el acceso directo inferior.";
  }

  if (texto.includes("tren") || texto.includes("renfe") || texto.includes("horarios") || texto.includes("estacion")) {
    return "🚆 **Horarios de Trenes (Cercanías y Media Distancia):** Los trenes de la línea C-1 conectan Utrera con Sevilla Santa Justa y Lebrija de forma regular. Consulta los horarios detallados en la sección de Trenes.";
  }

  if (texto.includes("aparc") || texto.includes("parking") || texto.includes("coche") || texto.includes("estacionar")) {
    return "🚗 **Zonas de Aparcamiento:** Tienes disponibles áreas de estacionamiento público en zonas clave como la Ronda, el recinto ferial y los aldedaños del centro urbano. Consulta los puntos recomendados en la sección de Aparcar.";
  }

  // 2. TODO LO DEMÁS VA DIRECTO A GEMINI (Adiós textos antiguos)
  try {
    const promptSistema = `Eres Conso, la asistente virtual oficial de Utrera (Sevilla). Eres amable, cercana, experta en los servicios locales, comercios, farmacias de guardia, horarios de trenes, autobuses, aparcamientos y costumbres de Utrera. Responde de forma útil, concisa, natural y con un toque andaluz cercano.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${promptSistema}\n\nPregunta del vecino o visitante: ${preguntaUsuario}` }] }
      ],
    });

    return response.text || "Lo siento, vecino, en este momento no puedo conectar con el servicio.";
  } catch (error) {
    console.error("Error al consultar la IA de Conso:", error);
    return "Disculpa, ahora mismo tengo un pequeño problema de conexión con el servicio de inteligencia artificial. Prueba de nuevo en unos segundos.";
  }
}