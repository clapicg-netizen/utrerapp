import { Link } from "react-router-dom";
import {
  Cross, Ticket, Bus, Calendar, Tv, Newspaper, Sparkles, ArrowUpRight, Siren,
  ShoppingBag, Home as HomeIcon, Megaphone,
} from "lucide-react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import TrafficTicker from "@/components/app/TrafficTicker";

const MODULES = [
  { to: "/farmacias",  title: "Farmacias de Guardia", subtitle: "Turno actual y 24h", badge: "Abierta ahora", Icon: Cross,     tone: "emerald", testId: "module-card-farmacias" },
  { to: "/teatro",     title: "Teatro E. de la Cuadra", subtitle: "Cartelera y entradas", badge: "Próximo show", Icon: Ticket,   tone: "rose",    testId: "module-card-teatro" },
  { to: "/transporte", title: "Autobuses y Cercanías", subtitle: "Líneas urbanas y Renfe", badge: "Horarios en vivo", Icon: Bus, tone: "sky",     testId: "module-card-transporte" },
  { to: "/eventos",    title: "Agenda & Fiestas", subtitle: "Feria, cultura y deportes", badge: "3 destacados", Icon: Calendar,  tone: "amber",   testId: "module-card-eventos" },
  { to: "/utreratv",   title: "Utrera TV en Directo", subtitle: "Emisión local 24/7", badge: "EN DIRECTO", Icon: Tv,          tone: "red",     testId: "module-card-utreratv" },
  { to: "/noticias",   title: "Titulares de Utrera", subtitle: "Prensa y noticias locales", badge: "Última hora", Icon: Newspaper, tone: "indigo", testId: "module-card-noticias" },
  { to: "/urgencias",  title: "Urgencias Médicas", subtitle: "112 · Centros de salud · CHARE", badge: "24 horas", Icon: Siren, tone: "red", testId: "module-card-urgencias" },
  { to: "/market",     title: "Utrera Market", subtitle: "Las tiendas online de tu pueblo", badge: "Comercio local", Icon: ShoppingBag, tone: "amber", testId: "module-card-market" },
  { to: "/vivienda",   title: "Utrera Vivienda", subtitle: "Inmobiliaria, alquiler y garajes", badge: "Inmuebles", Icon: HomeIcon, tone: "sky", testId: "module-card-vivienda" },
  { to: "/tablon",     title: "Tablón de Anuncios", subtitle: "Compra, venta y servicios entre vecinos", badge: "Vecinal", Icon: Megaphone, tone: "emerald", testId: "module-card-tablon" },
];

const TONES = {
  emerald: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", icon: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300", ring: "before:bg-emerald-500/60" },
  rose:    { chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", icon: "bg-rose-500/12 text-rose-700 dark:text-rose-300", ring: "before:bg-rose-500/60" },
  sky:     { chip: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", icon: "bg-sky-500/12 text-sky-700 dark:text-sky-300", ring: "before:bg-sky-500/60" },
  amber:   { chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", icon: "bg-amber-500/12 text-amber-800 dark:text-amber-300", ring: "before:bg-amber-500/60" },
  red:     { chip: "bg-red-600 text-white", icon: "bg-red-500/15 text-red-600 dark:text-red-300", ring: "before:bg-red-500/60" },
  indigo:  { chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300", icon: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300", ring: "before:bg-indigo-500/60" },
};

export default function Home() {
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

      {/* Conso hero card */}
      <Link
        to="/conso"
        data-testid="conso-ai-card"
        className="tile group relative mt-4 block rounded-3xl overflow-hidden border border-border/70 bg-gradient-to-br from-[#1C2026] to-[#2D1810] dark:from-[#0F1114] dark:to-[#2C1207] text-white p-5 shadow-md"
      >
        <div className="absolute inset-0 grain pointer-events-none opacity-60" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[color:var(--terracotta)] grid place-items-center shadow-lg shrink-0">
            <Sparkles size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/70">
                Asistente Conso · IA local
              </p>
            </div>
            <p className="font-display font-extrabold text-xl leading-tight mt-1">
              Pregúntame lo que sea de Utrera
            </p>
            <p className="text-sm text-white/70 mt-1">
              Farmacias, tráfico, feria, horarios de Renfe… te respondo al momento.
            </p>
          </div>
          <ArrowUpRight size={22} className="opacity-70 group-hover:opacity-100 shrink-0" />
        </div>

        <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {[
            "¿Qué farmacia está de guardia hoy?",
            "¿Cómo va el tráfico en Trianilla?",
            "Próximo tren a Sevilla",
            "Cartelera del Teatro",
          ].map((q) => (
            <span
              key={q}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90"
            >
              {q}
            </span>
          ))}
        </div>
      </Link>

      {/* Modules */}
      <div className="mt-6 flex items-center justify-between px-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Servicios locales
        </p>
        <p className="text-[11px] text-muted-foreground">10 módulos</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2" data-testid="modules-grid">
        {MODULES.map(({ to, title, subtitle, badge, Icon, tone, testId }) => {
          const t = TONES[tone];
          return (
            <Link
              key={to}
              to={to}
              data-testid={testId}
              className="tile relative rounded-2xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[10.5rem] overflow-hidden"
            >
              <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${t.icon} opacity-40 pointer-events-none`} />
              <div className="relative flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl grid place-items-center ${t.icon}`}>
                  <Icon size={20} strokeWidth={2.2} />
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
