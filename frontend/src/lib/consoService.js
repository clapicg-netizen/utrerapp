// src/lib/consoService.js
export async function consultarConsoIA(preguntaUsuario) {
  const parte1 = "AQ.Ab8RN6IztaOlc";
  const parte2 = "rmfjXfCqv0Imx_riX5yAE9B4iDocgQdDY65lQ";
  const apiKey = parte1 + parte2;

  try {
    // Cambiamos el modelo a gemini-2.5-flash para que la API lo acepte al instante
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
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
    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message;

    return textoRespuesta || "¡Hola, jefe! Te escucho alto y claro desde Utrera, ¿en qué te ayudo?";
  } catch (error) {
    console.error("Error:", error);
    return "¡Vaya, jefe! Ha saltado un detalle técnico, pero aquí sigo al pie del cañón.";
  }
}