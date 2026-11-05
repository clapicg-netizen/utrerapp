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

  // 'normal' (Comercio Estándar), 'especial1' (Inmobiliaria), 'especial2' (Comida / Delivery)
  const [tipoRegistro, setTipoRegistro] = useState('normal');

  // 1. Formulario Comercio Estándar (Normal - Completo con redes, galería, pdf y video)
  const formComercioNormalInicial = {
    nombre: '',
    categoria: 'Comercio',
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

  // 2. Formulario Ficha 1: Inmobiliaria (Especial 1) - INTACTO
  const formInmobiliariaInicial = {
    nombre: '',
    categoria: 'Inmobiliarias',
    subcategoria: 'Inmobiliaria VIP',
    tipo_ficha: 'especial1',
    direccion: '',
    telefono: '',
    whatsapp: '',
    instagram_username: '',
    horario_texto: '',
    descripcion: '',
    portada_url: '',
    pin_acceso: '1234',
    titulo_seccion_catalogo: 'Inmuebles destacados',
    banners_destacados_texto: '',
    mostrar_boton_captacion: true,
    texto_boton_captacion: 'Solicitar valoración gratuita'
  };

  // 3. Formulario Ficha 2: Comida / Pedidos (Especial 2) - INTACTO
  const formComidaInicial = {
    nombre: '',
    categoria: 'Hostelería',
    subcategoria: 'Comida a domicilio',
    tipo_ficha: 'especial2',
    direccion: '',
    telefono: '',
    whatsapp: '',
    horario_texto: '',
    descripcion: '',
    portada_url: '',
    pin_acceso: '1234',
    horario_pedidos: '13:00 - 16:00 y 20:00 - 23:30',
    pedido_minimo: 12,
    coste_envio: 2,
    whatsapp_recepcion_pedidos: ''
  };

  const [formNormal, setFormNormal] = useState(formComercioNormalInicial);
  const [formEspecial1, setFormEspecial1] = useState(formInmobiliariaInicial);
  const [formEspecial2, setFormEspecial2] = useState(formComidaInicial);

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

  const handleFileUpload = async (e, campo, esGaleria = false, formularioDestino = 'normal') => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setMensaje({ tipo: 'exito', texto: 'Subiendo archivo a Supabase Storage...' });

    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      if (formularioDestino === 'normal') {
        if (esGaleria) {
          setFormNormal(prev => ({ ...prev, galeria_urls: [...prev.galeria_urls, res.url] }));
        } else {
          setFormNormal(prev => ({ ...prev, [campo]: res.url }));
        }
      } else if (formularioDestino === 'especial1') {
        setFormEspecial1(prev => ({ ...prev, [campo]: res.url }));
      } else if (formularioDestino === 'especial2') {
        setFormEspecial2(prev => ({ ...prev, [campo]: res.url }));
      }
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  const handleEliminarImagenGaleria = (index) => {
    setFormNormal(prev => ({
      ...prev,
      galeria_urls: prev.galeria_urls.filter((_, i) => i !== index)
    }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      let datosAEnviar = {};

      if (tipoRegistro === 'normal') {
        datosAEnviar = { ...formNormal, tipo_ficha: 'normal' };
      } else if (tipoRegistro === 'especial1') {
        let bannersArray = [];
        if (formEspecial1.banners_destacados_texto) {
          bannersArray = formEspecial1.banners_destacados_texto.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        }
        datosAEnviar = {
          ...formEspecial1,
          tipo_ficha: 'especial1',
          banners_destacados: bannersArray
        };
        delete datosAEnviar.banners_destacados_texto;
      } else if (tipoRegistro === 'especial2') {
        datosAEnviar = { ...formEspecial2, tipo_ficha: 'especial2' };
      }

      if (editandoId) {
        const res = await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datosAEnviar);
        setGuardando(false);
        if (res.success) {
          setMensaje({ tipo: 'exito', texto: '¡Registro actualizado con éxito!' });
          setEditandoId(null);
          setFormNormal(formComercioNormalInicial);
          cargarLista();
        } else {
          setMensaje({ tipo: 'error', texto: res.message });
        }
      } else {
        const res = await crearComercio(datosAEnviar);
        setGuardando(false);
        if (res.success) {
          setMensaje({ tipo: 'exito', texto: '¡Nuevo registro creado con éxito!' });
          setFormNormal(formComercioNormalInicial);
          setFormEspecial1(formInmobiliariaInicial);
          setFormEspecial2(formComidaInicial);
          cargarLista();
        } else {
          setMensaje({ tipo: 'error', texto: res.message });
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
    const tipo = c.tipo_ficha || 'normal';
    setTipoRegistro(tipo);

    if (tipo === 'especial1') {
      setFormEspecial1({
        nombre: c.nombre || '',
        categoria: c.categoria || 'Inmobiliarias',
        subcategoria: c.subcategoria || '',
        tipo_ficha: 'especial1',
        direccion: c.direccion || '',
        telefono: c.telefono || '',
        whatsapp: c.whatsapp || '',
        instagram_username: c.instagram_username || '',
        horario_texto: c.horario_texto || '',
        descripcion: c.descripcion || '',
        portada_url: c.portada_url || '',
        pin_acceso: c.pin_acceso || '1234',
        titulo_seccion_catalogo: c.titulo_seccion_catalogo || 'Inmuebles destacados',
        banners_destacados_texto: c.banners_destacados ? c.banners_destacados.join(', ') : '',
        mostrar_boton_captacion: c.mostrar_boton_captacion ?? true,
        texto_boton_captacion: c.texto_boton_captacion || 'Solicitar valoración gratuita'
      });
    } else if (tipo === 'especial2') {
      setFormEspecial2({
        nombre: c.nombre || '',
        categoria: c.categoria || 'Hostelería',
        subcategoria: c.subcategoria || '',
        tipo_ficha: 'especial2',
        direccion: c.direccion || '',
        telefono: c.telefono || '',
        whatsapp: c.whatsapp || '',
        horario_texto: c.horario_texto || '',
        descripcion: c.descripcion || '',
        portada_url: c.portada_url || '',
        pin_acceso: c.pin_acceso || '1234',
        horario_pedidos: c.horario_pedidos || '',
        pedido_minimo: c.pedido_minimo || 12,
        coste_envio: c.coste_envio || 2,
        whatsapp_recepcion_pedidos: c.whatsapp_recepcion_pedidos || ''
      });
    } else {
      setFormNormal({
        nombre: c.nombre || '',
        categoria: c.categoria || 'Comercio',
        subcategoria: c.subcategoria || '',
        tipo_ficha: 'normal',
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
    }
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
          <p className="text-xs text-slate-500 mt-1 mb-6">Gestión independiente para JuanRa</p>

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

      {/* Selector de Pestañas Independientes */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-black text-slate-800">
            {editandoId ? `✏️ Editando Registro` : "➕ Crear Nuevo Registro en Utrerapp"}
          </h2>
          {editandoId && (
            <button
              onClick={() => {
                setEditandoId(null);
                setFormNormal(formComercioNormalInicial);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-slate-600 cursor-pointer"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        {!editandoId && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">Selecciona el tipo de ficha independiente:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipoRegistro('normal')}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  tipoRegistro === 'normal' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border'
                }`}
              >
                🏪 Comercio Estándar (Normal)
              </button>
              <button
                type="button"
                onClick={() => setTipoRegistro('especial1')}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  tipoRegistro === 'especial1' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-slate-600 border'
                }`}
              >
                🏢 Ficha 1: Inmobiliaria (Especial 1)
              </button>
              <button
                type="button"
                onClick={() => setTipoRegistro('especial2')}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  tipoRegistro === 'especial2' ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-slate-600 border'
                }`}
              >
                🍔 Ficha 2: Comida / Pedidos (Especial 2)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {/* ========================================================= */}
          {/* 1. FORMULARIO COMERCIO ESTÁNDAR (NORMAL - COMPLETO)       */}
          {/* ========================================================= */}
          {tipoRegistro === 'normal' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-3 rounded-xl text-xs font-bold text-blue-900 border border-blue-200">
                🏪 Formulario completo para comercios, tiendas, bares tradicionales y servicios.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Comercio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tienda de Moda Utrera"
                    value={formNormal.nombre}
                    onChange={(e) => setFormNormal({...formNormal, nombre: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📂 Categoría *</label>
                  <select
                    value={formNormal.categoria}
                    onChange={(e) => setFormNormal({...formNormal, categoria: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Comercio">Comercio</option>
                    <option value="Hostelería">Hostelería (Bar / Tapa)</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Salud y Belleza">Salud y Belleza</option>
                    <option value="Formación">Formación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Oposiciones / Clases"
                    value={formNormal.subcategoria}
                    onChange={(e) => setFormNormal({...formNormal, subcategoria: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección en Utrera</label>
                  <input
                    type="text"
                    placeholder="Ej. Calle Ancha, 15"
                    value={formNormal.direccion}
                    onChange={(e) => setFormNormal({...formNormal, direccion: e.target.value})}
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
                    value={formNormal.whatsapp}
                    onChange={(e) => setFormNormal({...formNormal, whatsapp: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📞 Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 954860000"
                    value={formNormal.telefono}
                    onChange={(e) => setFormNormal({...formNormal, telefono: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Instagram Usuario</label>
                  <input
                    type="text"
                    placeholder="Ej. @tucomercio"
                    value={formNormal.instagram_username}
                    onChange={(e) => setFormNormal({...formNormal, instagram_username: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🕒 Horario</label>
                  <input
                    type="text"
                    placeholder="Ej. Lunes a Sábado: 9:00 - 14:00"
                    value={formNormal.horario_texto}
                    onChange={(e) => setFormNormal({...formNormal, horario_texto: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">⚡ Oferta Flash / Anuncio</label>
                  <input
                    type="text"
                    placeholder="Ej. 10% de descuento este mes"
                    value={formNormal.oferta_flash}
                    onChange={(e) => setFormNormal({...formNormal, oferta_flash: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Archivos y Multimedia */}
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada</label>
                    {formNormal.portada_url && (
                      <img src={formNormal.portada_url} alt="Portada" className="w-full h-28 object-cover rounded-xl mb-1 border" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'portada_url', false, 'normal')}
                      disabled={subiendo}
                      className="w-full text-xs text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Logotipo</label>
                    {formNormal.logo_url && (
                      <img src={formNormal.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-xl mb-1 border" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo_url', false, 'normal')}
                      disabled={subiendo}
                      className="w-full text-xs text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">📄 Carta / PDF adjunto</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, 'carta_pdf_url', false, 'normal')}
                      disabled={subiendo}
                      className="w-full text-xs text-slate-500"
                    />
                    {formNormal.carta_pdf_url && (
                      <a href={formNormal.carta_pdf_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline mt-1 block">Ver PDF actual</a>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">🎬 Vídeo / Story URL (YouTube / MP4)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formNormal.video_story_url}
                      onChange={(e) => setFormNormal({...formNormal, video_story_url: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Galería de Imágenes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería de Imágenes del Comercio</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {formNormal.galeria_urls.map((img, idx) => (
                      <div key={idx} className="relative group h-20 bg-slate-100 rounded-xl overflow-hidden border">
                        <img src={img} alt={`Gal ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleEliminarImagenGaleria(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'galeria_urls', true, 'normal')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Negocio</label>
                  <textarea
                    rows="3"
                    placeholder="Escribe un resumen atractivo..."
                    value={formNormal.descripcion}
                    onChange={(e) => setFormNormal({...formNormal, descripcion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. FORMULARIO FICHA 1: INMOBILIARIA (ESPECIAL 1)           */}
          {/* ========================================================= */}
          {tipoRegistro === 'especial1' && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-3 rounded-xl text-xs font-bold text-amber-900 border border-amber-200">
                🏢 Ficha Especial 1: Configuración de la agencia inmobiliaria, carrusel superior y botón de captación.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre de la Inmobiliaria *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Inmobiliaria Centro Utrera"
                    value={formEspecial1.nombre}
                    onChange={(e) => setFormEspecial1({...formEspecial1, nombre: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección en Utrera</label>
                  <input
                    type="text"
                    placeholder="Ej. Avda. San Juan Bosco, 1"
                    value={formEspecial1.direccion}
                    onChange={(e) => setFormEspecial1({...formEspecial1, direccion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ej. 34686944934"
                    value={formEspecial1.whatsapp}
                    onChange={(e) => setFormEspecial1({...formEspecial1, whatsapp: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📞 Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 686944934"
                    value={formEspecial1.telefono}
                    onChange={(e) => setFormEspecial1({...formEspecial1, telefono: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 space-y-4">
                <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider">🏢 AJUSTES DE CABECERA Y CARRUSEL (FICHA 1)</h3>
                
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">🏷️ Título de la Sección del Catálogo</label>
                  <input
                    type="text"
                    placeholder="Ej. Inmuebles destacados"
                    value={formEspecial1.titulo_seccion_catalogo}
                    onChange={(e) => setFormEspecial1({...formEspecial1, titulo_seccion_catalogo: e.target.value})}
                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">🖼️ URLs para el Carrusel Superior (Separadas por comas)</label>
                  <textarea
                    rows="2"
                    placeholder="https://img1.com/foto1.jpg, https://img2.com/foto2.jpg"
                    value={formEspecial1.banners_destacados_texto}
                    onChange={(e) => setFormEspecial1({...formEspecial1, banners_destacados_texto: e.target.value})}
                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">✨ Texto del Botón de Captación</label>
                    <input
                      type="text"
                      placeholder="Ej. Solicitar valoración gratuita"
                      value={formEspecial1.texto_boton_captacion}
                      onChange={(e) => setFormEspecial1({...formEspecial1, texto_boton_captacion: e.target.value})}
                      className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="mostrar_boton_cap"
                      checked={formEspecial1.mostrar_boton_captacion}
                      onChange={(e) => setFormEspecial1({...formEspecial1, mostrar_boton_captacion: e.target.checked})}
                      className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                    />
                    <label htmlFor="mostrar_boton_cap" className="text-xs font-bold text-amber-900 cursor-pointer">
                      Mostrar Botón de Captación
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada</label>
                  {formEspecial1.portada_url && (
                    <img src={formEspecial1.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'portada_url', false, 'especial1')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción de la Agencia</label>
                  <textarea
                    rows="3"
                    placeholder="Quienes somos, años de experiencia..."
                    value={formEspecial1.descripcion}
                    onChange={(e) => setFormEspecial1({...formEspecial1, descripcion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. FORMULARIO FICHA 2: COMIDA / PEDIDOS (ESPECIAL 2)       */}
          {/* ========================================================= */}
          {tipoRegistro === 'especial2' && (
            <div className="space-y-6">
              <div className="bg-rose-50 p-3 rounded-xl text-xs font-bold text-rose-900 border border-rose-200">
                🍔 Ficha Especial 2: Configuración del restaurante, horarios de pedidos y recepción de comandas por WhatsApp.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Restaurante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pizzería Nonna Utrera"
                    value={formEspecial2.nombre}
                    onChange={(e) => setFormEspecial2({...formEspecial2, nombre: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📍 Dirección en Utrera</label>
                  <input
                    type="text"
                    placeholder="Ej. Plaza del Altozano, 4"
                    value={formEspecial2.direccion}
                    onChange={(e) => setFormEspecial2({...formEspecial2, direccion: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">💬 WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ej. 34600000000"
                    value={formEspecial2.whatsapp}
                    onChange={(e) => setFormEspecial2({...formEspecial2, whatsapp: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📱 WhatsApp Recepción Comanda *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 34600000000"
                    value={formEspecial2.whatsapp_recepcion_pedidos}
                    onChange={(e) => setFormEspecial2({...formEspecial2, whatsapp_recepcion_pedidos: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 space-y-4">
                <h3 className="text-xs font-black uppercase text-rose-900 tracking-wider">🍔 AJUSTES GENERALES DE PEDIDOS (FICHA 2)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">🕒 Horario de Pedidos</label>
                    <input
                      type="text"
                      placeholder="Ej. 13:00 - 23:30"
                      value={formEspecial2.horario_pedidos}
                      onChange={(e) => setFormEspecial2({...formEspecial2, horario_pedidos: e.target.value})}
                      className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">💰 Pedido Mínimo (€)</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={formEspecial2.pedido_minimo}
                      onChange={(e) => setFormEspecial2({...formEspecial2, pedido_minimo: e.target.value})}
                      className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">🛵 Coste de Envío (€)</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={formEspecial2.coste_envio}
                      onChange={(e) => setFormEspecial2({...formEspecial2, coste_envio: e.target.value})}
                      className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada</label>
                  {formEspecial2.portada_url && (
                    <img src={formEspecial2.portada_url} alt="Portada" className="w-full h-36 object-cover rounded-2xl mb-2 border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'portada_url', false, 'especial2')}
                    disabled={subiendo}
                    className="w-full text-xs text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 Descripción del Local</label>
                  <textarea
                    rows="3"
                    placeholder="Especialidad en pizzas artesanales..."
                    value={formEspecial2.descripcion}
                    onChange={(e) => setFormEspecial2({...formEspecial2, descripcion: e.target.value})}
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
            {guardando ? 'Guardando en Supabase...' : tipoRegistro === 'especial1' ? '🏢 Guardar Ficha 1 (Inmobiliaria)' : tipoRegistro === 'especial2' ? '🍔 Guardar Ficha 2 (Comida)' : '🚀 Guardar Comercio Estándar'}
          </button>
        </form>
      </div>

      {/* Lista de Registros */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-slate-800 border-b pb-3">
          🏬 Registros en Utrerapp ({comercios.length})
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
                    {c.tipo_ficha === 'especial1' && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full">Ficha 1 (Inmobiliaria)</span>}
                    {c.tipo_ficha === 'especial2' && <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded-full">Ficha 2 (Comida)</span>}
                    {(!c.tipo_ficha || c.tipo_ficha === 'normal') && <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-full">Estándar</span>}
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