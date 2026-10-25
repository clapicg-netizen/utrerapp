import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "../lib/api";
import { Bus, Train, Clock, ExternalLink, Compass, Navigation } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Transporte() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    api.get("/transit").then((r) => setLines(r.data)).catch((e) => console.error("Error transit:", e));
  }, []);

  const buses = lines.filter((l) => l.kind === "bus");
  const trains = lines.filter((l) => l.kind === "renfe");

  const Card = ({ l }) => {
    const isBus = l.kind === "bus";
    return (
      <div data-testid={`transit-${l.id}`} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl grid place-items-center ${isBus ? "bg-[color:var(--transit)]/12 text-[color:var(--transit)]" : "bg-rose-500/12 text-rose-600"}`}>
            {isBus ? <Bus size={20} /> : <Train size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${isBus ? "bg-[color:var(--transit)] text-white" : "bg-rose-600 text-white"}`}>
                {l.line}
              </span>
              <p className="font-display font-bold text-[14px] truncate">{l.name}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{l.frequency}</p>
          </div>
        </div>
        {l.next_departures && l.next_departures.length > 0 && (
          <div className="mt-3 flex gap-2">
            {l.next_departures.map((t, i) => (
              <div
                key={t + i}
                className={`flex-1 text-center py-2 rounded-xl font-mono text-sm ${i === 0 ? "bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta)] font-bold" : "bg-muted text-muted-foreground"}`}
              >
                <Clock size={11} className="inline mr-1" /> {t}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-shell pb-28" data-testid="transporte-page">
      <TopBar title="Transporte y Movilidad" back testId="transporte-topbar" />

      <Tabs defaultValue="renfe" className="mt-4">
        <TabsList className="grid grid-cols-3 w-full rounded-full bg-muted p-1 h-11">
          <TabsTrigger data-testid="tab-renfe" value="renfe" className="rounded-full text-xs font-bold data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">
            Cercanías
          </TabsTrigger>
          <TabsTrigger data-testid="tab-bus" value="bus" className="rounded-full text-xs font-bold data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">
            Urbanos
          </TabsTrigger>
          <TabsTrigger data-testid="tab-moovit" value="moovit" className="rounded-full text-xs font-bold data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">
            Rutas
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA CERCANÍAS RENFE */}
        <TabsContent value="renfe" className="mt-4 space-y-3">
          {trains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">Cargando horarios de trenes...</div>
          ) : (
            trains.map((l) => <Card key={l.id} l={l} />)
          )}
          <div className="pt-2">
            <a
              href="https://www.renfe.com/es/es/cercanias/cercanias-sevilla"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-card hover:bg-muted/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm transition-colors"
            >
              <span className="flex items-center gap-2">
                <Train size={16} className="text-rose-600" /> Web Oficial Renfe Cercanías
              </span>
              <ExternalLink size={14} className="text-muted-foreground" />
            </a>
          </div>
        </TabsContent>

        {/* PESTAÑA AUTOBUSES URBANOS */}
        <TabsContent value="bus" className="mt-4 space-y-3">
          {buses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">Cargando líneas de autobús...</div>
          ) : (
            buses.map((l) => <Card key={l.id} l={l} />)
          )}
        </TabsContent>

        {/* PESTAÑA PLANIFICADOR DE RUTAS (MOOVIT) */}
        <TabsContent value="moovit" className="mt-4 space-y-3">
          <div className="bg-gradient-to-br from-blue-600 to-sky-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden space-y-4">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-2.5">
              <span className="bg-white/20 p-2.5 rounded-2xl text-white">
                <Navigation size={20} />
              </span>
              <div>
                <h3 className="text-sm font-black">Planificador de Trayectos</h3>
                <p className="text-[11px] text-sky-100">Utrera ➔ Sevilla / Plaza de Armas</p>
              </div>
            </div>

            <p className="text-xs text-sky-100 leading-relaxed">
              Calcula rutas combinadas de tren, autobús y metro en tiempo real con indicaciones paso a paso hasta tu destino.
            </p>

            <a
              href="https://moovitapp.com/tripplan/sevilla-3802/poi/Plaza%20de%20Armas/Utrera/en?fll=37.183365_-5.790053&tll=37.3929_-6.004052&utm_source=widget&utm_campaign=get_directions_button&widget_source_referrer=holautrera.com&o=1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-blue-700 hover:bg-sky-50 font-black text-xs py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Abrir Planificador en Moovit</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="bg-muted/50 border border-border/70 rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Compass size={14} className="text-[color:var(--terracotta)]" /> Movilidad Integrada
            </p>
            <p className="leading-relaxed">
              El planificador se abrirá de forma segura en tu navegador con las coordenadas exactas de salida y llegada.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}