import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Shield, LogOut, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Admin() {
  const [tok, setTok] = useState(() => localStorage.getItem("utrerapp_admin_token") || "");
  const [pwd, setPwd] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin/login", { password: pwd });
      localStorage.setItem("utrerapp_admin_token", data.token);
      setTok(data.token);
      toast.success("Sesión iniciada");
    } catch {
      toast.error("Contraseña incorrecta");
    }
  };

  const logout = () => {
    localStorage.removeItem("utrerapp_admin_token");
    setTok("");
  };

  if (!tok) {
    return (
      <div className="app-shell" data-testid="admin-login-page">
        <TopBar title="Panel de administración" back testId="admin-topbar" />
        <form
          onSubmit={login}
          data-testid="admin-login-form"
          className="mt-8 rounded-3xl border border-border/70 bg-card p-5 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta)] grid place-items-center">
            <Shield size={24} />
          </div>
          <h2 className="font-display font-extrabold text-xl mt-3">Acceso restringido</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Introduce la contraseña de gestor municipal para editar avisos, farmacias y eventos.
          </p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Contraseña"
            data-testid="admin-password-input"
            className="mt-4 w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-[color:var(--terracotta)]"
          />
          <button
            type="submit"
            data-testid="admin-login-submit"
            className="mt-3 w-full py-3 rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-dark)] text-white font-semibold"
          >
            Entrar
          </button>
          <p className="text-[11px] text-muted-foreground mt-3 font-mono">Pista demo: admin123</p>
        </form>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-shell" data-testid="admin-panel">
      <TopBar title="Panel · Utrerapp" back testId="admin-topbar" />
      <div className="mt-3 flex justify-between items-center px-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Sesión de gestor · activa
        </p>
        <button
          onClick={logout}
          data-testid="admin-logout"
          className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70"
        >
          <LogOut size={12} /> Salir
        </button>
      </div>

      <Tabs defaultValue="traffic" className="mt-3">
        <TabsList className="grid grid-cols-4 w-full rounded-full bg-muted p-1 h-10">
          <TabsTrigger value="traffic" data-testid="admin-tab-traffic" className="rounded-full text-xs data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">Tráfico</TabsTrigger>
          <TabsTrigger value="pharmacies" data-testid="admin-tab-pharmacies" className="rounded-full text-xs data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">Farmacias</TabsTrigger>
          <TabsTrigger value="events" data-testid="admin-tab-events" className="rounded-full text-xs data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">Eventos</TabsTrigger>
          <TabsTrigger value="news" data-testid="admin-tab-news" className="rounded-full text-xs data-[state=active]:bg-[color:var(--terracotta)] data-[state=active]:text-white">Noticias</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="mt-4">
          <AdminSection
            title="Avisos de tráfico"
            endpoint="/traffic"
            fields={[
              { k: "zone", label: "Zona", ph: "Trianilla" },
              { k: "status", label: "Estado (green/yellow/red)", ph: "yellow" },
              { k: "message", label: "Mensaje", ph: "Obras en marcha" },
              { k: "detail", label: "Detalle", ph: "Descripción larga…" },
            ]}
            renderRow={(t) => (
              <>
                <p className="font-display font-bold text-[14px]">{t.zone} · <span className={
                  t.status === "green" ? "text-emerald-600" : t.status === "red" ? "text-rose-600" : "text-amber-600"
                }>{t.status}</span></p>
                <p className="text-xs text-muted-foreground">{t.message}</p>
              </>
            )}
            testKey="traffic"
          />
        </TabsContent>

        <TabsContent value="pharmacies" className="mt-4">
          <AdminSection
            title="Farmacias de guardia"
            endpoint="/pharmacies"
            fields={[
              { k: "name", label: "Nombre", ph: "Farmacia Ldo. Pérez" },
              { k: "address", label: "Dirección", ph: "C/ Ancha, 34" },
              { k: "phone", label: "Teléfono", ph: "955 861 234" },
              { k: "hours", label: "Horario", ph: "09:00 - 22:00" },
              { k: "on_duty_today", label: "De guardia (true/false)", ph: "true", type: "bool" },
              { k: "is_24h", label: "24h (true/false)", ph: "false", type: "bool" },
            ]}
            renderRow={(p) => (
              <>
                <p className="font-display font-bold text-[14px]">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.address} · {p.on_duty_today ? "🟢 Guardia" : "—"}</p>
              </>
            )}
            testKey="pharmacies"
          />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <AdminSection
            title="Eventos y fiestas"
            endpoint="/events"
            fields={[
              { k: "title", label: "Título", ph: "Feria de la Manzanilla" },
              { k: "category", label: "Categoría", ph: "Fiestas" },
              { k: "date", label: "Fecha (YYYY-MM-DD)", ph: "2026-03-14" },
              { k: "location", label: "Lugar", ph: "Recinto ferial" },
              { k: "description", label: "Descripción", ph: "Descripción…" },
              { k: "highlighted", label: "Destacado (true/false)", ph: "true", type: "bool" },
            ]}
            renderRow={(e) => (
              <>
                <p className="font-display font-bold text-[14px]">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.date} · {e.location}</p>
              </>
            )}
            testKey="events"
          />
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <AdminSection
            title="Titulares"
            endpoint="/news"
            fields={[
              { k: "source", label: "Medio", ph: "Utrera al Día" },
              { k: "headline", label: "Titular", ph: "Titular…" },
              { k: "summary", label: "Resumen", ph: "Resumen…" },
              { k: "category", label: "Categoría", ph: "Cultura" },
            ]}
            renderRow={(n) => (
              <>
                <p className="font-display font-bold text-[14px]">{n.headline}</p>
                <p className="text-xs text-muted-foreground">{n.source} · {n.category}</p>
              </>
            )}
            testKey="news"
          />
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}

function AdminSection({ title, endpoint, fields, renderRow, testKey }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);

  const load = () => api.get(endpoint).then((r) => setItems(r.data));
  useEffect(() => { load(); }, []); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    for (const f of fields) {
      if (f.type === "bool") payload[f.k] = String(payload[f.k]).toLowerCase() === "true";
    }
    try {
      await api.post(endpoint, payload);
      toast.success("Guardado");
      setForm({});
      setOpen(false);
      load();
    } catch (err) {
      toast.error("Error al guardar", { description: err?.response?.data?.detail || "" });
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success("Eliminado");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="font-display font-bold text-[14px]">{title}</p>
        <button
          onClick={() => setOpen(!open)}
          data-testid={`admin-add-${testKey}`}
          className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[color:var(--terracotta)] text-white"
        >
          <Plus size={12} /> Nuevo
        </button>
      </div>

      {open && (
        <form onSubmit={submit} data-testid={`admin-form-${testKey}`} className="rounded-2xl border border-border/70 bg-card p-3 mb-3 space-y-2">
          {fields.map((f) => (
            <div key={f.k}>
              <label className="text-[11px] text-muted-foreground font-semibold">{f.label}</label>
              <input
                value={form[f.k] ?? ""}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                placeholder={f.ph}
                data-testid={`admin-input-${testKey}-${f.k}`}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--terracotta)]"
              />
            </div>
          ))}
          <button
            type="submit"
            data-testid={`admin-submit-${testKey}`}
            className="w-full py-2.5 rounded-full bg-[color:var(--terracotta)] text-white text-sm font-semibold"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="space-y-2" data-testid={`admin-list-${testKey}`}>
        {items.map((it) => (
          <div
            key={it.id}
            data-testid={`admin-item-${testKey}-${it.id}`}
            className="rounded-xl border border-border/70 bg-card p-3 flex items-start justify-between gap-2"
          >
            <div className="flex-1 min-w-0">{renderRow(it)}</div>
            <button
              onClick={() => remove(it.id)}
              data-testid={`admin-delete-${testKey}-${it.id}`}
              className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 grid place-items-center"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
