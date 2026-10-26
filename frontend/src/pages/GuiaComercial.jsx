// src/pages/GuiaComercial.jsx
import React, { useState, useEffect } from "react";
import { Phone, Navigation, Globe, Search, MapPin, ExternalLink, Image, FileText, Video, Zap, Sparkles, ShoppingBag, Utensils, Clock, CreditCard, Bike, Plus, Minus, ShoppingCart, ShieldCheck } from "lucide-react";
import { obtenerComercios, actualizarComercio, crearComercio, subirArchivoComercio } from "../lib/comerciosService";

const PIN_ADMIN_MAESTRO = "9999";

export default function GuiaComercial() {
  const [comercios, setComercios] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("Todos");
  const [comercioSel, setComercioSel] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados para el panel de administración/edición del comercio
  const [modoAdmin, setModoAdmin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [autenticadoAdmin, setAutenticadoAdmin] = useState(false);
  const [esAdminMaestro, setEsAdminMaestro] = useState(false);
  const [mensajeAdmin, setMensajeAdmin] = useState({ tipo: "", texto: "" });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // Formulario de edición/creación con Redes Sociales y Galería
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "Hostelería",
    subcategoria: "",
    direccion: "",
    descripcion: "",
    horario_texto: "",
    telefono: "",
    whatsapp: "",
    portada_url: "",
    logo_url: "",
    carta_pdf_url: "",
    galeria_urls: [],
    instagram_url: "",
    tiktok_url: "",
    facebook_url: "",
    web_url: "",
    tienda_url: "",
    oferta_flash: "",
    video_story_url: "",
    pin_acceso: "1234",
    destacado: false
  });

  // Estados para el Carrito
  const [carrito, setCarrito] = useState({});
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);

  const categorias = ["Todos", "Hostelería", "Comercio", "Servicios", "Salud y Belleza"];

  // Leer si viene un parámetro en la URL al cargar (ej. ?cat=hosteleria)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catUrl = params.get('cat');
    if (catUrl) {
      // Si la URL pide hostelería, ajustamos la categoría seleccionada
      if (catUrl.toLowerCase() === 'hosteleria') {
        setCategoriaSel('Hostelería');
      }
    }
    cargarComercios();
  }, []);

  const cargarComercios = async () => {
    setCargando(true);
    try {
      const data = await obtenerComercios("Todos");
      setComercios(data || []);
    } catch (error) {
      console.error("Error al cargar los comercios:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const comerciosCarrusel = comercios.length > 0 ? comercios : [];

  useEffect(() => {
    if (comerciosCarrusel.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceCarrusel((prev) => (prev + 1) % comerciosCarrusel.length);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [comerciosCarrusel.length]);

  const normalizar = (texto) =>
    (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const comerciosFiltrados = comercios.filter((c) => {
    const coincideCategoria =
      categoriaSel === "Todos" ||
      normalizar(c.categoria) === normalizar(categoriaSel) ||
      (c.subcategoria && normalizar(c.subcategoria).includes(normalizar(categoriaSel)));

    const coincideBusqueda =
      !busqueda.trim() ||
      normalizar(c.nombre).includes(normalizar(busqueda)) ||
      normalizar(c.descripcion).includes(normalizar(busqueda)) ||
      (c.subcategoria && normalizar(c.subcategoria).includes(normalizar(busqueda)));

    return coincideCategoria && coincideBusqueda;
  });

  const abrirMapa = (comercio) => {
    const direccionEscapada = encodeURIComponent((comercio.direccion || comercio.nombre) + ", Utrera");
    window.open("https://www.google.com/maps/search/?api=1&query=" + direccionEscapada, "_blank");
  };

  const obtenerPortadaValida = (url) => {
    if (url && typeof url === 'string' && url.trim() !== "" && url !== "EMPTY" && url !== "NULL") {
      return url.trim();
    }
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";
  };

  // Gestión de subida de archivos (imágenes/galería)
  const handleFileUpload = async (e, campo, esGaleria = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    const res = await subirArchivoComercio(file);
    setSubiendo(false);

    if (res.success) {
      if (esGaleria) {
        setFormData(prev => ({
          ...prev,
          galeria_urls: [...(prev.galeria_urls || []), res.url]
        }));
      } else {
        setFormData(prev => ({ ...prev, [campo]: res.url }));
      }
      setMensajeAdmin({ tipo: 'exito', texto: '¡Archivo subido con éxito!' });
    } else {
      setMensajeAdmin({ tipo: 'error', texto: res.message });
    }
  };

  const eliminarDeGaleria = (index) => {
    setFormData(prev => ({
      ...prev,
      galeria_urls: prev.galeria_urls.filter((_, i) => i !== index)
    }));
  };

  const prepararEdicionComercio = (c) => {
    setComercios(comercios);
    setComercioSel(c);
    setFormData({
      nombre: c.nombre || "",
      categoria: c.categoria || "Hostelería",
      subcategoria: c.subcategoria || "",
      direccion: c.direccion || "",
      descripcion: c.descripcion || "",
      horario_texto: c.horario_texto || "",
      telefono: c.telefono || "",
      whatsapp: c.whatsapp || "",
      portada_url: c.portada_url || "",
      logo_url: c.logo_url || "",
      carta_pdf_url: c.carta_pdf_url || "",
      galeria_urls: Array.isArray(c.galeria_urls) ? c.galeria_urls : [],
      instagram_url: c.instagram_url || c.instagram_username || "",
      tiktok_url: c.tiktok_url || "",
      facebook_url: c.facebook_url || "",
      web_url: c.web_url || "",
      tienda_url: c.tienda_url || "",
      oferta_flash: c.oferta_flash || "",
      video_story_url: c.video_story_url || "",
      pin_acceso: c.pin_acceso || "1234",
      destacado: c.destacado || false
    });
    setModoAdmin(true);
    setAutenticadoAdmin(false);
    setPinInput("");
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    if (pinInput === PIN_ADMIN_MAESTRO || pinInput === (comercioSel?.pin_acceso || "1234")) {
      setAutenticadoAdmin(true);
      setEsAdminMaestro(pinInput === PIN_ADMIN_MAESTRO);
      setMensajeAdmin({ tipo: "", texto: "" });
    } else {
      setMensajeAdmin({ tipo: "error", texto: "PIN incorrecto" });
    }
  };

  const guardarCambiosComercio = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const res = await actualizarComercio(comercioSel.id, PIN_ADMIN_MAESTRO, formData);
    setGuardando(false);

    if (res.success) {
      setMensajeAdmin({ tipo: "exito", texto: "¡Cambios guardados correctamente!" });
      await cargarComercios();
      setTimeout(() => {
        setModoAdmin(false);
        setComercioSel(null);
      }, 1000);
    } else {
      setMensajeAdmin({ tipo: "error", texto: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* CABECERA HERO PREMIUM */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 text-white p-6 shadow-xl relative overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl"></div>
        <div className="max-w-md mx-auto relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Directorio Oficial
            </span>
            <span className="text-xs text-rose-200 font-medium">Utrera 2026</span>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight">Guía Comercial Utrera</h1>
          <p className="text-xs text-rose-100 leading-relaxed">
            Descubre el corazón comercial, bares y servicios de nuestra tierra en un solo lugar.
          </p>

          <div className="relative pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Busca un bar, tienda, servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder-rose-200/70 pl-10 pr-4 py-3 rounded-2xl text-xs border border-white/20 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-6">

        {/* CATEGORÍAS */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Categorías</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                  categoriaSel === cat ? "bg-rose-900 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE COMERCIOS */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Establecimientos ({comerciosFiltrados.length})
          </h2>

          {cargando ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando guía comercial...</div>
          ) : comerciosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 font-medium text-sm">No se encontraron comercios en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comerciosFiltrados.map((comercio) => (
                <div
                  key={comercio.id}
                  onClick={() => { setComercioSel(comercio); setModoAdmin(false); }}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <img src={obtenerPortadaValida(comercio.portada_url)} alt={comercio.nombre} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate">{comercio.nombre}</h3>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                        {comercio.subcategoria || comercio.categoria}
                      </p>
                      
                      {comercio.direccion && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{comercio.direccion}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setComercioSel(comercio);
                        setModoAdmin(false);
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
                    >
                      👁️ Ver Ficha Completa
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prepararEdicionComercio(comercio);
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL FICHA DESPLEGABLE O PANEL DE EDICIÓN */}
      {comercioSel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-5 pb-32">
            
            <button
              onClick={() => { setComercioSel(null); setModoAdmin(false); }}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 cursor-pointer"
            >
              ✕
            </button>

            {/* SI ESTÁ EN MODO EDICIÓN */}
            {modoAdmin ? (
              <div>
                {!autenticadoAdmin ? (
                  <form onSubmit={handleLoginAdmin} className="space-y-4 pt-4">
                    <div className="text-center">
                      <span className="text-3xl">🔐</span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">Acceso de Gestión</h3>
                      <p className="text-xs text-slate-500">Introduce el PIN para editar {comercioSel.nombre}</p>
                    </div>

                    {mensajeAdmin.texto && (
                      <div className="p-3 rounded-xl text-xs font-bold bg-red-50 text-red-600 text-center">
                        {mensajeAdmin.texto}
                      </div>
                    )}

                    <input
                      type="password"
                      placeholder="PIN (ej. 1234 o 9999)"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-bold"
                      autoFocus
                    />

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow"
                    >
                      Ver Panel de Edición
                    </button>
                  </form>
                ) : (
                  <form onSubmit={guardarCambiosComercio} className="space-y-4 pt-2">
                    <div className="border-b pb-2 flex justify-between items-center">
                      <h3 className="text-base font-black text-slate-900">✏️ Editando: {formData.nombre}</h3>
                      <button
                        type="button"
                        onClick={() => setModoAdmin(false)}
                        className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-600"
                      >
                        Ver Ficha
                      </button>
                    </div>

                    {mensajeAdmin.texto && (
                      <div className={`p-3 rounded-xl text-xs font-bold text-center ${mensajeAdmin.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {mensajeAdmin.texto}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Comercio:</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Categoría:</label>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                        >
                          <option value="Hostelería">Hostelería</option>
                          <option value="Comercio">Comercio</option>
                          <option value="Servicios">Servicios</option>
                          <option value="Salud y Belleza">Salud y Belleza</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subcategoría:</label>
                        <input
                          type="text"
                          value={formData.subcategoria}
                          onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                          className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dirección:</label>
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                        className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                      />
                    </div>

                    {/* SITIO WEB Y TIENDA ONLINE */}
                    <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                      <p className="text-xs font-bold text-slate-800 uppercase">🌐 Sitio Web y Tienda Online</p>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Página Web:</label>
                        <input
                          type="text"
                          value={formData.web_url}
                          onChange={(e) => setFormData({...formData, web_url: e.target.value})}
                          placeholder="https://www.tu-web.es"
                          className="w-full p-2 bg-white border rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Tienda Online:</label>
                        <input
                          type="text"
                          value={formData.tienda_url}
                          onChange={(e) => setFormData({...formData, tienda_url: e.target.value})}
                          placeholder="https://tu-tienda.palbin.com"
                          className="w-full p-2 bg-white border rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    {/* PORTADA PRINCIPAL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">📸 Foto de Portada:</label>
                      <input
                        type="text"
                        value={formData.portada_url}
                        onChange={(e) => setFormData({...formData, portada_url: e.target.value})}
                        placeholder="URL de la imagen..."
                        className="w-full p-2 bg-slate-50 border rounded-xl text-xs mb-1"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'portada_url')}
                        disabled={subiendo}
                        className="w-full text-xs text-slate-500"
                      />
                    </div>

                    {/* GALERÍA DE FOTOS */}
                    <div className="bg-slate-50 p-3 rounded-2xl border">
                      <label className="block text-xs font-bold text-slate-800 mb-2">🖼️ Galería de Fotos (Múltiples):</label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {formData.galeria_urls.map((url, idx) => (
                          <div key={idx} className="relative h-16 bg-slate-200 rounded-xl overflow-hidden border">
                            <img src={url} alt={`Gal ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => eliminarDeGaleria(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center"
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

                    {/* VÍDEO PROMOCIONAL */}
                    <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                      <p className="text-xs font-bold text-slate-800 uppercase">🎬 Vídeo Promocional</p>
                      <input
                        type="text"
                        value={formData.video_story_url}
                        onChange={(e) => setFormData({...formData, video_story_url: e.target.value})}
                        placeholder="URL del vídeo..."
                        className="w-full p-2 bg-white border rounded-xl text-xs"
                      />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video_story_url')}
                        disabled={subiendo}
                        className="w-full text-xs text-slate-500"
                      />
                    </div>

                    {/* REDES SOCIALES */}
                    <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                      <p className="text-xs font-bold text-slate-800 uppercase">🌐 Redes Sociales</p>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Instagram:</label>
                        <input
                          type="text"
                          value={formData.instagram_url}
                          onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                          placeholder="https://instagram.com/..."
                          className="w-full p-2 bg-white border rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">TikTok:</label>
                        <input
                          type="text"
                          value={formData.tiktok_url}
                          onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
                          placeholder="https://tiktok.com/@..."
                          className="w-full p-2 bg-white border rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Facebook:</label>
                        <input
                          type="text"
                          value={formData.facebook_url}
                          onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                          placeholder="https://facebook.com/..."
                          className="w-full p-2 bg-white border rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp:</label>
                        <input
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">PIN Acceso:</label>
                        <input
                          type="text"
                          value={formData.pin_acceso}
                          onChange={(e) => setFormData({...formData, pin_acceso: e.target.value})}
                          className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Descripción:</label>
                      <textarea
                        rows="2"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={guardando}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow"
                    >
                      {guardando ? "Guardando..." : "💾 Guardar Cambios"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* VISTA NORMAL DE LA FICHA DEL COMERCIO */
              <div>
                <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative mb-4 border">
                  <img src={obtenerPortadaValida(comercioSel.portada_url)} alt={comercioSel.nombre} className="w-full h-full object-cover" />
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{comercioSel.nombre}</h2>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-0.5">
                      {comercioSel.subcategoria || comercioSel.categoria}
                    </p>
                  </div>
                  <button
                    onClick={() => { setModoAdmin(true); setAutenticadoAdmin(false); }}
                    className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1"
                  >
                    ✏️ Editar
                  </button>
                </div>

                {comercioSel.direccion && (
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" /> {comercioSel.direccion}
                  </p>
                )}

                {comercioSel.descripcion && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border">
                    {comercioSel.descripcion}
                  </p>
                )}

                {/* VÍDEO PROMOCIONAL EN LA VISTA PÚBLICA */}
                {comercioSel.video_story_url && typeof comercioSel.video_story_url === 'string' && comercioSel.video_story_url.trim() !== '' && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      🎬 Vídeo Promocional
                    </p>
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-black border shadow-sm">
                      <video 
                        src={comercioSel.video_story_url.trim()} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* GALERÍA DE FOTOS EN LA VISTA */}
                {comercioSel.galeria_urls && Array.isArray(comercioSel.galeria_urls) && comercioSel.galeria_urls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Image size={14} /> Galería de Fotos
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {comercioSel.galeria_urls.map((url, i) => (
                        url && (
                          <div 
                            key={i} 
                            onClick={() => setFotoAmpliada(url.trim())}
                            className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border cursor-pointer hover:opacity-90"
                          >
                            <img src={url.trim()} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* SITIO WEB Y TIENDA ONLINE EN LA VISTA PÚBLICA */}
                {(comercioSel.web_url || comercioSel.tienda_url) && (
                  <div className="mt-4 pt-3 border-t flex gap-2">
                    {comercioSel.web_url && (
                      <a href={comercioSel.web_url.startsWith('http') ? comercioSel.web_url : `https://${comercioSel.web_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1">
                        🌐 Web Oficial
                      </a>
                    )}
                    {comercioSel.tienda_url && (
                      <a href={comercioSel.tienda_url.startsWith('http') ? comercioSel.tienda_url : `https://${comercioSel.tienda_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-amber-500 text-slate-950 py-2 rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1">
                        🛍️ Tienda Online
                      </a>
                    )}
                  </div>
                )}

                {/* REDES SOCIALES EN LA VISTA PÚBLICA */}
                {(() => {
                  const insta = comercioSel.instagram_url || comercioSel.instagram_username;
                  const tiktok = comercioSel.tiktok_url;
                  const facebook = comercioSel.facebook_url;

                  if (!insta && !tiktok && !facebook) return null;

                  return (
                    <div className="mt-3 pt-2 flex gap-2">
                      {insta && (
                        <a 
                          href={insta.startsWith('http') ? insta : `https://${insta}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-pink-600 text-white py-2 rounded-xl text-center text-xs font-bold shadow"
                        >
                          Instagram
                        </a>
                      )}
                      {tiktok && (
                        <a 
                          href={tiktok.startsWith('http') ? tiktok : `https://${tiktok}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-black text-white py-2 rounded-xl text-center text-xs font-bold shadow"
                        >
                          TikTok
                        </a>
                      )}
                      {facebook && (
                        <a 
                          href={facebook.startsWith('http') ? facebook : `https://${facebook}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-center text-xs font-bold shadow"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  );
                })()}

                {/* BOTONES DE CONTACTO */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {comercioSel.whatsapp && (
                    <a
                      href={"https://wa.me/" + comercioSel.whatsapp.replace("+", "").replace(/\s/g, "")}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    ></a>