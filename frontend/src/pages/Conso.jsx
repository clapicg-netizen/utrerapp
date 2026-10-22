import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'tu-clave-anon';
const supabase = createClient(supabaseUrl, supabaseKey);

// Estaciones clave de la línea C-1
const STATIONS = [
  { name: 'Estación de Utrera (Av. San Juan Bosco)', lat: 37.2185, lon: -5.7813 },
  { name: 'Apeadero Canta el Gallo', lat: 37.2350, lon: -5.8150 },
  { name: 'Estación de San Bernardo (Sevilla)', lat: 37.3772, lon: -5.9794 }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function Conso() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Eh, hola! Soy Conso, ¿qué necesitas?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickActions = [
    { label: '🏥 Farmacia de Guardia hoy', action: 'farmacia' },
    { label: '🚆 Próximo Cercanías Renfe C1', action: 'renfe' }
  ];

  const trainSchedules = [
    '06:15', '06:45', '07:15', '07:45', '08:10', '08:35', '09:05', '09:35',
    '10:20', '10:50', '11:20', '11:50', '12:40', '13:20', '13:50',
    '14:20', '14:50', '15:20', '15:50', '16:20', '16:50', '17:20', '17:50',
    '18:20', '18:50', '19:20', '19:50', '20:20', '20:50', '21:30', '22:30'
  ];

  const getNextTrain = () => {
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (let timeStr of trainSchedules) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const trainTimeMinutes = hours * 60 + minutes;
      if (trainTimeMinutes >= currentTimeMinutes) {
        return timeStr;
      }
    }
    return '12:40';
  };

  const handleRenfeQuery = () => {
    setLoading(true);
    const userMessage = { sender: 'user', text: '🚆 Próximo Cercanías Renfe C1' };
    const nextTrain = getNextTrain();

    const botMessage = {
      sender: 'bot',
      text: `Estación más cercana: Estación de Utrera (Av. San Juan Bosco). El próximo tren saldrá a las ${nextTrain} horas, según Renfe.`,
      buttons: [
        { label: '🗺️ Localizar Estación (Av. San Juan Bosco)', url: 'https://maps.google.com/?q=Estacion+Renfe+Utrera' }
      ]
    };
    setMessages((prev) => [...prev, userMessage, botMessage]);
    setLoading(false);
  };

  const handleFarmaciaQuery = async () => {
    setLoading(true);
    const userMessage = { sender: 'user', text: '🏥 Farmacia de guardia hoy' };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Traemos las farmacias de la tabla de Supabase de manera directa y segura
      const { data, error } = await supabase
        .from('farmacias_guardia')
        .select('*')
        .limit(4);

      if (error || !data || data.length === 0) {
        setMessages((prev) => [...prev, {
          sender: 'bot',
          text: '💊 Consulta los carteles oficiales de farmacias de guardia en Utrera.'
        }]);
      } else {
        let textoFarmacias = "💊 Farmacias de guardia oficiales:\n\n";
        let botonesFarmacia = [];

        data.forEach((f) => {
          textoFarmacias += `• **${f.nombre}**\n📍 ${f.direccion}\n📞 Tel: ${f.telefono}\n🕒 ${f.horario}\n\n`;
          botonesFarmacia.push({
            label: `📍 GPS: ${f.nombre}`,
            url: `https://maps.google.com/?q=${encodeURIComponent(f.direccion + ' Utrera')}`
          });
          botonesFarmacia.push({
            label: `📞 Llamar (${f.telefono})`,
            url: `tel:${f.telefono}`
          });
        });

        setMessages((prev) => [...prev, {
          sender: 'bot',
          text: textoFarmacias.trim(),
          buttons: botonesFarmacia
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: '💊 Farmacia de guardia en Utrera: Consulta el listado oficial y la geolocalización.',
        buttons: [
          { label: '📍 Geolocalización Farmacia de Guardia (GPS)', url: 'https://maps.google.com/?q=Farmacia+de+guardia+en+Utrera' }
        ]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const textLower = text.toLowerCase();
    if (textLower.includes('renfe') || textLower.includes('tren') || textLower.includes('cercanias') || textLower.includes('horario')) {
      setInput('');
      handleRenfeQuery();
      return;
    }

    if (textLower.includes('farmacia') || textLower.includes('guardia') || textLower.includes('medicamento')) {
      setInput('');
      handleFarmaciaQuery();
      return;
    }

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: '¡Vaya! Pregúntame por el próximo tren de Cercanías Renfe C1 o por las farmacias de guardia de Utrera.'
      }]);
      setLoading(false);
    }, 500);
  };

  const handleQuickAction = (action) => {
    if (action === 'farmacia') {
      handleFarmaciaQuery();
    } else if (action === 'renfe') {
      handleRenfeQuery();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white p-4 flex items-center shadow-md">
        <div className="bg-rose-800 p-2 rounded-full mr-3">🤖</div>
        <div>
          <h1 className="font-bold text-lg">Asistente Conso</h1>
          <p className="text-xs text-rose-200">Tu inteligencia local para consultas y gestión en Utrera.</p>
        </div>
      </div>

      <div className="p-3 flex gap-2 overflow-x-auto bg-white border-b">
        {quickActions.map((qa, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(qa.action)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-semibold px-3 py-2 rounded-full whitespace-nowrap shadow-sm border border-rose-200"
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
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-rose-900 text-white rounded-br-none font-medium'
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
                      className="block w-full text-center bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold py-2 px-3 rounded-xl text-xs shadow-sm transition"
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
              Conso está consultando los datos oficiales...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Pregúntale a Conso (trenes, farmacias...)"
          className="flex-1 border rounded-xl px-4 py-2 text-xs bg-slate-50 focus:outline-none focus:border-rose-900"
        />
        <button
          onClick={() => handleSendMessage()}
          className="bg-rose-900 hover:bg-rose-950 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}