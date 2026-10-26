// src/lib/consoService.js
export async function consultarConsoIA(preguntaUsuario) {
  const apiKey = "AIzaSyAzVp6-6Pq2hT1G_mX4vL9k8nJ3sR5yW7x";

  try {
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
    console.log("Respuesta completa de Gemini:", data); // Para verla en la consola del navegador si hace falta

    // Extracción robusta de la respuesta
    const textoRespuesta = data?.candidates?.[0]?.output?.text || 
                           data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                           data?.error?.message;

    if (textoRespuesta) {
      return textoRespuesta;
    } else {
      return "¡Hola, jefe! Te escucho alto y claro desde Utrera, ¿en qué te ayudo?";
    }
  } catch (error) {
    console.error("Error:", error);
    return "¡Vaya, jefe! Ha saltado un detalle técnico, pero aquí sigo al pie del cañón.";
  }
}