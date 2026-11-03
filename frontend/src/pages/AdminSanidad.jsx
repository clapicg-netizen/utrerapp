// frontend/src/pages/AdminSanidad.jsx
import React, { useState } from "react";
import { ArrowLeft, Save, Lock, KeyRound, Upload, Image as ImageIcon } from "lucide-react";

export default function AdminSanidad({ setPaginaActual, supabase }) {
  const PIN_SECRETO = "1967"; 

  const [autenticado, setAutenticado] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [errorPin, setErrorPin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imagenSubiendo, setImagenSubiendo] = useState(false);
  const [previewImagen, setPreviewImagen] = useState(null);

  // Estado completo de la ficha del socio sanitario
  const [form, setForm] = useState({
    nombre: "",
    tipo: "dental",
    categoria: "",
    eslogan: "",
    registro_sanitario: "",
    imagen_url: "", 
    video_url: "",
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

  // 📸 SUBIDA ROBUSTA A SUPABASE STORAGE
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
    setMensaje("Subiendo imagen a Supabase...");
    setPreviewImagen(URL.createObjectURL(file));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `sanidad_${Date.now()}.${fileExt}`;
      const filePath = `socios_fundadores/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagenes_sanidad')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('imagenes_sanidad')
        .getPublicUrl(filePath);

      const urlFinal = publicUrlData.publicUrl;

      // Actualizamos el formulario directamente con la URL garantizada
      setForm((prev) => ({ ...prev, imagen_url: urlFinal }));
      setMensaje("✅ ¡Imagen subida y enlazada con éxito!");
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setMensaje("❌ Error al subir la imagen: " + error.message);
      setPreviewImagen(null);
    } finally {
      setImagenSubiendo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      // Procesar especialidades separadas por comas en formato array
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
          imagen_url: form.imagen_url || "https://images.unsplash.com/photo-1629909613654-28e377c37b09",
          video_url: form.video_url,
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

      setMensaje("✅ ¡Centro sanitario publicado correctamente!");
      setForm({
        nombre: "",
        tipo: "dental",
        categoria: "",
        eslogan: "",
        registro_sanitario: "",
        imagen_url: "",
        video_url: "",
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
        <div className="bg-slate-900 text-white p-8 shadow-2xl rounded-3xl text-center space-y-5 relative overflow-hidden border border-amber-500/30">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
            <Lock size={30} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight">Acceso Restringido Utrerapp</h1>
            <p className="text-xs text-slate-400">Introduce tu PIN de administrador para gestionar los socios sanitarios.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <input 
              type="password" 
              maxLength="6"
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value)}
              placeholder="••••"
              className="w-40 text-center text-2xl tracking-widest p-3 bg-slate-950 border border-slate-700 rounded-2xl text-amber-400 focus:outline-none focus:border-amber-500 mx-auto block font-mono"
              autoFocus
            />

            {errorPin && (
              <p className="text-xs text-rose-400 font-bold">❌ PIN incorrecto. Inténtalo de nuevo.</p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 p-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              <span>Desbloquear Panel</span>
            </button>
          </form>

          {setPaginaActual && (
            <button 
              onClick={() => setPaginaActual("sanidad")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer pt-2"
            >
              <ArrowLeft size={14} /> Volver a Sanidad
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-6 font-sans">
      
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        {setPaginaActual && (
          <button 
            onClick={() => setPaginaActual("sanidad")}
            className="inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-500/30 font-bold hover:bg-teal-900 transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Volver a Sanidad
          </button>
        )}

        <div className="space-y-1">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            Panel de Gestión Segura
          </span>
          <h1 className="text-xl font-black tracking-tight">Modificar y Crear Fichas Sanitarias</h1>
          <p className="text-xs text-slate-300">Rellena los campos con los datos definitivos del socio fundador.</p>
        </div>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${mensaje.includes("✅") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 space-y-4">
        
        {/* 1. INFORMACIÓN GENERAL */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">1. Información General</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre del Centro / Clínica *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Clínica Dental Dra. Ordóñez" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Categoría PWA *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium">
                <option value="clinicas">Clínica / Especialidades</option>
                <option value="dental">Dental / Odontología</option>
                <option value="estetica">Estética y Belleza</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtítulo / Especialidad *</label>
              <input type="text" name="categoria" value={form.categoria} onChange={handleChange} required placeholder="Ej: Odontología Avanzada" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Eslogan Comercial</label>
            <input type="text" name="eslogan" value={form.eslogan} onChange={handleChange} placeholder="Ej: Tu sonrisa en las mejores manos" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Registro Sanitario Oficial *</label>
            <input type="text" name="registro_sanitario" value={form.registro_sanitario} onChange={handleChange} required placeholder="Ej: NCA 1222" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium" />
          </div>
        </div>

        {/* 2. IMAGEN PRINCIPAL */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">2. Imagen Principal del Centro *</h2>
          
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 border-2 border-teal-500 border-dashed text-teal-800 p-5 rounded-3xl text-center flex flex-col items-center justify-center gap-2 flex-1 transition-all">
              <Upload size={22} className="text-teal-600" />
              <span className="text-xs font-bold">
                {imagenSubiendo ? "Subiendo foto..." : "Seleccionar Foto"}
              </span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleSubirImagenLocal} 
                disabled={imagenSubiendo}
                className="hidden"
              />
            </label>

            {previewImagen ? (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 relative">
                <img src={previewImagen} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                <ImageIcon size={28} />
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 pl-1">Se subirá de forma segura al almacenamiento de Supabase.</p>
        </div>

        {/* 3. VÍDEO Y REDES */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">3. Multimedia y Redes Sociales</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">URL del Vídeo / Reel (Opcional)</label>
            <input type="url" name="video_url" value={form.video_url} onChange={handleChange} placeholder="Enlace de YouTube o Facebook Reel" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Instagram</label>
              <input type="url" name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">TikTok</label>
              <input type="url" name="tiktok_url" value={form.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Facebook</label>
              <input type="url" name="facebook_url" value={form.facebook_url} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 4. EQUIPO Y SERVICIOS */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">4. Especialidades y Servicios</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Especialidades (separadas por comas)</label>
            <input type="text" name="especialidades" value={form.especialidades} onChange={handleChange} placeholder="Implantología, Ortodoncia, Estética dental" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tecnología Destacada</label>
              <input type="text" name="tecnologia" value={form.tecnologia} onChange={handleChange} placeholder="TAC 3D dental" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Especialista / Colegiado</label>
              <input type="text" name="medico" value={form.medico} onChange={handleChange} placeholder="Dra. Belén Ordóñez" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Financiación</label>
              <input type="text" name="financiacion" value={form.financiacion} onChange={handleChange} placeholder="Hasta 36 meses sin intereses" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mutuas / Seguros</label>
              <input type="text" name="mutuas" value={form.mutuas} onChange={handleChange} placeholder="Sanitas, Adeslas..." className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 5. CONTACTO Y UBICACIÓN */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">5. Contacto y Ubicación</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Dirección Completa *</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Calle Real, Utrera" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Horario *</label>
            <input type="text" name="horario" value={form.horario} onChange={handleChange} required placeholder="L-V: 9:00 - 20:00" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp (con prefijo) *</label>
              <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="34600000000" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono Fijo / Móvil *</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required placeholder="955000000" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Enlace Google Maps (Cómo llegar)</label>
            <input type="url" name="mapa_url" value={form.mapa_url} onChange={handleChange} placeholder="https://www.google.com/maps/search/?api=1&query=..." className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || imagenSubiendo}
          className="w-full bg-gradient-to-r from-teal-900 to-teal-950 text-white hover:from-teal-800 hover:to-teal-900 p-4 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 pt-4 mt-4 disabled:opacity-60"
        >
          <Save size={16} />
          <span>{loading ? "Publicando..." : "Guardar y Publicar Ficha"}</span>
        </button>

      </form>

    </div>
  );
}