import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import {
  mergeWithLocal, safeImg, cleanPhotos, telHref, whatsappHref,
  mapsHref, safeExternal,
} from "@/lib/localStore";
import {
  Beer, UtensilsCrossed, Coffee, Bike, Phone, MessageCircle, Clock,
  BookOpen, MapPin, Star, FileText, Globe, Instagram, Facebook, Music2,
  Megaphone, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

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

const igHref = (val) => {
  if (!val) return null;
  if (val.startsWith("http")) return val;
  return `https://instagram.com/${val.replace(/^@/, "")}`;
};
const tkHref = (val) => {
  if (!val) return null;
  if (val.startsWith("http")) return val;
  return `https://tiktok.com/@${val.replace(/^@/, "")}`;
};

export default function Bares() {
  const [cat, setCat] = useState("bares");
  const [all, setAll] = useState([]);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    try {
      const r = await api.get(`/hosteleria`);
      setAll(mergeWithLocal("/hosteleria", r.data));
    } catch {
      setAll(mergeWithLocal("/hosteleria", []));
    }
  };
  useEffect(() => { load(); }, []);

  const list = useMemo(() => all.filter((x) => x.tipo === cat), [all, cat]);
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
        {list.map((p) => {
          const cover = safeImg(p.foto);
          return (
            <button
              key={p.id}
              onClick={() => setDetail(p)}
              data-testid={`bares-item-${p.id}`}
              className="w-full text-left rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm block"
            >
              {cover && (
                <div className="relative h-36">
                  <img
                    src={cover}
                    alt={p.nombre}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
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
                  {p.oferta_titulo && (
                    <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full inline-flex items-center gap-1">
                      <Megaphone size={10} /> Promo
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-display font-bold text-[15px] leading-tight">{p.nombre}</h3>
                {p.descripcion && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.descripcion}</p>}
                {p.zona && (
                  <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                    <MapPin size={11} /> {p.zona}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <PlaceDetail item={detail} cat={cat} onClose={() => setDetail(null)} />

      <BottomNav />
    </div>
  );
}

function PlaceDetail({ item, cat, onClose }) {
  if (!item) return null;
  const cover = safeImg(item.foto);
  const extras = cleanPhotos(item.fotos);
  const gallery = [cover, ...extras].filter(Boolean);
  const promoImg = safeImg(item.oferta_imagen);
  const menuPdf = safeExternal(item.menu_pdf_url);
  const web = safeExternal(item.web);
  const carta = safeExternal(item.carta_url);
  const tel = telHref(item.telefono);
  const wa = whatsappHref(item.whatsapp || item.telefono, item.nombre);
  const map = mapsHref(item.direccion || item.zona || item.nombre);
  const ig = igHref(item.instagram);
  const fb = safeExternal(item.facebook);
  const tk = tkHref(item.tiktok);

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-testid="bares-detail" className="rounded-3xl max-w-md p-0 overflow-hidden gap-0 max-h-[90vh] overflow-y-auto">
        {gallery.length > 0 && (
          <div data-testid="bares-gallery">
            {gallery.length === 1 && (
              <img src={gallery[0]} alt={item.nombre} className="w-full h-48 object-cover" onError={(e)=>{e.currentTarget.style.display="none";}} />
            )}
            {gallery.length >= 2 && (
              <div className="grid grid-cols-2 gap-1">
                <img src={gallery[0]} alt={item.nombre} className="w-full h-44 object-cover col-span-2" onError={(e)=>{e.currentTarget.style.display="none";}} />
                {gallery.slice(1, 3).map((p, i) => (
                  <img key={i} src={p} alt="" className="w-full h-24 object-cover" onError={(e)=>{e.currentTarget.style.display="none";}} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          <DialogHeader>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {item.tipo}{item.rating ? ` · ★ ${item.rating}` : ""}
                </span>
                <DialogTitle className="font-display text-lg leading-tight">{item.nombre}</DialogTitle>
                <DialogDescription className="sr-only">
                  Ficha del negocio {item.nombre}
                </DialogDescription>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted grid place-items-center shrink-0" aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
          </DialogHeader>

          {item.descripcion && (
            <p className="text-sm text-foreground/80 mt-3 whitespace-pre-wrap">{item.descripcion}</p>
          )}
          {(item.zona || item.horario) && (
            <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
              {item.zona && <p className="flex items-center gap-1"><MapPin size={11} /> {item.zona}</p>}
              {item.horario && <p className="flex items-center gap-1"><Clock size={11} /> {item.horario}</p>}
            </div>
          )}

          {(item.oferta_titulo || item.oferta_texto || promoImg) && (
            <div data-testid="bares-promo" className="mt-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white p-4">
              <p className="text-[10px] uppercase tracking-widest text-white/80 font-semibold inline-flex items-center gap-1">
                🎉 Evento / Menú Especial
              </p>
              {item.oferta_titulo && (
                <p className="font-display font-extrabold text-base leading-tight mt-1">{item.oferta_titulo}</p>
              )}
              {item.oferta_texto && (
                <p className="text-xs text-white/90 mt-1 whitespace-pre-wrap">{item.oferta_texto}</p>
              )}
              {promoImg && (
                <img src={promoImg} alt="" className="mt-3 w-full rounded-xl max-h-56 object-cover" onError={(e)=>{e.currentTarget.style.display="none";}} />
              )}
            </div>
          )}

          {menuPdf && (
            <a
              href={menuPdf}
              target="_blank"
              rel="noreferrer"
              data-testid="bares-menu-pdf"
              className="mt-4 w-full py-3 rounded-xl bg-[color:var(--terracotta)] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2"
            >
              <FileText size={16} /> Ver Carta / Menú (PDF)
            </a>
          )}
          {!menuPdf && carta && (
            <a
              href={carta}
              target="_blank"
              rel="noreferrer"
              data-testid="bares-carta-url"
              className="mt-4 w-full py-3 rounded-xl bg-muted text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <BookOpen size={14} /> Ver Carta
            </a>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {tel && (
              <a href={tel} data-testid="bares-detail-call" className="py-2.5 rounded-xl bg-[color:var(--transit)] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <Phone size={13} /> Llamar
              </a>
            )}
            {map && (
              <a href={map} target="_blank" rel="noreferrer" data-testid="bares-detail-map" className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <MapPin size={13} /> Cómo llegar
              </a>
            )}
            {web && (
              <a href={web} target="_blank" rel="noreferrer" data-testid="bares-detail-web" className="py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <Globe size={13} /> Web
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" data-testid="bares-detail-wa" className="py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <MessageCircle size={13} /> {cat === "domicilio" ? "Pedir" : "Reservar"}
              </a>
            )}
          </div>

          {(ig || fb || tk) && (
            <div data-testid="bares-socials" className="mt-3 flex gap-2">
              {ig && (
                <a href={ig} target="_blank" rel="noreferrer" data-testid="bares-ig" className="flex-1 py-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1">
                  <Instagram size={13} /> Instagram
                </a>
              )}
              {fb && (
                <a href={fb} target="_blank" rel="noreferrer" data-testid="bares-fb" className="flex-1 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-semibold inline-flex items-center justify-center gap-1">
                  <Facebook size={13} /> Facebook
                </a>
              )}
              {tk && (
                <a href={tk} target="_blank" rel="noreferrer" data-testid="bares-tk" className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-1">
                  <Music2 size={13} /> TikTok
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
