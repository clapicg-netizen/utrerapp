import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import {
  Beer, UtensilsCrossed, Coffee, Bike, Phone, MessageCircle, Clock,
  BookOpen, MapPin, Star,
} from "lucide-react";

const CATS = [
  { id: "bares",    label: "Bares & Tapas",   Icon: Beer,             tone: "amber" },
  { id: "restaurantes", label: "Restaurantes", Icon: UtensilsCrossed, tone: "rose" },
  { id: "cafes",    label: "Cafés & Copas",   Icon: Coffee,           tone: "sky" },
  { id: "domicilio", label: "A Domicilio",     Icon: Bike,             tone: "emerald" },
];

const PLACES = {
  bares: [
    {
      name: "Bar Casa Manolo",
      cover: "https://images.unsplash.com/photo-1546195643-70f48f9c5b87?auto=format&fit=crop&w=800&q=75",
      desc: "El clásico utrerano. Tapas de guiso, montaditos y su famoso solomillo al whisky.",
      hours: "L-D · 12:00-16:30 y 19:30-00:00",
      zone: "C/ Ancha, 22",
      rating: 4.7,
      phone: "955861010",
      wa: "34655700001",
      menu: "https://google.com/search?q=bar+casa+manolo+utrera+carta",
    },
    {
      name: "Taberna El Altozano",
      cover: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=75",
      desc: "Vinos de la tierra, jamón de bellota y quesos artesanos. Ambiente tradicional.",
      hours: "Ma-D · 12:30-16:00 y 20:00-00:30",
      zone: "Pl. del Altozano, 4",
      rating: 4.6,
      phone: "955862345",
      wa: "34655700002",
      menu: "https://google.com/search?q=taberna+altozano+utrera",
    },
    {
      name: "Bar Los Tarantos",
      cover: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=75",
      desc: "Tapas flamencas, caracoles y pescaíto frito. Con actuaciones espontáneas.",
      hours: "Mi-D · 13:00-16:00 y 20:00-01:00",
      zone: "C/ Trianilla, 12",
      rating: 4.8,
      phone: "955864455",
      wa: "34655700003",
      menu: "https://google.com/search?q=bar+los+tarantos+utrera",
    },
  ],
  restaurantes: [
    {
      name: "Restaurante Consolación",
      cover: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=75",
      desc: "Cocina andaluza actualizada. Menú del día 14€, carta con producto local del Corbones.",
      hours: "L-Sa · 13:30-16:00 y 21:00-23:30",
      zone: "Av. de Sevilla, 41",
      rating: 4.5,
      phone: "955867788",
      wa: "34655700004",
      menu: "https://google.com/search?q=restaurante+consolacion+utrera+carta",
    },
    {
      name: "El Corral de la Manzanilla",
      cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=75",
      desc: "Arroces caldosos, carnes a la brasa y bodega propia. Ideal para grupos.",
      hours: "Ma-D · 13:00-17:00 y 20:30-00:00",
      zone: "Carretera A-364, km 2",
      rating: 4.6,
      phone: "955868899",
      wa: "34655700005",
      menu: "https://google.com/search?q=corral+manzanilla+utrera",
    },
    {
      name: "La Cocina de Rocío",
      cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=75",
      desc: "Cocina de mercado con toques modernos. Reserva recomendada los fines de semana.",
      hours: "Ju-D · 13:30-16:00 y 20:30-23:30",
      zone: "C/ Rodrigo Caro, 8",
      rating: 4.9,
      phone: "955869900",
      wa: "34655700006",
      menu: "https://google.com/search?q=la+cocina+de+rocio+utrera",
    },
  ],
  cafes: [
    {
      name: "Café Central Utrera",
      cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=75",
      desc: "Desayunos molletes, tostadas de aceite y repostería casera. Wi-Fi.",
      hours: "L-D · 07:30-22:00",
      zone: "Pl. del Altozano, 12",
      rating: 4.4,
      phone: "955861133",
      wa: "34655700007",
      menu: "https://google.com/search?q=cafe+central+utrera",
    },
    {
      name: "Gin Bar Malamadre",
      cover: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=75",
      desc: "Coctelería de autor, ginebras premium y música en directo los sábados.",
      hours: "Ju-Sa · 20:00-03:00",
      zone: "C/ Sevilla, 8",
      rating: 4.7,
      phone: "955862211",
      wa: "34655700008",
      menu: "https://google.com/search?q=gin+bar+malamadre+utrera",
    },
  ],
  domicilio: [
    {
      name: "Pizzería La Manzanilla",
      cover: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=75",
      desc: "Pizzas artesanas horno de leña. Envío a Utrera y pedanías en 30 min.",
      hours: "Ma-D · 19:30-23:30",
      zone: "C/ Salesianos, 33 · Envío 2€",
      rating: 4.6,
      phone: "955867700",
      wa: "34655700009",
      menu: "https://google.com/search?q=pizzeria+la+manzanilla+utrera",
    },
    {
      name: "Sushi Utrera Roll",
      cover: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=75",
      desc: "Sushi y makis para llevar o a domicilio. 20% dto. martes.",
      hours: "Ma-D · 13:30-16:00 y 20:30-23:30",
      zone: "Av. María Auxiliadora, 14",
      rating: 4.8,
      phone: "955868811",
      wa: "34655700010",
      menu: "https://google.com/search?q=sushi+utrera+roll",
    },
    {
      name: "Kebab Utrera Express",
      cover: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=75",
      desc: "Kebabs, durums y hamburguesas. Reparto en 20 min por Utrera.",
      hours: "Todos los días · 12:00-01:00",
      zone: "C/ Álvarez Quintero, 5",
      rating: 4.3,
      phone: "955869922",
      wa: "34655700011",
      menu: "https://google.com/search?q=kebab+utrera+express",
    },
  ],
};

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
  const list = PLACES[cat] || [];
  const active = CATS.find((c) => c.id === cat);

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
          <p className="text-xs text-white/80 mt-0.5">
            Más de {Object.values(PLACES).flat().length} sitios recomendados
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
        {list.map((p) => (
          <article
            key={p.name}
            data-testid={`bares-item-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
            className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm"
          >
            <div className="relative h-36">
              <img src={p.cover} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/95 text-[color:var(--terracotta-dark)] font-display font-extrabold text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                <Star size={11} fill="currentColor" /> {p.rating}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1">
                <Clock size={10} /> {p.hours}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-[15px] leading-tight">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
              <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                <MapPin size={11} /> {p.zone}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href={p.menu}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`bares-menu-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
                  className="py-2 rounded-full bg-muted hover:bg-muted/70 text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <BookOpen size={13} /> Carta
                </a>
                <a
                  href={`tel:${p.phone}`}
                  data-testid={`bares-call-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
                  className="py-2 rounded-full bg-[color:var(--transit)] hover:opacity-90 text-white text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <Phone size={13} /> Llamar
                </a>
                <a
                  href={waLink(p.wa, p.name)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`bares-wa-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
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
