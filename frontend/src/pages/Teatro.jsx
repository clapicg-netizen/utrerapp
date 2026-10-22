import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "./lib/Api";
import { Ticket, CalendarDays, Clock, Euro } from "lucide-react";
import { toast } from "sonner";

export default function Teatro() {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    api.get("/theater").then((r) => setShows(r.data));
  }, []);

  return (
    <div className="app-shell" data-testid="teatro-page">
      <TopBar title="Teatro Enrique de la Cuadra" back testId="teatro-topbar" />

      <div className="mt-4 rounded-3xl overflow-hidden relative h-40 shadow-md" data-testid="teatro-hero">
        <img
          src="https://images.unsplash.com/photo-1761359841098-8e84b7cf3661?crop=entropy&cs=srgb&fm=jpg&w=800&q=80"
          alt="Teatro"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80">Cartelera 2026</p>
          <h2 className="font-display font-extrabold text-xl leading-tight">Enrique de la Cuadra</h2>
          <p className="text-xs text-white/80">C/ Rodrigo Caro, 16 · Utrera</p>
        </div>
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Próximos espectáculos
      </p>

      <div className="space-y-3" data-testid="theater-list">
        {shows.map((s) => (
          <div
            key={s.id}
            data-testid={`show-item-${s.id}`}
            className="rounded-2xl border border-border/70 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--theater)]/12 text-[color:var(--theater)]">
                  {s.genre}
                </span>
                <h3 className="font-display font-bold text-base mt-1.5 leading-tight">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-[color:var(--theater)]/10 text-[color:var(--theater)] grid place-items-center shrink-0">
                <Ticket size={22} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {s.date}</span>
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {s.time}</span>
              <span className="inline-flex items-center gap-1"><Euro size={12} /> {s.price}</span>
            </div>
            <button
              data-testid={`buy-ticket-${s.id}`}
              onClick={() => toast.success("Entrada reservada", { description: `${s.title} · ${s.date} ${s.time}` })}
              className="mt-3 w-full py-2.5 rounded-full text-sm font-semibold bg-[color:var(--theater)] hover:opacity-90 text-white"
            >
              Reservar entrada
            </button>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
