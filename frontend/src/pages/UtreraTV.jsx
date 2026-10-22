import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "./lib/Api";
import { Play, Radio } from "lucide-react";

export default function UtreraTV() {
  const [channels, setChannels] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/tv").then((r) => {
      setChannels(r.data);
      setActive(r.data[0]);
    });
  }, []);

  if (!active) return null;

  return (
    <div className="app-shell" data-testid="utreratv-page">
      <TopBar title="Utrera TV" back testId="utreratv-topbar" />

      <div className="mt-4 relative rounded-3xl overflow-hidden aspect-video bg-black shadow-md" data-testid="tv-player">
        <img
          src="https://images.unsplash.com/photo-1549643276-fdf2fab574f5?crop=entropy&cs=srgb&fm=jpg&w=800&q=80"
          alt="Utrera"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" /> En directo
        </div>
        <button
          data-testid="tv-play-btn"
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/95 grid place-items-center shadow-lg"
        >
          <Play size={26} fill="black" className="ml-1" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/75">Ahora</p>
          <p className="font-display font-bold text-base leading-tight">{active.now_playing}</p>
          <p className="text-xs text-white/75 mt-0.5">A continuación · {active.next_show}</p>
        </div>
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Canales locales
      </p>
      <div className="grid grid-cols-2 gap-3" data-testid="tv-channels">
        {channels.map((c) => (
          <button
            key={c.id}
            data-testid={`tv-channel-${c.id}`}
            onClick={() => setActive(c)}
            className={`text-left rounded-2xl border p-4 tile ${
              active.id === c.id
                ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/6"
                : "border-border/70 bg-card"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-500/12 text-red-600 grid place-items-center">
                <Radio size={17} />
              </div>
              <div>
                <p className="font-display font-bold text-[13px] leading-tight">{c.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Directo</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.now_playing}</p>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
