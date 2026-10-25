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
    descripcion: '',
    portada_url: '',
    carta_pdf_url: '',
    galeria_urls: [],
    pin_acceso: '1234'
  };

  const [formData, setFormData] = useState(formInicial);

  const cargarLista = async () => {
    try {
      const data = await obtenerComercios('Todos');
      setComercios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setComercios([]);
    }
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
      setMensaje({ tipo: 'error', texto: res?.message || 'Error al subir el archivo' });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      setMensaje({ tipo: 'error', texto: 'El nombre es obligatorio' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    // Nos aseguramos de que galeria_urls sea siempre un array limpio
    const datosAEnviar = {
      ...formData,
      galeria_urls: Array.isArray(formData.galeria_urls) ? formData.galeria_urls.filter(u => typeof u === 'string' && u.trim() !== '') : []
    };

    if (editandoId) {
      const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datosAEnviar);
      setGuardando(false);
      if (res && res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio actualizado con su galería múltiple y PDF!' });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + (res?.message || 'Desconocido') });
      }
    } else {
      const res = await crearComercio(datosAEnviar);
      setGuardando(false);
      if (res && res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio creado con éxito!' });
        setFormData(formInicial);
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al crear: ' + (res?.message || 'Desconocido') });
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
      descripcion: c.descripcion || '',
      portada_url: typeof c.portada_url === 'string' ? c.portada_url : '',
      carta_pdf_url: typeof c.carta_pdf_url === 'string' ? c.carta_pdf_url : '',
      galeria_urls: Array.isArray(c.galeria_urls) ? c.galeria_urls : [],
      pin_acceso: c.pin_acceso || '1234'
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
        <div className={`p-4 rounded-2xl text-xs font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Negocio *</label>
              <input
                type="text"
                placeholder="Ej. Bar La Chana"
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
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-black uppercase text-slate-400">📸 Portada, Galería y Carta PDF</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📸 Portada Principal</label>
              {formData.portada_url && typeof formData.portada_url === 'string' && (
                <img src={formData.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'portada_url')}
                disabled={subiendo}
                className="w-full text-xs text-slate-500 mb-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📄 Carta / Menú en PDF</label>
              {formData.carta_pdf_url && typeof formData.carta_pdf_url === 'string' && (
                <p className="text-[11px] text-emerald-600 font-bold mb-1 truncate">✓ PDF cargado: {formData.carta_pdf_url}</p>
              )}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, 'carta_pdf_url')}
                disabled={subiendo}
                className="w-full text-xs text-slate-500 mb-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos (Sube tantas como quieras)</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                {Array.isArray(formData.galeria_urls) && formData.galeria_urls.map((url, idx) => (
                  <div key={idx} className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border">
                    {typeof url === 'string' && <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />}
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
  );
}