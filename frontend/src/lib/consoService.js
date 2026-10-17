import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const SYSTEM_INSTRUCTION = `Eres Conso, la asistente virtual oficial de Utrerapp (la guía local de Utrera). 
Tu objetivo es ayudar a los vecinos y visitantes de Utrera respondiendo a sus preguntas sobre comercios, horarios de transportes (trenes Renfe, autobuses), farmacias de guardia, noticias y lugares de interés de la ciudad.
Sé siempre amable, concisa, cercana y atenta.
Saluda de forma estándar y profesional diciendo: "¡Hola! Soy Conso, tu asistente de Utrera."`;

export const obtenerRespuestaConso = async (mensajeUsuario, historial = []) => {
  try {
    if (!apiKey) {
      return "Hola. Para hablar con Conso, asegúrate de configurar la clave API de Gemini en el archivo .env (REACT_APP_GEMINI_API_KEY).";
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: historial.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage(mensajeUsuario);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error al comunicarse con Conso:', error);
    return 'Lo siento, he tenido un problema al procesar tu consulta. Por favor, inténtalo de nuevo en unos momentos.';
  }
};