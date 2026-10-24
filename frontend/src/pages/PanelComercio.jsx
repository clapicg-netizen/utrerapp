// src/pages/PanelComercio.jsx
import React, { useState, useEffect } from 'react';
import { obtenerComercios, actualizarComercio, crearComercio, subirArchivoComercio } from '../lib/comerciosService';

// PIN de control absoluto para ti como dueño de Utrerapp
const PIN_ADMIN_MAESTRO = "9999"; 

export default function PanelComercio() {
  const [comercios, setComercios] = useState([]);
  const [modoAlta, setModoAlta] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [comercioSel, setComercioSel] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // Formulario
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
    oferta_flash: '',
    video_story_url: '',
    pin_acceso: '1234'
  });

  useEffect(() => {
    async function cargar() {
      const data = await obtenerComercios("Todos");
      setComercios(data || []);
    }
    cargar();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    // 1. Acceso Administrador JuanRa (PIN Maestro)
    if (pinInput === PIN_ADMIN_MAESTRO) {
      setEsAdmin(true);
      if (comercioSel) {
        setAutenticado(true);
        cargarDatosComercio(comercioSel);
      } else {
        setModoAlta(true);
      }
      return;
    }

    // 2. Acceso Comerciante
    if (!comercioSel) {
      setMensaje({ tipo: 'error', texto: 'Selecciona tu negocio para acceder' });
      return;
    }

    if (pinInput === (comercioSel.pin_acceso || '1234')) {
      setAutenticado(true);
      cargarDatosComercio(comercioSel);
    } else {
      setMensaje({ tipo: 'error', texto: 'PIN incorrecto' });
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
      portada_url: c.portada_url && c.portada_url !== "EMPTY" ? c.portada_url : '',
      logo_url: c.logo_url && c.logo_url !== "EMPTY" ? c.logo_url : '',
      carta_pdf_url: c.carta_pdf_url && c.carta_pdf_url !== "EMPTY" ? c.carta_pdf_url : '',
      galeria_urls: Array.isArray(c.galeria_urls) ? c.galeria_urls : [],
      oferta_flash: c.oferta_flash || '',
      video_story_url: c.video_story_url && c.video_story_url !== "EMPTY" ? c.video_story_url : '',
      pin_acceso: c.pin_acceso || '1234'
    });
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
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido correctamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }
  };

  const eliminarDeGaleria = (index) => {
    setFormData((prev) => ({
      ...prev,
      galeria_urls: prev.galeria_urls.filter((_, i) => i !== index)
    }));
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
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    const datosLimpios = limpiarDatosParaEnviar(formData);

    if (modoAlta) {
      if (!datosLimpios.nombre || !datosLimpios.categoria) {
        setMensaje({ tipo: 'error', texto: 'Indica el nombre y la categoría' });
        setGuardando(false);
        return;
      }
      const res = await crearComercio(datosLimpios);
      setGuardando(false);
      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Comercio dado de alta correctamente!' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    } else {
      const pinUsado = pinInput === PIN_ADMIN_MAESTRO ? comercioSel.pin_acceso : pinInput;
      const res = await actualizarComercio(comercioSel.id, pinUsado, datosLimpios);
      setGuardando(false);

      if (res.success) {
        setMensaje({ tipo: 'exito', texto: '¡Cambios guardados con éxito!' });
      } else {
        setMensaje({ tipo: 'error', texto: res.message });
      }
    }
  };

  if (!autenticado && !modoAlta) {
    return (
      <div className="max-w-md mx-auto p-6 pt-8">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-xl font-black text-slate-900 mt-2">Acceso Comercios</h1>
            <p className="text-xs text-slate-500 mt-1">Gestiona tu negocio en Utrerapp</p>
          </div>

          {mensaje.texto && (
            <div className={`p-3 rounded-2xl text-xs font-bold mb-4 text-center ${
              mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selecciona tu comercio:</label>
              <select
                onChange={(e) => setComercios(comercios.find(c => c.id === e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                <option value="">-- Seleccionar Comercio --</option>
                {comercios.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN de acceso:</label>
              <input
                type="password"
                placeholder="****"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-md"
            >
              Entrar al Panel
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 mt-6">
            Para altas de nuevos negocios contacta con la administración de Utrerapp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase">
            {modoAlta ? "Alta de Comercio (Admin)" : "Modificando"}
          </span>
          <h1 className="text-lg font-black text-slate-900">
            {modoAlta ? "Nuevo Negocio" : comercioSel?.nombre}
          </h1>
        </div>
        <button
          onClick={() => {
            setAutenticado(false);
            setModoAlta(false);
            setEsAdmin(false);
          }}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl"
        >
          Salir
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-2xl text-xs font-bold mb-4 text-center ${
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-md">
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">🏷️ Nombre del Comercio:</label>
          <input
            type="text"
            placeholder="Ej. Cafetería La Plaza"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            required={modoAlta}
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
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dirección:</label>
            <input
              type="text"
              placeholder="Calle..."
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada (Cámara o Archivo):</label>
          {formData.portada_url && (
            <img src={formData.portada_url} alt="Portada" className="w-full h-32 object-cover rounded-2xl mb-2 border" />
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
          <label className="block text-xs font-bold text-slate-700 mb-1">🖼️ Galería (Añade varias fotos):</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {formData.galeria_urls.map((url, idx) => (
              <div key={idx} className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border">
                <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => eliminarDeGaleria(idx)}
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
              placeholder="1234"
              value={formData.pin_acceso}
              onChange={(e) => setFormData({...formData, pin_acceso: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl transition shadow-md mt-4"
        >
          {guardando ? 'Guardando...' : modoAlta ? '🚀 Dar de Alta Comercio' : '💾 Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}