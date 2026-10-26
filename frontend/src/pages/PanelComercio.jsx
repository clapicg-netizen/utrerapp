// src/pages/PanelComercio.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, actualizarComercio, crearComercio, subirArchivoComercio } from '../lib/comerciosService';

export default function PanelComercio() {
  const [comercios, setComercios] = useState([]);
  const [pinInput, setPinInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [comercioSelId, setComercioSelId] = useState('');
  const [comercioActual, setComercioActual] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [esEnlaceDirecto, setEsEnlaceDirecto] = useState(false);

  // Formulario del comercio activo
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
    inicializarPanel();
  }, []);

  const inicializarPanel = async () => {
    const data = await obtenerComercios("Todos");
    const listaComercios = data || [];
    setComercios(listaComercios);

    // Leer si viene un ?id= en la URL (Enlace exclusivo para el cliente)
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');

    if (idUrl) {
      setEsEnlaceDirecto(true);
      const comercioEncontrado = listaComercios.find(c => String(c.id) === String(idUrl));
      if (comercioEncontrado) {
        setComercioSelId(comercioEncontrado.id);
        setComercioActual(comercioEncontrado);
      } else {
        setMensaje({ tipo: 'error', texto: 'El enlace no corresponde a ningún comercio válido.' });
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!comercioSelId) {
      setMensaje({ tipo: 'error', texto: 'No se ha detectado el comercio a modificar.' });
      return;
    }

    const comercioEncontrado = comercios.find(c => String(c.id) === String(comercioSelId));
    
    if (comercioEncontrado && pinInput === (comercioEncontrado.pin_acceso || '1234')) {
      setAutenticado(true);
      cargarDatosComercio(comercioEncontrado);
    } else {
      setMensaje({ tipo: 'error', texto: 'PIN de acceso incorrecto.' });
    }
  };

  const cargarDatosComercio = (c) => {
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
      instagram_url: c.instagram_username || c.instagram_url || '',
      tiktok_url: c.tiktok_username || c.tiktok_url || '',
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

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Indica al menos el nombre y la categoría' });
      setGuardando(false);
      return;
    }

    const res = await actualizarComercio(comercioSelId, null, formData);
    setGuardando(false);

    if (res.success) {
      setMensaje({ tipo: 'exito', texto: '¡Cambios guardados con éxito en base de datos!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  // PANTALLA DE LOGIN CON PIN DEL COMERCIO
  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="text-center mb-6">
            <span className="text-5xl">🔐</span>
            <h1 className="text-xl font-black text-slate-900 mt-2">Área de Gestión</h1>
            <p className="text-xs text-slate-500 mt-1">
              {comercioActual ? `Modificando ficha de: ${comercioActual.nombre}` : 'Identifícate para continuar en Utrerapp'}
            </p>
          </div>

          {mensaje.texto && (
            <div className={`p-3 rounded-2xl text-xs font-bold mb-4 text-center ${
              mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {!esEnlaceDirecto && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selecciona tu comercio:</label>
                <select
                  value={comercioSelId}
                  onChange={(e) => setComercioSelId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="">-- Elige tu negocio --</option>
                  {comercios.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN de acceso de tu negocio:</label>
              <input
                type="password"
                placeholder="Introduce tu PIN (ej. 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-center tracking-widest text-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md cursor-pointer"
            >
              Entrar a mi Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PANTALLA DE EDICIÓN EXCLUSIVA DEL COMERCIO
  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-xs text-emerald-600 font-bold uppercase">
            Panel Exclusivo de Negocio
          </span>
          <h1 className="text-lg font-black text-slate-900">
            {formData.nombre}
          </h1>
        </div>
        <button
          onClick={() => {
            setAutenticado(false);
            setPinInput('');
          }}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-2xl text-xs font-bold mb-4 text-center ${
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* FORMULARIO DE EDICIÓN */}
      <form onSubmit={handleGuardar} className="space-y-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-md">
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Comercio:</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Categoría:</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="Hostelería">Hostelería</option>
              <option value="Comercio">Comercio</option>
              <option value="Servicios">Servicios</option>
              <option value="Salud">Salud</option>
              <option value="Inmobiliarias">Inmobiliarias</option>
              <option value="Comida a domicilio">Comida a domicilio</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría / Tipo:</label>
            <input
              type="text"
              value={formData.subcategoria}
              onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección:</label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        {/* 🌐 SITIO WEB Y TIENDA ONLINE */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">🌐 Sitio Web y Tienda Online</p>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Página Web:</label>
            <input
              type="text"
              placeholder="https://www.tu-web.es"
              value={formData.web_url}
              onChange={(e) => setFormData({...formData, web_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tienda Online / E-commerce:</label>
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
          <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada:</label>
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
          <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos:</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Instagram:</label>
            <input
              type="text"
              placeholder="https://instagram.com/tu_negocio"
              value={formData.instagram_url}
              onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">TikTok:</label>
            <input
              type="text"
              placeholder="https://tiktok.com/@tu_negocio"
              value={formData.tiktok_url}
              onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Facebook:</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp:</label>
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
              value={formData.pin_acceso}
              onChange={(e) => setFormData({...formData, pin_acceso: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción:</label>
          <textarea
            rows="3"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={guardando || subiendo}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl transition shadow-md mt-4 cursor-pointer"
        >
          {guardando ? 'Guardando cambios...' : '💾 Guardar Cambios en mi Ficha'}
        </button>
      </form>
    </div>
  );
}