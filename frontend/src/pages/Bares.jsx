import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import {
  Beer, UtensilsCrossed, Coffee, Bike, Phone, MessageCircle, Clock,
  BookOpen, MapPin, Star,
} from "lucide-react";

const CATS = [
  { id: "bares", label: "Bares & Tapas", Icon: Beer, tone: "amber" },
  { id: "restaurantes", label: "Restaurantes", Icon: UtensilsCrossed, tone: "rose" },
  { id: "cafes", label: "Cafés & Copas", Icon: Coffee, tone: "sky" },
  { id: "domicilio", label: "A Domicilio", Icon: Bike, tone: "emerald" },
];

const TONES = {
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  rose: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

const waLink = (num, name) => {
  const clean = String(num).replace(/[^\d]/g, "");
  const msg = encodeURIComponent(`Hola, quería reservar/pedir en ${name}. Vengo desde Utrerapp.`);
  return `https://wa.me/${clean}?text=${msg}`;
};

export default function Bares() {
  const [cat, setCat] = useState("bares");
  const [list, setList] = useState([]);
  const active = CATS.find((c) => c.id === cat);

  useEffect(() => {
    api.get(`/hosteleria?tipo=${cat}`).then((r) => setList(r.data));
  }, [cat]);

  return (
    <div className="app-shell" data-testid="bares-page">
      <TopBar title="Utrera Bares & Tapas" back testId="bares-topbar" />

      <div
        data-testid="bares-hero"
        className="tile mt-4 relative rounded-3xl overflow-hidden shadow-md h-40"
      >
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=75"
          alt="Tapeo en Utrera"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <div className="flex items-center gap-1.5">
            <Beer size={14} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80">
              Gastronomía de Utrera
            </p>
          </div>
          <p className="font-display font-extrabold text-xl leading-tight mt-1">
            Tapeo, carta digital y pedidos
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" data-testid="bares-categories">
        {CATS.map(({ id, label, Icon, tone }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            data-testid={`bares-cat-${id}`}
            className={`rounded-2xl border p-2.5 flex flex-col items-center gap-1.5 tile ${
              cat === id
                ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/8"
                : "border-border/70 bg-card"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl grid place-items-center ${TONES[tone]}`}>
              <Icon size={16} />
            </div>
            <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        {active?.label} · {list.length} sitios
      </p>

      <div className="space-y-3.5" data-testid="bares-list">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No hay sitios en esta categoría todavía.
          </div>
        )}
        {list.map((p) => (
          <article
            key={p.id}
            data-testid={`bares-item-${p.id}`}
            className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm"
          >
            {p.foto && (
              <div className="relative h-36">
                <img src={p.foto} alt={p.nombre} className="absolute inset-0 w-full h-full object-cover" />
                {p.rating ? (
                  <div className="absolute top-2 right-2 bg-white/95 text-[color:var(--terracotta-dark)] font-display font-extrabold text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <Star size={11} fill="currentColor" /> {p.rating}
                  </div>
                ) : null}
                {p.horario && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <Clock size={10} /> {p.horario}
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-display font-bold text-[15px] leading-tight">{p.nombre}</h3>
              {p.descripcion && <p className="text-xs text-muted-foreground mt-1">{p.descripcion}</p>}
              {p.zona && (
                <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                  <MapPin size={11} /> {p.zona}
                </p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href={p.carta_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`bares-menu-${p.id}`}
                  className="py-2 rounded-full bg-muted hover:bg-muted/70 text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <BookOpen size={13} /> Carta
                </a>
                <a
                  href={`tel:${p.telefono}`}
                  data-testid={`bares-call-${p.id}`}
                  className="py-2 rounded-full bg-[color:var(--transit)] hover:opacity-90 text-white text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <Phone size={13} /> Llamar
                </a>
                <a
                  href={waLink(p.whatsapp || p.telefono, p.nombre)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`bares-wa-${p.id}`}
                  className="py-2 rounded-full bg-[#25D366] hover:bg-[#1FBA57] text-white text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <MessageCircle size={13} /> {cat === "domicilio" ? "Pedir" : "Reservar"}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
