import React, { useState } from 'react';
import { obtenerRespuestaConso } from '../lib/consoService';

// Coordenadas de las estaciones clave de la línea C-1
const STATIONS = [
  { name: 'Estación de Utrera', lat: 37.2185, lon: -5.7813 },
  { name: 'Apeadero Canta el Gallo', lat: 37.2350, lon: -5.8150 },
  { name: 'Estación de San Bernardo (Sevilla)', lat: 37.3772, lon: -5.9794 }
];

// Fórmula de Haversine para calcular la distancia en metros entre dos coordenadas GPS
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la tierra en metros
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
      text: '¡Hola! Soy Conso, tu asistente de Utrera. 👋\nPregúntame por las farmacias de guardia o los horarios de Renfe y te llevaré directamente.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickActions = [
    { label: '🏥 Farmacia de Guardia hoy', action: 'farmacia' },
    { label: '🚆 Próximo Cercanías Renfe C1', action: 'renfe' }
  ];

  // Horarios base de salida hacia Sevilla (Línea C-1)
  const trainSchedules = [
    '06:15', '06:45', '07:15', '07:45', '08:10', '08:35', '09:05', '09:35',
    '10:20', '10:50', '11:20', '11:50', '12:20', '12:50', '13:20', '13:50',
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
    return '06:15 (del día siguiente)';
  };

  const handleRenfeQuery = () => {
    setLoading(true);
    const userMessage = { sender: 'user', text: '🚆 Próximo Cercanías Renfe C1' };
    
    if (!navigator.geolocation) {
      const nextTrain = getNextTrain();
      const botMessage = {
        sender: 'bot',
        text: `El próximo tren sale a las ${nextTrain} según Renfe. (Tu dispositivo no soporta geolocalización).`,
        buttons: [
          { label: '🗺️ Ir a Estación de Utrera', url: 'https://maps.google.com/?q=Estacion+Renfe+Utrera' },
          { label: '📱 Web oficial Renfe', url: 'https://www.renfe.com' }
        ]
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        let closestStation = STATIONS[0];
        let minDistance = calculateDistance(userLat, userLon, closestStation.lat, closestStation.lon);

        for (let i = 1; i < STATIONS.length; i++) {
          const dist = calculateDistance(userLat, userLon, STATIONS[i].lat, STATIONS[i].lon);
          if (dist < minDistance) {
            minDistance = dist;
            closestStation = STATIONS[i];
          }
        }

        const nextTrain = getNextTrain();
        const distanceText = minDistance < 1000 ? `${minDistance} metros` : `${(minDistance / 1000).toFixed(1)} km`;

        const botMessage = {
          sender: 'bot',
          text: `El próximo tren sale a las ${nextTrain} según Renfe, te encuentras a ${distanceText} de la ${closestStation.name}.`,
          buttons: [
            { label: `🗺️ Ir a ${closestStation.name}`, url: `https://maps.google.com/?q=${encodeURIComponent(closestStation.name)}` },
            { label: '📱 Consultar horarios oficiales Renfe', url: 'https://www.renfe.com' }
          ]
        };

        setMessages((prev) => [...prev, userMessage, botMessage]);
        setLoading(false);
      },
      (error) => {
        const nextTrain = getNextTrain();
        const botMessage = {
          sender: 'bot',
          text: `El próximo tren sale a las ${nextTrain} según Renfe. (No se pudo obtener la ubicación GPS: ${error.message}).`,
          buttons: [
            { label: '🗺️ Ir a Estación de Utrera', url: 'https://maps.google.com/?q=Estacion+Renfe+Utrera' },
            { label: '📱 Web oficial Renfe', url: 'https://www.renfe.com' }
          ]
        };
        setMessages((prev) => [...prev, userMessage, botMessage]);
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    if (text.toLowerCase().includes('renfe') || text.toLowerCase().includes('tren') || text.toLowerCase().includes('cercanias')) {
      handleRenfeQuery();
      return;
    }

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
        text: `🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**\n📅 *MARTES, 13 DE OCTUBRE*\n\n- **Ldo/a. Francisco Javier González Mancha**\n📍 Dirección: Real, 29\n📞 Teléfono: 954861840\n⏰ Horarios: Turno de Guardia 24 horas`,
        buttons: [
          { label: '🗺️ Te llevo a Francisco Javier González Mancha', url: 'https://maps.google.com/?q=Real+29+Utrera' },
          { label: '📞 Llamar a Francisco Javier González Mancha (954861840)', url: 'tel:954861840' }
        ]
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
    } else if (action === 'renfe') {
      handleRenfeQuery();
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
              Conso está consultando tu ubicación y el próximo tren...
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