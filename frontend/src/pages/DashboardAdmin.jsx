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
    tipo_ficha: 'normal', // 'normal', 'especial1' (Inmobiliarias), 'especial2' (Comida a domicilio)
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
    pin_acceso: '1234',
    // Campos específicos para fichas especiales en formato texto/json plano para edición rápida
    datos_especiales_json: ''
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
      setMensaje({ tipo: 'error', texto: res?.message || 'Error al subir el archivo.' });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria) {
      setMensaje({ tipo: 'error', texto: 'Nombre y Categoría requeridos' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    // Intentamos parsear el JSON de datos especiales si se ha escrito algo
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
      galeria_urls: Array.isArray(formData.galeria_urls) ? formData.galeria_urls.filter(u => typeof u === 'string' && u.trim() !== '') : [],
      // Enviamos también el campo estructurado si tu base de datos lo soporta
      datos_especiales: parsedDatosEspeciais
    };

    delete datosAEnviar.datos_especiales_json; // Limpiamos temporal para el envío si la columna se llama diferente

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
      instagram_username: c.instagram_username || '',
      facebook_url: c.facebook_url || '',
      tiktok_username: c.tiktok_username || '',
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
          {/* SELECTOR DE TIPO DE FICHA */}
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

          {/* CAMPOS ESPECÍFICOS SI ES FICHA ESPECIAL 1 o 2 */}
          {formData.tipo_ficha !== 'normal' && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
              <h3 className="text-xs font-black uppercase text-amber-900">
                ⚙️ Configuración Avanzada ({formData.tipo_ficha === 'especial1' ? 'Inmobiliaria' : 'Comida a Domicilio'})
              </h3>
              <p className="text-[11px] text-amber-800">
                Introduce aquí los datos estructurados en formato JSON (catálogo de inmuebles o categorías/platos de comida) para esta ficha avanzada.
              </p>
              <textarea
                rows="5"
                placeholder={formData.tipo_ficha === 'especial1' ? 'Ej. {"titulo_seccion": "Inmuebles", "items": [{"titulo": "Piso centro", "precio": "120000€"}]}' : 'Ej. {"pedido_minimo": 12, "coste_envio": 2, "platos": [{"nombre": "Burger", "precio": 8.5}]}'}
                value={formData.datos_especiales_json}
                onChange={(e) => setFormData({...formData, datos_especiales_json: e.target.value})}
                className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-mono"
              />
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-black uppercase text-slate-400">📸 Portada, Galería y Carta PDF</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📸 Portada Principal</label>
              {formData.portada_url && typeof formData.portada_url === 'string' && (
                <img src={formData.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
              )}
              <input
                type="text"
                placeholder="O pega URL de imagen directa..."
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">📄 Carta / Menú o Folleto (Imagen o PDF)</label>
              {formData.carta_pdf_url && typeof formData.carta_pdf_url === 'string' && (
                <p className="text-[11px] text-emerald-600 font-bold mb-1 truncate">✓ Archivo activo: {formData.carta_pdf_url}</p>
              )}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos</label>
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

          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">⚡ Oferta Flash / Promoción</label>
              <input
                type="text"
                placeholder="Ej. Valoración gratuita de inmuebles"
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
                  <p className="text-[11px] text-slate-500">{c.categoria} {c.tipo_ficha && c.tipo_ficha !== 'normal' ? `(${c.tipo_ficha})` : ''}</p>
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