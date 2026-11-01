// src/components/FichaInmobiliaria.jsx
import React, { useState, useEffect } from "react";
import { MapPin, Bed, Bath, Maximize, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function FichaInmobiliaria({ negocioId }) {
  const [negocio, setNegocio] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [filtroModalidad, setFiltroModalidad] = useState("Todos");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchInmobiliariaData() {
      if (!negocioId) return;
      setCargando(true);
      try {
        // 1. Obtener datos generales del negocio desde la tabla unificada 'comercios'
        const { data: negData, error: negError } = await supabase
          .from("comercios")
          .select("*")
          .eq("id", negocioId)
          .maybeSingle();

        if (negError) throw negError;
        if (negData) setNegocio(negData);

        // 2. Obtener el catálogo de propiedades de la nueva tabla 'especial1_items'
        const { data: propData, error: propError } = await supabase
          .from("especial1_items")
          .select("*")
          .eq("negocio_id", negocioId);

        if (propError) throw propError;
        if (propData) setPropiedades(propData);
      } catch (err) {
        console.error("Error al cargar datos de inmobiliaria:", err);
      } finally {
        setCargando(false);
      }
    }
    fetchInmobiliariaData();
  }, [negocioId]);

  const propiedadesFiltradas = propiedades.filter((p) => {
    if (filtroModalidad === "Todos") return true;
    return p.modalidad?.toLowerCase() === filtroModalidad.toLowerCase();
  });

  if (cargando) {
    return <div className="text-center py-16 text-slate-500 font-bold text-sm">Cargando catálogo inmobiliario...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800 font-sans">
      
      {/* Cabecera / Banner Superior dinámico desde 'comercios' */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-black">{negocio?.titulo_seccion_catalogo || negocio?.nombre || "Catálogo Inmobiliario VIP"}</h1>
        <p className="text-xs text-slate-400 mt-1">{negocio?.descripcion || "Encuentra tu vivienda, local o terreno ideal en Utrera"}</p>
        
        {negocio?.mostrar_boton_captacion !== false && (
          <button 
            onClick={() => window.open(`https://wa.me/${negocio?.whatsapp || "34600000000"}?text=${encodeURIComponent(negocio?.texto_boton_captacion || "Hola, quiero solicitar una valoración gratuita")}`, "_blank")}
            className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>✨</span> {negocio?.texto_boton_captacion || "Solicitar valoración gratuita"}
          </button>
        )}
      </div>

      {/* Filtros de Categoría / Operación dinámicos o estándar */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2">
        {(negocio?.categorias_filtro && negocio.categorias_filtro.length > 0 ? ["Todos", ...negocio.categorias_filtro] : ["Todos", "Venta", "Alquiler", "Traspaso"]).map((mod) => (
          <button
            key={mod}
            onClick={() => setFiltroModalidad(mod)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filtroModalidad === mod ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Listado de Propiedades desde 'especial1_items' */}
      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        {propiedadesFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">No hay propiedades disponibles en esta modalidad.</p>
          </div>
        ) : (
          propiedadesFiltradas.map((prop) => {
            // Extraer características de la columna JSONB 'caracteristicas_clave' o campos directos
            const carac = prop.caracteristicas_clave || {};
            const imagenPrincipal = (prop.imagenes && prop.imagenes.length > 0) ? prop.imagenes[0] : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2";

            return (
              <div key={prop.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 overflow-hidden space-y-3">
                
                {/* Imagen / Portada */}
                <div className="relative h-48 bg-slate-100 rounded-2xl overflow-hidden border">
                  <img
                    src={imagenPrincipal}
                    alt={prop.titulo}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                    {prop.modalidad || "Venta"} {prop.referencia_interna ? `• ${prop.referencia_interna}` : ""}
                  </span>
                  {prop.etiqueta_destacado && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                      {prop.etiqueta_destacado}
                    </span>
                  )}
                </div>

                {/* Títulos y Precios */}
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{prop.titulo}</h3>
                    <span className="font-black text-amber-600 text-base whitespace-nowrap">
                      {prop.precio ? Number(prop.precio).toLocaleString() + " €" : "Consultar"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" /> {prop.subtitulo_zona || "Utrera, Sevilla"}
                  </p>
                </div>

                {/* Características Clave (Habitaciones, Baños, M2) */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center text-xs font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-1">
                    <Bed size={14} className="text-amber-600" /> {carac.habitaciones ?? prop.habitaciones ?? 0} hab.
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Bath size={14} className="text-amber-600" /> {carac.banos ?? prop.baños ?? 0} baños
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Maximize size={14} className="text-amber-600" /> {carac.m2 ?? prop.metros_cuadrados ?? 0} m²
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{prop.descripcion}</p>

                {/* Botón de Contacto Directo WhatsApp */}
                <a
                  href={`https://wa.me/${prop.whatsapp_contacto_directo || negocio?.whatsapp || "34600000000"}?text=${encodeURIComponent(`Hola, me interesa el inmueble ${prop.referencia_interna ? `(${prop.referencia_interna}) ` : ""}: ${prop.titulo}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle size={16} /> Contactar por este inmueble
                </a>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}