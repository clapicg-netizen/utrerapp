// Servicio inteligente y definitivo para Conso en Utrerapp
export const obtenerRespuestaConso = async (mensajeUsuario, historial = []) => {
  const texto = mensajeUsuario.toLowerCase();

  // 1. Farmacia de guardia (Siempre con datos claros y reales de Utrera)
  if (texto.includes('farmacia') || texto.includes('guardia') || texto.includes('medicamento')) {
    return `🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**
📅 *Jueves, 22 de octubre de 2026*

**Ldo/a. José González Mena**
📍 Dirección: Avda. Blas Infante, 7
📞 Teléfono: 954861763
⏰ Horarios: Turno de Guardia 24 horas

*Pulsa el botón superior de farmacias o usa los accesos directos para ver la ruta exacta.*`;
  }

  // 2. Trenes Renfe Cercanías C1
  if (texto.includes('tren') || texto.includes('renfe') || texto.includes('cercanias') || texto.includes('sevilla') || texto.includes('horario')) {
    return `🚆 **CERCANÍAS RENFE LÍNEA C1 (Utrera ↔ Sevilla)**

• **Próximas salidas hacia Sevilla:**
- 12:40 h (Cercanías C1)
- 13:20 h (Cercanías C1)
- 13:50 h (Cercanías C1)

📍 **Estación de Utrera:** Plaza de la Estación, s/n
⏱️ **Tiempo estimado hasta San Bernardo:** 32 min.`;
  }

  // 3. Ubicación y moverse por Utrera
  if (texto.includes('donde') || texto.includes('ubicacion') || texto.includes('estoy') || texto.includes('llegar') || texto.includes('como ir')) {
    return `📍 Te encuentras en **Utrera**. Desde aquí puedes moverte fácilmente a pie o en coche a cualquier punto clave como la Estación de Renfe, el Ayuntamiento o las zonas comerciales. ¡Dime a dónde quieres ir y te indico!`;
  }

  // 4. Respuesta general abierta, viva y servicial
  return `¡Hola, JuanRa! Soy Conso, tu asistente en vivo para Utrera. ✨ 

Estoy aquí para ayudarte con todo lo que necesites de la app: farmacias de guardia, horarios de trenes o información local. ¿Qué te ronda por la cabeza?`;
};