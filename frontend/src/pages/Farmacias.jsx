import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import { Phone, MapPin, Clock, Cross } from "lucide-react";

export default function Farmacias() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/pharmacies").then((r) => setItems(r.data));
  }, []);

  const duty = items.find((p) => p.on_duty_today);
  const rest = items.filter((p) => p.id !== duty?.id);

  return (
    <div className="app-shell" data-testid="farmacias-page">
      <TopBar title="Farmacias de Guardia" back testId="farmacias-topbar" />

      {duty && (
        <section
          data-testid="pharmacy-duty-card"
          className="mt-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 relative overflow-hidden shadow-md"
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 live-dot" />
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/80">
              De guardia ahora
            </p>
          </div>
          <h2 className="font-display font-extrabold text-2xl leading-tight mt-1 relative">
            {duty.name}
          </h2>
          <p className="text-sm text-white/85 mt-2 flex items-center gap-2 relative">
            <MapPin size={14} /> {duty.address}
          </p>
          <p className="text-sm text-white/85 mt-1 flex items-center gap-2 relative">
            <Clock size={14} /> {duty.hours}
          </p>
          <div className="mt-4 flex gap-2 relative">
            <a
              href={`tel:${duty.phone.replace(/\s/g, "")}`}
              data-testid="pharmacy-call-btn"
              className="flex-1 bg-white text-emerald-800 font-semibold text-sm rounded-full px-4 py-2.5 flex items-center justify-center gap-2"
            >
              <Phone size={16} /> {duty.phone}
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(duty.address + ", Utrera")}`}
              target="_blank"
              rel="noreferrer"
              data-testid="pharmacy-map-btn"
              className="px-4 py-2.5 bg-white/15 border border-white/25 rounded-full text-sm font-semibold flex items-center gap-2"
            >
              <MapPin size={16} /> Mapa
            </a>
          </div>
        </section>
      )}

      <p className="mt-6 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Otras farmacias
      </p>
      <div className="space-y-2.5" data-testid="pharmacy-list">
        {rest.map((p) => (
          <div
            key={p.id}
            data-testid={`pharmacy-item-${p.id}`}
            className="rounded-2xl border border-border/70 bg-card p-4 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 grid place-items-center shrink-0">
              <Cross size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-[14px] truncate">{p.name}</p>
                {p.is_24h && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">24H</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{p.address}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.hours}</p>
            </div>
            <a
              href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 grid place-items-center"
            >
              <Phone size={16} />
            </a>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
