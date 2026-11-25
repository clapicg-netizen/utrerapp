import { PARKING_URL } from '../lib/parking';
// src/pages/Conso.jsx
import React, { useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Pill, Train, Car, Plus, Sun, Moon, Clock, MapPin, Phone, Navigation } from 'lucide-react';

const pharmacyStatus = {
  active: { label: 'Vigente en el momento de la consulta', style: 'bg-emerald-100 text-emerald-950' },
  scheduled: { label: 'Programada', style: 'bg-sky-100 text-sky-950' },
  ended: { label: 'Finalizada', style: 'bg-slate-100 text-slate-700' },
};

const pharmacyGroups = [
  { shift: 'day', title: 'Turno de día', Icon: Sun, style: 'text-amber-900 bg-amber-50' },
  { shift: 'night', title: 'Turno de noche', Icon: Moon, style: 'text-indigo-900 bg-indigo-50' },
];

function PharmacyCard({ shift }) {
  const { name, address, municipality, destination, hours, phone, status, carryover } = shift;
  const badge = pharmacyStatus[status];
  const dial = phone?.replace(/[\s()-]/g, '');
  const mapUrl = destination && `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800';

  return (
    <article className={`space-y-3 rounded-xl border bg-white p-3.5 ${status === 'active' ? 'border-emerald-700' : 'border-slate-300'}`}>
      <p className={`inline-block rounded-md px-2 py-1 text-sm font-bold ${badge.style}`}>{badge.label}</p>
      <h5 className="break-words text-xl font-bold leading-tight text-slate-950">{name}</h5>
      {address && <p className="flex items-start gap-2 text-base text-slate-800">
        <MapPin aria-hidden="true" size={19} className="mt-1 shrink-0" />
        <span>{address}<span className="block text-sm text-slate-600">{municipality}</span></span>
      </p>}
      <p className="flex items-start gap-2 text-base font-semibold text-slate-800">
        <Clock aria-hidden="true" size={19} className="mt-1 shrink-0" />
        <span>{hours}{carryover && <span className="block text-sm font-normal">Empezó anoche</span>}</span>
      </p>
      <div className="grid gap-2 min-[380px]:grid-cols-2">
        {dial && /^\+?\d{9,15}$/.test(dial) && (
          <a href={`tel:${dial}`} aria-label={`Llamar a ${name}`}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-2 py-2 text-center text-base font-bold text-white hover:bg-emerald-900 ${focus}`}>
            <Phone aria-hidden="true" size={19} className="shrink-0" /> Llamar
          </a>
        )}
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`Cómo llegar a ${name} (abre mapas)`}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border border-emerald-800 px-2 py-2 text-center text-base font-bold text-emerald-950 hover:bg-emerald-50 ${focus}`}>
            <Navigation aria-hidden="true" size={19} className="shrink-0" /> Cómo llegar
          </a>
        )}
      </div>
    </article>
  );
}

function PharmacyReply({ days, fallback }) {
  return (
    <section aria-label="Farmacias de guardia" className="overflow-hidden rounded-2xl border border-emerald-200 bg-white text-base leading-snug shadow-sm">
      <header className="flex items-center gap-3 bg-emerald-950 px-4 py-4 text-white">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
          <Plus aria-hidden="true" size={31} strokeWidth={4} />
        </span>
        <div>
          <h2 className="text-xl font-bold">Farmacias de guardia</h2>
          {days.length === 1 && <h3 className="mt-1 text-base capitalize text-emerald-100">
            <time dateTime={days[0].date}>{days[0].label}</time>
          </h3>}
        </div>
      </header>
      <div className="space-y-5 p-3 sm:p-4">
        {days.map(day => (
          <section key={day.date} className="space-y-3">
            {days.length > 1 && <h3 className="text-lg font-bold capitalize text-slate-950"><time dateTime={day.date}>{day.label}</time></h3>}
            {day.shifts.length === 0 && <p className="text-slate-700">{days.length === 1 ? fallback : 'No hay turnos verificados para esta fecha.'}</p>}
            {pharmacyGroups.map(({ shift, title, Icon, style }) => {
              const entries = day.shifts.filter(entry => entry.shift === shift);
              if (!entries.length) return null;
              return (
                <section key={shift} className="space-y-2">
                  <h4 className={`flex items-center gap-2 rounded-lg px-3 py-2 font-bold ${style}`}><Icon aria-hidden="true" size={21} />{title}</h4>
                  {entries.map(entry => <PharmacyCard key={`${entry.startDate}-${entry.phone}-${entry.name}`} shift={entry} />)}
                </section>
              );
            })}
          </section>
        ))}
        <footer className="border-t border-emerald-100 pt-3">
          <p className="text-sm text-slate-600">Calendario de guardias de UtrerApp</p>
          <p className="mt-1 font-semibold text-emerald-900">¡Que haya mejoría! 💚</p>
        </footer>
      </div>
    </section>
  );
}

export default function Conso({ setPaginaActual }) {
  const previousTopic = useRef(undefined);
  const [mensaje, setMensaje] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  
  const [chat, setChat] = useState([
    {
      origen: 'conso',
      texto: `¡Hola! Soy Conso, la asistente de UtrerApp. Pregúntame por Utrera y sus pedanías o usa los accesos rápidos de abajo.`
    }
  ]);

  const procesarRespuesta = async (pregunta) => {
    const queryContext = previousTopic.current;
    previousTopic.current = undefined;
    const texto = pregunta.toLowerCase();

    if (texto.trim() === 'horario de trenes') {
      return (
        <div className="space-y-3">
          <div>
            <p className="font-bold text-slate-900 mb-0.5">🚆 UTRERAPP LIVE • ESTADO DEL TREN</p>
            <p className="text-[11px] text-slate-500">Información en tiempo real y cuentas atrás</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-3">
            <p className="text-xs text-slate-200">¡Consulta las salidas, llegadas con paso por el Hospital Virgen del Rocío y el mapa en directo!</p>
            <button
              onClick={(e) => {
                e.preventDefault();
                setPaginaActual('cercanias');
              }}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Train size={16} />
              <span>Abrir Estado del Tren en Directo ➔</span>
            </button>
          </div>
        </div>
      );
    }

    if (texto.trim() === 'aparcamientos') {
      return (
        <div className="space-y-3">
          <div>
            <p className="font-bold text-slate-900 mb-0.5">🅿️ APARCAMIENTOS DE UTRERA</p>
            <p className="text-[11px] text-slate-500">Consulta el mapa de HolaUtrera</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(PARKING_URL, "_blank", "noopener,noreferrer");
            }}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🗺️ Ver mapa de aparcamientos (holautrera.com)</span>
          </button>
        </div>
      );
    }

    try {
      const response = await fetch('/api/conso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: pregunta, context: queryContext }),
      });
      const { answer, links = [], suggestions, examples = [], context, pharmacy } = await response.json();
      previousTopic.current = context === 'weather' || context === 'pharmacy' ? context : undefined;
      if (context === 'pharmacy' && pharmacy?.days?.length) {
        return { pharmacy: true, content: <PharmacyReply days={pharmacy.days} fallback={answer} /> };
      }
      if (!answer) throw new Error();
      return (
        <div className="space-y-2">
          <p className="whitespace-pre-line">{answer}</p>
          {links.length > 0 && <ul className="space-y-1">
            {links.map(({ label, url }) => <li key={url}>
              <a className="underline text-sky-800" href={url}>{label}</a>
            </li>)}
          </ul>}
          {examples.length > 0 && <ul className="space-y-1">
            {examples.map(example => <li key={example}>
              <button type="button" className="underline text-sky-800" onClick={() => setMensaje(example)}>{example}</button>
            </li>)}
          </ul>}
          {suggestions && <iframe
            title="Sugerencias de Google Search"
            className="w-full min-h-24 border-0"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            srcDoc={`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https://www.google.com https://www.gstatic.com">${suggestions}`}
          />}
        </div>
      );
    } catch {
      return 'Ahora mismo no puedo conectar con Conso IA. Puedes seguir usando los accesos rápidos.';
    }
  };

  const enviarMensaje = async (textoEnvio) => {
    if (cargandoIA || !textoEnvio.trim() || textoEnvio.length > 500) return;

    const nuevoChat = [...chat, { origen: 'usuario', texto: textoEnvio }];
    setChat(nuevoChat);
    setMensaje('');
    setCargandoIA(true);

    const respuestaConso = await procesarRespuesta(textoEnvio);
    setChat((prev) => [...prev, respuestaConso?.pharmacy
      ? { origen: 'conso', texto: respuestaConso.content, pharmacy: true }
      : { origen: 'conso', texto: respuestaConso }]);
    setCargandoIA(false);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    enviarMensaje(mensaje);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans flex flex-col justify-between">
      <div className="bg-gradient-to-r from-rose-950 to-red-900 text-white p-5 shadow-lg">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold">Conso IA</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-rose-200">Asistente de UtrerApp</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-3 overflow-y-auto">
        {chat.map((msg, index) => msg.pharmacy ? (
          <div key={index} className="w-full">{msg.texto}</div>
        ) : (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${msg.origen === 'usuario' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
              msg.origen === 'usuario' ? 'bg-rose-900 text-white' : 'bg-amber-500 text-slate-950 font-bold'
            }`}>
              {msg.origen === 'usuario' ? <User size={16} /> : <Sparkles size={16} />}
            </div>

            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm max-w-[85%] ${
              msg.origen === 'usuario' 
                ? 'bg-rose-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {typeof msg.texto === 'string' ? <p className="whitespace-pre-line">{msg.texto}</p> : msg.texto}
            </div>
          </div>
        ))}

        {cargandoIA && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
            <Sparkles size={14} className="animate-spin text-amber-500" />
            <span>Conso está pensando su respuesta...</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 max-w-md mx-auto w-full grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => enviarMensaje("Farmacia de guardia")}
          className="bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Pill size={14} className="text-rose-700" />
          <span>Farmacias</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Horario de trenes")}
          className="bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Train size={14} className="text-slate-600" />
          <span>Trenes</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Aparcamientos")}
          className="bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Car size={14} className="text-sky-700" />
          <span>Aparcar</span>
        </button>
      </div>

      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-15 max-w-md mx-auto w-full">
        <form onSubmit={manejarSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Pregunta por el tiempo, comercios, visitas o trenes"
            maxLength={500}
                value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl text-xs border border-slate-200 focus:outline-none focus:border-rose-900 transition-colors"
          />
          <button
            type="submit"
            className="bg-rose-900 text-white px-5 py-3 rounded-2xl text-xs font-bold hover:bg-rose-950 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enviar</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
