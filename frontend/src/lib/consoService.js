// Servicio simplificado y autónomo para Conso
export const obtenerRespuestaConso = async (mensajeUsuario, historial = []) => {
  const texto = mensajeUsuario.toLowerCase();

  // Si pregunta por farmacias
  if (texto.includes('farmacia') || texto.includes('guardia')) {
    return `🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**
- **Ldo/a. Francisco Javier González Mancha**
📍 Dirección: Real, 29
📞 Teléfono: 954861840
⏰ Horarios: Turno de Guardia 24 horas`;
  }

  // Respuesta general por defecto
  return `¡Hola! Soy Conso, tu asistente de Utrera. 👋 
Puedes preguntarme por las farmacias de guardia o pulsar el botón de Cercanías para calcular tu distancia a la estación y ver los próximos trenes según Renfe.`;
};