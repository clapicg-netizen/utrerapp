import React from "react";
import { ArrowLeft, Landmark, Camera, MapPin, ExternalLink, Compass } from "lucide-react";

export default function QueVer({ setPaginaActual }) {
  const monumentos = [
    {
      nombre: "Castillo de Utrera",
      tipo: "Monumento Histórico",
      descripcion: "Fortaleza medieval situada en un cerro elevado, testigo de la historia defensiva y señorial de la ciudad.",
      imagen: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
      instaTag: "#CastilloDeUtrera"
    },
    {
      nombre: "Santuario de Nuestra Señora de Consolación",
      tipo: "Templo & Peregrinación",
      descripcion: "Lugar de profunda devoción mariana y joya del barroco andaluz. Casa de la Patrona de Utrera.",
      imagen: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=600&q=80",
      instaTag: "#SantuarioConsolacionUtrera"
    },
    {
      nombre: "Iglesia de Santa María de la Mesa",
      tipo: "Arquitectura Gótica-Renacentista",
      descripcion: "Imponente templo situado en la Plaza del Altozano, con una esbelta torre que domina el perfil urbano.",
      imagen: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=600&q=80",
      instaTag: "#SantaMariaUtrera"
    },
    {
      nombre: "Plaza del Altozano",
      tipo: "Centro Neurálgico",
      descripcion: "El corazón social y comercial de Utrera, rodeado de palmeras, terrazas y ambiente cofrade y festivo.",
      imagen: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
      instaTag: "#AltozanoUtrera"
    }
  ];

  const rutas = [
    {
      titulo: "Ruta Monumental e Histórica",
      duración: "2 horas aprox.",
      descripcion: "Un paseo imprescindible por el casco antiguo descubriendo palacios, plazas y templos centenarios."
    },
    {
      titulo: "Ruta del Mostachón y la Repostería",
      duración: "1.5 horas",
      descripcion: "Disfruta de los sabores tradicionales de Utrera visitando las confiterías históricas de la ciudad."
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans text-slate-800">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-900 to-slate-900 text-white p-5 shadow-xl rounded-3xl relative overflow-hidden space-y-2">
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => setPaginaActual("home")}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Camera size={12} /> Turismo Utrera
          </span>
        </div>
        <h1 className="text-xl font-black tracking-tight relative z-10 pt-1">Qué Ver en Utrera</h1>
        <p className="text-xs text-amber-100/90 relative z-10">Monumentos, patrimonio histórico y rincones con encanto andaluz.</p>
      </div>

      {/* ENLACE INSPIRACIÓN INSTAGRAM */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 p-4 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-black tracking-wider text-pink-200">#UtreraEnInstagram</p>
          <h3 className="font-extrabold text-xs">Comparte tus fotos y rincones</h3>
        </div>
        <a
          href="https://www.instagram.com/explore/tags/utrera/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow hover:bg-slate-100 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Ver Fotos</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* GALERÍA DE MONUMENTOS VISUALES */}
      <div className="space-y-3">
        <div className="px-1 flex items-center gap-1.5">
          <Landmark size={16} className="text-amber-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Monumentos Emblemáticos</h2>
        </div>

        <div className="space-y-4">
          {monumentos.map((mon, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
              <div className="relative h-44 w-full bg-slate-100">
                <img src={mon.imagen} alt={mon.nombre} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                  {mon.tipo}
                </span>
                <span className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                  {mon.instaTag}
                </span>
              </div>

              <div className="p-4 pt-0 space-y-1.5">
                <h3 className="text-sm font-black text-slate-900">{mon.nombre}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{mon.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RUTAS TURÍSTICAS */}
      <div className="space-y-3 pt-2">
        <div className="px-1 flex items-center gap-1.5">
          <Compass size={16} className="text-indigo-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Rutas Recomendadas</h2>
        </div>

        <div className="space-y-2.5">
          {rutas.map((ruta, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-indigo-950">{ruta.titulo}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">{ruta.duración}</span>
              </div>
              <p className="text-[11px] text-slate-600">{ruta.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}