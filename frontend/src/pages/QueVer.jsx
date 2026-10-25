import React, { useState } from "react";
import { ArrowLeft, Landmark, ExternalLink, Compass, Volume2, X, ChevronRight } from "lucide-react";
import { monumentosUtrera } from "./monumentosUtrera";

export default function QueVer({ setPaginaActual }) {
  const [idioma, setIdioma] = useState('es'); // 'es', 'en', 'fr'
  const [reproduciendoId, setReproduciendoId] = useState(null);
  const [monumentoSeleccionado, setMonumentoSeleccionado] = useState(null);
  const [fotoActivaIndex, setFotoActivaIndex] = useState(0);

  const uiTextos = {
    es: {
      tituloCabecera: "Visita Utrera",
      subtituloCabecera: "Patrimonio histórico, monumentos y rincones con encanto andaluz.",
      instaTitulo: "#UtreraEnInstagram",
      instaSub: "Comparte tus fotos y rincones favoritos",
      instaBtn: "Ver Fotos",
      seccionMonumentos: "Monumentos Emblemáticos",
      seccionRutas: "Rutas Recomendadas",
      audioBtn: "Escuchar Audioguía",
      audioParar: "Pausar",
      horarioLabel: "Horarios:",
      verMas: "Toca para abrir ficha completa",
      cerrar: "Cerrar",
      fuente: "Información basada en Turismo de la Provincia de Sevilla (Prodetur)"
    },
    en: {
      tituloCabecera: "Visit Utrera",
      subtituloCabecera: "Historical heritage, monuments and corners with Andalusian charm.",
      instaTitulo: "#UtreraOnInstagram",
      instaSub: "Share your photos and favorite spots",
      instaBtn: "View Photos",
      seccionMonumentos: "Emblematic Monuments",
      seccionRutas: "Recommended Routes",
      audioBtn: "Listen Audioguide",
      audioParar: "Pause",
      horarioLabel: "Opening Hours:",
      verMas: "Tap to open full card",
      cerrar: "Close",
      fuente: "Information based on Tourism of the Province of Seville (Prodetur)"
    },
    fr: {
      tituloCabecera: "Visiter Utrera",
      subtituloCabecera: "Patrimoine historique, monuments et coins au charme andalou.",
      instaTitulo: "#UtreraSurInstagram",
      instaSub: "Partagez vos photos et vos endroits préférés",
      instaBtn: "Voir les photos",
      seccionMonumentos: "Monuments Emblématiques",
      seccionRutas: "Itinéraires Recommandés",
      audioBtn: "Écouter l'audioguide",
      audioParar: "Pause",
      horarioLabel: "Horaires :",
      verMas: "Appuyez pour ouvrir la fiche complète",
      cerrar: "Fermer",
      fuente: "Informations basées sur le Tourisme de la Province de Séville (Prodetur)"
    }
  };

  const t = uiTextos[idioma];

  const rutas = [
    {
      titulo: {
        es: "Ruta Monumental e Histórica",
        en: "Monumental & Historical Route",
        fr: "Route Monumentale & Historique"
      },
      duracion: "2 horas aprox.",
      descripcion: {
        es: "Un paseo imprescindible por el casco antiguo descubriendo palacios, plazas y templos centenarios.",
        en: "An essential walk through the old town discovering palaces, squares and centuries-old temples.",
        fr: "Une promenade incontournable dans la vieille ville à la découverte des palais, places et temples centenaires."
      }
    },
    {
      titulo: {
        es: "Ruta del Mostachón y la Repostería",
        en: "Mostachón & Pastry Route",
        fr: "Route du Mostachón et de la Pâtisserie"
      },
      duracion: "1.5 horas",
      descripcion: {
        es: "Disfruta de los sabores tradicionales de Utrera visitando las confiterías históricas de la ciudad.",
        en: "Enjoy the traditional flavors of Utrera visiting the historic confectioneries of the city.",
        fr: "Savourez les saveurs traditionnelles d'Utrera en visitant les confiseries historiques de la ville."
      }
    }
  ];

  const toggleAudio = (monumento, e) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      if (reproduciendoId === monumento.id) {
        window.speechSynthesis.cancel();
        setReproduciendoId(null);
      } else {
        window.speechSynthesis.cancel();
        const textoALeer = monumento.descripcion[idioma];
        const utterance = new SpeechSynthesisUtterance(textoALeer);
        utterance.lang = idioma === 'es' ? 'es-ES' : idioma === 'en' ? 'en-US' : 'fr-FR';
        utterance.onend = () => setReproduciendoId(null);
        window.speechSynthesis.speak(utterance);
        setReproduciendoId(monumento.id);
      }
    } else {
      alert("Tu dispositivo no soporta audioguía por voz.");
    }
  };

  const abrirFicha = (mon) => {
    setMonumentoSeleccionado(mon);
    setFotoActivaIndex(0);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans text-slate-800">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-900 to-slate-900 text-white p-5 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => setPaginaActual("home")}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          {/* SELECTOR DE IDIOMA MULTILINGÜE */}
          <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/20 gap-1">
            <button
              onClick={() => setIdioma('es')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${idioma === 'es' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white hover:bg-white/10'}`}
            >
              🇪🇸 ES
            </button>
            <button
              onClick={() => setIdioma('en')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${idioma === 'en' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white hover:bg-white/10'}`}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setIdioma('fr')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${idioma === 'fr' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white hover:bg-white/10'}`}
            >
              🇫🇷 FR
            </button>
          </div>
        </div>

        <h1 className="text-xl font-black tracking-tight relative z-10 pt-1">{t.tituloCabecera}</h1>
        <p className="text-xs text-amber-100/90 relative z-10">{t.subtituloCabecera}</p>
      </div>

      {/* ENLACE INSPIRACIÓN INSTAGRAM */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 p-4 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-black tracking-wider text-pink-200">{t.instaTitulo}</p>
          <h3 className="font-extrabold text-xs">{t.instaSub}</h3>
        </div>
        <a
          href="https://www.instagram.com/explore/tags/utrera/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow hover:bg-slate-100 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>{t.instaBtn}</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* GALERÍA DE MONUMENTOS */}
      <div className="space-y-3">
        <div className="px-1 flex items-center gap-1.5">
          <Landmark size={16} className="text-amber-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">{t.seccionMonumentos}</h2>
        </div>

        <div className="space-y-4">
          {monumentosUtrera.map((mon) => (
            <div 
              key={mon.id} 
              onClick={() => abrirFicha(mon)}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3 cursor-pointer hover:shadow-md hover:border-amber-400 transition-all group"
            >
              <div className="relative h-44 w-full bg-slate-100">
                <img src={mon.imagen} alt={mon.nombre[idioma]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                  {mon.tipo[idioma]}
                </span>
                <span className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                  {mon.instaTag}
                </span>
              </div>

              <div className="p-4 pt-0 space-y-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">{mon.nombre[idioma]}</h3>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{mon.descripcion[idioma]}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                    {t.verMas}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL / FICHA COMPLETA CON VISOR DE FOTOS */}
      {monumentoSeleccionado && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full">
                {monumentoSeleccionado.tipo[idioma]}
              </span>
              <button 
                onClick={() => setMonumentoSeleccionado(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* VISOR DE FOTOS PRINCIPAL */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-md bg-slate-900">
              <img 
                src={monumentoSeleccionado.galeria ? monumentoSeleccionado.galeria[fotoActivaIndex] : monumentoSeleccionado.imagen} 
                alt={monumentoSeleccionado.nombre[idioma]} 
                className="w-full h-full object-cover transition-all duration-300" 
              />
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Foto {fotoActivaIndex + 1} de {monumentoSeleccionado.galeria ? monumentoSeleccionado.galeria.length : 1}
              </span>
            </div>

            {/* MINIATURAS DEL VISOR */}
            {monumentoSeleccionado.galeria && monumentoSeleccionado.galeria.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {monumentoSeleccionado.galeria.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFotoActivaIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      fotoActivaIndex === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={foto} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <h2 className="text-lg font-black text-slate-900">{monumentoSeleccionado.nombre[idioma]}</h2>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{monumentoSeleccionado.descripcion[idioma]}</p>
            </div>

            {/* HORARIOS, DIRECCIÓN Y TELÉFONO */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div>
                <p className="font-bold text-slate-900">{t.horarioLabel}</p>
                <p className="text-slate-600 whitespace-pre-line">{monumentoSeleccionado.horarios[idioma] || monumentoSeleccionado.horarios.es}</p>
              </div>

              {monumentoSeleccionado.direccion && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Dirección: </span>
                    <span className="text-slate-600">{monumentoSeleccionado.direccion}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(monumentoSeleccionado.nombre.es + ", " + monumentoSeleccionado.direccion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[10px] shadow hover:bg-amber-400 transition-colors shrink-0"
                  >
                    Ir a verlo 🗺️
                  </a>
                </div>
              )}

              {monumentoSeleccionado.telefono && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Teléfono: </span>
                    <span className="text-slate-600">{monumentoSeleccionado.telefono}</span>
                  </div>
                  <a
                    href={`tel:${monumentoSeleccionado.telefono}`}
                    className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] shadow hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    Llamar 📞
                  </a>
                </div>
              )}
            </div>

            {/* BOTÓN DE AUDIOGUÍA */}
            <button
              type="button"
              onClick={(e) => toggleAudio(monumentoSeleccionado, e)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                reproduciendoId === monumentoSeleccionado.id
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Volume2 size={18} />
              <span>{reproduciendoId === monumentoSeleccionado.id ? t.audioParar : t.audioBtn}</span>
            </button>

            <button
              onClick={() => setMonumentoSeleccionado(null)}
              className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              {t.cerrar}
            </button>

          </div>
        </div>
      )}

      {/* RUTAS TURÍSTICAS */}
      <div className="space-y-3 pt-2">
        <div className="px-1 flex items-center gap-1.5">
          <Compass size={16} className="text-indigo-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">{t.seccionRutas}</h2>
        </div>

        <div className="space-y-2.5">
          {rutas.map((ruta, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-indigo-950">{ruta.titulo[idioma]}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">{ruta.duracion}</span>
              </div>
              <p className="text-[11px] text-slate-600">{ruta.descripcion[idioma]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MENCIÓN LEGAL / FUENTE OFICIAL */}
      <div className="text-center pt-4 pb-2">
        <p className="text-[10px] text-slate-400 italic">
          {t.fuente}
        </p>
      </div>

    </div>
  );
}