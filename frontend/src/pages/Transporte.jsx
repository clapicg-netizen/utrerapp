import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import { Bus, Train, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Transporte() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    api.get("/transit").then((r) => setLines(r.data));
  }, []);

  const buses = lines.filter((l) => l.kind === "bus");
  const trains = lines.filter((l) => l.kind === "renfe");

  const Card = ({ l }) => {
    const isBus = l.kind === "bus";
    return (
      <div data-testid={`transit-${l.id}`} className="rounded-2xl border border-border/70 bg-card p-4">
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
      </div>
    );
  };

  return (
    <div className="app-shell" data-testid="transporte-page">
      <TopBar title="Autobuses y Cercanías" back testId="transporte-topbar" />

      <Tabs defaultValue="bus" className="mt-4">
        <TabsList className="grid grid-cols-2 w-full rounded-full bg-muted p-1 h-11">
          <TabsTrigger data-testid="tab-bus" value="bus" className="rounded-full data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">
            Urbanos
          </TabsTrigger>
          <TabsTrigger data-testid="tab-renfe" value="renfe" className="rounded-full data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">
            Cercanías Renfe
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bus" className="mt-4 space-y-3">
          {buses.map((l) => <Card key={l.id} l={l} />)}
        </TabsContent>
        <TabsContent value="renfe" className="mt-4 space-y-3">
          {trains.map((l) => <Card key={l.id} l={l} />)}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}
