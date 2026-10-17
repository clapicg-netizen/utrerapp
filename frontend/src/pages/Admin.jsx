// src/pages/PanelAdmin.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, subirArchivoComercio } from '../lib/comerciosService';

const PIN_ADMIN_MAESTRO = "9999";

export default function PanelAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [comercios, setComercios] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // null = Modo Crear
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
    instagram_username: '',
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
    const data = await obtenerComercios("Todos");
    setComercios(data);
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
      setMensaje({ tipo: 'error', texto: 'PIN de Administrador incorrecto' });
    }
  };

  const handleFileUpload = async (e, campo, esGaleria = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase Storage...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      if (esGaleria) {
        setFormData((prev) => ({
          ...prev,
          galeria_urls: [...prev.galeria_urls, res.url]
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [campo]: res.url
        }));
      }
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Indica al menos el Nombre y la Categoría' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    if (editandoId) {
      // Modificar existente
      const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, formData);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio actualizado con éxito!' });
        setEditandoId(null);
        setFormData(formInicial);
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    } else {
      // Crear nuevo
      const res = await crearComercio(formData);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Nuevo comercio dado de alta en Utrerapp!' });
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
      instagram_username: c.instagram_username || '',
      horario_texto: c.horario_texto || '',
      descripcion: c.descripcion || '',
      oferta_flash: c.oferta_flash || '',
      portada_url: c.portada_url || '',
      logo_url: c.logo_url || '',
      carta_pdf_url: c.carta_pdf_url || '',
      galeria_urls: c.galeria_urls || [],
      video_story_url: c.video_story_url || '',
      destacado: c.destacado ?? true,
      pin_acceso: c.pin_acceso || '1234'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres borrar "${nombre}" de Utrerapp?`)) {
      const res = await eliminarComercio(id);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: `Comercio ${nombre} eliminado.` });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    }
  };

  // Login de Administrador
  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-16">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <span className="text-5xl">👑</span>
          <h1 className="text-2xl font-black text-slate-900 mt-3">Panel Admin Utrerapp</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Gestión rápida de negocios para JuanRa</p>

          {mensaje.texto && (
            <div className={`p-3 rounded-2xl text-xs font-bold mb-4 ${
              mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Introduce tu PIN Maestro (9999)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-lg font-black tracking-widest"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg transition"
            >
              Entrar al Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-8">
      
      {/* Cabecera Admin */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Dashboard de Administración</span>
          <h1 className="text-2xl font-black">Gestión Total de Comercios</h1>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-2xl text-xs font-bold text-center ${
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de Alta / Edición */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-black text-slate-800">
            {editandoId ? `✏️ Editando: ${formData.nombre}` : "➕ Registrar Nuevo Comercio"}
          </h2>
          {editandoId && (
            <button
              onClick={() => {
                setEditandoId(null);
                setFormData(formInicial);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-slate-600"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {/* Bloque 1: Datos Principales */}
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
                placeholder="Ej. Tapas y Raciones / Ropa / Peluquería"
                value={formData.subcategoria}
                onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección en Utrera</label>
              <input
                type="text"
                placeholder="Ej. Plaza del Altozano, 12"
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Bloque 2: Contacto y Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp (Sin espacios)</label>
              <input
                type="text"
                placeholder="Ej. 34600000000"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📞 Teléfono Fijo/Móvil</label>
              <input
                type="text"
                placeholder="Ej. 954860000"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🔑 PIN de Cliente (Acceso Comercio)</label>
              <input
                type="text"
                placeholder="1234"
                value={formData.pin_acceso}
                onChange={(e) => setFormData({...formData, pin_acceso: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Bloque 3: Imágenes y Archivos */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Multimedia & Archivos</h3>

            {/* Foto de Portada */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada Principal</label>
              {formData.portada_url && (
                <img src={formData.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'portada_url')}
                disabled={subiendo}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Galería de Fotos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos (Añadir múltiples)</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                {formData.galeria_urls.map((url, idx) => (
                  <div key={idx} className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border">
                    <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({...p, galeria_urls: p.galeria_urls.filter((_, i) => i !== idx)}))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center"
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

            {/* Carta PDF */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📄 Carta / Menú (PDF o Imagen)</label>
              {formData.carta_pdf_url && (
                <p className="text-[11px] text-emerald-600 font-bold mb-1 truncate">✓ Archivo subido: {formData.carta_pdf_url}</p>
              )}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, 'carta_pdf_url')}
                disabled={subiendo}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          </div>

          {/* Bloque 4: Descripción, Oferta Flash y VIP */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">⚡ Oferta Flash / Promoción Activa</label>
              <input
                type="text"
                placeholder="Ej. ¡Hoy 2x1 en jarras de cerveza de 20:00 a 22:00!"
                value={formData.oferta_flash}
                onChange={(e) => setFormData({...formData, oferta_flash: e.target.value})}
                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Local</label>
              <textarea
                rows="3"
                placeholder="Escribe un resumen atractivo para los vecinos..."
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
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="destacado" className="text-xs font-bold text-blue-900 cursor-pointer">
                ⭐ Comercio Destacado / VIP (Aparece primero en los carruseles superiores)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando || subiendo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-2xl shadow-lg transition"
          >
            {guardando ? 'Guardando en la App...' : editandoId ? '💾 Guardar Cambios en Comercio' : '🚀 Dar de Alta Comercio en Utrerapp'}
          </button>
        </form>
      </div>

      {/* Tabla / Lista de Comercios Existentes */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-slate-800 border-b pb-3">
          🏬 Comercios Registrados ({comercios.length})
        </h2>

        <div className="divide-y divide-slate-100">
          {comercios.map((c) => (
            <div key={c.id} className="py-3 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {c.portada_url ? (
                  <img src={c.portada_url} alt={c.nombre} className="w-12 h-12 rounded-xl object-cover border" />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-lg">🏪</div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.nombre}</h3>
                  <p className="text-[11px] text-slate-500">
                    {c.categoria} {c.subcategoria ? `• ${c.subcategoria}` : ''} | PIN: <span className="font-bold text-blue-600">{c.pin_acceso || '1234'}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(c)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminar(c.id, c.nombre)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition"
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