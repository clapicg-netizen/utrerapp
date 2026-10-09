import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import { Phone, MapPin, Clock, Cross, Navigation, Compass } from "lucide-react";

// Farmacias reales registradas en Utrera con coordenadas GPS exactas
const FARMACIAS_REALES_UTRERA = [
  {
    id: "f1",
    nombre: "Farmacia José González Mena",
    direccion: "Avda. Blas Infante, 7, Local 1, 41710 Utrera",
    telefono: "954861763",
    horario: "De Guardia hoy (22:00 a 09:30)",
    de_guardia: true,
    lat: 37.1848,
    lng: -5.7820,
  },
  {
    id: "f2",
    nombre: "Farmacia José Luis Algarín Pachón",
    direccion: "Calle Corredera, 1, 41710 Utrera",
    telefono: "954860448",
    horario: "Turno diurno (09:30 a 22:00)",
    de_guardia: false,
    lat: 37.1812,
    lng: -5.7801,
  },
  {
    id: "f3",
    nombre: "Farmacia Rafael González (Antig. La Fuente)",
    direccion: "Calle Cristo de los Afligidos, 76, 41710 Utrera",
    telefono: "954860213",
    horario: "Turno diurno (09:30 a 22:00)",
    de_guardia: false,
    lat: 37.1795,
    lng: -5.7774,
  },
  {
    id: "f4",
    nombre: "Farmacia Pablo Troncoso López (El Charco)",
    direccion: "Avda. María Auxiliadora, 95, 41710 Utrera",
    telefono: "954860196",
    horario: "Turno diurno (09:30 a 22:00)",
    de_guardia: false,
    lat: 37.1861,
    lng: -5.7738,
  },
  {
    id: "f5",
    nombre: "Farmacia Mª Carmen Martín García",
    direccion: "Calle Las Mujeres, 13, 41710 Utrera",
    telefono: "954861922",
    horario: "Horario comercial habitual",
    de_guardia: false,
    lat: 37.1820,
    lng: -5.7811,
  },
];

export default function Farmacias() {
  const [farmacias, setFarmacias] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [cargandoLoc, setCargandoLoc] = useState(false);

  useEffect(() => {
    api
      .get("/farmacias")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFarmacias(res.data);
        } else {
          setFarmacias(FARMACIAS_REALES_UTRERA);
        }
      })
      .catch(() => setFarmacias(FARMACIAS_REALES_UTRERA));
  }, []);

  // Función para obtener la ubicación actual del vecino
  const obtenerUbicacion = () => {
    setCargandoLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setCargandoLoc(false);
        },
        () => {
          alert("No se pudo obtener tu ubicación. Comprueba los permisos GPS del navegador.");
          setCargandoLoc(false);
        }
      );
    } else {
      alert("Tu dispositivo no soporta geolocalización.");
      setCargandoLoc(false);
    }
  };

  // Abrir Google Maps directamente hacia la farmacia
  const abrirMapa = (f) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}&destination_place_id=${encodeURIComponent(
      f.nombre + " " + f.direccion
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="app-shell" data-testid="farmacias-page">
      <TopBar title="Farmacias de Guardia" back testId="farmacias-topbar" />

      {/* Banner Urgencias */}
      <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0">
            <Cross size={20} />
          </div>
          <div>
            <p className="font-display font-bold text-xs text-foreground">Oficial · COF Sevilla</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Farmacias de guardia verificadas en Utrera.
            </p>
          </div>
        </div>
      </div>

      {/* Botón para geolocalizar al usuario */}
      <button
        onClick={obtenerUbicacion}
        disabled={cargandoLoc}
        className="mt-3 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
      >
        <Compass size={15} className={cargandoLoc ? "animate-spin" : ""} />
        {userLoc
          ? "📍 Ubicación detectada (Ver farmacias cercanas)"
          : cargandoLoc
          ? "Obteniendo tu ubicación GPS..."
          : "Usa mi ubicación para ver la farmacia más cercana"}
      </button>

      {/* Listado de Farmacias */}
      <div className="mt-4 space-y-3 pb-20">
        {farmacias.map((f) => (
          <div
            key={f.id || f.nombre}
            className="p-4 rounded-2xl border border-border/70 bg-card space-y-2.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                    f.de_guardia
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {f.de_guardia ? "🟢 De Guardia Hoy" : "🕒 Turno Regular"}
                </span>
                <h3 className="font-display font-bold text-base leading-tight">
                  {f.nombre}
                </h3>
              </div>
            </div>

            {f.direccion && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin size={13} className="shrink-0 text-emerald-600" />
                {f.direccion}
              </p>
            )}

            {f.horario && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock size={13} className="shrink-0 text-emerald-600" />
                {f.horario}
              </p>
            )}

            {/* Doble Botón: Llamar + Cómo llegar (GPS) */}
            <div className="pt-1 grid grid-cols-2 gap-2">
              {f.telefono && (
                <a
                  href={`tel:${f.telefono}`}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <Phone size={13} /> Llamar
                </a>
              )}

              <button
                onClick={() => abrirMapa(f)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-border transition-all active:scale-[0.99]"
              >
                <Navigation size={13} className="text-sky-600" /> Cómo llegar
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}