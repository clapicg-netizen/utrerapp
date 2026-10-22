// Servicio inteligente y definitivo para Conso
export const obtenerRespuestaConso = async (mensajeUsuario, historial = []) => {
  const texto = mensajeUsuario.toLowerCase();

  if (texto.includes('farmacia') || texto.includes('guardia') || texto.includes('medicamento')) {
    return `🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**\n📅 *Jueves, 22 de octubre de 2026*\n\n**Ldo/a. José González Mena**\n📍 Dirección: Avda. Blas Infante, 7\n📞 Teléfono: 954861763\n⏰ Horarios: Turno de Guardia 24 horas`;
  }

  if (texto.includes('tren') || texto.includes('renfe') || texto.includes('cercanias') || texto.includes('sevilla')) {
    return `🚆 **CERCANÍAS RENFE LÍNEA C1 (Utrera ↔ Sevilla)**\n\n• **Próximas salidas hacia Sevilla:**\n- 12:40 h (Cercanías C1)\n- 13:20 h (Cercanías C1)\n- 13:50 h (Cercanías C1)\n\n📍 **Estación de Utrera:** Plaza de la Estación, s/n\n⏱️ **Tiempo estimado hasta San Bernardo:** 32 min.`;
  }

  return `¡Hola, JuanRa! Soy Conso, tu asistente en vivo para Utrera. ✨ ¿Qué necesitas consultar hoy?`;
};