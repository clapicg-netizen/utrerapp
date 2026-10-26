// src/lib/consoService.js
export async function consultarConsoIA(preguntaUsuario) {
  // Convertimos a minúsculas para buscar palabras clave fácilmente
  const texto = preguntaUsuario.toLowerCase();

  // 1. Pestaña / Consulta de FARMACIAS
  if (texto.includes("farmacia") || texto.includes("guardia") || texto.includes("medicamento")) {
    return "💊 **Farmacias de Guardia en Utrera:** Puedes consultar el listado completo y actualizado de farmacias de guardia para hoy mismo en la sección de Farmacias de Utrerapp o pulsando el acceso directo inferior.";
  }

  // 2. Pestaña / Consulta de TRENES
  if (texto.includes("tren") || texto.includes("renfe") || texto.includes("horarios") || texto.includes("estacion")) {
    return "🚆 **Horarios de Trenes (Cercanías y Media Distancia):** Los trenes de la línea C-1 conectan Utrera con Sevilla Santa Justa y Lebrija de forma regular. Consulta los horarios detallados en la sección de Trenes.";
  }

  // 3. Pestaña / Consulta de APARCAMIENTOS
  if (texto.includes("aparc") || texto.includes("parking") || texto.includes("coche") || texto.includes("estacionar")) {
    return "🚗 **Zonas de Aparcamiento:** Tienes disponibles áreas de estacionamiento público en zonas clave como la Ronda, el recinto ferial y los aldedaños del centro urbano. Consulta los puntos recomendados en la sección de Aparcar.";
  }

  // 4. Consulta de TAXIS (que estabas buscando antes)
  if (texto.includes("taxi") || texto.includes("parada")) {
    return "🚖 **Parada de Taxis en Utrera:** Puedes contactar con la parada principal o solicitar un servicio local directamente desde los teléfonos de emergencia y servicios de la guía de Utrerapp.";
  }

  // Respuesta por defecto cercana y útil
  return `¡Hola, jefe! Te he entendido perfectamente. Como asistente local de Utrera, te recomiendo usar los accesos directos de abajo (**Farmacias**, **Trenes** o **Aparcar**) para ver la info al instante, o preguntarme por taxis, horarios o servicios de nuestra ciudad.`;
}