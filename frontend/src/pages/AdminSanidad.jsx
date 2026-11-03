// frontend/src/pages/AdminSanidad.jsx
import React, { useState } from "react";
import { ArrowLeft, Save, Lock, KeyRound, Upload, Image as ImageIcon, Plus, Trash2, Video, CheckCircle2 } from "lucide-react";

export default function AdminSanidad({ setPaginaActual, supabase }) {
  const PIN_SECRETO = "1967"; 

  const [autenticado, setAutenticado] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [errorPin, setErrorPin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imagenSubiendo, setImagenSubiendo] = useState(false);
  const [galeriaSubiendo, setGaleriaSubiendo] = useState(false);
  const [videoSubiendo, setVideoSubiendo] = useState(false);
  const [previewImagen, setPreviewImagen] = useState(null);

  // Estado completo de la ficha del socio sanitario
  const [form, setForm] = useState({
    nombre: "",
    tipo: "dental",
    categoria: "",
    eslogan: "",
    registro_sanitario: "",
    imagen_url: "", // URL final garantizada
    galeria_fotos: [],
    video_url: "",
    web_oficial_url: "",
    servicios_clinicos: [],
    especialidades: "",
    tecnologia: "",
    medico: "",
    financiacion: "",
    mutuas: "",
    direccion: "",
    horario: "",
    whatsapp: "",
    telefono: "",
    mapa_url: "",
    instagram_url: "",
    tiktok_url: "",
    facebook_url: ""
  });

  const [nuevoServicio, setNuevoServicio] = useState({ titulo: "", descripcion: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinIngresado === PIN_SECRETO) {
      setAutenticado(true);
      setErrorPin(false);
    } else {
      setErrorPin(true);
      setPinIngresado("");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📸 SUBIDA DE IMAGEN PRINCIPAL (BLINDADA CON DOBLE FEEDBACK)
  const handleSubirImagenLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMensaje("❌ El archivo debe ser una imagen válida (JPG, PNG).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMensaje("❌ La imagen es demasiado grande (máx 3MB).");
      return;
    }

    setImagenSubiendo(true);
    setMensaje("Subiendo imagen principal a Supabase Storage...");
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewImagen(objectUrl);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `sanidad_main_${Date.now()}.${fileExt}`;
      const filePath = `socios_fundadores/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagenes_sanidad')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('imagenes_sanidad')
        .getPublicUrl(filePath);

      const urlFinal = publicUrlData.publicUrl;

      // Actualizamos tanto la vista previa como el input de texto de forma síncrona
      setForm((prev) => ({ ...prev, imagen_url: urlFinal }));
      setMensaje("✅ ¡Imagen subida con éxito y enlazada en el formulario!");
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setMensaje("❌ Error al subir la imagen: " + error.message);
      setPreviewImagen(null);
    } finally {
      setImagenSubiendo(false);
    }
  };

  // 🖼️ SUBIDA DE GALERÍA DE FOTOS
  const handleSubirGaleria = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setGaleriaSubiendo(true);
    setMensaje("Subiendo fotos de la galería...");

    try {
      const nuevasUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const fileExt = file.name.split('.').pop();
        const fileName = `sanidad_gal_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `socios_fundadores/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagenes_sanidad')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('imagenes_sanidad')
          .getPublicUrl(filePath);

        nuevasUrls.push(publicUrlData.publicUrl);
      }

      setForm((prev) => ({
        ...prev,
        galeria_fotos: [...prev.galeria_fotos, ...nuevasUrls]
      }));
      setMensaje("✅ ¡Galería de estancias actualizada!");
    } catch (error) {
      console.error('Error subiendo galería:', error);
      setMensaje("❌ Error al subir las fotos: " + error.message);
    } finally {
      setGaleriaSubiendo(false);
    }
  };

  // 🎬 SUBIDA DE VÍDEO LOCAL
  const handleSubirVideoLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setMensaje("❌ El archivo debe ser un vídeo válido (MP4).");
      return;
    }

    setVideoSubiendo(true);
    setMensaje("Subiendo vídeo a Supabase...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `sanidad_vid_${Date.now()}.${fileExt}`;
      const filePath = `socios_fundadores/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagenes_sanidad')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('imagenes_sanidad')
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, video_url: publicUrlData.publicUrl }));
      setMensaje("✅ ¡Vídeo subido con éxito!");
    } catch (error) {
      console.error('Error subiendo vídeo:', error);
      setMensaje("❌ Error al subir vídeo: " + error.message);
    } finally {
      setVideoSubiendo(false);
    }
  };

  const agregarServicioClinico = () => {
    if (!nuevoServicio.titulo || !nuevoServicio.descripcion) {
      setMensaje("⚠️ Introduce título y descripción para el servicio.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      servicios_clinicos: [...prev.servicios_clinicos, { ...nuevoServicio }]
    }));
    setNuevoServicio({ titulo: "", descripcion: "" });
    setMensaje("");
  };

  const eliminarServicioClinico = (index) => {
    setForm((prev) => ({
      ...prev,
      servicios_clinicos: prev.servicios_clinicos.filter((_, i) => i !== index)
    }));
  };

  const eliminarFotoGaleria = (index) => {
    setForm((prev) => ({
      ...prev,
      galeria_fotos: prev.galeria_fotos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    if (!form.imagen_url) {
      setMensaje("❌ Falta la imagen principal. Sube una foto o introduce su URL.");
      setLoading(false);
      return;
    }

    try {
      const arrayEspecialidades = form.especialidades
        ? form.especialidades.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

      const { error } = await supabase.from("centros_sanitarios").insert([
        {
          nombre: form.nombre,
          tipo: form.tipo,
          categoria: form.categoria,
          eslogan: form.eslogan,
          registro_sanitario: form.registro_sanitario,
          imagen_url: form.imagen_url,
          galeria_fotos: form.galeria_fotos,
          video_url: form.video_url,
          web_oficial_url: form.web_oficial_url,
          servicios_clinicos: form.servicios_clinicos,
          especialidades: arrayEspecialidades,
          tecnologia: form.tecnologia,
          medico: form.medico,
          financiacion: form.financiacion,
          mutuas: form.mutuas,
          direccion: form.direccion,
          horario: form.horario,
          whatsapp: form.whatsapp,
          telefono: form.telefono,
          mapa_url: form.mapa_url,
          instagram_url: form.instagram_url,
          tiktok_url: form.tiktok_url,
          facebook_url: form.facebook_url,
          activo: true
        }
      ]);

      if (error) throw error;

      setMensaje("✅ ¡Ficha sanitaria visual publicada correctamente!");
      setForm({
        nombre: "",
        tipo: "dental",
        categoria: "",
        eslogan: "",
        registro_sanitario: "",
        imagen_url: "",
        galeria_fotos: [],
        video_url: "",
        web_oficial_url: "",
        servicios_clinicos: [],
        especialidades: "",
        tecnologia: "",
        medico: "",
        financiacion: "",
        mutuas: "",
        direccion: "",
        horario: "",
        whatsapp: "",
        telefono: "",
        mapa_url: "",
        instagram_url: "",
        tiktok_url: "",
        facebook_url: ""
      });
      setPreviewImagen(null);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar en Supabase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-4 pt-16 pb-28 space-y-6 font-sans">
        <div className="bg-slate-900 text-white p-8 shadow-2xl rounded-3xl text-center space-y-5 border border-amber-500/30">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <Lock size={30} />
          </div>
          <h1 className="text-xl font-black">Acceso Restringido Utrerapp</h1>
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <input 
              type="password" 
              maxLength="6"
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value)}
              placeholder="••••"
              className="w-40 text-center text-2xl tracking-widest p-3 bg-slate-950 border border-slate-700 rounded-2xl text-amber-400 mx-auto block font-mono"
              autoFocus
            />
            {errorPin && <p className="text-xs text-rose-400 font-bold">❌ PIN incorrecto.</p>}
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 p-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
              <KeyRound size={16} /> Desbloquear Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-6 font-sans">
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 text-white p-6 shadow-xl rounded-3xl space-y-3">
        {setPaginaActual && (
          <button onClick={() => setPaginaActual("sanidad")} className="inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-500/30 font-bold cursor-pointer">
            <ArrowLeft size={14} /> Volver a Sanidad
          </button>
        )}
        <h1 className="text-xl font-black">Ficha Sanitaria Interactiva</h1>
        <p className="text-xs text-slate-300">Gestión visual avanzada de centros sanitarios.</p>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${mensaje.includes("✅") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 space-y-4">
        
        {/* 1. INFORMACIÓN GENERAL */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-teal-900 uppercase border-b pb-1">1. Información General</h2>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre del Centro / Clínica *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Clínica Dental Dra. Ordóñez" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Categoría PWA *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                <option value="clinicas">Clínica / Especialidades</option>
                <option value="dental">Dental / Odontología</option>
                <option value="estetica">Estética y Belleza</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtítulo / Especialidad *</label>
              <input type="text" name="categoria" value={form.categoria} onChange={handleChange} required placeholder="Ej: Odontología Avanzada" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Eslogan Comercial</label>
            <input type="text" name="eslogan" value={form.eslogan} onChange={handleChange} placeholder="Ej: Tu sonrisa en las mejores manos" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Registro Sanitario Oficial *</label>
            <input type="text" name="registro_sanitario" value={form.registro_sanitario} onChange={handleChange} required placeholder="Ej: NCA 1222" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-teal-700 mb-1">🌐 Enlace a su Web Oficial o Landing Page</label>
            <input type="url" name="web_oficial_url" value={form.web_oficial_url} onChange={handleChange} placeholder="https://www.tuclinica.com" className="w-full text-xs p-3 bg-teal-50/50 border border-teal-200 rounded-xl font-medium" />
          </div>
        </div>

        {/* 2. IMAGEN PRINCIPAL (CON INPUT DE URL VISIBLE PARA CERO FALLOS) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase border-b pb-1">2. Imagen Principal (Fachada / Portada) *</h2>
          
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 border-2 border-teal-500 border-dashed text-teal-800 p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-1 flex-1 transition-all">
              <Upload size={20} className="text-teal-600" />
              <span className="text-[11px] font-bold">{imagenSubiendo ? "Subiendo..." : "Subir Portada"}</span>
              <input type="file" accept="image/*" onChange={handleSubirImagenLocal} disabled={imagenSubiendo} className="hidden" />
            </label>
            {previewImagen || form.imagen_url ? (
              <div className="w-20 h-20 rounded-xl border-2 border-white shadow-md overflow-hidden flex-shrink-0 relative">
                <img src={previewImagen || form.imagen_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                  <CheckCircle2 size={12} />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                <ImageIcon size={24} />
              </div>
            )}
          </div>

          {/* CAJETÍN DE TEXTO VISIBLE PARA LA URL (Garantía absoluta de que no se pierde) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">URL de la imagen (Se rellena sola al subir o pégala directa)</label>
            <input 
              type="url" 
              name="imagen_url" 
              value={form.imagen_url} 
              onChange={handleChange} 
              required 
              placeholder="https://... o sube la foto arriba" 
              className="w-full text-[11px] p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700" 
            />
          </div>

          {/* Galería de Estancias */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Galería de Estancias (Salas, Gabinetes, Recepción)</label>
            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 border-dashed text-slate-700 p-4 rounded-2xl text-center flex items-center justify-center gap-2 transition-all block">
              <Upload size={18} className="text-slate-500" />
              <span className="text-xs font-bold">{galeriaSubiendo ? "Subiendo fotos..." : "Añadir fotos a la galería"}</span>
              <input type="file" accept="image/*" multiple onChange={handleSubirGaleria} disabled={galeriaSubiendo} className="hidden" />
            </label>

            {form.galeria_fotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {form.galeria_fotos.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden h-16 border border-slate-200 group">
                    <img src={url} alt={`Gal ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => eliminarFotoGaleria(idx)} className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-80 hover:opacity-100">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. MULTIMEDIA Y VÍDEO */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase border-b pb-1">3. Vídeo y Redes Sociales</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">URL de Vídeo Web</label>
              <input type="url" name="video_url" value={form.video_url} onChange={handleChange} placeholder="Enlace YouTube / Reel" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-teal-700 mb-1">O Subir Vídeo (MP4)</label>
              <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs font-bold">
                <Video size={14} className="text-teal-600" />
                <span>{videoSubiendo ? "Subiendo..." : "Subir Vídeo"}</span>
                <input type="file" accept="video/mp4" onChange={handleSubirVideoLocal} disabled={videoSubiendo} className="hidden" />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Instagram</label>
              <input type="url" name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="https://..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">TikTok</label>
              <input type="url" name="tiktok_url" value={form.tiktok_url} onChange={handleChange} placeholder="https://..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Facebook</label>
              <input type="url" name="facebook_url" value={form.facebook_url} onChange={handleChange} placeholder="https://..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 4. SERVICIOS CLÍNICOS DETALLADOS */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase border-b pb-1">4. Servicios Clínicos (Estilo Tarjetas)</h2>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <input type="text" placeholder="Título del Servicio (Ej: Implantología)" value={nuevoServicio.titulo} onChange={(e) => setNuevoServicio({ ...nuevoServicio, titulo: e.target.value })} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
            <textarea placeholder="Descripción breve..." value={nuevoServicio.descripcion} onChange={(e) => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl h-16 resize-none" />
            <button type="button" onClick={agregarServicioClinico} className="w-full bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus size={14} /> Añadir Servicio
            </button>
          </div>

          {form.servicios_clinicos.length > 0 && (
            <div className="space-y-2 mt-2">
              {form.servicios_clinicos.map((s, idx) => (
                <div key={idx} className="bg-teal-50/60 border border-teal-200 p-3 rounded-xl flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-teal-950">🦷 {s.titulo}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{s.descripcion}</p>
                  </div>
                  <button type="button" onClick={() => eliminarServicioClinico(idx)} className="text-rose-600 p-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 mt-3">Otras Especialidades (comas)</label>
            <input type="text" name="especialidades" value={form.especialidades} onChange={handleChange} placeholder="Endodoncia, Estética..." className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tecnología</label>
              <input type="text" name="tecnologia" value={form.tecnologia} onChange={handleChange} placeholder="TAC 3D" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Especialista</label>
              <input type="text" name="medico" value={form.medico} onChange={handleChange} placeholder="Dr. / Dra." className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Financiación</label>
              <input type="text" name="financiacion" value={form.financiacion} onChange={handleChange} placeholder="Hasta 36 meses" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mutuas</label>
              <input type="text" name="mutuas" value={form.mutuas} onChange={handleChange} placeholder="Sanitas, Adeslas" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 5. CONTACTO Y UBICACIÓN */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase border-b pb-1">5. Contacto y Ubicación</h2>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Dirección *</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Calle Real, Utrera" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Horario *</label>
            <input type="text" name="horario" value={form.horario} onChange={handleChange} required placeholder="L-V: 9:00 - 20:00" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp *</label>
              <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="34600000000" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono *</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required placeholder="955000000" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Maps URL</label>
            <input type="url" name="mapa_url" value={form.mapa_url} onChange={handleChange} placeholder="https://..." className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || imagenSubiendo || galeriaSubiendo || videoSubiendo}
          className="w-full bg-gradient-to-r from-teal-900 to-teal-950 text-white hover:from-teal-800 hover:to-teal-900 p-4 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 pt-4 mt-4 disabled:opacity-60"
        >
          <Save size={16} />
          <span>{loading ? "Publicando..." : "Guardar y Publicar Ficha Visual"}</span>
        </button>

      </form>
    </div>
  );
}