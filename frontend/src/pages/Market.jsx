import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { Shirt, Utensils, Dumbbell, Sofa, Store, ExternalLink } from "lucide-react";

const CATEGORIES = [
  { id: "moda", label: "Moda", Icon: Shirt, tone: "rose" },
  { id: "alimentacion", label: "Alimentación", Icon: Utensils, tone: "amber" },
  { id: "deportes", label: "Deportes", Icon: Dumbbell, tone: "sky" },
  { id: "hogar", label: "Hogar", Icon: Sofa, tone: "emerald" },
];

const SHOPS = {
  moda: [
    { name: "Boutique Trianilla", desc: "Moda mujer y complementos artesanos.", url: "https://google.com/search?q=Boutique+Trianilla+Utrera", tag: "Envío gratis > 30€" },
    { name: "Zapatería Utrera Kids", desc: "Calzado infantil y comuniones.", url: "https://google.com/search?q=zapateria+utrera+kids", tag: "Novedad" },
    { name: "El Rincón Flamenco", desc: "Trajes de flamenca y complementos de feria.", url: "https://google.com/search?q=el+rincon+flamenco+utrera" },
  ],
  alimentacion: [
    { name: "Aceite Utrera Verde", desc: "AOVE del Corbones directo del molino.", url: "https://google.com/search?q=aceite+utrera+verde", tag: "Local" },
    { name: "Mostachones El Altozano", desc: "Mostachones y bollería tradicional envío 24h.", url: "https://google.com/search?q=mostachones+utrera" },
    { name: "Bodega Salado", desc: "Vinos, manzanilla y jamón ibérico.", url: "https://google.com/search?q=bodega+salado+utrera" },
  ],
  deportes: [
    { name: "Deportes Utrera Sport", desc: "Fútbol, running y padel. Recogida en tienda.", url: "https://google.com/search?q=deportes+utrera+sport" },
    { name: "Ciclos El Palmar", desc: "Bicis eléctricas y montaña. Servicio taller.", url: "https://google.com/search?q=ciclos+el+palmar+utrera", tag: "Taller propio" },
  ],
  hogar: [
    { name: "Muebles Consolación", desc: "Muebles a medida y decoración.", url: "https://google.com/search?q=muebles+consolacion+utrera" },
    { name: "Electrodomésticos Vega", desc: "Instalación gratuita en Utrera y comarca.", url: "https://google.com/search?q=electrodomesticos+vega+utrera", tag: "Instalación" },
    { name: "Ferretería La Manzanilla", desc: "Bricolaje y jardín. Envío al día.", url: "https://google.com/search?q=ferreteria+la+manzanilla+utrera" },
  ],
};

const TONES = {
  rose: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

export default function Market() {
  const [cat, setCat] = useState("moda");
  const list = SHOPS[cat] || [];
  const active = CATEGORIES.find((c) => c.id === cat);

  return (
    <div className="app-shell" data-testid="market-page">
      <TopBar title="Utrera Market" back testId="market-topbar" />

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#1C2026] to-[#3B1F14] text-white p-5 relative overflow-hidden shadow-md" data-testid="market-hero">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[color:var(--terracotta)] grid place-items-center">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/70">
              Comercio local
            </p>
            <p className="font-display font-extrabold text-xl leading-tight">
              Las tiendas online de tu pueblo
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" data-testid="market-categories">
        {CATEGORIES.map(({ id, label, Icon, tone }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            data-testid={`market-cat-${id}`}
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
        {active?.label} · {list.length} comercios
      </p>

      <div className="space-y-2.5" data-testid="market-list">
        {list.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            data-testid={`market-shop-${s.name.replace(/\s+/g, "-").toLowerCase()}`}
            className="tile rounded-2xl border border-border/70 bg-card p-4 flex gap-3 items-start"
          >
            <div className={`w-11 h-11 rounded-xl grid place-items-center ${TONES[active?.tone || "rose"]}`}>
              <Store size={19} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-[14px] truncate">{s.name}</h3>
                {s.tag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--secondary)]/25 text-[color:var(--terracotta-dark)]">
                    {s.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
            <ExternalLink size={16} className="text-muted-foreground shrink-0 mt-1" />
          </a>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
