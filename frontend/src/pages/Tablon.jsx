import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MessageCircle, Plus, Tag, User, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "venta", label: "Venta" },
  { id: "compra", label: "Compra" },
  { id: "servicio", label: "Servicios" },
];

const CAT_STYLE = {
  venta: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  compra: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  servicio: "bg-[color:var(--secondary)]/25 text-[color:var(--terracotta-dark)]",
};

export default function Tablon() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", precio: "", descripcion: "", whatsapp: "", categoria: "venta", autor: "" });

  const load = () => {
    const q = filter === "todos" ? "" : `?categoria=${filter}`;
    api.get(`/anuncios${q}`).then((r) => setItems(r.data));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.whatsapp) {
      toast.error("Título y WhatsApp son obligatorios");
      return;
    }
    try {
      await api.post("/anuncios", { ...form, municipio: "utrera", es_activo: true });
      toast.success("Anuncio publicado");
      setOpen(false);
      setForm({ titulo: "", precio: "", descripcion: "", whatsapp: "", categoria: "venta", autor: "" });
      load();
    } catch (err) {
      toast.error("No se pudo publicar", { description: err?.response?.data?.detail || "" });
    }
  };

  const waLink = (num, titulo) => {
    const clean = String(num).replace(/[^\d]/g, "");
    const msg = encodeURIComponent(`Hola, te escribo desde Utrerapp por tu anuncio: "${titulo}"`);
    return `https://wa.me/${clean}?text=${msg}`;
  };

  return (
    <div className="app-shell" data-testid="tablon-page">
      <TopBar title="Tablón de Anuncios" back testId="tablon-topbar" />

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#2A1810] to-[#5C2A0E] text-white p-5 relative overflow-hidden shadow-md" data-testid="tablon-hero">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[color:var(--secondary)] text-[#1C1917] grid place-items-center">
            <Tag size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/75">
              Vecinos de Utrera
            </p>
            <p className="font-display font-extrabold text-xl leading-tight">
              Compra, venta y servicios
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            data-testid="tablon-new-btn"
            className="w-10 h-10 rounded-full bg-white text-[color:var(--terracotta)] grid place-items-center shadow"
            aria-label="Publicar anuncio"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar" data-testid="tablon-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            data-testid={`tablon-filter-${f.id}`}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold border ${
              filter === f.id
                ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]"
                : "bg-muted text-muted-foreground border-border/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mt-4 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        {items.length} anuncios activos en Utrera
      </p>

      <div className="space-y-2.5" data-testid="tablon-list">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Todavía no hay anuncios en esta categoría. ¡Sé el primero!
          </div>
        )}
        {items.map((a) => (
          <div
            key={a.id}
            data-testid={`tablon-item-${a.id}`}
            className="rounded-2xl border border-border/70 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_STYLE[a.categoria] || "bg-muted"}`}>
                  {a.categoria === "venta" ? "SE VENDE" : a.categoria === "compra" ? "SE BUSCA" : "SERVICIO"}
                </span>
                <h3 className="font-display font-bold text-[15px] mt-1.5 leading-tight">{a.titulo}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.descripcion}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                  <User size={11} /> {a.autor}
                </p>
              </div>
              <p className="font-display font-extrabold text-[color:var(--terracotta)] text-base whitespace-nowrap shrink-0">
                {a.precio}
              </p>
            </div>
            <a
              href={waLink(a.whatsapp, a.titulo)}
              target="_blank"
              rel="noreferrer"
              data-testid={`tablon-wa-${a.id}`}
              className="mt-3 w-full py-2.5 rounded-full bg-[#25D366] hover:bg-[#1FBA57] text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} /> Contactar por WhatsApp
            </a>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="tablon-form-dialog" className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Publicar anuncio</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Categoría</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {["venta", "compra", "servicio"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, categoria: c })}
                    data-testid={`tablon-form-cat-${c}`}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      form.categoria === c
                        ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]"
                        : "bg-muted border-border/60"
                    }`}
                  >
                    {c === "venta" ? "Vendo" : c === "compra" ? "Busco" : "Servicio"}
                  </button>
                ))}
              </div>
            </div>
            {[
              { k: "titulo", label: "Título *", ph: "Ej. Bicicleta Orbea 27,5\"" },
              { k: "precio", label: "Precio", ph: "180€ · Consultar · Gratis" },
              { k: "descripcion", label: "Descripción", ph: "Explica el estado, ubicación, etc.", ta: true },
              { k: "whatsapp", label: "WhatsApp * (con prefijo, ej. 34655…)", ph: "34655123456" },
              { k: "autor", label: "Tu nombre", ph: "Manolo R." },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-[11px] text-muted-foreground font-semibold">{f.label}</label>
                {f.ta ? (
                  <textarea
                    value={form[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    placeholder={f.ph}
                    data-testid={`tablon-form-${f.k}`}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--terracotta)] resize-none"
                  />
                ) : (
                  <input
                    value={form[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    placeholder={f.ph}
                    data-testid={`tablon-form-${f.k}`}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--terracotta)]"
                  />
                )}
              </div>
            ))}
            <DialogFooter className="!flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-muted text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                data-testid="tablon-form-submit"
                className="flex-1 py-2.5 rounded-full bg-[color:var(--terracotta)] text-white text-sm font-semibold"
              >
                Publicar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
