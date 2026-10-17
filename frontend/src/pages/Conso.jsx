import React, { useState } from 'react';
import { obtenerRespuestaConso } from '../lib/consoService';

export default function Conso() {
  // Saludo inicial estándar oficial
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy Conso, tu asistente de Utrera. 👋\nPregúntame por las farmacias de guardia o los horarios de Renfe y te llevaré directamente.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickActions = [
    { label: '🏥 Farmacia de Guardia hoy', action: 'farmacia' },
    { label: '🚆 Próximo Cercanías Renfe C1', action: 'renfe' }
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const botReplyText = await obtenerRespuestaConso(text, updatedMessages);
      setMessages((prev) => [...prev, { sender: 'bot', text: botReplyText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Lo siento, ha ocurrido un error al conectar con Conso.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'farmacia') {
      const userMessage = { sender: 'user', text: '🏥 Farmacia de Guardia hoy' };
      const botMessage = {
        sender: 'bot',
        text: `🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**
📅 *MARTES, 13 DE OCTUBRE*

• **Ldo/a. Francisco Javier González Mancha**
📍 Dirección: Real, 29
📞 Teléfono: 954861840
⏰ Horarios: Turno de Guardia 24 horas`,
        buttons: [
          { label: '🗺️ Te llevo a Francisco Javier González Mancha', url: 'https://maps.google.com/?q=Real+29+Utrera' },
          { label: '📞 Llamar a Francisco Javier González Mancha (954861840)', url: 'tel:954861840' }
        ]
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
    } else if (action === 'renfe') {
      const userMessage = { sender: 'user', text: '🚆 Próximo Cercanías Renfe C1' };
      const botMessage = {
        sender: 'bot',
        text: `🚆 **CERCANÍAS RENFE LÍNEA C1 (Utrera ↔ Sevilla)**

• **Próximas salidas Utrera dirección Sevilla:**
  - 09:35 h (Cercanías C1)
  - 09:58 h (Media Distancia)
  - 10:20 h (Cercanías C1)
  - 10:50 h (Cercanías C1)

📍 **Estación de Trenes de Utrera:** Plaza de la Estación, s/n
⏱️ **Tiempo estimado a San Bernardo:** 32 min.`,
        buttons: [
          { label: '🗺️ Te llevo a la Estación de Renfe', url: 'https://maps.google.com/?q=Estacion+Renfe+Utrera' },
          { label: '📱 Consultar horarios oficiales Renfe', url: 'https://www.renfe.com' }
        ]
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Cabecera */}
      <div className="bg-amber-900 text-white p-4 flex items-center shadow-md">
        <div className="bg-amber-700 p-2 rounded-full mr-3">🤝</div>
        <div>
          <h1 className="font-bold text-lg">Conso 🤖</h1>
          <p className="text-xs text-amber-200">Asistente Virtual de Utrera</p>
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="p-3 flex gap-2 overflow-x-auto bg-white border-b">
        {quickActions.map((qa, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(qa.action)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold px-3 py-2 rounded-full whitespace-nowrap shadow-sm border border-amber-300"
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Área de Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-white rounded-br-none font-medium'
                  : 'bg-white border text-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.buttons && (
                <div className="mt-3 space-y-2">
                  {msg.buttons.map((btn, bIdx) => (
                    <a
                      key={bIdx}
                      href={btn.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-3 rounded-xl text-xs shadow-sm transition"
                    >
                      {btn.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border p-3 rounded-2xl text-xs text-slate-500 animate-pulse">
              Conso está pensando...
            </div>
          </div>
        )}
      </div>

      {/* Entrada de texto */}
      <div className="p-3 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Escribe tu consulta a Conso..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={() => handleSendMessage()}
          className="bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-full shadow-md transition"
        >
          ➤
        </button>
      </div>
    </div>
  );
}