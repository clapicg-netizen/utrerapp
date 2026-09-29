import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { Phone, MapPin, Ambulance, Siren, Flame, Shield, Cross, AlertOctagon } from "lucide-react";

const EMERGENCY = [
  { id: "e112", num: "112", label: "Emergencias generales", desc: "Bomberos, Policía y Sanitario", Icon: AlertOctagon, tone: "red" },
  { id: "e061", num: "061", label: "Emergencias sanitarias", desc: "Ambulancia · SAS Andalucía", Icon: Ambulance, tone: "rose" },
  { id: "policia", num: "955860808", display: "955 86 08 08", label: "Policía Local Utrera", desc: "Jefatura · 24h", Icon: Shield, tone: "blue" },
  { id: "bomberos", num: "955861992", display: "955 86 19 92", label: "Bomberos Utrera", desc: "Parque comarcal", Icon: Flame, tone: "orange" },
];

const CENTERS = [
  {
    id: "cs-norte",
    name: "Centro de Salud Utrera Norte",
    address: "C/ Menéndez Pelayo, s/n · 41710 Utrera",
    phone: "955 839 500",
    hours: "L-V 08:00-21:00 · Urgencias 24h",
    tag: "Atención primaria",
    tone: "emerald",
  },
  {
    id: "cs-sur",
    name: "Centro de Salud Utrera Sur",
    address: "Av. de Los Cronistas, s/n · 41710 Utrera",
    phone: "955 839 520",
    hours: "L-V 08:00-21:00 · Urgencias 24h",
    tag: "Atención primaria",
    tone: "emerald",
  },
  {
    id: "chare",
    name: "Hospital de Alta Resolución (CHARE) de Utrera",
    address: "Carretera de Los Palacios, km 3,4 · 41710 Utrera",
    phone: "955 839 400",
    hours: "Urgencias hospitalarias 24h · Consultas externas",
    tag: "Hospital",
    tone: "rose",
  },
];

const TONES = {
  red: { bg: "bg-red-600", ring: "bg-red-500/12 text-red-600" },
  rose: { bg: "bg-rose-600", ring: "bg-rose-500/12 text-rose-600" },
  blue: { bg: "bg-[color:var(--transit)]", ring: "bg-[color:var(--transit)]/12 text-[color:var(--transit)]" },
  orange: { bg: "bg-orange-600", ring: "bg-orange-500/12 text-orange-600" },
  emerald: { bg: "bg-emerald-600", ring: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
};

export default function Urgencias() {
  return (
    <div className="app-shell" data-testid="urgencias-page">
      <TopBar title="Servicios Médicos y Urgencias" back testId="urgencias-topbar" />

      {/* Emergency hero */}
      <a
        href="tel:112"
        data-testid="urg-112-hero"
        className="tile mt-4 block rounded-3xl bg-gradient-to-br from-red-600 to-red-800 text-white p-5 relative overflow-hidden shadow-md"
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 grid place-items-center border border-white/25">
            <Siren size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80">
              Emergencia
            </p>
            <p className="font-display font-extrabold text-3xl leading-none mt-0.5">
              Llamar al 112
            </p>
            <p className="text-xs text-white/85 mt-1">Servicio único europeo · 24h</p>
          </div>
          <Phone size={22} />
        </div>
      </a>

      {/* Emergency quick dial grid */}
      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Marcación rápida
      </p>
      <div className="grid grid-cols-2 gap-3" data-testid="urg-quickdial-grid">
        {EMERGENCY.map(({ id, num, display, label, desc, Icon, tone }) => {
          const t = TONES[tone];
          return (
            <a
              key={id}
              href={`tel:${num}`}
              data-testid={`urg-call-${id}`}
              className="tile rounded-2xl border border-border/70 bg-card p-4 flex flex-col relative overflow-hidden"
            >
              <div className={`w-10 h-10 rounded-xl ${t.ring} grid place-items-center`}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <p className="font-display font-extrabold text-xl mt-3 font-mono tracking-tight">
                {display || num}
              </p>
              <p className="font-display font-bold text-[13px] leading-tight mt-0.5">
                {label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
              <span className={`mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-full py-1.5 ${t.bg}`}>
                <Phone size={12} /> Llamar
              </span>
            </a>
          );
        })}
      </div>

      {/* Health centers */}
      <p className="mt-6 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Centros sanitarios de Utrera
      </p>
      <div className="space-y-3" data-testid="urg-centers-list">
        {CENTERS.map((c) => {
          const t = TONES[c.tone];
          return (
            <div
              key={c.id}
              data-testid={`urg-center-${c.id}`}
              className="rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${t.ring} grid place-items-center shrink-0`}>
                  <Cross size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">
                    {c.tag}
                  </span>
                  <h3 className="font-display font-bold text-[15px] leading-tight mt-1.5">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 shrink-0" /> {c.address}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {c.hours}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  data-testid={`urg-center-call-${c.id}`}
                  className="flex-1 py-2.5 rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-dark)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Phone size={14} /> {c.phone}
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(c.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`urg-center-map-${c.id}`}
                  className="px-4 py-2.5 rounded-full bg-muted hover:bg-muted/70 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <MapPin size={14} /> Mapa
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-100/50 dark:bg-amber-500/10 p-4 flex gap-3" data-testid="urg-disclaimer">
        <AlertOctagon size={18} className="text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-200">
          Ante cualquier situación que ponga en riesgo la vida, llama primero al <strong>112</strong>.
          Los teléfonos y horarios pueden variar; ante duda, contacta con el 112 o tu Centro de Salud.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
