// src/pages/PanelComercio.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, actualizarComercio, crearComercio, subirArchivoComercio } from '../lib/comerciosService';

const PIN_ADMIN_MAESTRO = "9999"; 

export default function PanelComercio() {
  const [comercios, setComercios] = useState([]);
  const [pinInput, setPinInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [esAdminMaestro, setEsAdminMaestro] = useState(false);
  const [comercioSelId, setComercioSelId] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // Texto para el Agente de Volcado Masivo a lo Bruto
  const [textoBruto, setTextoBruto] = useState('');

  // Formulario del comercio activo (añadidos web_url y tienda_online)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Hostelería',
    subcategoria: '',
    direccion: '',
    descripcion: '',
    horario_texto: '',
    telefono: '',
    whatsapp: '',
    portada_url: '',
    logo_url: '',
    carta_pdf_url: '',
    galeria_urls: [],
    instagram_url: '',
    tiktok_url: '',
    facebook_url: '',
    web_url: '',
    tienda_online: '',
    oferta_flash: '',
    video_story_url: '',
    pin_acceso: '1234',
    destacado: false
  });

  useEffect(() => {
    cargarComerciosLista();
  }, []);

  const cargarComerciosLista = async () => {
    const data = await obtenerComercios("Todos");
    setComercios(data || []);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (pinInput === PIN_ADMIN_MAESTRO) {
      setEsAdminMaestro(true);
      setAutenticado(true);
      return;
    }

    if (!comercioSelId) {
      setMensaje({ tipo: 'error', texto: 'Selecciona tu comercio para acceder' });
      return;
    }

    const comercioEncontrado = comercios.find(c => c.id === comercioSelId);
    if (comercioEncontrado && pinInput === (comercioEncontrado.pin_acceso || '1234')) {
      setEsAdminMaestro(false);
      setAutenticado(true);
      cargarDatosComercio(comercioEncontrado);
    } else {
      setMensaje({ tipo: 'error', texto: 'PIN incorrecto' });
    }
  };

  const cargarDatosComercio = (c) => {
    setComercioSelId(c.id);
    setFormData({
      nombre: c.nombre || '',
      categoria: c.categoria || 'Hostelería',
      subcategoria: c.subcategoria || '',
      direccion: c.direccion || '',
      descripcion: c.descripcion || '',
      horario_texto: c.horario_texto || '',
      telefono: c.telefono || '',
      whatsapp: c.whatsapp || '',
      portada_url: c.portada_url || '',
      logo_url: c.logo_url || '',
      carta_pdf_url: c.carta_pdf_url || '',
      galeria_urls: Array.isArray(c.galeria_urls) ? c.galeria_urls : [],
      instagram_url: c.instagram_url || '',
      tiktok_url: c.tiktok_url || '',
      facebook_url: c.facebook_url || '',
      web_url: c.web_url || '',
      tienda_online: c.tienda_online || '',
      oferta_flash: c.oferta_flash || '',
      video_story_url: c.video_story_url || '',
      pin_acceso: c.pin_acceso || '1234',
      destacado: c.destacado || false
    });
  };

  const handleFileUpload = async (e, campo, esGaleria = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      let nuevoFormData = { ...formData };
      if (esGaleria) {
        nuevoFormData.galeria_urls = [...(formData.galeria_urls || []), res.url];
      } else {
        nuevoFormData[campo] = res.url;
      }
      setFormData(nuevoFormData);
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  const eliminarDeGaleria = (index) => {
    setFormData(prev => ({
      ...prev,
      galeria_urls: prev.galeria_urls.filter((_, i) => i !== index)
    }));
  };

  // 🤖 PROCESADOR DE VOLCADO MASIVO A LO BRUTO
  const procesarVolcadoBruto = () => {
    if (!textoBruto.trim()) return;

    try {
      const lineas = textoBruto.split('\n');
      let datosActualizados = { ...formData };
      let nuevasGaleria = [...(formData.galeria_urls || [])];

      lineas.forEach(linea => {
        const l = linea.trim();
        const lower = l.toLowerCase();

        if (lower.startsWith('n:')) {
          datosActualizados.nombre = l.substring(2).trim();
        } else if (lower.startsWith('cat:')) {
          datosActualizados.categoria = l.substring(4).trim();
        } else if (lower.startsWith('subcat:')) {
          datosActualizados.subcategoria = l.substring(7).trim();
        } else if (lower.startsWith('dir:')) {
          datosActualizados.direccion = l.substring(4).trim();
        } else if (lower.startsWith('w:')) {
          datosActualizados.whatsapp = l.substring(2).trim();
        } else if (lower.startsWith('tlf:') || lower.startsWith('telefono:')) {
          datosActualizados.telefono = l.substring(l.indexOf(':') + 1).trim();
        } else if (lower.startsWith('port:')) {
          datosActualizados.portada_url = l.substring(5).trim();
        } else if (lower.startsWith('gl:')) {
          nuevasGaleria.push(l.substring(3).trim());
        } else if (lower.startsWith('ig:')) {
          datosActualizados.instagram_url = l.substring(3).trim();
        } else if (lower.startsWith('tk:')) {
          datosActualizados.tiktok_url = l.substring(3).trim();
        } else if (lower.startsWith('fb:')) {
          datosActualizados.facebook_url = l.substring(3).trim();
        } else if (lower.startsWith('web:') || lower.startsWith('wb:')) {
          datosActualizados.web_url = l.substring(l.indexOf(':') + 1).trim();
        } else if (lower.startsWith('tienda:')) {
          datosActualizados.tienda_online = l.substring(l.indexOf(':') + 1).trim();
        } else if (lower.startsWith('vd:') || lower.startsWith('video:')) {
          datosActualizados.video_story_url = l.substring(l.indexOf(':') + 1).trim();
        } else if (lower.startsWith('pdf:') || lower.startsWith('carta:')) {
          datosActualizados.carta_pdf_url = l.substring(l.indexOf(':') + 1).trim();
        } else if (lower.startsWith('desc:') || lower.startsWith('descripcion:')) {
          datosActualizados.descripcion = l.substring(l.indexOf(':') + 1).trim();
        } else if (lower.startsWith('oferta:') || lower.startsWith('flash:')) {
          datosActualizados.oferta_flash = l.substring(l.indexOf(':') + 1).trim();
        }
      });

      datosActualizados.galeria_urls = nuevasGaleria;
      setFormData(datosActualizados);
      setMensaje({ tipo: 'exito', texto: '¡Datos volcados y estructurados con éxito en el formulario!' });
      setTextoBruto('');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al procesar el texto bruto.' });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Indica al menos el nombre y la categoría' });
      setGuardando(false);
      return;
    }

    if (esAdminMaestro && !comercioSelId) {
      const res = await crearComercio(formData);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio dado de alta correctamente!' });
        await cargarComerciosLista();
        setComercioSelId('');
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    } else {
      const idAActualizar = comercioSelId;
      const res = await actualizarComercio(idAActualizar, PIN_ADMIN_MAESTRO, formData);
      setGuardando(false);

      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Cambios guardados con éxito en base de datos!' });
        await cargarComerciosLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    }
  };

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-8">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-xl font-black text-slate-900 mt-2">Acceso Comercios</h1>
            <p className="text-xs text-slate-500 mt-1">Gestiona tu negocio en Utrerapp</p>
          </div>

          {mensaje.texto && (
            <div className={`p-3 rounded-2xl text-xs font-bold mb-4 text-center ${
              mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selecciona tu comercio (Opcional si eres Admin):</label>
              <select
                value={comercioSelId}
                onChange={(e) => {
                  const selId = e.target.value;
                  setComercioSelId(selId);
                  if (selId) {
                    const c = comercios.find(item => item.id === selId);
                    if (c) cargarDatosComercio(c);
                  }
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                <option value="">-- Nuevo Comercio / Administrador Maestro --</option>
                {comercios.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN de acceso (Usa 9999 para Administrador):</label>
              <input
                type="password"
                placeholder="****"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-md"
            >
              Entrar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase">
            {esAdminMaestro ? "⭐ Panel Administrador Maestro" : "Modificando Negocio"}
          </span>
          <h1 className="text-lg font-black text-slate-900">
            {formData.nombre || "Nuevo Negocio"}
          </h1>
        </div>
        <button
          onClick={() => {
            setAutenticado(false);
            setPinInput('');
            setEsAdminMaestro(false);
          }}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl"
        >
          Salir
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-2xl text-xs font-bold mb-4 text-center ${
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* 🤖 AGENTE IA DE VOLCADO MASIVO A LO BRUTO */}
      <div className="mb-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-xl border border-indigo-500/30">
        <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
          🤖 Agente IA de Volcado Masivo ("A lo Bruto")
        </h3>
        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
          Pega aquí los datos usando abreviaturas (<code className="text-amber-300">N:</code>, <code className="text-amber-300">Web:</code>, <code className="text-amber-300">Tienda:</code>, <code className="text-amber-300">Port:</code>, <code className="text-amber-300">Ig:</code>) y pulsa procesar para rellenar el formulario.
        </p>
        <textarea
          rows="4"
          placeholder="N: Bar La Chana&#10;Cat: Hostelería&#10;Web: https://...&#10;Tienda: https://...&#10;Port: https://..."
          value={textoBruto}
          onChange={(e) => setTextoBruto(e.target.value)}
          className="w-full p-3 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-white/20"
        />
        <button
          type="button"
          onClick={procesarVolcadoBruto}
          className="mt-2.5 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl transition shadow"
        >
          ⚡ Procesar y Rellenar Ficha Automáticamente
        </button>
      </div>

      {/* SELECTOR RÁPIDO DE COMERCIO PARA ADMIN */}
      {esAdminMaestro && (
        <div className="mb-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">📂 Selecciona otro comercio para editar o crea uno nuevo:</label>
          <select
            value={comercioSelId}
            onChange={(e) => {
              const selId = e.target.value;
              setComercioSelId(selId);
              if (selId) {
                const c = comercios.find(item => item.id === selId);
                if (c) cargarDatosComercio(c);
              } else {
                setFormData({
                  nombre: '',
                  categoria: 'Hostelería',
                  subcategoria: '',
                  direccion: '',
                  descripcion: '',
                  horario_texto: '',
                  telefono: '',
                  whatsapp: '',
                  portada_url: '',
                  logo_url: '',
                  carta_pdf_url: '',
                  galeria_urls: [],
                  instagram_url: '',
                  tiktok_url: '',
                  facebook_url: '',
                  web_url: '',
                  tienda_online: '',
                  oferta_flash: '',
                  video_story_url: '',
                  pin_acceso: '1234',
                  destacado: false
                });
              }
            }}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            <option value="">➕ Crear Nuevo Comercio / Limpiar Formulario</option>
            {comercios.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* FORMULARIO DE EDICIÓN / ALTA */}
      <form onSubmit={handleGuardar} className="space-y-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-md">
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Comercio (N:):</label>
          <input
            type="text"
            placeholder="Ej. Bar La Chana"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Categoría (Cat:):</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="Hostelería">Hostelería</option>
              <option value="Comercio">Comercio</option>
              <option value="Servicios">Servicios</option>
              <option value="Salud">Salud</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría / Tipo:</label>
            <input
              type="text"
              placeholder="Ej. Tapas"
              value={formData.subcategoria}
              onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección (Dir:):</label>
          <input
            type="text"
            placeholder="Calle Clemente de la Cuadra, 13"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        {/* 🌐 SITIO WEB Y TIENDA ONLINE */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">🌐 Sitio Web y Tienda Online</p>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Página Web (Web:):</label>
            <input
              type="text"
              placeholder="https://www.lachanataberna.es"
              value={formData.web_url}
              onChange={(e) => setFormData({...formData, web_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tienda Online / E-commerce (Tienda:):</label>
            <input
              type="text"
              placeholder="https://tu-tienda.palbin.com"
              value={formData.tienda_online}
              onChange={(e) => setFormData({...formData, tienda_online: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada (Port:):</label>
          {formData.portada_url && (
            <img src={formData.portada_url} alt="Portada" className="w-full h-32 object-cover rounded-2xl mb-2 border" />
          )}
          <input
            type="text"
            placeholder="O pega URL de imagen aquí..."
            value={formData.portada_url}
            onChange={(e) => setFormData({...formData, portada_url: e.target.value})}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'portada_url')}
            disabled={subiendo}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* 🖼️ GALERÍA DE FOTOS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos (Gl:):</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {formData.galeria_urls.map((url, idx) => (
              <div key={idx} className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border">
                <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => eliminarDeGaleria(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, null, true)}
            disabled={subiendo}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        {/* 🌐 REDES SOCIALES */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">🌐 Redes Sociales</p>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instagram (Ig:):</label>
            <input
              type="text"
              placeholder="https://instagram.com/tu_negocio"
              value={formData.instagram_url}
              onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">TikTok (Tk:):</label>
            <input
              type="text"
              placeholder="https://tiktok.com/@tu_negocio"
              value={formData.tiktok_url}
              onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Facebook (Fb:):</label>
            <input
              type="text"
              placeholder="https://facebook.com/tu_negocio"
              value={formData.facebook_url}
              onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp (W:):</label>
            <input
              type="text"
              placeholder="34600000000"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">🔑 PIN de Cliente:</label>
            <input
              type="text"
              placeholder="1234"
              value={formData.pin_acceso}
              onChange={(e) => setFormData({...formData, pin_acceso: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción (Desc:):</label>
          <textarea
            rows="3"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <input
            type="checkbox"
            id="destacadoCheck"
            checked={formData.destacado}
            onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
            className="w-4 h-4 text-rose-900 rounded"
          />
          <label htmlFor="destacadoCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
            ⭐ Comercio Destacado / VIP (Aparece en carrusel)
          </label>
        </div>

        <button
          type="submit"
          disabled={guardando || subiendo}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl transition shadow-md mt-4 cursor-pointer"
        >
          {guardando ? 'Guardando...' : comercioSelId ? '💾 Guardar Cambios en Base de Datos' : '🚀 Dar de Alta Comercio'}
        </button>
      </form>
    </div>
  );
}