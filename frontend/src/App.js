import React, { useState, useEffect } from "react";
import { 
  Store, ShieldCheck, HeartHandshake, Send, Bot, User, Sparkles, 
  Trophy, QrCode, CheckCircle2, Lock, List, X, Compass, MapPin, Phone
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Configuración con el nuevo proyecto de Supabase
const supabaseUrl = 'https://gzvybwvrkplbipkzkjwg.supabase.co';
const supabaseKey = 'sb_publishable_nHxahamn3YALCGJM2zmI5Q_L6ug6oMN';
const supabase = createClient(supabaseUrl, supabaseKey);

// Base de datos de farmacias de guardia (2026)
const farmaciasGuardiaOficiales = {
  "2026-10-19": { farmacia: "Víctor Espada Varela", dir: "Álvarez Quintero, 55", tel: "954860257" },
  "2026-10-20": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" }
};

// -------------------------------------------------------------
// VISTA INICIO
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
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VISTA GUÍA COMERCIAL (Conectada correctamente a comercios_utrera)
// -------------------------------------------------------------
function VistaGuiaComercial() {
  const [comercios, setComercios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      console.log("Intentando conectar con Supabase (comercios_utrera)...");
      const { data, error } = await supabase.from("comercios_utrera").select("*");
      
      if (error) {
        console.error("Error al cargar de Supabase:", error);
      } else {
        console.log("Datos recibidos de Supabase:", data);
        if (data) setComercios(data);
      }
      setCargando(false);
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 p-4 max-w-md mx-auto">
      <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
        <Store size={20} className="text-rose-600" /> Guía Comercial de Utrera
      </h2>

      {cargando ? (
        <p className="text-xs text-slate-500 text-center py-8">Cargando registros de Supabase...</p>
      ) : comercios.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-xs text-slate-600 font-bold">No hay comercios registrados todavía.</p>
          <p className="text-[11px] text-slate-400 mt-1">Añade registros desde tu panel de Supabase o Admin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comercios.map((item) => (
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
// CONTENEDOR PRINCIPAL PWA
// -------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1">
        {activeTab === "home" && <VistaInicio setTab={setActiveTab} />}
        {activeTab === "market" && <VistaGuiaComercial />}
        {activeTab === "conso" && (
          <div className="p-4 text-center text-xs text-slate-600">Vista Conso activa</div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button onClick={() => setActiveTab("home")} className="flex flex-col items-center text-xs font-bold text-rose-600">
            <span>Inicio</span>
          </button>
          <button onClick={() => setActiveTab("market")} className="flex flex-col items-center text-xs font-bold text-slate-600">
            <span>Guía</span>
          </button>
        </div>
      </nav>
    </div>
  );
}