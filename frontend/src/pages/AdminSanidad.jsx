// frontend/src/pages/AdminSanidad.jsx
import React, { useState } from "react";
import { ArrowLeft, PlusCircle, Save, ShieldCheck, Sparkles, Video, Globe, Phone, MapPin } from "lucide-react";

export default function AdminSanidad({ setPaginaActual, supabase }) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estado del formulario para un nuevo centro / socio fundador
  const [form, setForm] = useState({
    nombre: "",
    tipo: "clinicas", // 'clinicas', 'dental', 'estetica'
    categoria: "",
    eslogan: "",
    registro_sanitario: "",
    imagen_url: "",
    video_url: "",
    especialidades: "", // Las separaremos por comas
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      // Convertir las especialidades de texto plano ("Ortodoncia, Implantes") a Array de PostgreSQL
      const arrayEspecialidades = form.especialidades
        ? form.especialidades.split(",").map((item) => item.trim())
        : [];

      // Inserción en la tabla de Supabase
      const { error } = await supabase.from("centros_sanitarios").insert([
        {
          nombre: form.nombre,
          tipo: form.tipo,
          categoria: form.categoria,
          eslogan: form.eslogan,
          registro_sanitario: form.registro_sanitario,
          imagen_url: form.imagen_url,
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

      setMensaje("✅ ¡Centro dado de alta correctamente en Supabase!");
      // Limpiar formulario básico
      setForm({
        nombre: "",
        tipo: "clinicas",
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
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar el centro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-6 font-sans">
      
      {/* CABECERA DEL PANEL */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        {setPaginaActual && (
          <button 
            onClick={() => setPaginaActual("home")}
            className="inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-500/30 font-bold hover:bg-teal-900 transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Volver a Utrerapp
          </button>
        )}

        <div className="space-y-1">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            Panel de Gestión
          </span>
          <h1 className="text-xl font-black tracking-tight">Alta de Socio Sanitario</h1>
          <p className="text-xs text-slate-300">Introduce los datos de la clínica o centro para publicarlo al instante.</p>
        </div>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${mensaje.includes("✅") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>
          {mensaje}
        </div>
      )}

      {/* FORMULARIO DE ALTA */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 space-y-4">
        
        {/* Datos Principales */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">1. Información General</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre del Centro / Clínica *</label>
            <input 
              type="text" 
              name="nombre" 
              value={form.nombre} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Clínica Dental Sonrisa Utrera" 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Categoría PWA *</label>
              <select 
                name="tipo" 
                value={form.tipo} 
                onChange={handleChange}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
              >
                <option value="clinicas">Clínica / Especialidades</option>
                <option value="dental">Dental / Odontología</option>
                <option value="estetica">Estética y Belleza</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtítulo / Especialidad *</label>
              <input 
                type="text" 
                name="categoria" 
                value={form.categoria} 
                onChange={handleChange} 
                required 
                placeholder="Ej: Odontología Avanzada" 
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Eslogan Comercial</label>
            <input 
              type="text" 
              name="eslogan" 
              value={form.eslogan} 
              onChange={handleChange} 
              placeholder="Ej: Tu sonrisa en las mejores manos" 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Registro Sanitario Oficial *</label>
            <input 
              type="text" 
              name="registro_sanitario" 
              value={form.registro_sanitario} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Reg. Sanitario: NICA 45123" 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>
        </div>

        {/* Multimedia, Vídeo y Redes */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">2. Multimedia y Redes Sociales</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">URL de la Imagen Principal *</label>
            <input 
              type="url" 
              name="imagen_url" 
              value={form.imagen_url} 
              onChange={handleChange} 
              required 
              placeholder="https://images.unsplash.com/..." 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">URL del Vídeo / Reel (Opcional)</label>
            <input 
              type="url" 
              name="video_url" 
              value={form.video_url} 
              onChange={handleChange} 
              placeholder="Enlace de YouTube o MP4 para presentación" 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Instagram URL</label>
              <input type="url" name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">TikTok URL</label>
              <input type="url" name="tiktok_url" value={form.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Facebook URL</label>
              <input type="url" name="facebook_url" value={form.facebook_url} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full text-[11px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Equipo y Tratamientos */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">3. Equipo Médico y Servicios</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Especialidades (separadas por comas)</label>
            <input 
              type="text" 
              name="especialidades" 
              value={form.especialidades} 
              onChange={handleChange} 
              placeholder="Ortodoncia Invisible, Implantes 3D, Blanqueamiento" 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tecnología Destacada</label>
              <input type="text" name="tecnologia" value={form.tecnologia} onChange={handleChange} placeholder="Escáner 3D" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Especialista / Colegiado</label>
              <input type="text" name="medico" value={form.medico} onChange={handleChange} placeholder="Dr. Pérez (Col. 41410)" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Financiación</label>
              <input type="text" name="financiacion" value={form.financiacion} onChange={handleChange} placeholder="Hasta 36 meses sin intereses" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mutuas / Seguros</label>
              <input type="text" name="mutuas" value={form.mutuas} onChange={handleChange} placeholder="Sanitas, Adeslas, Asisa" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Contacto y Ubicación */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider border-b pb-1">4. Contacto y Ubicación</h2>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Dirección Completa *</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Av. San Juan Bosco, 45, Utrera" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Horario *</label>
            <input type="text" name="horario" value={form.horario} onChange={handleChange} required placeholder="L-V: 9:00 - 14:00 y 16:30 - 20:30" className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl" />
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

        {/* BOTÓN DE ENVÍO */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-900 to-teal-950 text-white hover:from-teal-800 hover:to-teal-900 p-4 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 pt-4 mt-4"
        >
          <Save size={16} />
          <span>{loading ? "Guardando en Supabase..." : "Publicar Centro Sanitario"}</span>
        </button>

      </form>

    </div>
  );
}