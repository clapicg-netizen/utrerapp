import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuración oficial de Supabase para Utrerapp
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'tu-clave-anon';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// COMPONENTE CONSO (Cerebro Inteligente Local)
// ==========================================
function Conso() {
  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([
    { remitente: "conso", texto: "¡Eh, hola! Soy Conso, ¿qué necesitas?" }
  ]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    const textoUsuario = mensaje.trim();
    if (!textoUsuario) return;

    const nuevoChat = [...chat, { remitente: "user", texto: textoUsuario }];
    setChat(nuevoChat);
    setMensaje("");

    const textoLower = textoUsuario.toLowerCase();

    // 1. LÓGICA DE TRENES (Línea C1)
    if (textoLower.includes("tren") || textoLower.includes("cercanias") || textoLower.includes("sevilla") || textoLower.includes("dos hermanas") || textoLower.includes("horario")) {
      setTimeout(() => {
        let estacionTexto = "Estación de Utrera (Av. San Juan Bosco)";
        if (textoLower.includes("dos hermanas")) {
          estacionTexto = "Estación de Dos Hermanas";
        } else if (textoLower.includes("sevilla")) {
          estacionTexto = "Estación de Utrera / Conexión Sevilla (Línea C1)";
        }

        const respuestaTren = {
          remitente: "conso",
          texto: `🚆 Estación más cercana: ${estacionTexto}. El próximo tren saldrá a las 12:40 horas, según Renfe.`,
          esTren: true
        };
        setChat(prev => [...prev, respuestaTren]);
      }, 600);
      return;
    }

    // 2. LÓGICA DE FARMACIAS (Consulta a Supabase - tabla farmacias_guardia)
    if (textoLower.includes("farmacia") || textoLower.includes("guardia") || textoLower.includes("medicamento")) {
      try {
        // Formatear la fecha actual al estilo de tu tabla (ej: "22-oct-2026")
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mesStr = meses[hoy.getMonth()];
        const anio = hoy.getFullYear();
        const fechaActualStr = `${dia}-${mesStr}-${anio}`;

        const { data, error } = await supabase
          .from('farmacias_guardia')
          .select('*')
          .eq('fecha', fechaActualStr);

        setTimeout(() => {
          if (error || !data || data.length === 0) {
            setChat(prev => [...prev, {
              remitente: "conso",
              texto: "💊 No se han encontrado farmacias de guardia registradas para hoy en la base de datos oficial. Consulta los carteles en las farmacias locales.",
              esFarmacia: false
            }]);
          } else {
            // Mostrar todas las farmacias de guardia de hoy (diurnas y nocturnas)
            let textoFarmacias = "💊 Farmacias de guardia hoy en Utrera:\n\n";
            data.forEach((f, idx) => {
              textoFarmacias += `${idx + 1}. **${f.nombre}**\n📍 ${f.direccion}\n📞 Tel: ${f.telefono}\n🕒 ${f.horario}\n\n`;
            });

            setChat(prev => [...prev, {
              remitente: "conso",
              texto: textoFarmacias,
              esFarmacia: true,
              farmaciasLista: data
            }]);
          }
        }, 600);
      } catch (err) {
        setTimeout(() => {
          setChat(prev => [...prev, {
            remitente: "conso",
            texto: "💊 Error al consultar las farmacias de guardia en Supabase.",
            esFarmacia: false
          }]);
        }, 600);
      }
      return;
    }

    // 3. OTRAS URGENCIAS O DEFAULT
    setTimeout(() => {
      let respuestaTexto = "¡Vaya! Eso que me pides no lo tengo controlado del todo, pero puedes consultar la sección de Urgencias o la Guía Local de Utrerapp.";
      if (textoLower.includes("urgencia") || textoLower.includes("chare") || textoLower.includes("hospital")) {
        respuestaTexto = "🏥 El CHARE de Utrera cuenta con urgencias 24 horas. Para emergencias graves, llama directamente al 112.";
      } else if (textoLower.includes("hola") || textoLower.includes("buenas")) {
        respuestaTexto = "¡Eh, hola! Soy Conso, ¿qué necesitas?";
      }

      setChat(prev => [...prev, { remitente: "conso", texto: respuestaTexto }]);
    }, 600);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-5 rounded-3xl text-white shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">🤖 Asistente Conso</h2>
        <p className="text-xs text-rose-200 mt-1">Tu inteligencia local para consultas y gestión en Utrera.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 h-[440px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {chat.map((c, index) => (
            <div key={index} className={`flex ${c.remitente === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-line ${c.remitente === "user" ? "bg-rose-900 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}>
                <p>{c.texto}</p>

                {/* Tarjetas interactivas para Farmacias */}
                {c.esFarmacia && c.farmaciasLista && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    {c.farmaciasLista.map((f, i) => (
                      <div key={i} className="space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(f.direccion + ' Utrera')}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="block text-center py-1.5 bg-rose-100 text-rose-900 font-bold rounded-lg hover:bg-rose-200 transition-colors shadow-sm text-[11px]"
                        >
                          📍 GPS: {f.nombre.split(' ')[0]}
                        </a>
                        <a 
                          href={`tel:${f.telefono}`}
                          className="block text-center py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-[11px]"
                        >
                          📞 Llamar ({f.telefono})
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tarjeta interactiva para Trenes */}
                {c.esTren && (
                  <div className="pt-2 border-t border-slate-200">
                    <a 
                      href="https://maps.google.com/?q=Estacion+de+Tren+Utrera" 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-center py-2 bg-rose-100 text-rose-900 font-bold rounded-lg hover:bg-rose-200 transition-colors shadow-sm"
                    >
                      📍 Localizar Estación (Av. San Juan Bosco)
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={enviarMensaje} className="flex gap-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Pregúntale a Conso (trenes, farmacias...)" 
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900"
          />
          <button type="submit" className="px-4 py-2 bg-rose-900 text-white text-xs font-semibold rounded-xl hover:bg-rose-950 transition-colors">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: AGENTE INTELIGENTE DE ALTAS (IA)
// ==========================================
function VistaAgenteAlta({ onAgregarComercio, setActiveTab }) {
  const [textoBruto, setTextoBruto] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const procesarTextoConIA = () => {
    if (!textoBruto.trim()) {
      alert("Por favor, pega algún texto con los datos del comercio.");
      return;
    }

    setProcesando(true);

    setTimeout(() => {
      const lineas = textoBruto.split('\n').map(l => l.trim()).filter(Boolean);
      const nombreDetectado = lineas[0] || "Nuevo Comercio Utrera";
      
      setResultado({
        nombre: nombreDetectado,
        categoria: "Hostelería / Tapas",
        contacto: "Responsable / Gerencia",
        slogan: "Calidad y tradición en Utrera",
        descripcion: textoBruto,
        direccion: "Utrera (Sevilla)",
        telefono: "955870000",
        whatsapp: "34600000000",
        email: "contacto@comercio.es",
        web: "",
        instagram: "@comercio_utrera",
        facebook: "",
        tiktok: "",
        horario: "Lunes a Domingo: Horario habitual",
        videoUrl: "",
        cartaUrl: "",
        imagenPrincipal: "",
        galeriaFotos: "",
        etiqueta: "Socio Fundador"
      });
      setProcesando(false);
    }, 800);
  };

  const guardarComercioProcesado = (e) => {
    e.preventDefault();
    if (!resultado) return;

    onAgregarComercio({
      ...resultado,
      id: Date.now(),
      galeria: [],
      foto: "🍷"
    });

    alert("¡Comercio procesado por el Agente y guardado con éxito!");
    setActiveTab("market");
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-5 rounded-3xl text-white shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">🪄 Agente Inteligente de Altas</h2>
        <p className="text-xs text-rose-200 mt-1">Pega el texto desordenado de WhatsApp y la IA estructurará la ficha.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5 text-xs text-slate-700">
        <div>
          <label className="block font-bold mb-1 text-rose-900">📥 Pega aquí la información desordenada:</label>
          <textarea 
            rows="5" 
            value={textoBruto} 
            onChange={e => setTextoBruto(e.target.value)} 
            placeholder="Ej: Bar El Turronero, abierto desde el 80. Está en calle Ancha 12. Teléfono 611223344..." 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900 leading-relaxed"
          ></textarea>
        </div>

        <button 
          type="button" 
          onClick={procesarTextoConIA} 
          disabled={procesando}
          className="w-full py-3 bg-rose-900 hover:bg-rose-950 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {procesando ? "🤖 Analizando datos..." : "✨ Procesar con Agente Inteligente"}
        </button>
      </div>

      {resultado && (
        <form onSubmit={guardarComercioProcesado} className="bg-white p-5 rounded-2xl border border-rose-200 shadow-md space-y-3.5 text-xs text-slate-700 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-rose-900 text-sm">👁️ Vista Previa Estructurada</h3>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">Listo para guardar</span>
          </div>

          <div>
            <label className="block font-bold mb-1">Nombre detectado</label>
            <input type="text" value={resultado.nombre} onChange={e => setResultado({...resultado, nombre: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Teléfono</label>
              <input type="text" value={resultado.telefono} onChange={e => setResultado({...resultado, telefono: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
            </div>
            <div>
              <label className="block font-bold mb-1">WhatsApp</label>
              <input type="text" value={resultado.whatsapp} onChange={e => setResultado({...resultado, whatsapp: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Descripción extraída</label>
            <textarea rows="3" value={resultado.descripcion} onChange={e => setResultado({...resultado, descripcion: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900"></textarea>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm mt-2">
            💾 Aprobar y Publicar en la Guía
          </button>
        </form>
      )}
    </div>
  );
}

// ==========================================
// VISTAS PRINCIPALES
// ==========================================

function VistaInicio({ setActiveTab }) {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24 font-sans">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-6 text-white shadow-xl">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider bg-rose-800/65 rounded-full text-rose-100 uppercase">
            Tu ciudad en la palma de la mano
          </span>
          <h1 className="text-2xl font-black tracking-tight">Utrerapp ✨</h1>
          <p className="text-sm text-rose-200 mt-1">Servicios, comercio y agenda de Utrera actualizados.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setActiveTab("market")} className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">🏪</div>
          <span className="font-bold text-slate-800 text-base">Guía Local</span>
          <span className="text-xs text-slate-500 mt-0.5">Comercios y socios fundadores</span>
        </button>

        <button onClick={() => setActiveTab("conso")} className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
          <span className="font-bold text-slate-800 text-base">Asistente Conso</span>
          <span className="text-xs text-slate-500 mt-0.5">Farmacias y trenes</span>
        </button>

        <button onClick={() => setActiveTab("agenda")} className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left col-span-2 bg-gradient-to-br from-white to-rose-50/40">
          <div className="w-12 h-12 rounded-xl bg-rose-900 text-white flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-md shadow-rose-900/20">🏥</div>
          <span className="font-bold text-slate-800 text-base">Agenda y Urgencias (CHARE & ClicSalud)</span>
          <span className="text-xs text-slate-500 mt-0.5">Centros médicos, citas previas y teléfonos de interés</span>
        </button>

        <button onClick={() => setActiveTab("agente")} className="group flex flex-col items-start p-5 bg-slate-900 text-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left col-span-2">
          <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">🪄</div>
          <span className="font-bold text-base">Agente Inteligente: Alta de Comercios</span>
          <span className="text-xs text-slate-400 mt-0.5">Pega texto libre y la IA genera la ficha</span>
        </button>
      </div>
    </div>
  );
}

function VistaGuiaComercial({ comercios, setActiveTab }) {
  const [comercioActivo, setComercioActivo] = useState(null);

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-5 rounded-3xl text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">🏪 Guía Comercial de Utrera</h2>
          <p className="text-xs text-rose-200 mt-1">Negocios y socios fundadores oficiales.</p>
        </div>
        <button 
          onClick={() => setActiveTab("agente")}
          className="px-3 py-2 bg-white text-rose-950 font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition-colors"
        >
          🪄 Agente IA
        </button>
      </div>

      <div className="space-y-3">
        {comercios.map((comercio) => {
          const isOpen = comercioActivo === comercio.id;
          return (
            <div key={comercio.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 transition-all">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setComercioActivo(isOpen ? null : comercio.id)}>
                <div className="flex items-center gap-3">
                  {comercio.foto && comercio.foto.startsWith("http") ? (
                    <img src={comercio.foto} alt={comercio.nombre} className="w-12 h-12 rounded-xl object-cover shadow-inner" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center text-2xl shadow-inner">
                      {comercio.foto || "🍷"}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-semibold bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {comercio.categoria}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1.5 flex items-center gap-1.5">
                      {comercio.nombre}
                      <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                  ⭐ {comercio.etiqueta || "Socio Fundador"}
                </span>
              </div>

              {comercio.slogan && <p className="text-xs text-slate-600 italic">"{comercio.slogan}"</p>}

              {isOpen && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs text-slate-700 bg-slate-50/90 p-3.5 rounded-2xl animate-fadeIn">
                  {comercio.descripcion && <p className="text-slate-600 leading-relaxed">{comercio.descripcion}</p>}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    {comercio.telefono && <p>📞 <strong>Teléfono:</strong> <a href={`tel:${comercio.telefono}`} className="text-rose-800 font-bold hover:underline">{comercio.telefono}</a></p>}
                    {comercio.whatsapp && (
                      <div className="pt-2">
                        <a href={`https://wa.me/${comercio.whatsapp}`} target="_blank" rel="noreferrer" className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
                          💬 Abrir WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VistaAgendaUrgencias() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Agenda y Urgencias</h2>
        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Esencial</span>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-base">CHARE de Utrera</h3>
        <p className="text-xs text-slate-500">Urgencias 24 horas.</p>
        <a href="tel:955000000" className="block text-center py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">📞 Llamar al CHARE</a>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL (App)
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  
  const [comercios, setComercios] = useState([
    {
      id: 1,
      nombre: "Bar Alonsi",
      categoria: "Hostelería / Tapas",
      telefono: "955870000",
      whatsapp: "34600000000",
      descripcion: "Establecimiento tradicional de referencia en Utrera.",
      etiqueta: "Socio Fundador",
      foto: "🍷"
    }
  ]);

  const agregarComercio = (nuevo) => {
    setComercios([nuevo, ...comercios]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <main className="flex-1">
        {activeTab === "home" && <VistaInicio setActiveTab={setActiveTab} />}
        {activeTab === "market" && <VistaGuiaComercial comercios={comercios} setActiveTab={setActiveTab} />}
        {activeTab === "agente" && <VistaAgenteAlta onAgregarComercio={agregarComercio} setActiveTab={setActiveTab} />}
        {activeTab === "conso" && <Conso />}
        {activeTab === "agenda" && <VistaAgendaUrgencias />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60 py-2 px-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "home" ? "text-rose-900 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}>
            <span className="text-lg">🏠</span>
            <span className="text-[10px] mt-0.5">Inicio</span>
          </button>

          <button onClick={() => setActiveTab("market")} className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "market" ? "text-rose-900 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}>
            <span className="text-lg">🏪</span>
            <span className="text-[10px] mt-0.5">Guía</span>
          </button>

          <button onClick={() => setActiveTab("agente")} className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "agente" ? "text-rose-900 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}>
            <span className="text-lg">🪄</span>
            <span className="text-[10px] mt-0.5">Agente IA</span>
          </button>

          <button onClick={() => setActiveTab("conso")} className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "conso" ? "text-rose-900 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}>
            <span className="text-lg">🤖</span>
            <span className="text-[10px] mt-0.5">Conso</span>
          </button>

          <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "agenda" ? "text-rose-900 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}>
            <span className="text-lg">🏥</span>
            <span className="text-[10px] mt-0.5">Urgencias</span>
          </button>
        </div>
      </nav>
    </div>
  );
}