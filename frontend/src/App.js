import React, { useState, useEffect } from "react";
import { 
  Store, MapPin, Phone, Building, Pill, FileText, Sparkles, HeartHandshake 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Configuración con tu proyecto de Supabase
const supabaseUrl = 'https://gzvybwvrkplbipkzkjwg.supabase.co';
const supabaseKey = 'sb_publishable_nHxahamn3YALCGJM2zmI5Q_L6ug6oMN';
const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------------------------------------------------
// VISTA INICIO (Con Asistente Conso incluido)
// -------------------------------------------------------------
function VistaInicio({ setTab }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 space-y-4 max-w-md mx-auto">
      <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-rose-800/30 text-8xl font-black">📍</div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          Utrerapp <Sparkles className="text-amber-400" size={20} />
        </h1>
        <p className="text-xs text-rose-200 mt-1">Tu ciudad en la palma de la mano</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setTab("market")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all"
        >
          <Store className="text-rose-600 mb-2" size={28} />
          <span className="font-bold text-xs text-slate-900">Guía Local</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Comercios y servicios</span>
        </button>

        <button 
          onClick={() => setTab("conso")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all"
        >
          <HeartHandshake className="text-rose-600 mb-2" size={28} />
          <span className="font-bold text-xs text-slate-900">Asistente Conso</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Farmacias y trenes</span>
        </button>

        <button 
          onClick={() => setTab("tablon")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all"
        >
          <FileText className="text-rose-600 mb-2" size={28} />
          <span className="font-bold text-xs text-slate-900">Tablón</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Anuncios locales</span>
        </button>

        <button 
          onClick={() => setTab("farmacias")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all"
        >
          <Pill className="text-rose-600 mb-2" size={28} />
          <span className="font-bold text-xs text-slate-900">Farmacias</span>
          <span className="text-[10px] text-slate-500 mt-0.5">De guardia</span>
        </button>

        <button 
          onClick={() => setTab("vivienda")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all col-span-2"
        >
          <Building className="text-rose-600 mb-2" size={28} />
          <span className="font-bold text-xs text-slate-900">Inmobiliaria</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Pisos y casas en Utrera</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VISTA ASISTENTE CONSO (Nueva sección)
// -------------------------------------------------------------
function VistaConso() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <HeartHandshake size={20} className="text-rose-600" /> Asistente Conso
      </h2>
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
          Ayuda Local
        </span>
        <h3 className="font-extrabold text-sm text-slate-900">¡Hola! Soy Conso</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tu asistente personal para consultar horarios de trenes de Cercanías, farmacias de guardia y servicios de utilidad en Utrera de forma rápida y sencilla.
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VISTA GUÍA COMERCIAL CON FILTROS
// -------------------------------------------------------------
function VistaGuiaComercial() {
  const [comercios, setComercios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase.from("comercios_utrera").select("*");
      
      const comerciosFicticios = [
        {
          id: 'fic-1',
          nombre: 'Ferretería El Tornillo Utrerano',
          categoria: 'Ferretería y Hogar',
          descripcion: 'Herramientas, duplicado de llaves y suministros para el hogar.',
          direccion: 'Calle Ancha, 14'
        },
        {
          id: 'fic-2',
          nombre: 'Panadería Artesana La Espiga',
          categoria: 'Alimentación',
          descripcion: 'Pan cateto de horno de leña, tortas de utrera y dulces tradicionales.',
          direccion: 'Plaza del Altozano, 8'
        }
      ];

      const listaFinal = (!error && data && data.length > 0) ? [...data, ...comerciosFicticios] : comerciosFicticios;
      setComercios(listaFinal);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  const categorias = ["Todas", ...new Set(comercios.map(item => item.categoria || "General"))];

  const comerciosFiltrados = categoriaSeleccionada === "Todas" 
    ? comercios 
    : comercios.filter(item => (item.categoria || "General") === categoriaSeleccionada);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <Store size={20} className="text-rose-600" /> Guía Comercial de Utrera
      </h2>

      {!cargando && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                categoriaSeleccionada === cat 
                  ? "bg-rose-900 text-white shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {cargando ? (
        <p className="text-xs text-slate-500 text-center py-8">Cargando comercios...</p>
      ) : comerciosFiltrados.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No hay comercios en esta categoría.</p>
      ) : (
        <div className="space-y-3">
          {comerciosFiltrados.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                {item.categoria || "General"}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-1">{item.nombre}</h3>
              <p className="text-xs text-slate-600">{item.descripcion}</p>
              {item.direccion && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                  <MapPin size={12} className="text-rose-600" /> {item.direccion}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VISTA TABLÓN DE ANUNCIOS
// -------------------------------------------------------------
function VistaTablon() {
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase.from("anuncios_locales").select("*");
      if (!error && data) setAnuncios(data);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 max-w-md mx-auto">
      <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
        <FileText size={20} className="text-rose-600" /> Tablón de Anuncios
      </h2>
      {cargando ? (
        <p className="text-xs text-slate-500 text-center py-8">Cargando anuncios...</p>
      ) : anuncios.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No hay anuncios registrados.</p>
      ) : (
        <div className="space-y-3">
          {anuncios.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900">{item.titulo}</h3>
              <p className="text-xs text-slate-600">{item.descripcion}</p>
              {item.precio && <p className="text-xs font-bold text-rose-600">Precio: {item.precio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VISTA FARMACIAS DE GUARDIA
// -------------------------------------------------------------
function VistaFarmacias() {
  const [farmacias, setFarmacias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase.from("farmacias_guardia").select("*");
      if (!error && data) setFarmacias(data);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 max-w-md mx-auto">
      <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
        <Pill size={20} className="text-rose-600" /> Farmacias de Guardia
      </h2>
      {cargando ? (
        <p className="text-xs text-slate-500 text-center py-8">Cargando farmacias...</p>
      ) : farmacias.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No hay farmacias registradas.</p>
      ) : (
        <div className="space-y-3">
          {farmacias.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900">{item.nombre}</h3>
              {item.direccion && <p className="text-xs text-slate-600"><MapPin size={12} className="inline text-rose-600" /> {item.direccion}</p>}
              {item.telefono && <p className="text-xs text-slate-500"><Phone size={12} className="inline text-rose-600" /> {item.telefono}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VISTA INMOBILIARIA
// -------------------------------------------------------------
function VistaInmobiliaria() {
  const [inmuebles, setInmuebles] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase.from("especial1_inmobiliaria").select("*");
      if (!error && data) setInmuebles(data);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 max-w-md mx-auto">
      <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
        <Building size={20} className="text-rose-600" /> Inmobiliaria
      </h2>
      {cargando ? (
        <p className="text-xs text-slate-500 text-center py-8">Cargando inmuebles...</p>
      ) : inmuebles.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No hay inmuebles registrados.</p>
      ) : (
        <div className="space-y-3">
          {inmuebles.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900">{item.titulo || item.tipo_inmueble}</h3>
              <p className="text-xs text-slate-600">{item.descripcion}</p>
              {item.precio && <p className="text-xs font-bold text-rose-600">{item.precio} €</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// CONTENEDOR PRINCIPAL PWA
// -------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1">
        {activeTab === "home" && <VistaInicio setTab={setActiveTab} />}
        {activeTab === "market" && <VistaGuiaComercial />}
        {activeTab === "conso" && <VistaConso />}
        {activeTab === "tablon" && <VistaTablon />}
        {activeTab === "farmacias" && <VistaFarmacias />}
        {activeTab === "vivienda" && <VistaInmobiliaria />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === "home" ? "text-rose-600" : "text-slate-500"}`}>
            <span>🏠 Inicio</span>
          </button>
          <button onClick={() => setActiveTab("market")} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === "market" ? "text-rose-600" : "text-slate-500"}`}>
            <span>🏪 Guía</span>
          </button>
          <button onClick={() => setActiveTab("conso")} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === "conso" ? "text-rose-600" : "text-slate-500"}`}>
            <span>🤖 Conso</span>
          </button>
          <button onClick={() => setActiveTab("tablon")} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === "tablon" ? "text-rose-600" : "text-slate-500"}`}>
            <span>📋 Tablón</span>
          </button>
          <button onClick={() => setActiveTab("vivienda")} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === "vivienda" ? "text-rose-600" : "text-slate-500"}`}>
            <span>🏢 Inmo</span>
          </button>
        </div>
      </nav>
    </div>
  );
}