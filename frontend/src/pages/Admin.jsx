// src/pages/PanelAdmin.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, subirArchivoComercio } from '../lib/comerciosService';
import { supabase } from '../lib/supabaseClient';

const PIN_ADMIN_MAESTRO = "9999";

export default function PanelAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [comercios, setComercios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // 'normal', 'inmobiliaria', 'comida'
  const [tipoRegistro, setTipoRegistro] = useState('normal');

  const formComercioInicial = {
    nombre: '',
    categoria: 'Hostelería',
    subcategoria: '',
    direccion: '',
    telefono: '',
    whatsapp: '',
    descripcion: '',
    oferta_flash: '',
    portada_url: '',
    carta_pdf_url: '',
    galeria_urls: [],
    destacado: true,
    pin_acceso: '1234'
  };

  // NUEVO: Estado específico para la tabla de Inmobiliaria vista en Supabase
  const formInmobiliariaInicial = {
    titulo: '',
    tipo_operacion: 'Venta',
    tipo_inmueble: 'Piso',
    precio: '',
    habitaciones: '',
    baños: '',
    metros_cuadrados: '',
    descripcion: '',
    contacto: '',
    activo: true
  };

  const [formData, setFormData] = useState(formComercioInicial);
  const [formInmobiliaria, setFormInmobiliaria] = useState(formInmobiliariaInicial);

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

  const handleFileUpload = async (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase Storage...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      setFormData((prev) => ({ ...prev, [campo]: res.url }));
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (tipoRegistro === 'inmobiliaria') {
        // Guarda directamente en la tabla exacta que tienes en Supabase
        const { error } = await supabase.from('especial1_inmobiliaria').insert([
          {
            titulo: formInmobiliaria.titulo,
            tipo_operacion: formInmobiliaria.tipo_operacion,
            tipo_inmueble: formInmobiliaria.tipo_inmueble,
            precio: Number(formInmobiliaria.precio) || 0,
            habitaciones: Number(formInmobiliaria.habitaciones) || 0,
            baños: Number(formInmobiliaria.baños) || 0,
            metros_cuadrados: Number(formInmobiliaria.metros_cuadrados) || 0,
            descripcion: formInmobiliaria.descripcion,
            contacto: formInmobiliaria.contacto,
            activo: formInmobiliaria.activo
          }
        ]);

        if (error) throw error;

        setGuardando(false);
        setMensaje({ tipo: 'exito', texto: '¡Inmueble registrado con éxito en Supabase!' });
        setFormInmobiliaria(formInmobiliariaInicial);

      } else {
        // Flujo comercio estándar
        if (editandoId) {
          const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, formData);
          setGuardando(false);
          if (res.success) {
            setMensaje({ tipo: 'exito', texto: '¡Comercio actualizado con éxito!' });
            setEditandoId(null);
            setFormData(formComercioInicial);
            cargarLista();
          } else {
            setMensaje({ tipo: 'error', texto: res.message });
          }
        } else {
          const res = await crearComercio(formData);
          setGuardando(false);
          if (res.success) {
            setMensaje({ tipo: 'exito', texto: '¡Nuevo comercio dado de alta!' });
            setFormData(formComercioInicial);
            cargarLista();
          } else {
            setMensaje({ tipo: 'error', texto: res.message });
          }
        }
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      setGuardando(false);
      setMensaje({ tipo: 'error', texto: 'Error al guardar en la base de datos.' });
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres borrar "${nombre}" de Utrerapp?`)) {
      const res = await eliminarComercio(id);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: `Eliminado correctamente.` });
        cargarLista();
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    }
  };

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-16 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <span className="text-5xl">👑</span>
          <h1 className="text-2xl font-black text-slate-900 mt-3">Panel Admin Utrerapp</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Gestión de negocios e inmobiliaria para JuanRa</p>

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
              placeholder="PIN Maestro (9999)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-lg font-black tracking-widest"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg transition cursor-pointer"
            >
              Entrar al Dashboard
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
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dashboard de Administración</span>
          <h1 className="text-2xl font-black">Gestión de Utrerapp</h1>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
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

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <h2 className="text-lg font-black text-slate-800 border-b pb-4">
          ➕ Registrar Nuevo Elemento
        </h2>

        {/* SELECTOR DE TIPO DE REGISTRO */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-2">Selecciona el tipo de registro:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoRegistro('normal')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                tipoRegistro === 'normal' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border'
              }`}
            >
              🏪 Comercio Estándar
            </button>
            <button
              type="button"
              onClick={() => setTipoRegistro('inmobiliaria')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                tipoRegistro === 'inmobiliaria' ? 'bg-amber-600 text-white shadow' : 'bg-white text-slate-600 border'
              }`}
            >
              🏢 Inmueble / Inmobiliaria (VIP ⭐)
            </button>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {tipoRegistro === 'inmobiliaria' ? (
            /* ================= FORMULARIO INMOBILIARIA (CAMPOS EXACTOS DE SUPABASE) ================= */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Título del Inmueble *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Espectacular piso luminoso en zona Centro"
                    value={formInmobiliaria.titulo}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, titulo: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📂 Tipo de Operación</label>
                  <select
                    value={formInmobiliaria.tipo_operacion}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, tipo_operacion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Traspaso">Traspaso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏠 Tipo de Inmueble</label>
                  <select
                    value={formInmobiliaria.tipo_inmueble}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, tipo_inmueble: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Piso">Piso</option>
                    <option value="Casa">Casa / Chalet</option>
                    <option value="Local">Local Comercial</option>
                    <option value="Terreno">Terreno / Solar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💰 Precio (€)</label>
                  <input
                    type="number"
                    placeholder="Ej. 135000"
                    value={formInmobiliaria.precio}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, precio: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📞 Contacto / Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ej. 34600000000"
                    value={formInmobiliaria.contacto}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, contacto: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🛏️ Habitaciones</label>
                  <input
                    type="number"
                    placeholder="Ej. 3"
                    value={formInmobiliaria.habitaciones}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, habitaciones: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🚿 Baños</label>
                  <input
                    type="number"
                    placeholder="Ej. 2"
                    value={formInmobiliaria.baños}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, baños: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📐 Metros Cuadrados (m²)</label>
                  <input
                    type="number"
                    placeholder="Ej. 110"
                    value={formInmobiliaria.metros_cuadrados}
                    onChange={(e) => setFormInmobiliaria({...formInmobiliaria, metros_cuadrados: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Inmueble</label>
                <textarea
                  rows="4"
                  placeholder="Detalla calidades, garaje, ascensor, orientación..."
                  value={formInmobiliaria.descripcion}
                  onChange={(e) => setFormInmobiliaria({...formInmobiliaria, descripcion: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formInmobiliaria.activo}
                  onChange={(e) => setFormInmobiliaria({...formInmobiliaria, activo: e.target.checked})}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="activo" className="text-xs font-bold text-amber-900 cursor-pointer">
                  🟢 Inmueble Activo y Visible en la App
                </label>
              </div>
            </div>
          ) : (
            /* ================= FORMULARIO COMERCIO ESTÁNDAR ================= */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Negocio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bar Alonsi"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Resumen atractivo..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando || subiendo}
            className={`w-full font-bold text-sm py-4 rounded-2xl shadow-lg transition cursor-pointer text-white ${
              tipoRegistro === 'inmobiliaria' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {guardando ? 'Guardando en Supabase...' : tipoRegistro === 'inmobiliaria' ? '🏢 Guardar Inmueble en la Tabla Inmobiliaria' : '🚀 Registrar Comercio Estándar'}
          </button>
        </form>
      </div>

    </div>
  );
}