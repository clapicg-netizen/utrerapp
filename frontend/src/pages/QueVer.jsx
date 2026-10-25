import React, { useState } from "react";
import { ArrowLeft, Landmark, Camera, ExternalLink, Compass, Volume2, Globe } from "lucide-react";

export default function QueVer({ setPaginaActual }) {
  const [idioma, setIdioma] = useState('es'); // 'es', 'en', 'fr'
  const [reproduciendoId, setReproduciendoId] = useState(null);

  // Textos estáticos de la interfaz según el idioma
  const uiTextos = {
    es: {
      tituloCabecera: "Qué Ver en Utrera",
      subtituloCabecera: "Patrimonio histórico, monumentos y rincones con encanto andaluz.",
      instaTitulo: "#UtreraEnInstagram",
      instaSub: "Comparte tus fotos y rincones favoritos",
      instaBtn: "Ver Fotos",
      seccionMonumentos: "Monumentos Emblemáticos",
      seccionRutas: "Rutas Recomendadas",
      audioBtn: "Escuchar Audioguía",
      audioParar: "Pausar",
      horarioLabel: "Horarios:",
      fuente: "Información basada en Turismo de la Provincia de Sevilla (Prodetur)"
    },
    en: {
      tituloCabecera: "What to See in Utrera",
      subtituloCabecera: "Historical heritage, monuments and corners with Andalusian charm.",
      instaTitulo: "#UtreraOnInstagram",
      instaSub: "Share your photos and favorite spots",
      instaBtn: "View Photos",
      seccionMonumentos: "Emblematic Monuments",
      seccionRutas: "Recommended Routes",
      audioBtn: "Listen Audioguide",
      audioParar: "Pause",
      horarioLabel: "Opening Hours:",
      fuente: "Information based on Tourism of the Province of Seville (Prodetur)"
    },
    fr: {
      tituloCabecera: "À voir à Utrera",
      subtituloCabecera: "Patrimoine historique, monuments et coins au charme andalou.",
      instaTitulo: "#UtreraSurInstagram",
      instaSub: "Partagez vos photos et vos endroits préférés",
      instaBtn: "Voir les photos",
      seccionMonumentos: "Monuments Emblématiques",
      seccionRutas: "Itinéraires Recommandés",
      audioBtn: "Écouter l'audioguide",
      audioParar: "Pause",
      horarioLabel: "Horaires :",
      fuente: "Informations basées sur le Tourisme de la Province de Séville (Prodetur)"
    }
  };

  const t = uiTextos[idioma];

  const monumentos = [
    {
      id: "santuario",
      nombre: {
        es: "Santuario de Nuestra Señora de Consolación",
        en: "Sanctuary of Our Lady of Consolation",
        fr: "Sanctuaire de Notre-Dame de Consolación"
      },
      tipo: {
        es: "Templo & Peregrinación",
        en: "Temple & Pilgrimage",
        fr: "Temple & Pèlerinage"
      },
      descripcion: {
        es: "Santuario histórico de profunda devoción mariana y joya espiritual de la baja Andalucía. Casa de la Patrona de Utrera y lugar de peregrinación centenario.",
        en: "Historical sanctuary of deep Marian devotion and spiritual jewel of lower Andalusia. Home of the Patron Saint of Utrera.",
        fr: "Sanctuaire historique d'une profonde dévotion mariane et joyau spirituel de la basse Andalousie. Maison de la Patronne d'Utrera."
      },
      horarios: "L-D: 9:00 - 13:30 y 17:00 - 20:30",
      imagen: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=600&q=80",
      instaTag: "#SantuarioConsolacionUtrera"
    },
    {
      id: "castillo",
      nombre: {
        es: "Castillo de Utrera y Torre del Homenaje",
        en: "Castle of Utrera and Keep",
        fr: "Château d'Utrera et Tour de l'Hommage"
      },
      tipo: {
        es: "Monumento Histórico",
        en: "Historical Monument",
        fr: "Monument Historique"
      },
      descripcion: {
        es: "Fortaleza medieval levantada sobre un antiguo alcázar árabe, situado en un cerro elevado que domina toda la campiña. Declarado BIC.",
        en: "Medieval fortress built on an ancient Arab alcazar, situated on a high hill overlooking the countryside.",
        fr: "Forteresse médiévale construite sur un ancien alcázar arabe, située sur une haute colline surplombant la campagne."
      },
      horarios: "Consultar visitas guiadas en oficina de turismo",
      imagen: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=600&q=80",
      instaTag: "#CastilloDeUtrera"
    },
    {
      id: "santa-maria",
      nombre: {
        es: "Iglesia de Santa María de la Mesa",
        en: "Church of Santa María de la Mesa",
        fr: "Église de Santa María de la Mesa"
      },
      tipo: {
        es: "Arquitectura Gótica-Renacentista",
        en: "Gothic-Renaissance Architecture",
        fr: "Architecture Gothique-Renaissance"
      },
      descripcion: {
        es: "Majestuoso templo declarado Monumento Histórico Artístico Nacional. Destaca su excepcional Puerta del Perdón con casetones renacentistas y su torre de más de 60 metros.",
        en: "Majestic temple declared a National Historic-Artistic Monument. Highlights include its exceptional Puerta del Perdón and its tower over 60 meters.",
        fr: "Majestueux temple déclaré Monument Historique et Artistique National. Il se distingue par sa magnifique Porte du Pardon et sa tour de plus de 60 mètres."
      },
      horarios: "L-V: 9:00-13:00 y 17:00-20:00 | S-D: 10:00-14:00 y 17:00-20:00",
      imagen: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=600&q=80",
      instaTag: "#SantaMariaUtrera"
    },
    {
      id: "nino-perdido",
      nombre: {
        es: "Callejón del Niño Perdido",
        en: "Callejón del Niño Perdido (Alley)",
        fr: "Ruelle du Callejón del Niño Perdido"
      },
      tipo: {
        es: "Rincón con Encanto",
        en: "Charming Corner",
        fr: "Coin de Charme"
      },
      descripcion: {
        es: "Típica estampa andaluza en pleno casco histórico, con su arco de entrada y callejuelas blancas impregnadas de historia y leyendas locales.",
        en: "Typical Andalusian spot in the historic center, with its entrance arch and white alleys steeped in history.",
        fr: "Endroit andalou typique du centre historique, avec son arc d'entrée et ses ruelles blanches imprégnées d'histoire."
      },
      horarios: "Acceso libre 24h",
      imagen: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
      instaTag: "#UtreraHistorica"
    }
  ];

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

  // Simulación de reproductor de audioguía mediante voz nativa del navegador (Text-to-Speech)
  const toggleAudio = (monumento) => {
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

      {/* GALERÍA DE MONUMENTOS CON AUDIOGUÍA */}
      <div className="space-y-3">
        <div className="px-1 flex items-center gap-1.5">
          <Landmark size={16} className="text-amber-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">{t.seccionMonumentos}</h2>
        </div>

        <div className="space-y-4">
          {monumentos.map((mon) => (
            <div key={mon.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
              <div className="relative h-44 w-full bg-slate-100">
                <img src={mon.imagen} alt={mon.nombre[idioma]} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                  {mon.tipo[idioma]}
                </span>
                <span className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                  {mon.instaTag}
                </span>
              </div>

              <div className="p-4 pt-0 space-y-2.5">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">{mon.nombre[idioma]}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{mon.descripcion[idioma]}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">{t.horarioLabel}</span> {mon.horarios}
                </div>

                {/* BOTÓN DE AUDIOGUÍA */}
                <button
                  type="button"
                  onClick={() => toggleAudio(mon)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    reproduciendoId === mon.id
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Volume2 size={16} />
                  <span>{reproduciendoId === mon.id ? t.audioParar : t.audioBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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