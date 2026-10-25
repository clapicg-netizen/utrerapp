import React, { useState, useEffect } from "react";
import { ArrowLeft, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function MuroComunidad({ setPaginaActual }) {
  const [fotos, setFotos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    cargarFotos();
  }, []);

  async function cargarFotos() {
    try {
      const { data, error } = await supabase
        .from('fotos_comunidad')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFotos(data);
    } catch (err) {
      console.error("Error cargando fotos:", err);
    }
  }

  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const subirFoto = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Por favor selecciona una foto.");

    setSubiendo(true);
    try {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const { error: errorStorage } = await supabase.storage
        .from('fotos-comunidad')
        .upload(nombreArchivo, archivo);

      if (errorStorage) throw errorStorage;

      const { data: urlData } = supabase.storage
        .from('fotos-comunidad')
        .getPublicUrl(nombreArchivo);

      const urlPublica = urlData.publicUrl;

      const { error: errorDb } = await supabase
        .from('fotos_comunidad')
        .insert([
          {
            url_imagen: urlPublica,
            usuario: usuario.trim() ? usuario : "Vecino de Utrera",
            monumento_id: "general"
          }
        ]);

      if (errorDb) throw errorDb;

      setArchivo(null);
      setPreview(null);
      setUsuario("");
      cargarFotos();
      alert("¡Foto subida con éxito al muro de Utrera!");
    } catch (err) {
      console.error("Error al subir:", err);
      alert("Hubo un error al subir la foto.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans text-slate-800">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white p-5 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => setPaginaActual("home")}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full">#UtreraEnInstagram</span>
        </div>

        <h1 className="text-xl font-black tracking-tight relative z-10 pt-1">Muro Fotográfico de Utrera</h1>
        <p className="text-xs text-pink-100 relative z-10">Comparte tus rincones favoritos y descubre los de otros vecinos.</p>
      </div>

      {/* FORMULARIO DE SUBIDA */}
      <form onSubmit={subirFoto} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
          <Camera size={16} className="text-pink-600" /> Sube tu foto
        </h2>

        <input
          type="text"
          placeholder="Tu nombre o apodo (opcional)"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-pink-500"
        />

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-4 cursor-pointer hover:border-pink-500 transition-colors bg-slate-50">
          {preview ? (
            <img src={preview} alt="Vista previa" className="h-36 w-full object-cover rounded-xl shadow" />
          ) : (
            <div className="flex flex-col items-center space-y-1 py-4 text-slate-400">
              <ImageIcon size={28} />
              <span className="text-xs font-bold text-slate-600">Toca para elegir una foto</span>
              <span className="text-[10px]">Desde tu galería o cámara</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={manejarSeleccionArchivo} className="hidden" />
        </label>

        <button
          type="submit"
          disabled={subiendo || !archivo}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          <span>{subiendo ? "Subiendo a la nube..." : "Publicar Foto en Utrerapp"}</span>
        </button>
      </form>

      {/* GALERÍA DE LA COMUNIDAD */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider px-1">Fotos de la Comunidad</h2>

        {fotos.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
            <p className="text-xs text-slate-400">Aún no hay fotos publicadas. ¡Sé el primero en compartir una!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {fotos.map((foto) => (
              <div key={foto.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="h-40 bg-slate-100">
                  <img src={foto.url_imagen} alt="Foto comunidad" className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 flex items-center justify-between text-[10px] text-slate-500 bg-slate-50/50">
                  <span className="font-bold text-slate-800 truncate max-w-[100px]">@{foto.usuario}</span>
                  <span>{new Date(foto.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}