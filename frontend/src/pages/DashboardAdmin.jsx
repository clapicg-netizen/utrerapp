// src/pages/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, subirArchivoComercio } from '../lib/comerciosService';

const PIN_ADMIN_MAESTRO = "9999";

export default function DashboardAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [comercios, setComercios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const formInicial = {
    nombre: '',
    categoria: 'Hostelería',
    subcategoria: '',
    direccion: '',
    telefono: '',
    whatsapp: '',
    web_url: '',
    tienda_url: '',
    instagram_username: '',
    facebook_url: '',
    tiktok_username: '',
    horario_texto: '',
    descripcion: '',
    oferta_flash: '',
    portada_url: '',
    logo_url: '',
    carta_pdf_url: '',
    galeria_urls: [],
    video_story_url: '',
    destacado: true,
    pin_acceso: '1234'
  };

  const [formData, setFormData] = useState(formInicial);

  const cargarLista = async () => {
    const data = await obtenerComercios('Todos');
    setComercios(data || []);
  };

  useEffect(() => {
    if (autenticado) {
      cargarLista();
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
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      if (esGaleria) {
        setFormData((prev) => ({
          ...prev,
          galeria_urls: [...(prev.galeria_urls || []), res.url]
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [campo]: res.url
        }));
      }
      setMensaje({ tipo: 'exito', texto: '¡Subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  const limpiarDatosParaEnviar = (data) => {
    return {
      ...data,
      portada_url: data.portada_url && data.portada_url.trim() !== "" ? data.portada_url.trim() : null,
      logo_url: data.logo_url && data.logo_url.trim() !== "" ? data.logo_url.trim() : null,
      carta_pdf_url: data.carta_pdf_url && data.carta_pdf_url.trim() !== "" ? data.carta_pdf_url.trim() : null,
      video_story_url: data.video_story_url && data.video_story_url.trim() !== "" ? data.video_story_url.trim() : null,
      galeria_urls: Array.isArray(data.galeria_urls) ? data.galeria_urls.filter(u => u && u.trim() !== "") : []
    };
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Nombre y Categoría requeridos' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    const datosLimpios = limpiarDatosParaEnviar(formData);

    if (editandoId) {
      const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datosLimpios);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio actualizado!' });
        setEditandoId(null);
        setFormData(formInicial);
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    } else {
      const res = await crearComercio(datosLimpios);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Nuevo comercio creado!' });
        setFormData(formInicial);
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    }
  };

  const handleEditar = (c) => {
    setEditandoId(c.id);
    setFormData({
      nombre: c.nombre || '',
      categoria: c.categoria || 'Hostelería',
      subcategoria: c.subcategoria || '',
      direccion: c.direccion || '',
      telefono: c.telefono || '',
      whatsapp: c.whatsapp || '',
      web_url: c.web_url || '',
      tienda_url: c.tienda_url || '',
      instagram_username: c.instagram_username || '',
      facebook_url: c.facebook_url || '',
      tiktok_username: c.tiktok_username || '',
      horario_texto: c.horario_texto || '',
      descripcion: c.descripcion || '',
      oferta_flash: c.oferta_flash || '',
      portada_url: c.portada_url && c.portada_url !== "EMPTY" ? c.portada_url : '',
      logo_url: c.logo_url && c.logo_url !== "EMPTY" ? c.logo_url : '',
      carta_pdf_url: c.carta_pdf_url && c.carta_pdf_url !== "EMPTY" ? c.carta_pdf_url : '',
      galeria_urls: Array.isArray(c.galeria_urls) ? c.galeria_urls : [],
      video_story_url: c.video_story_url && c.video_story_url !== "EMPTY" ? c.video_story_url : '',
      destacado: c.destacado ?? true,
      pin_acceso: c.pin_acceso || '1234'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Borrar "${nombre}"?`)) {
      const res = await eliminarComercio(id);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: `Eliminado: ${nombre}` });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
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
            <div className={mensaje.tipo === 'error' ? 'p-3 rounded-2xl text-xs font-bold mb-4 bg-red-50 text-red-600' : 'p-3 rounded-2xl text-xs font-bold mb-4 bg-emerald-50 text-emerald-600'}>
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
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-8">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Dashboard Admin</span>
          <h1 className="text-2xl font-black">Gestión de Comercios</h1>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
        >
          Salir
        </button>
      </div>

      {mensaje.texto && (
        <div className={mensaje.tipo === 'error' ? 'p-4 rounded-2xl text-xs font-bold text-center bg-red-50 text-red-600' : 'p-4 rounded-2xl text-xs font-bold text-center bg-emerald-50 text-emerald-600'}>
          {mensaje.texto}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-black text-slate-800">
            {editandoId ? `✏️ Editando: ${formData.nombre}` : '➕ Registrar Nuevo Comercio'}
          </h2>
          {editandoId && (
            <button
              onClick={() => {
                setEditandoId(null);
                setFormData(formInicial);
              }}
              className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-xl text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Negocio *</label>
              <input
                type="text"
                placeholder="Ej. Bar Alonsi"
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
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría</label>
              <input
                type="text"
                placeholder="Ej. Tapas y Raciones"
                value={formData.subcategoria}
                onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección</label>
              <input
                type="text"
                placeholder="Ej. Plaza del Altozano, 12"
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

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-black uppercase text-slate-400">🌐 Web y Redes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🌐 Sitio Web</label>
                <input
                  type="url"
                  placeholder="https://www.minegocio.com"
                  value={formData.web_url}
                  onChange={(e) => setFormData({...formData, web_url: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🛒 Tienda Online</label>
                <input
                  type="url"
                  placeholder="https://tienda.minegocio.com"
                  value={formData.tienda_url}
                  onChange={(e) => setFormData({...formData, tienda_url: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">📸 Instagram</label>
                <input
                  type="text"
                  placeholder="@minegocio_utrera"
                  value={formData.instagram_username}
                  onChange={(e) => setFormData({...formData, instagram_username: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">📘 Facebook</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/minegocio"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🎵 TikTok</label>
                <input
                  type="text"
                  placeholder="@minegocio_utrera"
                  value={formData.tiktok_username}
                  onChange={(e) => setFormData({...formData, tiktok_username: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-black uppercase text-slate-400">📸 Multimedia y Carta</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📸 Portada Principal</label>
              {formData.portada_url && (
                <img src={formData.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'portada_url')}
                disabled={subiendo}
                className="w-full text-xs text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📄 Carta / Menú (PDF / Imagen)</label>
              {formData.carta_pdf_url && (
                <p className="text-[11px] text-emerald-600 font-bold mb-1 truncate">✓ Subida: {formData.carta_pdf_url}</p>
              )}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, 'carta_pdf_url')}
                disabled={subiendo}
                className="w-full text-xs text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                {formData.galeria_urls.map((url, idx) => (
                  <div key={idx} className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border">
                    <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({...p, galeria_urls: p.galeria_urls.filter((_, i) => i !== idx)}))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] font-bold cursor-pointer"
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
                className="w-full text-xs text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">⚡ Oferta Flash</label>
              <input
                type="text"
                placeholder="Ej. 2x1 en tapas hoy"
                value={formData.oferta_flash}
                onChange={(e) => setFormData({...formData, oferta_flash: e.target.value})}
                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción</label>
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
                ⭐ Comercio Destacado / VIP
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
          {comercios.map((c) => (
            <div key={c.id} className="py-3 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {c.portada_url && c.portada_url !== "EMPTY" ? (
                  <img src={c.portada_url} alt={c.nombre} className="w-12 h-12 rounded-xl object-cover border" />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-lg">🏪</div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.nombre}</h3>
                  <p className="text-[11px] text-slate-500">
                    {c.categoria} | PIN: <span className="font-bold text-blue-600">{c.pin_acceso || '1234'}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(c)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  ✏️ Editar
                </button>
                <button
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
  );
}