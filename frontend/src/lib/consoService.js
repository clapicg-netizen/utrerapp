// src/lib/consoService.js

export async function consultarConsoIA(preguntaUsuario) {
  const apiKey = "AIzaSyAzVp6-6Pq2hT1G_mX4vL9k8nJ3sR5yW7x";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Estructura oficial requerida por la API de Google Generative AI
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, hablas con naturalidad y conoces todo sobre Utrera: sus monumentos, su historia, ferias, tradiciones, panaderías, comercios, clima actual y datos prácticos. Responde de forma clara, directa y útil en tiempo real para los vecinos y visitantes. No menciones que eres un modelo de lenguaje; eres Conso, la IA en tiempo real de Utrerapp.\n\nPregunta del vecino: ${preguntaUsuario}`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Estructura de respuesta inesperada:", data);
      throw new Error("Respuesta inválida de la API");
    }
  } catch (error) {
    console.error("Error al conectar en tiempo real con Conso IA:", error);
    return `ℹ️ Sobre "${preguntaUsuario}", Utrera cuenta con una gran actividad y servicios municipales. Recuerda que puedes consultarme directamente por las **farmacias de guardia**, los **horarios de trenes** o los **aparcamientos**. ¡Dime en qué más te puedo ayudar!`;
  }
}