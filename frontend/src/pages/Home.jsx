import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Trophy, Sparkles, X } from "lucide-react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import TrafficTicker from "@/components/app/TrafficTicker";

const MODULES = [
  { to: "/farmacias",  title: "Farmacias de Guardia", subtitle: "Turno actual y 24h", badge: "Abierta ahora", icon: "💊", tone: "emerald", testId: "module-card-farmacias" },
  { to: "/teatro",     title: "Teatro E. de la Cuadra", subtitle: "Cartelera y entradas", badge: "Próximo show", icon: "🎟️", tone: "rose",    testId: "module-card-teatro" },
  { to: "/transporte", title: "Autobuses y Cercanías", subtitle: "Líneas urbanas y Renfe", badge: "Horarios en vivo", icon: "🚌", tone: "sky",     testId: "module-card-transporte" },
  { to: "/eventos",    title: "Agenda & Fiestas", subtitle: "Feria, cultura y deportes", badge: "3 destacados", icon: "📅", tone: "amber",   testId: "module-card-eventos" },
  { to: "/utreratv",   title: "Utrera TV en Directo", subtitle: "Emisión local 24/7", badge: "EN DIRECTO", icon: "📺", tone: "red",     testId: "module-card-utreratv" },
  { to: "/noticias",   title: "Titulares de Utrera", subtitle: "Prensa y noticias locales", badge: "Última hora", icon: "📰", tone: "indigo", testId: "module-card-noticias" },
  { to: "/urgencias",  title: "Urgencias Médicas", subtitle: "112 · Centros de salud · CHARE", badge: "24 horas", icon: "🚨", tone: "red", testId: "module-card-urgencias" },
  { to: "/market",     title: "Utrera Market", subtitle: "Las tiendas online de tu pueblo", badge: "Comercio local", icon: "🛍️", tone: "amber", testId: "module-card-market" },
  { to: "/vivienda",   title: "Utrera Vivienda", subtitle: "Inmobiliaria, alquiler y garajes", badge: "Inmuebles", icon: "🏠", tone: "sky", testId: "module-card-vivienda" },
  { to: "/tablon",     title: "Tablón de Anuncios", subtitle: "Compra, venta y servicios entre vecinos", badge: "Vecinal", icon: "📢", tone: "emerald", testId: "module-card-tablon" },
  { to: "/bares",      title: "Utrera Bares & Tapas", subtitle: "Tapeo, carta digital y pedidos", badge: "Recomendados", icon: "🍺", tone: "amber", testId: "module-card-bares" },
];

const TONES = {
  emerald: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", icon: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  rose:    { chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", icon: "bg-rose-500/12 text-rose-700 dark:text-rose-300" },
  sky:     { chip: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", icon: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  amber:   { chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", icon: "bg-amber-500/12 text-amber-800 dark:text-amber-300" },
  red:     { chip: "bg-red-600 text-white", icon: "bg-red-500/15 text-red-600 dark:text-red-300" },
  indigo:  { chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300", icon: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300" },
};

export default function Home() {
  const [showRules, setShowRules] = useState(false);
  const hh = new Date().getHours();
  const greet = hh < 6 ? "Buenas noches" : hh < 14 ? "Buenos días" : hh < 21 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="app-shell" data-testid="home-page">
      <TopBar title="Utrerapp" testId="home-topbar" />

      <TrafficTicker />

      {/* Greeting */}
      <div className="mt-5" data-testid="home-greeting">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          {greet}, utrerano/a
        </p>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight mt-1">
          Todo lo que <span className="text-[color:var(--terracotta)]">pasa en Utrera</span>,
          en tu bolsillo.
        </h2>
      </div>

      {/* Tarjeta Destacada Principal: La Búsqueda del Mostachón */}
      <div className="tile group relative mt-4 block rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#3D200F] to-[#1C0D05] text-white p-5 shadow-md">
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 grid place-items-center text-2xl shadow-lg shrink-0">
            🍩
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 live-dot" />
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-amber-300">
                Juego Local · Utrerapp
              </p>
            </div>
            <p className="font-display font-extrabold text-xl leading-tight mt-1">
              La Búsqueda del Mostachón
            </p>
            <p className="text-sm text-white/70 mt-1">
              Escanea códigos en bares, acumula puntos y compite en el Ranking.
            </p>
          </div>
        </div>

        {/* Dos botones de acción */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => setShowRules(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white text-center transition flex items-center justify-center gap-1.5"
          >
            📜 Reglas & Premios
          </button>
          <a
            href="https://clapicg-netizen.github.io/la-busqueda-del-mostachon/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 text-center flex items-center justify-center gap-1 shadow-md transition"
          >
            🔎 ¡JUGAR! <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Modal Ventana de Reglas y Premios */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1C1410] border border-amber-500/30 p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-wider">
              <Trophy size={16} /> Bases del Juego
            </div>
            <h3 className="text-xl font-extrabold mt-1 text-white">Reglas & Premios</h3>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-white/80 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-amber-300 text-sm mb-1">📜 ¿Cómo jugar?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Acércate:</strong> Ve a menos de 6m de los puntos del mapa.</li>
                  <li><strong>Escanea:</strong> Busca el cartel QR en bares colaboradores.</li>
                  <li><strong>Suma:</strong> +10 pts por monumentos, +30 pts por bares.</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="font-bold text-amber-300 text-sm mb-1">🎁 Premios</p>
                <p className="italic text-amber-200/90">
                  Cada mes se informará de los premios correspondientes para los primeros clasificados del Ranking.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-5 w-full py-3 rounded-xl bg-amber-500 font-bold text-slate-950 text-xs uppercase tracking-wider"
            >
              ¡Entendido, a buscar!
            </button>
          </div>
        </div>
      )}

      {/* Modules */}
      <div className="mt-6 flex items-center justify-between px-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Servicios locales
        </p>
        <p className="text-[11px] text-muted-foreground">11 módulos</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2" data-testid="modules-grid">
        {MODULES.map(({ to, title, subtitle, badge, icon, tone, testId }) => {
          const t = TONES[tone];
          return (
            <Link
              key={to}
              to={to}
              data-testid={testId}
              className="tile relative rounded-2xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[10.5rem] overflow-hidden"
            >
              <div className="relative flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl grid place-items-center text-xl ${t.icon}`}>
                  {icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.chip}`}>
                  {badge}
                </span>
              </div>
              <div className="relative mt-3">
                <h3 className="font-display font-bold text-[15px] leading-tight">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 mb-4 text-center text-[11px] text-muted-foreground">
        Hecho en Utrera · v1.0 · <Link to="/admin" data-testid="footer-admin-link" className="underline">Panel</Link>
      </p>

      <BottomNav />
    </div>
  );
}