// src/lib/consoService.js
export async function consultarConsoIA(preguntaUsuario) {
  const parte1 = "AQ.Ab8RN6IztaOlc";
  const parte2 = "rmfjXfCqv0Imx_riX5yAE9B4iDocgQdDY65lQ";
  const apiKey = parte1 + parte2;

  try {
    // Usamos gemini-1.5-flash que es el modelo estándar más rápido y estable
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
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
    console.log("Respuesta de Gemini:", data);

    // Capturamos el texto de forma segura con varias alternativas por si cambia el formato
    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                           data?.error?.message;

    if (textoRespuesta) {
      return textoRespuesta;
    } else {
      return "¡Hola, jefe! Aquí estoy en Utrera, ¿en qué te puedo echar una mano hoy?";
    }
  } catch (error) {
    console.error("Error en ConsoIA:", error);
    return "¡Vaya, jefe! Me he quedado un momento sin cobertura, dímelo otra vez por favor.";
  }
}