import { useEffect, useState } from "react";
import { api } from "../lib/api ";
import { AlertTriangle, CheckCircle2, TrafficCone } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const STATUS = {
  green:  { label: "Fluido",     bg: "bg-emerald-100 text-emerald-800",  Icon: CheckCircle2, dot: "bg-emerald-500" },
  yellow: { label: "Retenciones", bg: "bg-amber-100 text-amber-900",       Icon: TrafficCone,  dot: "bg-amber-500" },
  red:    { label: "Cortado",     bg: "bg-rose-100 text-rose-800",         Icon: AlertTriangle, dot: "bg-rose-500" },
};

export default function TrafficTicker() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/traffic").then((r) => setAlerts(r.data)).catch(() => {});
  }, []);

  const items = alerts.length ? alerts : [];
  const rail = [...items, ...items]; // duplicate for seamless marquee

  return (
    <section data-testid="traffic-alerts-banner" className="mt-3">
      <div className="flex items-center gap-2 px-1 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--terracotta)] live-dot" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          Tráfico en directo · Utrera
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-[color:var(--traffic-bg)]/60 dark:bg-amber-500/10">
        <div className="marquee-track flex gap-2 py-2.5 w-max whitespace-nowrap">
          {rail.map((a, i) => {
            const s = STATUS[a.status] || STATUS.yellow;
            const { Icon } = s;
            return (
              <button
                key={`${a.id}-${i}`}
                data-testid={`traffic-chip-${a.zone.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setOpen(a)}
                className={`inline-flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1 text-xs font-semibold ${s.bg} shrink-0`}
              >
                <span className="w-6 h-6 rounded-full bg-white/70 grid place-items-center">
                  <Icon size={12} />
                </span>
                <span className="font-display">{a.zone}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot} live-dot`} />
                <span className="opacity-80 font-normal">{a.message}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent data-testid="traffic-detail-dialog" className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{open?.zone}</DialogTitle>
            <DialogDescription className="text-base text-foreground/80 pt-1">
              {open?.message}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{open?.detail}</p>
          <p className="text-[11px] text-muted-foreground/70 font-mono">
            Actualizado: {open?.updated_at?.slice(0, 16).replace("T", " ")}
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
