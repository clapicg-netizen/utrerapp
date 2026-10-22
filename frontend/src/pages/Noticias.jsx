import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "../lib/api";
import { Newspaper, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SOURCE_COLORS = {
  "Utrera al Día": "bg-rose-100 text-rose-700",
  "Utrera Información": "bg-indigo-100 text-indigo-700",
  "Diario de Utrera": "bg-emerald-100 text-emerald-700",
  "Sevilla Este": "bg-amber-100 text-amber-800",
};

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/news").then((r) => setNews(r.data));
  }, []);

  const sources = [...new Set(news.map((n) => n.source))];

  return (
    <div className="app-shell" data-testid="noticias-page">
      <TopBar title="Titulares de Utrera" back testId="noticias-topbar" />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar" data-testid="news-sources">
        <span className="text-[11px] px-3 py-1.5 rounded-full bg-[color:var(--terracotta)] text-white font-semibold shrink-0">
          Todos
        </span>
        {sources.map((s) => (
          <span key={s} className="text-[11px] px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border/60 shrink-0">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-2.5" data-testid="news-list">
        {news.map((n) => (
          <button
            key={n.id}
            data-testid={`news-item-${n.id}`}
            onClick={() => setOpen(n)}
            className="w-full text-left rounded-2xl border border-border/70 bg-card p-4 tile flex gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta)] grid place-items-center shrink-0">
              <Newspaper size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[n.source] || "bg-muted"}`}>
                  {n.source}
                </span>
                <span className="text-[10px] text-muted-foreground">{n.category}</span>
              </div>
              <h3 className="font-display font-bold text-[14px] leading-tight mt-1.5">{n.headline}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono flex items-center gap-1">
                <Clock size={10} /> {n.published_at.slice(0, 10)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent data-testid="news-dialog" className="rounded-3xl max-w-md">
          <DialogHeader>
            <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[open?.source] || "bg-muted"}`}>
              {open?.source}
            </span>
            <DialogTitle className="font-display text-lg leading-tight mt-1.5">
              {open?.headline}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/80 pt-2 leading-relaxed">
              {open?.summary}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Este titular es una vista previa. Pulsa para abrir la nota completa en el medio original.
          </p>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
