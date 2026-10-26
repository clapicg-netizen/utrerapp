// src/lib/consoService.js

export async function consultarConsoIA(preguntaUsuario) {
  // Usamos tu clave de API directamente
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "TU_API_KEY";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptSistema = "Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, hablas con naturalidad y conoces todo sobre Utrera: sus monumentos (Santa María, el Santuario), su historia, ferias, tradiciones, panaderías, comercios, clima actual y datos prácticos. Responde de forma clara, directa y útil en tiempo real para los vecinos y visitantes. No menciones que eres un modelo de lenguaje; eres Conso, la IA en tiempo real de Utrerapp.";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${promptSistema}\n\nPregunta del vecino: ${preguntaUsuario}` }]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data && data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Respuesta inválida de la API");
    }
  } catch (error) {
    console.error("Error al conectar en tiempo real con Conso IA:", error);
    return "¡Vaya! En este momento tengo la línea un poco saturada, pero ya mismo recupero la conexión en tiempo real. Pregúntame por las farmacias de guardia o los trenes mientras tanto.";
  }
}