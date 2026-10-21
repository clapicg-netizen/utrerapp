import React, { useState } from 'react';

// ==========================================
// COMPONENTE CONSO
// ==========================================
function Conso() {
  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([
    { remitente: "conso", texto: "¡Hola, JuanRa! Soy Conso, tu asistente para Utrerapp. ¿En qué te puedo echar una mano hoy?" }
  ]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevoChat = [...chat, { remitente: "user", texto: mensaje }];
    setChat(nuevoChat);
    setMensaje("");

    setTimeout(() => {
      setChat(prev => [...prev, { remitente: "conso", texto: "¡Recibido! Lo reviso enseguida para dejarlo perfecto en Utrerapp." }]);
    }, 1000);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-5 rounded-3xl text-white shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">🤖 Asistente Conso</h2>
        <p className="text-xs text-rose-200 mt-1">Tu inteligencia local para consultas y gestión en Utrera.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 h-[400px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {chat.map((c, index) => (
            <div key={index} className={`flex ${c.remitente === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${c.remitente === "user" ? "bg-rose-900 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}>
                {c.texto}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={enviarMensaje} className="flex gap-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Pregúntale a Conso..." 
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
// VISTA: FORMULARIO DE ALTA (SOLO ADMIN)
// ==========================================
function VistaAltaComercio({ onAgregarComercio, setActiveTab }) {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "Hostelería / Tapas",
    contacto: "",
    slogan: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    whatsapp: "",
    email: "",
    web: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    horario: "",
    videoUrl: "",
    cartaUrl: "",
    imagenPrincipal: "",
    galeriaFotos: "",
    etiqueta: "Socio Fundador"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    // Convertir la galeria separada por comas en un array si existe
    const galeriaArray = formData.galeriaFotos 
      ? formData.galeriaFotos.split(',').map(url => url.trim())
      : [];

    onAgregarComercio({
      ...formData,
      id: Date.now(),
      galeria: galeriaArray,
      foto: formData.imagenPrincipal || (formData.categoria.includes("Hostelería") ? "🍷" : "🏪")
    });

    alert("¡Comercio dado de alta con imágenes correctamente!");
    setActiveTab("market");
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-5 rounded-3xl text-white shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">📝 Panel Admin: Alta de Comercio</h2>
        <p className="text-xs text-rose-200 mt-1">Fichas oficiales con gestión de imágenes y productos.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5 text-xs text-slate-700">
        <div>
          <label className="block font-bold mb-1">Nombre del Comercio *</label>
          <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Bar Alonsi" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold mb-1">Categoría</label>
            <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900">
              <option value="Hostelería / Tapas">Hostelería / Tapas</option>
              <option value="Hostelería / Restauración">Hostelería / Restauración</option>
              <option value="Electrodomésticos y Tecnología">Electrodomésticos y Tecnología</option>
              <option value="Comercio Local y Servicios">Comercio Local y Servicios</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Persona de Contacto</label>
            <input type="text" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} placeholder="Ej. Diego / Pablo" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">Dirección Exacta</label>
          <input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} placeholder="Ej. Calle Belmonte, 1, Utrera" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold mb-1">Teléfono</label>
            <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="955870000" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
          <div>
            <label className="block font-bold mb-1">WhatsApp</label>
            <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="34600000000" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold mb-1">Correo Electrónico</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="correo@comercio.es" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
          <div>
            <label className="block font-bold mb-1">Sitio Web</label>
            <input type="text" value={formData.web} onChange={e => setFormData({...formData, web: e.target.value})} placeholder="https://..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
        </div>

        {/* NUEVOS CAMPOS DE IMÁGENES */}
        <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3">
          <h3 className="font-bold text-rose-900 flex items-center gap-1.5">🖼️ Imágenes y Galería del Comercio</h3>
          <div>
            <label className="block font-bold mb-1">URL Foto Principal / Logotipo</label>
            <input type="text" value={formData.imagenPrincipal} onChange={e => setFormData({...formData, imagenPrincipal: e.target.value})} placeholder="https://... (enlace de la foto)" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
          <div>
            <label className="block font-bold mb-1">URLs de Galería (separadas por comas)</label>
            <textarea rows="2" value={formData.galeriaFotos} onChange={e => setFormData({...formData, galeriaFotos: e.target.value})} placeholder="https://foto1.jpg, https://foto2.jpg..." className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900"></textarea>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">Horario detallado</label>
          <input type="text" value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})} placeholder="Ej. Lunes a Domingo: 08:00 - 23:30" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
        </div>

        <div>
          <label className="block font-bold mb-1">Slogan o Frase Breve</label>
          <input type="text" value={formData.slogan} onChange={e => setFormData({...formData, slogan: e.target.value})} placeholder="Ej. El punto de encuentro tradicional" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
        </div>

        <div>
          <label className="block font-bold mb-1">Descripción Completa</label>
          <textarea rows="3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Detalles del establecimiento..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900"></textarea>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block font-bold mb-1">Instagram</label>
            <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@usuario" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
          <div>
            <label className="block font-bold mb-1">Facebook</label>
            <input type="text" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} placeholder="Nombre" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
          <div>
            <label className="block font-bold mb-1">TikTok</label>
            <input type="text" value={formData.tiktok} onChange={e => setFormData({...formData, tiktok: e.target.value})} placeholder="@usuario" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold mb-1">Enlace Vídeo (YouTube Embed)</label>
            <input type="text" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://www.youtube.com/embed/..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
          <div>
            <label className="block font-bold mb-1">Enlace Carta / PDF (Menú)</label>
            <input type="text" value={formData.cartaUrl} onChange={e => setFormData({...formData, cartaUrl: e.target.value})} placeholder="https://... o PDF" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900" />
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-rose-900 hover:bg-rose-950 text-white font-bold rounded-xl transition-colors shadow-sm mt-2">
          💾 Guardar y Publicar en la Guía
        </button>
      </form>
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

        <button onClick={() => setActiveTab("alta")} className="group flex flex-col items-start p-5 bg-slate-900 text-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left col-span-2">
          <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
          <span className="font-bold text-base">Panel Admin: Dar de Alta Comercio</span>
          <span className="text-xs text-slate-400 mt-0.5">Acceso exclusivo administrador</span>
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
          onClick={() => setActiveTab("alta")}
          className="px-3 py-2 bg-white text-rose-950 font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition-colors"
        >
          ⚙️ Admin
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
                  
                  {/* Galería de Imágenes si la tiene */}
                  {comercio.galeria && comercio.galeria.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700">📸 Galería de Instalaciones / Productos:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {comercio.galeria.map((imgUrl, idx) => (
                          <img key={idx} src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-20 rounded-xl object-cover shadow-sm border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {comercio.videoUrl && (
                    <div className="space-y-1 pt-1">
                      <span className="font-bold text-slate-700">📺 Vídeo Promocional:</span>
                      <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-inner bg-black">
                        <iframe src={comercio.videoUrl} title={`Vídeo de ${comercio.nombre}`} className="absolute top-0 left-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    {comercio.contacto && <p>👤 <strong>Contacto:</strong> {comercio.contacto}</p>}
                    {comercio.direccion && <p>📍 <strong>Dirección:</strong> {comercio.direccion}</p>}
                    {comercio.horario && <p>⏰ <strong>Horario:</strong> {comercio.horario}</p>}
                    {comercio.telefono && <p>📞 <strong>Teléfono:</strong> <a href={`tel:${comercio.telefono}`} className="text-rose-800 font-bold hover:underline">{comercio.telefono}</a></p>}
                    {comercio.email && <p>✉️ <strong>Email:</strong> <a href={`mailto:${comercio.email}`} className="text-rose-800 hover:underline">{comercio.email}</a></p>}
                    
                    {(comercio.instagram || comercio.facebook || comercio.tiktok) && (
                      <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                        {comercio.instagram && <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">📸 <strong>IG:</strong> {comercio.instagram}</span>}
                        {comercio.facebook && <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">📘 <strong>FB:</strong> {comercio.facebook}</span>}
                        {comercio.tiktok && <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">🎵 <strong>TikTok:</strong> {comercio.tiktok}</span>}
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      {comercio.whatsapp && (
                        <a href={`https://wa.me/${comercio.whatsapp}?text=Hola,%20contacto%20desde%20Utrerapp`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
                          💬 WhatsApp
                        </a>
                      )}
                      {comercio.cartaUrl && (
                        <a href={comercio.cartaUrl} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
                          📋 Ver Carta / PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-1 flex gap-2">
                <button onClick={() => setComercioActivo(isOpen ? null : comercio.id)} className="flex-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                  {isOpen ? "Ocultar ficha" : "🔍 Ver ficha multimedia"}
                </button>
                {comercio.telefono && (
                  <a href={`tel:${comercio.telefono}`} className="px-4 text-center py-2 bg-rose-900 hover:bg-rose-950 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center">
                    📞 Llamar
                  </a>
                )}
              </div>
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
  const [activeTab, setActiveTab] = useState("market");
  
  const [comercios, setComercios] = useState([
    {
      id: 1,
      nombre: "Bar Alonsi",
      categoria: "Hostelería / Tapas",
      contacto: "Diego",
      slogan: "El punto de encuentro tradicional en Utrera",
      descripcion: "Establecimiento tradicional de referencia en Utrera. Especialistas en tapas caseras, buen ambiente y trato familiar de toda la vida.",
      direccion: "Calle Belmonte, 1, Utrera (Sevilla)",
      horario: "Lunes a Domingo: 08:00 - 23:30",
      etiqueta: "Socio Fundador",
      telefono: "955870000",
      whatsapp: "34600000000",
      instagram: "@baralonsi",
      facebook: "Bar Alonsi Utrera",
      tiktok: "@baralonsi",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      cartaUrl: "#",
      foto: "🍷",
      galeria: []
    },
    {
      id: 2,
      nombre: "La Chana",
      categoria: "Hostelería / Restauración",
      contacto: "Pablo",
      slogan: "Cocina con solera y sabor andaluz",
      descripcion: "Ambiente único y cocina tradicional en Utrera. Producto de primera calidad.",
      direccion: "Calle Don Clemente de la Cuadra, 13, Utrera (Sevilla)",
      horario: "Martes a Domingo: 12:30 - 00:00",
      etiqueta: "Socio Fundador",
      telefono: "955871111",
      whatsapp: "34611111111",
      instagram: "@lachana_utrera",
      facebook: "La Chana Utrera",
      tiktok: "@lachana",
      cartaUrl: "#",
      foto: "🍽️",
      galeria: []
    },
    {
      id: 3,
      nombre: "Digital GM",
      categoria: "Electrodomésticos y Tecnología",
      contacto: "Dirección / Propiedad",
      slogan: "Tu tecnología y electrodomésticos de confianza",
      descripcion: "Tienda especializada en electrodomésticos, informática y servicio técnico oficial.",
      direccion: "Avenida María Auxiliadora, 40, Utrera (Sevilla)",
      horario: "Lunes a Sábado: 09:30 - 13:30 y 17:00 - 20:30",
      etiqueta: "Socio Fundador",
      telefono: "955872222",
      whatsapp: "34622222222",
      instagram: "@digitalgm",
      facebook: "Digital GM",
      tiktok: "@digitalgm",
      cartaUrl: "#",
      foto: "💻",
      galeria: []
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
        {activeTab === "alta" && <VistaAltaComercio onAgregarComercio={agregarComercio} setActiveTab={setActiveTab} />}
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