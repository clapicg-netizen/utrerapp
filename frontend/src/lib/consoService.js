// src/lib/consoService.js
export async function consultarConsoIA(preguntaUsuario) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Falta la clave VITE_GEMINI_API_KEY en el entorno");
    return "¡Vaya, jefe! No encuentro la llave de acceso a la IA. Revísala en Vercel.";
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: "Eres Conso, el asistente virtual oficial de Utrera (Sevilla). Eres amable, cercano, hablas con naturalidad y conoces todo sobre Utrera: sus monumentos, su historia, ferias, tradiciones, panaderías, comercios, clima actual y datos prácticos. Responde de forma clara, directa y útil en tiempo real para los vecinos y visitantes. No menciones que eres un modelo de lenguaje; eres Conso, la IA en tiempo real de Utrerapp." },
              { text: preguntaUsuario }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Respuesta inesperada de Gemini:", data);
      return "¡Vaya, jefe! He recibido una respuesta extraña del servidor, pero aquí sigo al pie del cañón.";
    }
  } catch (error) {
    console.error("Error de red al conectar con Gemini:", error);
    return "¡Vaya, jefe! Ha saltado un pequeño detalle técnico en la red, pero aquí estoy al pie del cañón.";
  }
}