import React, { useState, useRef, useEffect } from 'react';
import { obtenerRespuestaConso } from '../lib/consoService';

export default function Conso() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy Conso, tu asistente de Utrera. 👋 Pregúntame por las farmacias de guardia o los horarios de Renfe.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const respuestaBot = await obtenerRespuestaConso(text, newMessages);
      setMessages((prev) => [...prev, { sender: 'bot', text: respuestaBot }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Vaya, ha ocurrido un pequeño error al procesar tu consulta.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '🏥 Farmacia de guardia hoy', text: 'farmacia de guardia hoy' },
    { label: '🚆 Próximo tren a Sevilla', text: 'próximo tren a sevilla' }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white p-4 flex items-center shadow-md">
        <div className="bg-rose-800 p-2 rounded-full mr-3">✨</div>
        <div>
          <h1 className="font-bold text-lg">Asistente Conso</h1>
          <p className="text-xs text-rose-200">Tu inteligencia local para consultas en Utrera.</p>
        </div>
      </div>

      <div className="p-3 flex gap-2 overflow-x-auto bg-white border-b">
        {quickActions.map((qa, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qa.text)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold px-3 py-2 rounded-full whitespace-nowrap shadow-sm border border-amber-300 transition"
          >
            {qa.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-white rounded-br-none font-medium'
                  : 'bg-white border text-slate-800 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border p-3 rounded-2xl text-xs text-slate-500 animate-pulse">
              Conso está procesando tu respuesta...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Pregúntale a Conso (trenes, farmacias...)"
          className="flex-1 border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={() => handleSendMessage()}
          className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}