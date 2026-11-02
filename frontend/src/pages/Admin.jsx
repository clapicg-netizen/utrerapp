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

  // 'normal', 'especial1' (Inmobiliaria) o 'especial2' (Comida)
  const [tipoRegistro, setTipoRegistro] = useState('normal');

  // Formulario Negocio Base / Estándar / VIP
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
    pin_acceso: '1234',
    
    // Configuración Ficha 1 (Inmobiliaria)
    titulo_seccion_catalogo: 'Inmuebles destacados',
    banners_destacados_texto: '', // URLs separadas por comas o saltos de línea para el carrusel
    mostrar_boton_captacion: true,
    texto_boton_captacion: 'Solicitar valoración gratuita',

    // Configuración Ficha 2 (Comida)
    horario_pedidos: '',
    pedido_minimo: '',
    coste_envio: '',
    whatsapp_recepcion_pedidos: ''
  };

  // Formulario Ficha 1: Ítem Propiedad (especial1_items)
  const formInmobiliariaItemInicial = {
    negocio_id: '',
    titulo: '',
    subtitulo_zona: '',
    modalidad: 'Venta',
    precio: '',
    habitaciones: '',
    banos: '',
    metros_cuadrados: '',
    planta: '',
    garaje: false,
    descripcion: '',
    etiqueta_destacado: 'Novedad',
    referencia_interna: '',
    whatsapp_contacto_directo: '',
    imagen: ''
  };

  // Formulario Ficha 2: Ítem Plato / Producto (especial2_items)
  const formComidaItemInicial = {
    negocio_id: '',
    categoria: 'Entrantes',
    nombre_producto: '',
    descripcion_ingredientes: '',
    precio: '',
    imagen_producto: '',
    etiquetas: 'Top ventas',
    opciones_personalizables: '',
    disponible: true
  };

  const [formData, setFormData] = useState(formComercioInicial);
  const [formInmobiliariaItem, setFormInmobiliariaItem] = useState(formInmobiliariaItemInicial);
  const [formComidaItem, setFormComidaItem] = useState(formComidaItemInicial);

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

  const handleFileUpload = async (e, campo, esGaleria = false, destinoForm = 'normal') => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase Storage...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      if (destinoForm === 'inmobiliaria') {
        setFormInmobiliariaItem(prev => ({ ...prev, [campo]: res.url }));
      } else if (destinoForm === 'comida') {
        setFormComidaItem(prev => ({ ...prev, [campo]: res.url }));
      } else if (esGaleria) {
        setFormData(prev => ({ ...prev, galeria_urls: [...prev.galeria_urls, res.url] }));
      } else {
        setFormData(prev => ({ ...prev, [campo]: res.url }));
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
      if (tipoRegistro === 'especial1') {
        if (!formInmobiliariaItem.negocio_id) {
          setGuardando(false);
          setMensaje({ tipo: 'error', texto: 'Selecciona la Inmobiliaria de destino.' });
          return;
        }

        const { error } = await supabase.from('especial1_items').insert([
          {
            negocio_id: formInmobiliariaItem.negocio_id,
            titulo: formInmobiliariaItem.titulo,
            subtitulo_zona: formInmobiliariaItem.subtitulo_zona,
            modalidad: formInmobiliariaItem.modalidad,
            precio: Number(formInmobiliariaItem.precio) || 0,
            imagenes: formInmobiliariaItem.imagen ? [formInmobiliariaItem.imagen] : [],
            caracteristicas_clave: {
              habitaciones: Number(formInmobiliariaItem.habitaciones) || 0,
              banos: Number(formInmobiliariaItem.banos) || 0,
              m2: Number(formInmobiliariaItem.metros_cuadrados) || 0,
              planta: formInmobiliariaItem.planta,
              garaje: formInmobiliariaItem.garaje
            },
            descripcion: formInmobiliariaItem.descripcion,
            etiqueta_destacado: formInmobiliariaItem.etiqueta_destacado,
            referencia_interna: formInmobiliariaItem.referencia_interna,
            whatsapp_contacto_directo: formInmobiliariaItem.whatsapp_contacto_directo
          }
        ]);

        if (error) throw error;
        setGuardando(false);
        setMensaje({ tipo: 'exito', texto: '¡Inmueble añadido al catálogo con éxito!' });
        setFormInmobiliariaItem(formInmobiliariaItemInicial);

      } else if (tipoRegistro === 'especial2') {
        if (!formComidaItem.negocio_id) {
          setGuardando(false);
          setMensaje({ tipo: 'error', texto: 'Selecciona el Restaurante de destino.' });
          return;
        }

        const { error } = await supabase.from('especial2_items').insert([
          {
            negocio_id: formComidaItem.negocio_id,
            categoria: formComidaItem.categoria,
            nombre_producto: formComidaItem.nombre_producto,
            descripcion_ingredientes: formComidaItem.descripcion_ingredientes,
            precio: Number(formComidaItem.precio) || 0,
            imagen_producto: formComidaItem.imagen_producto,
            etiquetas: formComidaItem.etiquetas ? formComidaItem.etiquetas.split(',').map(s => s.trim()) : [],
            opciones_personalizables: formComidaItem.opciones_personalizables ? { notas: formComidaItem.opciones_personalizables } : null,
            disponible: formComidaItem.disponible
          }
        ]);

        if (error) throw error;
        setGuardando(false);
        setMensaje({ tipo: 'exito', texto: '¡Plato añadido a la carta con éxito!' });
        setFormComidaItem(formComidaItemInicial);

      } else {
        // Procesar banners destacados en array si se introdujeron separados por comas o saltos de línea
        let bannersArray = [];
        if (formData.banners_destacados_texto) {
          bannersArray = formData.banners_destacados_texto.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        }

        const datosAEnviar = {
          ...formData,
          tipo_ficha: formData.categoria === 'Inmobiliarias' ? 'especial1' : formData.horario_pedidos ? 'especial2' : 'normal',
          banners_destacados: bannersArray
        };
        delete datosAEnviar.banners_destacados_texto;

        if (editandoId) {
          const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datosAEnviar);
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
          const res = await crearComercio(datosAEnviar);
          setGuardando(false);
          if (res.success) {
            setMensaje({ tipo: 'exito', texto: '¡Nuevo negocio dado de alta!' });
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
      pin_acceso: c.pin_acceso || '1234',
      horario_pedidos: c.horario_pedidos || '',
      pedido_minimo: c.pedido_minimo || '',
      coste_envio: c.coste_envio || '',
      whatsapp_recepcion_pedidos: c.whatsapp_recepcion_pedidos || '',
      titulo_seccion_catalogo: c.titulo_seccion_catalogo || 'Inmuebles destacados',
      banners_destacados_texto: c.banners_destacados ? c.banners_destacados.join(', ') : '',
      mostrar_boton_captacion: c.mostrar_boton_captacion ?? true,
      texto_boton_captacion: c.texto_boton_captacion || 'Solicitar valoración gratuita'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres borrar "${nombre}"?`)) {
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
            {editandoId ? `✏️ Editando: ${formData.nombre}` : "➕ Registrar Nuevo Elemento o Catálogo"}
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
                🏪 Negocio Base (Estándar / VIP)
              </button>
              <button
                type="button"
                onClick={() => setTipoRegistro('especial1')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  tipoRegistro === 'especial1' ? 'bg-amber-600 text-white shadow' : 'bg-white text-slate-600 border'
                }`}
              >
                🏢 Añadir Inmueble (Ficha 1)
              </button>
              <button
                type="button"
                onClick={() => setTipoRegistro('especial2')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  tipoRegistro === 'especial2' ? 'bg-rose-600 text-white shadow' : 'bg-white text-slate-600 border'
                }`}
              >
                🍔 Añadir Plato (Ficha 2)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {tipoRegistro === 'especial1' ? (
            // FORMULARIO COMPLETO FICHA 1: INMUEBLES
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">🏢 Selecciona la Inmobiliaria de destino *</label>
                <select
                  required
                  value={formInmobiliariaItem.negocio_id}
                  onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, negocio_id: e.target.value})}
                  className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="">-- Elige un negocio inmobiliario --</option>
                  {comercios.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Título del Inmueble *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Piso luminoso en zona Centro"
                    value={formInmobiliariaItem.titulo}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, titulo: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📍 Subtítulo / Zona</label>
                  <input
                    type="text"
                    placeholder="Ej. Zona San José / Av. de España"
                    value={formInmobiliariaItem.subtitulo_zona}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, subtitulo_zona: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📂 Modalidad</label>
                  <select
                    value={formInmobiliariaItem.modalidad}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, modalidad: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Traspaso">Traspaso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💰 Precio (€) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 135000"
                    value={formInmobiliariaItem.precio}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, precio: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🔖 Referencia Interna</label>
                  <input
                    type="text"
                    placeholder="Ej. REF-1042"
                    value={formInmobiliariaItem.referencia_interna}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, referencia_interna: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🛏️ Habitaciones</label>
                  <input
                    type="number"
                    placeholder="Ej. 3"
                    value={formInmobiliariaItem.habitaciones}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, habitaciones: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🚿 Baños</label>
                  <input
                    type="number"
                    placeholder="Ej. 2"
                    value={formInmobiliariaItem.banos}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, banos: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📐 Metros Cuadrados (m²)</label>
                  <input
                    type="number"
                    placeholder="Ej. 110"
                    value={formInmobiliariaItem.metros_cuadrados}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, metros_cuadrados: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏢 Planta</label>
                  <input
                    type="text"
                    placeholder="Ej. 2ª Planta con ascensor"
                    value={formInmobiliariaItem.planta}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, planta: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">⭐ Etiqueta Destacado</label>
                  <input
                    type="text"
                    placeholder="Ej. Novedad / Oportunidad"
                    value={formInmobiliariaItem.etiqueta_destacado}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, etiqueta_destacado: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="garaje"
                    checked={formInmobiliariaItem.garaje}
                    onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, garaje: e.target.checked})}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="garaje" className="text-xs font-bold text-amber-900 cursor-pointer">
                    🚗 Incluye Garaje
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de la Propiedad</label>
                  {formInmobiliariaItem.imagen && (
                    <img src={formInmobiliariaItem.imagen} alt="Inmueble" className="w-full h-32 object-cover rounded-xl mb-2 border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'imagen', false, 'inmobiliaria')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción Completa</label>
                <textarea
                  rows="3"
                  placeholder="Detalla calidades, orientación, extras..."
                  value={formInmobiliariaItem.descripcion}
                  onChange={(e) => setFormInmobiliariaItem({...formInmobiliariaItem, descripcion: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

          ) : tipoRegistro === 'especial2' ? (
            // FORMULARIO COMPLETO FICHA 2: COMIDA / PLATOS
            <div className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                <label className="block text-xs font-bold text-rose-900 mb-1">🍔 Selecciona el Restaurante / Bar de destino *</label>
                <select
                  required
                  value={formComidaItem.negocio_id}
                  onChange={(e) => setFormComidaItem({...formComidaItem, negocio_id: e.target.value})}
                  className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="">-- Elige un establecimiento de hostelería --</option>
                  {comercios.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📂 Categoría del Plato *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Entrantes, Pizzas, Bebidas, Postres"
                    value={formComidaItem.categoria}
                    onChange={(e) => setFormComidaItem({...formComidaItem, categoria: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🍽️ Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hamburguesa Smash Utrerapp"
                    value={formComidaItem.nombre_producto}
                    onChange={(e) => setFormComidaItem({...formComidaItem, nombre_producto: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💰 Precio (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 8.50"
                    value={formComidaItem.precio}
                    onChange={(e) => setFormComidaItem({...formComidaItem, precio: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Etiquetas (Separadas por comas)</label>
                  <input
                    type="text"
                    placeholder="Ej. Top ventas, Picante, Sin Gluten"
                    value={formComidaItem.etiquetas}
                    onChange={(e) => setFormComidaItem({...formComidaItem, etiquetas: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto del Plato</label>
                  {formComidaItem.imagen_producto && (
                    <img src={formComidaItem.imagen_producto} alt="Plato" className="w-full h-28 object-cover rounded-xl mb-1 border" />
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
                  value={formComidaItem.descripcion_ingredientes}
                  onChange={(e) => setFormComidaItem({...formComidaItem, descripcion_ingredientes: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">⚙️ Opciones personalizables / Extras</label>
                <input
                  type="text"
                  placeholder="Ej. Elegir punto de la carne, salsas, etc."
                  value={formComidaItem.opciones_personalizables}
                  onChange={(e) => setFormComidaItem({...formComidaItem, opciones_personalizables: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formComidaItem.disponible}
                  onChange={(e) => setFormComidaItem({...formComidaItem, disponible: e.target.checked})}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="disponible" className="text-xs font-bold text-rose-900 cursor-pointer">
                  🟢 Disponible en Carta (Activo para pedidos)
                </label>
              </div>
            </div>

          ) : (
            // FORMULARIO NEGOCIO BASE (ESTÁNDAR / VIP)
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Negocio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bar Alonsi / Inmobiliaria Utrera"
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
                    <option value="Inmobiliarias">Inmobiliarias</option>
                    <option value="Salud y Belleza">Salud y Belleza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Tapas / Pisos en Venta"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ej. 34600000000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📞 Teléfono</label>
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

              {/* CONFIGURACIÓN ESPECÍFICA SI ES HOSTELERÍA (FICHA 2) */}
              {formData.categoria === 'Hostelería' && (
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-4">
                  <h3 className="text-xs font-black uppercase text-rose-900">🍔 Ajustes de Pedidos (Ficha 2)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-rose-900 mb-1">🕒 Horario de Pedidos</label>
                      <input
                        type="text"
                        placeholder="Ej. 13:00 - 16:00 y 20:00 - 23:30"
                        value={formData.horario_pedidos}
                        onChange={(e) => setFormData({...formData, horario_pedidos: e.target.value})}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-rose-900 mb-1">📱 WhatsApp Recepción Comanda</label>
                      <input
                        type="text"
                        placeholder="Ej. 34600000000"
                        value={formData.whatsapp_recepcion_pedidos}
                        onChange={(e) => setFormData({...formData, whatsapp_recepcion_pedidos: e.target.value})}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-rose-900 mb-1">💰 Pedido Mínimo (€)</label>
                      <input
                        type="number"
                        placeholder="12"
                        value={formData.pedido_minimo}
                        onChange={(e) => setFormData({...formData, pedido_minimo: e.target.value})}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-rose-900 mb-1">🛵 Coste de Envío (€)</label>
                      <input
                        type="number"
                        placeholder="2"
                        value={formData.coste_envio}
                        onChange={(e) => setFormData({...formData, coste_envio: e.target.value})}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CONFIGURACIÓN ESPECÍFICA SI ES INMOBILIARIA (FICHA 1) */}
              {formData.categoria === 'Inmobiliarias' && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-4">
                  <h3 className="text-xs font-black uppercase text-amber-900">🏢 Ajustes de Cabecera y Carrusel (Ficha 1)</h3>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">🏷️ Título de la Sección del Catálogo</label>
                    <input
                      type="text"
                      placeholder="Ej. Inmuebles destacados"
                      value={formData.titulo_seccion_catalogo}
                      onChange={(e) => setFormData({...formData, titulo_seccion_catalogo: e.target.value})}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">🖼️ URLs para el Carrusel Superior (Separadas por comas)</label>
                    <textarea
                      rows="2"
                      placeholder="https://img1.com/foto1.jpg, https://img2.com/foto2.jpg"
                      value={formData.banners_destacados_texto}
                      onChange={(e) => setFormData({...formData, banners_destacados_texto: e.target.value})}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">✨ Texto del Botón de Captación</label>
                      <input
                        type="text"
                        placeholder="Ej. Solicitar valoración gratuita"
                        value={formData.texto_boton_captacion}
                        onChange={(e) => setFormData({...formData, texto_boton_captacion: e.target.value})}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="mostrar_boton"
                        checked={formData.mostrar_boton_captacion}
                        onChange={(e) => setFormData({...formData, mostrar_boton_captacion: e.target.checked})}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                      <label htmlFor="mostrar_boton" className="text-xs font-bold text-amber-900 cursor-pointer">
                        Mostrar Botón de Captación
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Negocio</label>
                  <textarea
                    rows="3"
                    placeholder="Escribe un resumen atractivo..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando || subiendo}
            className={`w-full font-bold text-sm py-4 rounded-2xl shadow-lg transition cursor-pointer text-white ${
              tipoRegistro === 'especial1' ? 'bg-amber-600 hover:bg-amber-700' : tipoRegistro === 'especial2' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {guardando ? 'Guardando en Supabase...' : tipoRegistro === 'especial1' ? '🏢 Guardar Inmueble en el Catálogo' : tipoRegistro === 'especial2' ? '🍔 Guardar Plato en la Carta' : '🚀 Registrar Negocio Base'}
          </button>
        </form>
      </div>

      {/* Lista de Negocios Registrados */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-slate-800 border-b pb-3">
          🏬 Negocios Registrados ({comercios.length})
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
                    {c.categoria === 'Inmobiliarias' && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full">Inmobiliaria VIP</span>}
                    {c.categoria === 'Hostelería' && c.horario_pedidos && <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded-full">Comida VIP</span>}
                  </h3>
                  <p className="text-[11px] text-slate-500">{c.categoria} {c.subcategoria ? `• ${c.subcategoria}` : ''}</p>
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