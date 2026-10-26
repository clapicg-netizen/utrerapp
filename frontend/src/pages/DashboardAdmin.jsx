// src/pages/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, subirArchivoComercio } from '../lib/comerciosService';
import { supabase } from '../lib/supabaseClient';

const PIN_ADMIN_MAESTRO = "9999";

export default function DashboardAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('comercios'); // 'comercios' o 'anuncios'
  
  // Estados para Comercios
  const [comercios, setComercios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const formInicial = {
    nombre: '',
    categoria: 'Hostelería',
    subcategoria: '',
    tipo_ficha: 'normal',
    direccion: '',
    telefono: '',
    whatsapp: '',
    web_url: '',
    tienda_url: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    horario_texto: '',
    descripcion: '',
    oferta_flash: '',
    portada_url: '',
    logo_url: '',
    carta_pdf_url: '',
    galeria_urls: [],
    video_story_url: '',
    destacado: true,
    pin_acceso: '1234',
    datos_especiales_json: ''
  };

  const [formData, setFormData] = useState(formInicial);

  // Estados para Anuncios de Portada
  const [anuncios, setAnuncios] = useState([]);
  const [editandoAnuncioId, setEditandoAnuncioId] = useState(null);
  const formAnuncioInicial = {
    titulo: '',
    subtitulo: '',
    tipo: 'OFERTA DEL DÍA ⚡',
    color_badge: 'bg-amber-500 text-white',
    bg_gradient: 'from-amber-600 to-orange-700',
    icono: '⚡',
    accion_tab: 'market',
    orden: 1,
    activo: true
  };
  const [formAnuncio, setFormAnuncio] = useState(formAnuncioInicial);

  const cargarLista = async () => {
    try {
      const data = await obtenerComercios('Todos');
      setComercios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setComercios([]);
    }
  };

  const cargarAnuncios = async () => {
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('orden', { ascending: true });
      if (error) throw error;
      if (data) setAnuncios(data);
    } catch (err) {
      console.error("Error al cargar anuncios:", err);
    }
  };

  useEffect(() => {
    if (autenticado) {
      cargarLista();
      cargarAnuncios();
    }
  }, [autenticado]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === PIN_ADMIN_MAESTRO) {
      setAutenticado(true);
      setMensaje({ tipo: '', texto: '' });
    } else {
      setMensaje({ tipo: 'error', texto: 'PIN incorrecto' });
    }
  };

  const handleFileUpload = async (e, campo, esGaleria = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res && res.success && res.url) {
      if (esGaleria) {
        setFormData(prev => ({
          ...prev,
          galeria_urls: [...(prev.galeria_urls || []), res.url]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [campo]: res.url
        }));
      }
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res?.message || 'Error al subir el archivo.' });
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
    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Nombre y Categoría requeridos' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    let parsedDatosEspeciais = null;
    if (formData.datos_especiales_json && formData.datos_especiales_json.trim() !== '') {
      try {
        parsedDatosEspeciais = JSON.parse(formData.datos_especiales_json);
      } catch (err) {
        setGuardando(false);
        setMensaje({ tipo: 'error', texto: 'Error en el formato JSON de los datos especiales. Revísalo.' });
        return;
      }
    }

    const datosAEnviar = {
      ...formData,
      portada_url: formData.portada_url && formData.portada_url.trim() !== "" ? formData.portada_url.trim() : null,
      logo_url: formData.logo_url && formData.logo_url.trim() !== "" ? formData.logo_url.trim() : null,
      carta_pdf_url: formData.carta_pdf_url && formData.carta_pdf_url.trim() !== "" ? formData.carta_pdf_url.trim() : null,
      video_story_url: formData.video_story_url && formData.video_story_url.trim() !== "" ? formData.video_story_url.trim() : null,
      web_url: formData.web_url && formData.web_url.trim() !== "" ? formData.web_url.trim() : null,
      tienda_url: formData.tienda_url && formData.tienda_url.trim() !== "" ? formData.tienda_url.trim() : null,
      instagram_url: formData.instagram_url && formData.instagram_url.trim() !== "" ? formData.instagram_url.trim() : null,
      tiktok_url: formData.tiktok_url && formData.tiktok_url.trim() !== "" ? formData.tiktok_url.trim() : null,
      facebook_url: formData.facebook_url && formData.facebook_url.trim() !== "" ? formData.facebook_url.trim() : null,
      galeria_urls: Array.isArray(formData.galeria_urls) ? formData.galeria_urls.filter(u => typeof u === 'string' && u.trim() !== '') : [],
      datos_especiales: parsedDatosEspeciais
    };

    delete datosAEnviar.datos_especiales_json;

    if (editandoId) {
      const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datosAEnviar);
      setGuardando(false);
      if (res && res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio actualizado correctamente!' });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al actualizar: ' + (res?.message || 'Desconocido') });
      }
    } else {
      const res = await crearComercio(datosAEnviar);
      setGuardando(false);
      if (res && res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Nuevo comercio creado con éxito!' });
        setFormData(formInicial);
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al crear: ' + (res?.message || 'Desconocido') });
      }
    }
  };

  const handleGuardarAnuncio = async (e) => {
    e.preventDefault();
    try {
      if (editandoAnuncioId) {
        const { error } = await supabase
          .from('anuncios')
          .update(formAnuncio)
          .eq('id', editandoAnuncioId);
        if (error) throw error;
        setMensaje({ tipo: 'exito', texto: '¡Anuncio actualizado correctamente!' });
      } else {
        const { error } = await supabase
          .from('anuncios')
          .insert([formAnuncio]);
        if (error) throw error;
        setMensaje({ tipo: 'exito', texto: '¡Nuevo anuncio creado con éxito!' });
      }
      setEditandoAnuncioId(null);
      setFormAnuncio(formAnuncioInicial);
      cargarAnuncios();
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Error al guardar el anuncio.' });
    }
  };

  const handleEditarAnuncio = (anuncio) => {
    setEditandoAnuncioId(anuncio.id);
    setFormAnuncio({
      titulo: anuncio.titulo || '',
      subtitulo: anuncio.subtitulo || '',
      tipo: anuncio.tipo || 'ANUNCIO 📢',
      color_badge: anuncio.color_badge || 'bg-rose-500 text-white',
      bg_gradient: anuncio.bg_gradient || 'from-rose-600 to-pink-700',
      icono: anuncio.icono || '📢',
      accion_tab: anuncio.accion_tab || 'market',
      orden: anuncio.orden || 1,
      activo: anuncio.activo ?? true
    });
  };

  const handleEliminarAnuncio = async (id, titulo) => {
    if (window.confirm(`¿Seguro que deseas borrar el anuncio "${titulo}"?`)) {
      try {
        const { error } = await supabase.from('anuncios').delete().eq('id', id);
        if (error) throw error;
        setMensaje({ tipo: 'exito', texto: `Anuncio eliminado: ${titulo}` });
        cargarAnuncios();
      } catch (err) {
        console.error(err);
        setMensaje({ tipo: 'error', texto: 'Error al eliminar el anuncio.' });
      }
    }
  };

  const handleEditar = (c) => {
    setEditandoId(c.id);
    setFormData({
      nombre: c.nombre || '',
      categoria: c.categoria || 'Hostelería',
      subcategoria: c.subcategoria || '',
      tipo_ficha: c.tipo_ficha || 'normal',
      direccion: c.direccion || '',
      telefono: c.telefono || '',
      whatsapp: c.whatsapp || '',
      web_url: c.web_url || '',
      tienda_url: c.tienda_url || '',
      instagram_url: c.instagram_url || '',
      facebook_url: c.facebook_url || '',
      tiktok_url: c.tiktok_url || '',
      horario_texto: c.horario_texto || '',
      descripcion: c.descripcion || '',
      oferta_flash: c.oferta_flash || '',
      portada_url: typeof c.portada_url === 'string' ? c.portada_url : '',
      logo_url: typeof c.logo_url === 'string' ? c.logo_url : '',
      carta_pdf_url: typeof c.carta_pdf_url === 'string' ? c.carta_pdf_url : '',
      galeria_urls: Array.isArray(c.galeria_urls) ? c.galeria_urls : [],
      video_story_url: typeof c.video_story_url === 'string' ? c.video_story_url : '',
      destacado: c.destacado ?? true,
      pin_acceso: c.pin_acceso || '1234',
      datos_especiales_json: c.datos_especiales ? JSON.stringify(c.datos_especiales, null, 2) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Seguro que deseas borrar "${nombre}"?`)) {
      const res = await eliminarComercio(id);
      if (res && res.success) {
        setMensaje({ tipo: 'exito', texto: `Eliminado: ${nombre}` });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res?.message || 'Error al eliminar' });
      }
    }
  };

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-16">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <span className="text-5xl">👑</span>
          <h1 className="text-2xl font-black text-slate-900 mt-3">Panel Admin</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Utrerapp Management</p>

          {mensaje.texto && (
            <div className={`p-3 rounded-2xl text-xs font-bold mb-4 ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="PIN Maestro (9999)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-lg font-black tracking-widest"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg cursor-pointer"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-8 font-sans">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dashboard Admin</span>
          <h1 className="text-2xl font-black">Panel de Control Utrerapp</h1>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
        >
          Salir
        </button>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN EN ADMIN */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setSeccionActiva('comercios')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-colors cursor-pointer ${seccionActiva === 'comercios' ? 'bg-slate-900 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          🏪 Gestión de Comercios ({comercios.length})
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('anuncios')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-colors cursor-pointer ${seccionActiva === 'anuncios' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          📢 Anuncios de Portada ({anuncios.length})
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-2xl text-xs font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* SECCIÓN 1: GESTIÓN DE COMERCIOS */}
      {seccionActiva === 'comercios' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-black text-slate-800">
                {editandoId ? `✏️ Editando: ${formData.nombre}` : '➕ Registrar Nuevo Comercio'}
              </h2>
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setFormData(formInicial);
                  }}
                  className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleGuardar} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <label className="block text-xs font-black text-blue-900 mb-1 uppercase tracking-wider">🎯 Tipo de Estructura de Ficha</label>
                <select
                  value={formData.tipo_ficha}
                  onChange={(e) => setFormData({...formData, tipo_ficha: e.target.value})}
                  className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-950"
                >
                  <option value="normal">📄 Ficha Normal / Estándar</option>
                  <option value="especial1">🏠 Ficha Especial 1 - Inmobiliarias (Catálogo de Inmuebles)</option>
                  <option value="especial2">🍔 Ficha Especial 2 - Comida a domicilio / Pedidos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Negocio *</label>
                  <input
                    type="text"
                    placeholder="Ej. Inmobiliaria Utrera / Bar La Chana"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📂 Categoría *</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Venta y Alquiler / Pizzas y Hamburguesas"
                    value={formData.subcategoria}
                    onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej. Calle Clemente de la Cuadra, 13"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp</label>
                  <input
                    type="text"
                    placeholder="34600000000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📞 Teléfono</label>
                  <input
                    type="text"
                    placeholder="954860000"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🔑 PIN Comercio</label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={formData.pin_acceso}
                    onChange={(e) => setFormData({...formData, pin_acceso: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* 🌐 SITIO WEB Y TIENDA ONLINE */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs font-black uppercase text-slate-700">🌐 Sitio Web y Tienda Online</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Página Web:</label>
                    <input
                      type="text"
                      placeholder="https://www.lachanataberna.es"
                      value={formData.web_url}
                      onChange={(e) => setFormData({...formData, web_url: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tienda Online / E-commerce:</label>
                    <input
                      type="text"
                      placeholder="https://tu-tienda.palbin.com"
                      value={formData.tienda_url}
                      onChange={(e) => setFormData({...formData, tienda_url: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 🌐 REDES SOCIALES */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs font-black uppercase text-slate-700">🌐 Redes Sociales</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Instagram URL:</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TikTok URL:</label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@..."
                      value={formData.tiktok_url}
                      onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Facebook URL:</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {formData.tipo_ficha !== 'normal' && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <h3 className="text-xs font-black uppercase text-amber-900">
                    ⚙️ Configuración Avanzada ({formData.tipo_ficha === 'especial1' ? 'Inmobiliaria' : 'Comida a Domicilio'})
                  </h3>
                  <textarea
                    rows="5"
                    placeholder="Escribe datos en formato JSON..."
                    value={formData.datos_especiales_json}
                    onChange={(e) => setFormData({...formData, datos_especiales_json: e.target.value})}
                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-xs font-black uppercase text-slate-400">📸 Portada, Galería, Vídeo y Carta PDF</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Portada Principal</label>
                  {formData.portada_url && typeof formData.portada_url === 'string' && (
                    <img src={formData.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
                  )}
                  <input
                    type="text"
                    placeholder="URL de imagen..."
                    value={formData.portada_url}
                    onChange={(e) => setFormData({...formData, portada_url: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'portada_url')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>

                {/* 🖼️ GALERÍA DE FOTOS MÚLTIPLE */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2">🖼️ Galería de Fotos (Múltiples imágenes):</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {Array.isArray(formData.galeria_urls) && formData.galeria_urls.map((url, idx) => (
                      <div key={idx} className="relative h-20 bg-slate-200 rounded-xl overflow-hidden border">
                        <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => eliminarDeGaleria(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center cursor-pointer shadow"
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

                {/* 🎬 VÍDEO PROMOCIONAL (URL O SUBIDA DIRECTA) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-xs font-black uppercase text-slate-700">🎬 Vídeo Promocional</p>
                  
                  {formData.video_story_url && (
                    <div className="mb-2">
                      <video 
                        src={formData.video_story_url} 
                        controls 
                        className="w-full h-40 object-cover rounded-xl border bg-black"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL del vídeo (YouTube o enlace directo):</label>
                    <input
                      type="text"
                      placeholder="https://... o sube un archivo abajo"
                      value={formData.video_story_url}
                      onChange={(e) => setFormData({...formData, video_story_url: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs mb-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subir archivo de vídeo (MP4) desde el dispositivo:</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video_story_url')}
                      disabled={subiendo}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📄 Carta / Menú o Folleto</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.carta_pdf_url}
                    onChange={(e) => setFormData({...formData, carta_pdf_url: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-2"
                  />
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleFileUpload(e, 'carta_pdf_url')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">⚡ Oferta Flash / Promoción</label>
                  <input
                    type="text"
                    placeholder="Ej. Descuento especial"
                    value={formData.oferta_flash}
                    onChange={(e) => setFormData({...formData, oferta_flash: e.target.value})}
                    className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Negocio</label>
                  <textarea
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="destacado"
                    checked={formData.destacado}
                    onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="destacado" className="text-xs font-bold text-blue-900 cursor-pointer">
                    ⭐ Comercio Destacado / VIP en Portada
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={guardando || subiendo}
                className="w-full bg-blue-600 text-white font-bold text-sm py-4 rounded-2xl shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
              >
                {guardando ? 'Guardando...' : editandoId ? '💾 Guardar Cambios' : '🚀 Dar de Alta Comercio'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-slate-800 border-b pb-3">
              🏬 Comercios Registrados ({comercios.length})
            </h2>

            <div className="divide-y divide-slate-100">
              {Array.isArray(comercios) && comercios.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    {c.portada_url && typeof c.portada_url === 'string' ? (
                      <img src={c.portada_url} alt={c.nombre} className="w-12 h-12 rounded-xl object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-lg">🏪</div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.nombre}</h3>
                      <p className="text-[11px] text-slate-500">{c.categoria}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditar(c)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(c.id, c.nombre)}
                      className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      🗑️ Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: GESTIÓN DE ANUNCIOS DE PORTADA */}
      {seccionActiva === 'anuncios' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-black text-slate-800">
                {editandoAnuncioId ? "✏️ Editando Anuncio" : "➕ Crear Nuevo Anuncio de Portada"}
              </h2>
              {editandoAnuncioId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoAnuncioId(null);
                    setFormAnuncio(formAnuncioInicial);
                  }}
                  className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleGuardarAnuncio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título principal *</label>
                <input
                  type="text"
                  placeholder="Ej: Bar Alonsi: 2x1 en tapas"
                  value={formAnuncio.titulo}
                  onChange={(e) => setFormAnuncio({...formAnuncio, titulo: e.target.value})}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo o descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Muestra la PWA al pedir hoy"
                  value={formAnuncio.subtitulo}
                  onChange={(e) => setFormAnuncio({...formAnuncio, subtitulo: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Etiqueta Tipo</label>
                  <input
                    type="text"
                    placeholder="Ej: OFERTA DEL DÍA ⚡"
                    value={formAnuncio.tipo}
                    onChange={(e) => setFormAnuncio({...formAnuncio, tipo: e.target.value})}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Icono (Emoji)</label>
                  <input
                    type="text"
                    placeholder="⚡"
                    value={formAnuncio.icono}
                    onChange={(e) => setFormAnuncio({...formAnuncio, icono: e.target.value})}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destino al hacer clic</label>
                  <select
                    value={formAnuncio.accion_tab}
                    onChange={(e) => setFormAnuncio({...formAnuncio, accion_tab: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="market">Guía Comercial / Market</option>
                    <option value="conso">Conso IA</option>
                    <option value="juego-mostachon">Juego del Mostachón</option>
                    <option value="transporte">Transporte</option>
                    <option value="salud">Salud</option>
                    <option value="farmacias">Farmacias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Orden de aparición (1, 2, 3...)</label>
                  <input
                    type="number"
                    value={formAnuncio.orden}
                    onChange={(e) => setFormAnuncio({...formAnuncio, orden: parseInt(e.target.value) || 1})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gradiente de Fondo</label>
                  <select
                    value={formAnuncio.bg_gradient}
                    onChange={(e) => setFormAnuncio({...formAnuncio, bg_gradient: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="from-rose-600 to-pink-700">Rosa / Fucsia</option>
                    <option value="from-amber-600 to-yellow-600">Ámbar / Oro</option>
                    <option value="from-amber-600 to-orange-700">Naranja / Oferta</option>
                    <option value="from-slate-800 to-slate-900">Oscuro / Elegante</option>
                    <option value="from-sky-600 to-blue-700">Azul / Marino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de la Etiqueta (Badge)</label>
                  <select
                    value={formAnuncio.color_badge}
                    onChange={(e) => setFormAnuncio({...formAnuncio, color_badge: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="bg-rose-500 text-white">Rojo / Blanco</option>
                    <option value="bg-amber-500 text-white">Ámbar / Blanco</option>
                    <option value="bg-amber-500 text-slate-900">Ámbar / Oscuro</option>
                    <option value="bg-sky-500 text-white">Celeste / Blanco</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="activoAnuncio"
                  checked={formAnuncio.activo}
                  onChange={(e) => setFormAnuncio({...formAnuncio, activo: e.target.checked})}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="activoAnuncio" className="text-xs font-bold text-amber-950 cursor-pointer">
                  📢 Mostrar este anuncio activamente en el carrusel de la PWA
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-4 rounded-2xl shadow-lg cursor-pointer transition-colors"
              >
                {editandoAnuncioId ? "💾 Actualizar Anuncio" : "🚀 Crear Anuncio de Portada"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-slate-800 border-b pb-3">
              📢 Anuncios Registrados ({anuncios.length})
            </h2>

            <div className="divide-y divide-slate-100">
              {anuncios.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icono}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                        {item.tipo}
                      </span>
                      {!item.activo && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">Oculto</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.titulo}</h3>
                    <p className="text-[11px] text-slate-500">{item.subtitulo}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditarAnuncio(item)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarAnuncio(item.id, item.titulo)}
                      className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      🗑️ Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}