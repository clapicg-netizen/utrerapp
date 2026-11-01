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

  // 'normal', 'inmobiliaria' o 'comida'
  const [tipoRegistro, setTipoRegistro] = useState('normal');

  // Formulario completo original para comercios estándar (con vídeo incluido)
  const formComercioInicial = {
    nombre: '',
    categoria: 'Hostelería',
    subcategoria: '',
    tipo_ficha: 'normal',
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

  // Formulario completo para inmobiliaria (con foto del inmueble)
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
    foto: '',
    activo: true
  };

  // Formulario completo para comida / pedidos (con imagen del plato)
  const formComidaInicial = {
    categoria: 'Entrantes',
    nombre_producto: '',
    descripcion_ingredientes: '',
    precio: '',
    imagen_producto: '',
    disponible: true
  };

  const [formData, setFormData] = useState(formComercioInicial);
  const [formInmobiliaria, setFormInmobiliaria] = useState(formInmobiliariaInicial);
  const [formComida, setFormComida] = useState(formComidaInicial);

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

  const handleFileUpload = async (e, campo, esGaleria = false, tipoForm = 'normal') => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase Storage...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      if (tipoForm === 'comida') {
        setFormComida((prev) => ({ ...prev, [campo]: res.url }));
      } else if (tipoForm === 'inmobiliaria') {
        setFormInmobiliaria((prev) => ({ ...prev, [campo]: res.url }));
      } else if (esGaleria) {
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
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (tipoRegistro === 'inmobiliaria') {
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
            foto: formInmobiliaria.foto,
            activo: formInmobiliaria.activo
          }
        ]);

        if (error) throw error;

        setGuardando(false);
        setMensaje({ tipo: 'exito', texto: '¡Inmueble registrado con éxito en Supabase!' });
        setFormInmobiliaria(formInmobiliariaInicial);

      } else if (tipoRegistro === 'comida') {
        const { error } = await supabase.from('especial2_items').insert([
          {
            categoria: formComida.categoria,
            nombre_producto: formComida.nombre_producto,
            descripcion_ingredientes: formComida.descripcion_ingredientes,
            precio: Number(formComida.precio) || 0,
            imagen_producto: formComida.imagen_producto,
            disponible: formComida.disponible
          }
        ]);

        if (error) throw error;

        setGuardando(false);
        setMensaje({ tipo: 'exito', texto: '¡Plato o producto de comida registrado con éxito!' });
        setFormComida(formComidaInicial);

      } else {
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
            setMensaje({ tipo: 'exito', texto: '¡Nuevo comercio dado de alta en Utrerapp!' });
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

  const handleEditar = (c) => {
    setEditandoId(c.id);
    setTipoRegistro('normal');
    setFormData({
      nombre: c.nombre || '',
      categoria: c.categoria || 'Hostelería',
      subcategoria: c.subcategoria || '',
      tipo_ficha: c.tipo_ficha || 'normal',
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

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-16 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <span className="text-5xl">👑</span>
          <h1 className="text-2xl font-black text-slate-900 mt-3">Panel Admin Utrerapp</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Gestión de negocios para JuanRa</p>

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
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-8 font-sans">
      
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dashboard de Administración</span>
          <h1 className="text-2xl font-black">Gestión Total de Utrerapp</h1>
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

      {/* Formulario Principal */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-black text-slate-800">
            {editandoId ? `✏️ Editando Comercio: ${formData.nombre}` : "➕ Registrar Nuevo Elemento"}
          </h2>
          {editandoId && (
            <button
              onClick={() => {
                setEditandoId(null);
                setFormData(formComercioInicial);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-slate-600 cursor-pointer"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        {!editandoId && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">Selecciona el tipo de registro:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                🏢 Ficha 1: Inmobiliaria
              </button>
              <button
                type="button"
                onClick={() => setTipoRegistro('comida')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  tipoRegistro === 'comida' ? 'bg-rose-600 text-white shadow' : 'bg-white text-slate-600 border'
                }`}
              >
                🍔 Ficha 2: Comida / Pedidos
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {tipoRegistro === 'inmobiliaria' ? (
            // FORMULARIO INMOBILIARIA (Ficha 1)
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">📞 Contacto / WhatsApp</label>
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto del Inmueble</label>
                  {formInmobiliaria.foto && (
                    <img src={formInmobiliaria.foto} alt="Inmueble" className="w-full h-24 object-cover rounded-xl mb-1 border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'foto', false, 'inmobiliaria')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
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
          ) : tipoRegistro === 'comida' ? (
            // FORMULARIO COMIDA / PEDIDOS (Ficha 2)
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📂 Categoría del Plato</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Entrantes, Pizzas, Bebidas, Postres"
                    value={formComida.categoria}
                    onChange={(e) => setFormComida({...formComida, categoria: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🍽️ Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hamburguesa Smash Utrerapp"
                    value={formComida.nombre_producto}
                    onChange={(e) => setFormComida({...formComida, nombre_producto: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💰 Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 8.50"
                    value={formComida.precio}
                    onChange={(e) => setFormComida({...formComida, precio: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto del Plato</label>
                  {formComida.imagen_producto && (
                    <img src={formComida.imagen_producto} alt="Plato" className="w-full h-24 object-cover rounded-xl mb-1 border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'imagen_producto', false, 'comida')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción e Ingredientes</label>
                <textarea
                  rows="3"
                  placeholder="Ej. Doble carne 100% buey, queso cheddar, bacón crujiente..."
                  value={formComida.descripcion_ingredientes}
                  onChange={(e) => setFormComida({...formComida, descripcion_ingredientes: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formComida.disponible}
                  onChange={(e) => setFormComida({...formComida, disponible: e.target.checked})}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="disponible" className="text-xs font-bold text-rose-900 cursor-pointer">
                  🟢 Disponible en Carta (Activo para pedidos)
                </label>
              </div>
            </div>
          ) : (
            // FORMULARIO COMERCIO ESTÁNDAR
            <div className="space-y-6">
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
                    <option value="Inmobiliarias">Inmobiliarias</option>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">⭐ Tipo de Estructura de Ficha</label>
                  <select
                    value={formData.tipo_ficha}
                    onChange={(e) => setFormData({...formData, tipo_ficha: e.target.value})}
                    className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-950"
                  >
                    <option value="normal">📄 Ficha Normal / Estándar</option>
                    <option value="especial1">🏠 Ficha Especial 1 - Inmobiliaria</option>
                    <option value="especial2">🍔 Ficha Especial 2 - Comida y Pedidos</option>
                  </select>
                </div>

                <div className="md:col-span-2">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">🔑 PIN de Cliente</label>
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
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Multimedia & Archivos</h3>

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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Fotos</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                    {formData.galeria_urls.map((url, idx) => (
                      <div key={idx} className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border">
                        <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({...p, galeria_urls: p.galeria_urls.filter((_, i) => i !== idx)}))}
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🎬 Vídeo Promocional (MP4)</label>
                  {formData.video_story_url && (
                    <p className="text-[11px] text-blue-600 font-bold mb-1 truncate">✓ Vídeo subido con éxito</p>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video_story_url')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                </div>

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

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">⚡ Oferta Flash / Promoción Activa</label>
                  <input
                    type="text"
                    placeholder="Ej. ¡Hoy 2x1 en jarras de cerveza!"
                    value={formData.oferta_flash}
                    onChange={(e) => setFormData({...formData, oferta_flash: e.target.value})}
                    className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Local</label>
                  <textarea
                    rows="3"
                    placeholder="Escribe un resumen atractivo..."
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
                    ⭐ Comercio Destacado / VIP (Aparece primero en los carruseles)
                  </label>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando || subiendo}
            className={`w-full font-bold text-sm py-4 rounded-2xl shadow-lg transition cursor-pointer text-white ${
              tipoRegistro === 'inmobiliaria' ? 'bg-amber-600 hover:bg-amber-700' : tipoRegistro === 'comida' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {guardando ? 'Guardando en Supabase...' : tipoRegistro === 'inmobiliaria' ? '🏢 Guardar Inmueble en la Tabla Inmobiliaria' : tipoRegistro === 'comida' ? '🍔 Guardar Plato en la Carta de Comida' : '🚀 Registrar Comercio Estándar'}
          </button>
        </form>
      </div>

      {/* Tabla de Comercios Existentes */}
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
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {c.nombre}
                    {c.tipo_ficha === 'especial1' && <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-full">Inmobiliaria</span>}
                    {c.tipo_ficha === 'especial2' && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full">Comida VIP</span>}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {c.categoria} {c.subcategoria ? `• ${c.subcategoria}` : ''} | PIN: <span className="font-bold text-blue-600">{c.pin_acceso || '1234'}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(c)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminar(c.id, c.nombre)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
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