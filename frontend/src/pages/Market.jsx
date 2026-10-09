import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import {
  mergeWithLocal, safeImg, cleanPhotos, telHref, whatsappHref,
  mapsHref, safeExternal,
} from "@/lib/localStore";
import {
  Shirt, Utensils, Dumbbell, Sofa, Store, ExternalLink, Phone, MapPin,
  Globe, FileText, Instagram, Facebook, Music2, X, Megaphone,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "moda", label: "Moda", Icon: Shirt, tone: "rose" },
  { id: "alimentacion", label: "Alimentación", Icon: Utensils, tone: "amber" },
  { id: "deportes", label: "Deportes", Icon: Dumbbell, tone: "sky" },
  { id: "hogar", label: "Hogar", Icon: Sofa, tone: "emerald" },
];

const TONES = {
  rose: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};

const igHref = (val) => {
  if (!val) return null;
  if (val.startsWith("http")) return val;
  const u = val.replace(/^@/, "");
  return `https://instagram.com/${u}`;
};
const tkHref = (val) => {
  if (!val) return null;
  if (val.startsWith("http")) return val;
  const u = val.replace(/^@/, "");
  return `https://tiktok.com/@${u}`;
};
const fbHref = (val) => safeExternal(val);

export default function Market() {
  const [cat, setCat] = useState("moda");
  const [all, setAll] = useState([]);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    try {
      const r = await api.get(`/comercios`);
      setAll(mergeWithLocal("/comercios", r.data));
    } catch {
      setAll(mergeWithLocal("/comercios", []));
    }
  };
  useEffect(() => { load(); }, []);

  const shops = useMemo(() => all.filter((x) => x.categoria === cat), [all, cat]);
  const active = CATEGORIES.find((c) => c.id === cat);

  return (
    <div className="app-shell" data-testid="market-page">
      <TopBar title="Utrera Market" back testId="market-topbar" />

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#1C2026] to-[#3B1F14] text-white p-5 relative overflow-hidden shadow-md" data-testid="market-hero">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[color:var(--terracotta)] grid place-items-center">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/70">
              Comercio local
            </p>
            <p className="font-display font-extrabold text-xl leading-tight">
              Las tiendas online de tu pueblo
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" data-testid="market-categories">
        {CATEGORIES.map(({ id, label, Icon, tone }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            data-testid={`market-cat-${id}`}
            className={`rounded-2xl border p-2.5 flex flex-col items-center gap-1.5 tile ${
              cat === id
                ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/8"
                : "border-border/70 bg-card"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl grid place-items-center ${TONES[tone]}`}>
              <Icon size={16} />
            </div>
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        {active?.label} · {shops.length} comercios
      </p>

      <div className="space-y-2.5" data-testid="market-list">
        {shops.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aún no hay comercios en esta categoría.
          </div>
        )}
        {shops.map((s) => {
          const img = safeImg(s.imagen);
          return (
            <button
              key={s.id}
              onClick={() => setDetail(s)}
              data-testid={`market-shop-${s.id}`}
              className="w-full text-left tile rounded-2xl border border-border/70 bg-card p-4 flex gap-3 items-start"
            >
              {img ? (
                <img
                  src={img}
                  alt={s.nombre}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className={`w-14 h-14 rounded-xl grid place-items-center shrink-0 ${TONES[active?.tone || "rose"]}`}>
                  <Store size={19} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-[14px] truncate">{s.nombre}</h3>
                  {s.tag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--secondary)]/25 text-[color:var(--terracotta-dark)]">
                      {s.tag}
                    </span>
                  )}
                  {s.oferta_titulo && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                      <Megaphone size={10} /> Oferta
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.descripcion}</p>
              </div>
              <ExternalLink size={16} className="text-muted-foreground shrink-0 mt-1" />
            </button>
          );
        })}
      </div>

      <ShopDetail item={detail} onClose={() => setDetail(null)} tone={TONES[active?.tone || "rose"]} />

      <BottomNav />
    </div>
  );
}

function ShopDetail({ item, onClose, tone }) {
  if (!item) return null;
  const cover = safeImg(item.imagen);
  const extras = cleanPhotos(item.fotos);
  const gallery = [cover, ...extras].filter(Boolean);
  const promoImg = safeImg(item.oferta_imagen);
  const menuPdf = safeExternal(item.menu_pdf_url);
  const web = safeExternal(item.web);
  const url = safeExternal(item.url);
  const tel = telHref(item.telefono);
  const map = mapsHref(item.direccion || item.nombre);
  const ig = igHref(item.instagram);
  const fb = fbHref(item.facebook);
  const tk = tkHref(item.tiktok);

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-testid="market-shop-detail" className="rounded-3xl max-w-md p-0 overflow-hidden gap-0 max-h-[90vh] overflow-y-auto">
        {/* Gallery */}
        {gallery.length > 0 && (
          <div data-testid="market-gallery" className={gallery.length === 1 ? "" : "grid grid-cols-2 gap-1"}>
            {gallery.length === 1 && (
              <img src={gallery[0]} alt={item.nombre} className="w-full h-44 object-cover" onError={(e)=>{e.currentTarget.style.display="none";}} />
            )}
            {gallery.length >= 2 && (
              <>
                <img src={gallery[0]} alt={item.nombre} className="w-full h-40 object-cover col-span-2" onError={(e)=>{e.currentTarget.style.display="none";}} />
                {gallery.slice(1, 3).map((p, i) => (
                  <img key={i} src={p} alt="" className="w-full h-24 object-cover" onError={(e)=>{e.currentTarget.style.display="none";}} />
                ))}
              </>
            )}
          </div>
        )}

        <div className="p-5">
          <DialogHeader>
            <div className="flex items-start gap-2">
              {!gallery.length && (
                <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${tone}`}>
                  <Store size={19} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {item.categoria}
                </span>
                <DialogTitle className="font-display text-lg leading-tight">{item.nombre}</DialogTitle>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted grid place-items-center shrink-0" aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
          </DialogHeader>

          {item.descripcion && (
            <p className="text-sm text-foreground/80 mt-3 whitespace-pre-wrap">{item.descripcion}</p>
          )}

          {/* Promo */}
          {(item.oferta_titulo || item.oferta_texto || promoImg) && (
            <div data-testid="market-promo" className="mt-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white p-4 shadow-inner">
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

          {/* Carta PDF */}
          {menuPdf && (
            <a
              href={menuPdf}
              target="_blank"
              rel="noreferrer"
              data-testid="market-menu-pdf"
              className="mt-4 w-full py-3 rounded-xl bg-[color:var(--terracotta)] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2"
            >
              <FileText size={16} /> Ver Carta / Menú (PDF)
            </a>
          )}

          {/* Quick actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {tel && (
              <a href={tel} data-testid="market-call" className="py-2.5 rounded-xl bg-[color:var(--transit)] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <Phone size={13} /> Llamar
              </a>
            )}
            {map && (
              <a href={map} target="_blank" rel="noreferrer" data-testid="market-map" className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <MapPin size={13} /> Cómo llegar
              </a>
            )}
            {web && (
              <a href={web} target="_blank" rel="noreferrer" data-testid="market-web" className="py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <Globe size={13} /> Web
              </a>
            )}
            {url && (
              <a href={url} target="_blank" rel="noreferrer" data-testid="market-shop-link" className="py-2.5 rounded-xl bg-[color:var(--secondary)] text-[#1C1917] text-xs font-extrabold inline-flex items-center justify-center gap-1.5">
                <Store size={13} /> Tienda online
              </a>
            )}
          </div>

          {/* Socials */}
          {(ig || fb || tk) && (
            <div data-testid="market-socials" className="mt-3 flex gap-2">
              {ig && (
                <a href={ig} target="_blank" rel="noreferrer" data-testid="market-ig" className="flex-1 py-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1">
                  <Instagram size={13} /> Instagram
                </a>
              )}
              {fb && (
                <a href={fb} target="_blank" rel="noreferrer" data-testid="market-fb" className="flex-1 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-semibold inline-flex items-center justify-center gap-1">
                  <Facebook size={13} /> Facebook
                </a>
              )}
              {tk && (
                <a href={tk} target="_blank" rel="noreferrer" data-testid="market-tk" className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-1">
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
