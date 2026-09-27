import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

export default function Eventos() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api.get("/events").then((r) => setEvents(r.data));
  }, []);

  const highlighted = events.filter((e) => e.highlighted);
  const rest = events.filter((e) => !e.highlighted);

  return (
    <div className="app-shell" data-testid="eventos-page">
      <TopBar title="Agenda & Fiestas" back testId="eventos-topbar" />

      <p className="mt-4 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Destacados de Utrera
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar" data-testid="highlighted-events">
        {highlighted.map((e) => (
          <div
            key={e.id}
            data-testid={`event-highlight-${e.id}`}
            className="shrink-0 w-64 rounded-2xl bg-gradient-to-br from-[color:var(--terracotta)] to-[color:var(--terracotta-dark)] text-white p-4 shadow-md"
          >
            <div className="flex items-center gap-1.5">
              <Star size={12} fill="currentColor" />
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/80">{e.category}</p>
            </div>
            <h3 className="font-display font-extrabold text-lg leading-tight mt-1.5">{e.title}</h3>
            <p className="text-xs text-white/85 mt-2">{e.description}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-white/90 font-mono">
              <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {e.date}</span>
            </div>
            <p className="text-[11px] text-white/75 mt-1 flex items-center gap-1"><MapPin size={11} /> {e.location}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Todos los eventos
      </p>

      <div className="space-y-2.5">
        {rest.map((e) => (
          <div
            key={e.id}
            data-testid={`event-item-${e.id}`}
            className="rounded-2xl border border-border/70 bg-card p-4 flex gap-3"
          >
            <div className="w-14 shrink-0 text-center rounded-xl bg-[color:var(--secondary)]/25 border border-[color:var(--secondary)]/40 py-2">
              <p className="font-display font-extrabold text-lg leading-none text-[color:var(--terracotta-dark)]">
                {e.date.slice(8, 10)}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                {new Date(e.date).toLocaleString("es-ES", { month: "short" }).replace(".", "")}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">{e.category}</span>
              <h3 className="font-display font-bold text-[14px] mt-1 leading-tight">{e.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.description}</p>
              <p className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1"><MapPin size={11} /> {e.location}</p>
            </div>
            <button
              data-testid={`event-calendar-${e.id}`}
              onClick={() => toast.success("Añadido al calendario", { description: e.title })}
              className="self-center w-9 h-9 rounded-full bg-muted hover:bg-muted/70 grid place-items-center"
            >
              <CalendarDays size={16} />
            </button>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
