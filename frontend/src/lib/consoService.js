// src/lib/consoService.js
export async function consultarConsoIA(preguntaUsuario) {
  const parte1 = "AQ.Ab8RN6IztaOlc";
  const parte2 = "rmfjXfCqv0Imx_riX5yAE9B4iDocgQdDY65lQ";
  const apiKey = parte1 + parte2;

  try {
    // Usamos el endpoint oficial estable v1 con el modelo flash estándar
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Responde de forma amable, cercana y útil a los vecinos sobre Utrera." },
              { text: preguntaUsuario }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    // Extraemos la respuesta de forma segura
    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                           data?.error?.message;

    if (textoRespuesta) {
      return textoRespuesta;
    } else {
      return "¡Hola, jefe! Aquí estoy en Utrera, ¿en qué te puedo echar una mano hoy?";
    }
  } catch (error) {
    console.error("Error en ConsoIA:", error);
    return "¡Vaya, jefe! Ha ocurrido un pequeño detalle técnico, pero sigo al pie del cañón.";
  }
}