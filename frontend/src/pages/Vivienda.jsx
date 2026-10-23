import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "../lib/api ";
import { mergeWithLocal, safeImg, telHref, mapsHref } from "../lib/localStore";
import { Home as HomeIcon, KeyRound, Car, Building2, MapPin, BedDouble, Euro, Phone } from "lucide-react";

const CATS = [
  { id: "venta", label: "Venta", Icon: HomeIcon, tone: "rose" },
  { id: "alquiler", label: "Alquiler", Icon: KeyRound, tone: "sky" },
  { id: "garajes", label: "Garajes", Icon: Car, tone: "amber" },
  { id: "locales", label: "Locales", Icon: Building2, tone: "emerald" },
];

const TONES = {
  rose: "bg-rose-500/12 text-rose-600",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

export default function Vivienda() {
  const [cat, setCat] = useState("venta");
  const [all, setAll] = useState([]);
  const active = CATS.find((c) => c.id === cat);

  const load = async () => {
    try {
      const r = await api.get(`/inmuebles`);
      setAll(mergeWithLocal("/inmuebles", r.data));
    } catch {
      setAll(mergeWithLocal("/inmuebles", []));
    }
  };
  useEffect(() => { load(); }, []);

  const items = useMemo(() => all.filter((x) => x.tipo === cat), [all, cat]);

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
        {active?.label} · {items.length} inmuebles
      </p>

      <div className="space-y-2.5" data-testid="vivienda-list">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No hay inmuebles publicados en esta categoría.
          </div>
        )}
        {items.map((l) => {
          const img = safeImg(l.foto);
          const map = mapsHref(l.zona);
          const tel = telHref(l.telefono);
          return (
            <div
              key={l.id}
              data-testid={`vivienda-item-${l.id}`}
              className="tile rounded-2xl border border-border/70 bg-card overflow-hidden"
            >
              {img && (
                <img src={img} alt={l.titulo} onError={(e)=>{e.currentTarget.style.display="none";}} className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {l.agencia && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">
                        {l.agencia}
                      </span>
                    )}
                    <h3 className="font-display font-bold text-[14px] mt-1.5 leading-tight">{l.titulo}</h3>
                    {l.zona && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin size={11} /> {l.zona}
                      </p>
                    )}
                  </div>
                  <p className="font-display font-extrabold text-[color:var(--terracotta)] text-base leading-none flex items-center gap-0.5 shrink-0">
                    <Euro size={13} /> {String(l.precio || "").replace("€", "").trim()}
                  </p>
                </div>
                {l.descripcion && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{l.descripcion}</p>
                )}
                {(l.dorm || l.m2) && (
                  <div className="mt-2.5 flex gap-3 text-xs text-muted-foreground font-mono">
                    {l.dorm ? (
                      <span className="inline-flex items-center gap-1"><BedDouble size={11} /> {l.dorm} dorm.</span>
                    ) : null}
                    {l.m2 ? <span>· {l.m2} m²</span> : null}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {tel && (
                    <a
                      href={tel}
                      data-testid={`vivienda-call-${l.id}`}
                      className="py-2 rounded-full bg-[color:var(--transit)] hover:opacity-90 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <Phone size={13} /> Llamar
                    </a>
                  )}
                  {map && (
                    <a
                      href={map}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`vivienda-map-${l.id}`}
                      className="py-2 rounded-full bg-emerald-600 hover:opacity-90 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <MapPin size={13} /> Cómo llegar
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
