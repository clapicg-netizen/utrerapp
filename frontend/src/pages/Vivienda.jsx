import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { Home as HomeIcon, KeyRound, Car, Building2, MapPin, BedDouble, Euro, ExternalLink } from "lucide-react";

const CATS = [
  { id: "venta", label: "Venta", Icon: HomeIcon, tone: "rose" },
  { id: "alquiler", label: "Alquiler", Icon: KeyRound, tone: "sky" },
  { id: "garajes", label: "Garajes", Icon: Car, tone: "amber" },
  { id: "locales", label: "Locales", Icon: Building2, tone: "emerald" },
];

const LISTINGS = {
  venta: [
    { title: "Piso 3 dorm. junto al Altozano", zone: "Centro", price: "148.000€", beds: 3, m2: 92, agency: "Inmobiliaria Utrera Centro", url: "https://google.com/search?q=piso+venta+utrera+altozano" },
    { title: "Chalet adosado con piscina", zone: "Salesianos", price: "245.000€", beds: 4, m2: 180, agency: "Ficasa Utrera", url: "https://google.com/search?q=chalet+adosado+utrera" },
    { title: "Casa histórica rehabilitada", zone: "Casco Antiguo", price: "195.000€", beds: 3, m2: 140, agency: "Alcántara Fincas", url: "https://google.com/search?q=casa+historica+utrera" },
  ],
  alquiler: [
    { title: "Ático amueblado con terraza", zone: "Trianilla", price: "650€/mes", beds: 2, m2: 78, agency: "Grupo Consolación", url: "https://google.com/search?q=alquiler+atico+utrera" },
    { title: "Piso económico cerca de la estación", zone: "Estación", price: "480€/mes", beds: 2, m2: 65, agency: "Inmobiliaria Utrera Centro", url: "https://google.com/search?q=alquiler+piso+utrera+renfe" },
    { title: "Estudio para estudiantes", zone: "Centro", price: "380€/mes", beds: 1, m2: 40, agency: "Alcántara Fincas", url: "https://google.com/search?q=alquiler+estudio+utrera" },
  ],
  garajes: [
    { title: "Plaza de garaje cubierta", zone: "Trianilla", price: "55€/mes", agency: "Particular · Utrera", url: "https://google.com/search?q=alquiler+garaje+utrera+trianilla" },
    { title: "Garaje doble en venta", zone: "Salesianos", price: "18.000€", agency: "Ficasa Utrera", url: "https://google.com/search?q=venta+garaje+utrera" },
  ],
  locales: [
    { title: "Local comercial a pie de calle", zone: "C/ Ancha", price: "900€/mes", m2: 90, agency: "Grupo Consolación", url: "https://google.com/search?q=alquiler+local+utrera+ancha" },
    { title: "Nave industrial polígono El Torno", zone: "Pol. El Torno", price: "1.500€/mes", m2: 400, agency: "Inmobiliaria Utrera Centro", url: "https://google.com/search?q=alquiler+nave+poligono+torno+utrera" },
  ],
};

const TONES = {
  rose: "bg-rose-500/12 text-rose-600",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

export default function Vivienda() {
  const [cat, setCat] = useState("venta");
  const active = CATS.find((c) => c.id === cat);
  const list = LISTINGS[cat] || [];

  return (
    <div className="app-shell" data-testid="vivienda-page">
      <TopBar title="Utrera Vivienda" back testId="vivienda-topbar" />

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#0F2A3F] to-[#1E6091] text-white p-5 relative overflow-hidden shadow-md" data-testid="vivienda-hero">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 grid place-items-center">
            <HomeIcon size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/75">
              Inmobiliaria local
            </p>
            <p className="font-display font-extrabold text-xl leading-tight">
              Vivir en Utrera, más fácil
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" data-testid="vivienda-categories">
        {CATS.map(({ id, label, Icon, tone }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            data-testid={`vivienda-cat-${id}`}
            className={`rounded-2xl border p-2.5 flex flex-col items-center gap-1.5 tile ${
              cat === id
                ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/8"
                : "border-border/70 bg-card"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl grid place-items-center ${TONES[tone]}`}>
              <Icon size={16} />
            </div>
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        {active?.label} · {list.length} inmuebles
      </p>

      <div className="space-y-2.5" data-testid="vivienda-list">
        {list.map((l, i) => (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            data-testid={`vivienda-item-${i}`}
            className="tile rounded-2xl border border-border/70 bg-card p-4 block"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">{l.agency}</span>
                <h3 className="font-display font-bold text-[14px] mt-1.5 leading-tight">{l.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin size={11} /> {l.zone}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-extrabold text-[color:var(--terracotta)] text-base leading-none flex items-center gap-0.5 justify-end">
                  <Euro size={13} /> {l.price.replace("€", "").trim()}
                </p>
                <ExternalLink size={14} className="mt-1.5 ml-auto text-muted-foreground" />
              </div>
            </div>
            {(l.beds || l.m2) && (
              <div className="mt-2.5 flex gap-3 text-xs text-muted-foreground font-mono">
                {l.beds && (
                  <span className="inline-flex items-center gap-1"><BedDouble size={11} /> {l.beds} dorm.</span>
                )}
                {l.m2 && <span>· {l.m2} m²</span>}
              </div>
            )}
          </a>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
