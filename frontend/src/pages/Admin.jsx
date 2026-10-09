import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import {
  mergeWithLocal, addLocal, patchLocal, removeLocal, genLocalId, isValidImage,
} from "@/lib/localStore";
import { toast } from "sonner";
import {
  Trash2, Shield, LogOut, Plus, Check, X, Pencil, Save, ChevronDown,
  Image as ImageIcon, FileUp, FileText,
} from "lucide-react";

const TABS = [
  { id: "traffic", label: "Tráfico" },
  { id: "pharmacies", label: "Farmacias" },
  { id: "events", label: "Eventos" },
  { id: "news", label: "Noticias" },
  { id: "comercios", label: "Comercios" },
  { id: "hosteleria", label: "Hostelería" },
  { id: "inmuebles", label: "Vivienda" },
  { id: "tablon", label: "Tablón" },
];

const MAX_IMG_MB = 2.5;
const MAX_PDF_MB = 6;

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export default function Admin() {
  const [tok, setTok] = useState(() => localStorage.getItem("utrerapp_admin_token") || "");
  const [pwd, setPwd] = useState("");
  const [tab, setTab] = useState("traffic");

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
            Introduce la contraseña de gestor municipal para editar avisos, comercios y eventos.
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
          <p className="text-[11px] text-muted-foreground mt-3 font-mono">Contraseña facilitada por el Ayuntamiento de Utrera.</p>
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

      <div
        data-testid="admin-tablist"
        className="mt-3 -mx-1 px-1 flex gap-1.5 overflow-x-auto no-scrollbar pb-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`admin-tab-${t.id}`}
            className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border ${
              tab === t.id
                ? "bg-[color:var(--terracotta)] text-white border-[color:var(--terracotta)]"
                : "bg-muted text-muted-foreground border-border/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "traffic" && (
          <AdminSection
            title="Avisos de tráfico"
            endpoint="/traffic"
            newLabel="+ Nuevo aviso"
            fields={[
              { k: "zone", label: "Zona", ph: "Trianilla" },
              { k: "status", label: "Estado", ph: "yellow", options: ["green", "yellow", "red"] },
              { k: "message", label: "Mensaje", ph: "Obras en marcha" },
              { k: "detail", label: "Detalle", ph: "Descripción larga…", ta: true },
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
        )}
        {tab === "pharmacies" && (
          <AdminSection
            title="Farmacias de guardia"
            endpoint="/pharmacies"
            newLabel="+ Nueva farmacia"
            fields={[
              { k: "name", label: "Nombre", ph: "Farmacia Ldo. Pérez" },
              { k: "address", label: "Dirección", ph: "C/ Ancha, 34" },
              { k: "phone", label: "Teléfono", ph: "955 861 234" },
              { k: "hours", label: "Horario", ph: "09:00 - 22:00" },
              { k: "on_duty_today", label: "De guardia hoy", type: "bool" },
              { k: "is_24h", label: "Abierta 24h", type: "bool" },
            ]}
            renderRow={(p) => (
              <>
                <p className="font-display font-bold text-[14px]">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.address} · {p.on_duty_today ? "🟢 Guardia" : "—"}</p>
              </>
            )}
            testKey="pharmacies"
          />
        )}
        {tab === "events" && (
          <AdminSection
            title="Eventos y fiestas"
            endpoint="/events"
            newLabel="+ Nuevo evento"
            fields={[
              { k: "title", label: "Título", ph: "Feria de la Manzanilla" },
              { k: "category", label: "Categoría", ph: "Fiestas" },
              { k: "date", label: "Fecha (YYYY-MM-DD)", ph: "2026-10-14" },
              { k: "location", label: "Lugar", ph: "Recinto ferial" },
              { k: "description", label: "Descripción", ph: "Descripción…", ta: true },
              { k: "highlighted", label: "Destacado en portada", type: "bool" },
            ]}
            renderRow={(e) => (
              <>
                <p className="font-display font-bold text-[14px]">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.date} · {e.location}</p>
              </>
            )}
            testKey="events"
          />
        )}
        {tab === "news" && (
          <AdminSection
            title="Titulares"
            endpoint="/news"
            newLabel="+ Nuevo titular"
            fields={[
              { k: "source", label: "Medio", ph: "Utrera al Día" },
              { k: "headline", label: "Titular", ph: "Titular…" },
              { k: "summary", label: "Resumen", ph: "Resumen…", ta: true },
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
        )}
        {tab === "comercios" && (
          <AdminSection
            title="Comercios (Utrera Market)"
            endpoint="/comercios"
            newLabel="+ Nuevo Comercio"
            groups={[
              {
                title: "Datos básicos",
                fields: [
                  { k: "nombre", label: "Nombre del comercio *", ph: "Boutique Trianilla" },
                  { k: "categoria", label: "Categoría *", options: ["moda", "alimentacion", "deportes", "hogar"] },
                  { k: "descripcion", label: "Descripción", ph: "Moda mujer y complementos artesanos.", ta: true },
                  { k: "tag", label: "Etiqueta (opcional)", ph: "Envío gratis > 30€" },
                ],
              },
              {
                title: "Imágenes (desde tu dispositivo)",
                fields: [
                  { k: "imagen", label: "Imagen / logo principal", type: "file-image" },
                  { k: "fotos", label: "Fotos secundarias (puedes elegir varias)", type: "file-image-multi" },
                ],
              },
              {
                title: "Contacto y acciones rápidas",
                fields: [
                  { k: "telefono", label: "Teléfono (Llamar)", ph: "955861234" },
                  { k: "direccion", label: "Dirección (GPS / Google Maps)", ph: "C/ Ancha, 34" },
                  { k: "url", label: "Tienda online / WhatsApp (CTA)", ph: "https://wa.me/34655…" },
                  { k: "web", label: "Web oficial", ph: "https://miweb.es" },
                ],
              },
              {
                title: "Carta / PDF y oferta destacada",
                fields: [
                  { k: "menu_pdf_url", label: "📄 PDF Carta / Menú", type: "file-pdf" },
                  { k: "oferta_titulo", label: "🎉 Título de oferta/evento", ph: "Rebajas de verano" },
                  { k: "oferta_texto", label: "Texto descriptivo de la oferta", ph: "Hasta un 50% dto. todo el stock.", ta: true },
                  { k: "oferta_imagen", label: "Cartel de la oferta", type: "file-image" },
                ],
              },
              {
                title: "Redes sociales",
                fields: [
                  { k: "instagram", label: "Instagram (@usuario o URL)", ph: "@mitienda" },
                  { k: "facebook", label: "Facebook (URL)", ph: "https://facebook.com/mitienda" },
                  { k: "tiktok", label: "TikTok (@usuario o URL)", ph: "@mitienda" },
                ],
              },
            ]}
            renderRow={(c) => (
              <div className="flex items-center gap-2 min-w-0">
                {isValidImage(c.imagen) && (
                  <img src={c.imagen} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-[14px] truncate">{c.nombre}{c._local ? " · 📴" : ""}</p>
                  <p className="text-xs text-muted-foreground">{c.categoria} · {c.tag || "—"}</p>
                </div>
              </div>
            )}
            testKey="comercios"
          />
        )}
        {tab === "hosteleria" && (
          <AdminSection
            title="Hostelería (Bares & Tapas)"
            endpoint="/hosteleria"
            newLabel="+ Nuevo Bar/Restaurante"
            groups={[
              {
                title: "Datos básicos",
                fields: [
                  { k: "nombre", label: "Nombre *", ph: "Bar Casa Manolo" },
                  { k: "tipo", label: "Tipo *", options: ["bares", "restaurantes", "cafes", "domicilio"] },
                  { k: "descripcion", label: "Descripción", ph: "Tapas de guiso y montaditos.", ta: true },
                  { k: "horario", label: "Horario", ph: "L-D · 12:00-16:30 y 19:30-00:00" },
                  { k: "rating", label: "Valoración (0-5)", ph: "4.7", type: "number" },
                ],
              },
              {
                title: "Imágenes (desde tu dispositivo)",
                fields: [
                  { k: "foto", label: "Foto principal", type: "file-image" },
                  { k: "fotos", label: "Fotos extra (puedes elegir varias)", type: "file-image-multi" },
                ],
              },
              {
                title: "Contacto y acciones rápidas",
                fields: [
                  { k: "telefono", label: "Teléfono (Llamar)", ph: "955861010" },
                  { k: "whatsapp", label: "WhatsApp (Reservas/Pedidos)", ph: "34655700001" },
                  { k: "zona", label: "Zona/Dirección (GPS)", ph: "C/ Ancha, 22" },
                  { k: "direccion", label: "Dirección completa (opcional)", ph: "C/ Ancha, 22, 41710 Utrera" },
                  { k: "web", label: "Web oficial", ph: "https://miweb.es" },
                  { k: "carta_url", label: "Enlace carta web (opcional)", ph: "https://miweb.es/carta" },
                ],
              },
              {
                title: "Carta / PDF y oferta destacada",
                fields: [
                  { k: "menu_pdf_url", label: "📄 PDF Carta / Menú", type: "file-pdf" },
                  { k: "oferta_titulo", label: "🎉 Título oferta/evento", ph: "Flamenco en vivo sábado" },
                  { k: "oferta_texto", label: "Descripción de la promoción", ph: "Actuación en directo a las 22h.", ta: true },
                  { k: "oferta_imagen", label: "Cartel de la promoción", type: "file-image" },
                ],
              },
              {
                title: "Redes sociales",
                fields: [
                  { k: "instagram", label: "Instagram (@usuario o URL)", ph: "@casamanolo" },
                  { k: "facebook", label: "Facebook (URL)", ph: "https://facebook.com/casamanolo" },
                  { k: "tiktok", label: "TikTok (@usuario o URL)", ph: "@casamanolo" },
                ],
              },
            ]}
            renderRow={(h) => (
              <div className="flex items-center gap-2 min-w-0">
                {isValidImage(h.foto) && (
                  <img src={h.foto} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-[14px] truncate">{h.nombre}{h._local ? " · 📴" : ""}</p>
                  <p className="text-xs text-muted-foreground">{h.tipo} · ★{h.rating} · {h.telefono}</p>
                </div>
              </div>
            )}
            testKey="hosteleria"
          />
        )}
        {tab === "inmuebles" && (
          <AdminSection
            title="Vivienda (inmuebles)"
            endpoint="/inmuebles"
            newLabel="+ Inmueble"
            groups={[
              {
                title: "Datos básicos",
                fields: [
                  { k: "titulo", label: "Título *", ph: "Piso 3 dorm. junto al Altozano" },
                  { k: "tipo", label: "Tipo *", options: ["venta", "alquiler", "garajes", "locales"] },
                  { k: "precio", label: "Precio", ph: "148.000€ o 650€/mes" },
                  { k: "descripcion", label: "Descripción", ph: "Reformado, orientación sur…", ta: true },
                ],
              },
              {
                title: "Imagen",
                fields: [
                  { k: "foto", label: "Foto principal", type: "file-image" },
                ],
              },
              {
                title: "Contacto y ubicación",
                fields: [
                  { k: "telefono", label: "Teléfono de contacto", ph: "955860100" },
                  { k: "zona", label: "Zona", ph: "Centro" },
                  { k: "agencia", label: "Agencia", ph: "Inmobiliaria Utrera Centro" },
                  { k: "dorm", label: "Dormitorios (nº)", ph: "3", type: "number" },
                  { k: "m2", label: "Superficie m² (nº)", ph: "92", type: "number" },
                ],
              },
            ]}
            renderRow={(v) => (
              <div className="flex items-center gap-2 min-w-0">
                {isValidImage(v.foto) && (
                  <img src={v.foto} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-[14px] truncate">{v.titulo}{v._local ? " · 📴" : ""}</p>
                  <p className="text-xs text-muted-foreground">{v.tipo} · {v.precio} · {v.zona}</p>
                </div>
              </div>
            )}
            testKey="inmuebles"
          />
        )}
        {tab === "tablon" && <AdminTablon />}
      </div>

      <BottomNav />
    </div>
  );
}

function AdminSection({
  title, endpoint, fields, groups, renderRow, testKey, newLabel = "+ Nuevo",
}) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const allFields = groups ? groups.flatMap((g) => g.fields) : (fields || []);

  const load = async () => {
    try {
      const r = await api.get(endpoint);
      setItems(mergeWithLocal(endpoint, r.data));
    } catch {
      setItems(mergeWithLocal(endpoint, []));
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const coerce = (payload) => {
    for (const f of allFields) {
      const v = payload[f.k];
      if (f.type === "bool") payload[f.k] = v === true || String(v).toLowerCase() === "true";
      if (f.type === "number" && v !== undefined && v !== "" && v !== null) {
        const n = Number(v);
        payload[f.k] = Number.isFinite(n) ? n : v;
      }
      if (f.type === "file-image-multi" && !Array.isArray(v)) {
        payload[f.k] = v ? [v] : [];
      }
    }
    return payload;
  };

  const startEdit = (item) => {
    const base = {};
    for (const f of allFields) {
      base[f.k] = item[f.k] ?? (f.type === "file-image-multi" ? [] : "");
    }
    base.id = item.id;
    base._local = !!item._local;
    setForm(base);
    setEditingId(item.id);
    setOpen(true);
  };

  const cancelEdit = () => {
    setForm({});
    setEditingId(null);
    setOpen(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = coerce({ ...form });
    if (editingId) payload.id = editingId;
    try {
      await api.post(endpoint, payload);
      toast.success(editingId ? "Cambios guardados" : "Guardado en el servidor");
      // If item was local-only, promote to server copy by removing local trace
      if (editingId && form._local) removeLocal(endpoint, editingId);
      setForm({});
      setEditingId(null);
      setOpen(false);
      load();
    } catch (err) {
      const saved = addLocal(endpoint, { ...payload, id: payload.id || genLocalId() });
      const status = err?.response?.status;
      toast(
        status === 401
          ? (editingId ? "Cambios guardados offline (token caducado)" : "Guardado offline (token caducado)")
          : (editingId ? "Cambios guardados offline" : "Guardado offline"),
        { description: saved.nombre || saved.titulo || saved.headline || saved.name || "Registro local" }
      );
      setForm({});
      setEditingId(null);
      setOpen(false);
      load();
    }
  };

  const remove = async (id, isLocal) => {
    if (isLocal) {
      removeLocal(endpoint, id);
      toast.success("Eliminado (local)");
      load();
      return;
    }
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success("Eliminado");
      load();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 404) {
        removeLocal(endpoint, id);
        toast.success("Eliminado localmente");
        load();
      } else {
        toast.error("Error al eliminar");
      }
    }
  };

  const setKey = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const renderInput = (f) => {
    const common = {
      value: form[f.k] ?? "",
      onChange: (e) => setKey(f.k, e.target.value),
      placeholder: f.ph,
      "data-testid": `admin-input-${testKey}-${f.k}`,
      className: "mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--terracotta)]",
    };

    if (f.type === "bool") {
      const checked = form[f.k] === true || String(form[f.k]).toLowerCase() === "true";
      return (
        <button
          type="button"
          onClick={() => setKey(f.k, !checked)}
          data-testid={`admin-input-${testKey}-${f.k}`}
          className={`mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            checked ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${checked ? "bg-white" : "bg-slate-400"}`} />
          {checked ? "Sí" : "No"}
        </button>
      );
    }
    if (f.options) {
      return (
        <select {...common}>
          <option value="">—</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.ta) {
      return <textarea rows={3} {...common} className={common.className + " resize-none"} />;
    }
    if (f.type === "file-image") {
      return (
        <FileImageField
          testKey={testKey}
          fieldKey={f.k}
          value={form[f.k]}
          onChange={(v) => setKey(f.k, v)}
        />
      );
    }
    if (f.type === "file-image-multi") {
      return (
        <FileImageMultiField
          testKey={testKey}
          fieldKey={f.k}
          value={Array.isArray(form[f.k]) ? form[f.k] : (form[f.k] ? [form[f.k]] : [])}
          onChange={(v) => setKey(f.k, v)}
        />
      );
    }
    if (f.type === "file-pdf") {
      return (
        <FilePdfField
          testKey={testKey}
          fieldKey={f.k}
          value={form[f.k]}
          onChange={(v) => setKey(f.k, v)}
        />
      );
    }
    return <input {...common} />;
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="font-display font-bold text-[14px]">{title}</p>
        <button
          onClick={() => (open ? cancelEdit() : setOpen(true))}
          data-testid={`admin-add-${testKey}`}
          className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[color:var(--terracotta)] text-white"
        >
          <Plus size={12} /> {newLabel}
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          data-testid={`admin-form-${testKey}`}
          className="rounded-2xl border border-border/70 bg-card p-3 mb-3 space-y-3"
        >
          {editingId && (
            <div
              data-testid={`admin-edit-banner-${testKey}`}
              className="rounded-xl bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta-dark)] px-3 py-2 text-xs font-semibold flex items-center gap-2"
            >
              <Pencil size={13} /> Editando registro existente · ID {editingId.slice(0, 10)}…
            </div>
          )}
          {groups ? (
            groups.map((g) => (
              <details key={g.title} open className="group rounded-xl bg-muted/50">
                <summary className="list-none cursor-pointer flex items-center justify-between px-3 py-2 font-display font-bold text-[12px] uppercase tracking-wider text-muted-foreground">
                  {g.title}
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  {g.fields.map((f) => (
                    <div key={f.k}>
                      <label className="text-[11px] text-muted-foreground font-semibold">{f.label}</label>
                      {renderInput(f)}
                    </div>
                  ))}
                </div>
              </details>
            ))
          ) : (
            (fields || []).map((f) => (
              <div key={f.k}>
                <label className="text-[11px] text-muted-foreground font-semibold">{f.label}</label>
                {renderInput(f)}
              </div>
            ))
          )}
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                data-testid={`admin-cancel-${testKey}`}
                className="flex-1 py-2.5 rounded-full bg-muted text-sm font-semibold"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              data-testid={`admin-submit-${testKey}`}
              className={`flex-1 py-2.5 rounded-full text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 ${
                editingId ? "bg-[color:var(--transit)]" : "bg-[color:var(--terracotta)]"
              }`}
            >
              {editingId ? <><Save size={14} /> Guardar Cambios / Actualizar</> : <><Plus size={14} /> Guardar</>}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2" data-testid={`admin-list-${testKey}`}>
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Sin registros todavía.</p>
        )}
        {items.map((it) => (
          <div
            key={it.id}
            data-testid={`admin-item-${testKey}-${it.id}`}
            className="rounded-xl border border-border/70 bg-card p-3 flex items-start justify-between gap-2"
          >
            <div className="flex-1 min-w-0">{renderRow(it)}</div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => startEdit(it)}
                data-testid={`admin-edit-${testKey}-${it.id}`}
                className="w-8 h-8 rounded-full bg-[color:var(--transit)]/15 text-[color:var(--transit)] grid place-items-center"
                aria-label="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => remove(it.id, !!it._local)}
                data-testid={`admin-delete-${testKey}-${it.id}`}
                className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 grid place-items-center"
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- File fields ----------
function FileImageField({ testKey, fieldKey, value, onChange }) {
  const ref = useRef(null);
  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen");
      return;
    }
    if (file.size > MAX_IMG_MB * 1024 * 1024) {
      toast.error(`La imagen pesa más de ${MAX_IMG_MB} MB. Reduce la calidad e inténtalo de nuevo.`);
      return;
    }
    try {
      const data = await readAsDataUrl(file);
      onChange(data);
    } catch {
      toast.error("No se pudo leer la imagen");
    } finally {
      if (ref.current) ref.current.value = "";
    }
  };
  const hasImg = isValidImage(value);
  return (
    <div className="mt-1 space-y-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={onPick}
        data-testid={`admin-fileimg-input-${testKey}-${fieldKey}`}
        className="hidden"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          data-testid={`admin-fileimg-pick-${testKey}-${fieldKey}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta-dark)] text-xs font-semibold"
        >
          <ImageIcon size={13} /> Seleccionar imagen
        </button>
        {hasImg && (
          <button
            type="button"
            onClick={() => onChange("")}
            data-testid={`admin-fileimg-clear-${testKey}-${fieldKey}`}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-muted text-xs font-semibold"
          >
            <X size={12} /> Quitar
          </button>
        )}
      </div>
      {hasImg && (
        <img
          src={value}
          alt="preview"
          data-testid={`admin-fileimg-preview-${testKey}-${fieldKey}`}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          className="w-full max-w-[180px] h-24 rounded-lg object-cover border border-border"
        />
      )}
    </div>
  );
}

function FileImageMultiField({ testKey, fieldKey, value, onChange }) {
  const ref = useRef(null);
  const list = Array.isArray(value) ? value : [];
  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const added = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_IMG_MB * 1024 * 1024) {
        toast.error(`"${f.name}" pesa más de ${MAX_IMG_MB} MB — descartada.`);
        continue;
      }
      try {
        added.push(await readAsDataUrl(f));
      } catch { /* ignore */ }
    }
    onChange([...list, ...added]);
    if (ref.current) ref.current.value = "";
  };
  const removeAt = (i) => onChange(list.filter((_, idx) => idx !== i));
  return (
    <div className="mt-1 space-y-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={onPick}
        data-testid={`admin-filemulti-input-${testKey}-${fieldKey}`}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        data-testid={`admin-filemulti-pick-${testKey}-${fieldKey}`}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta-dark)] text-xs font-semibold"
      >
        <ImageIcon size={13} /> Añadir fotos ({list.length})
      </button>
      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5" data-testid={`admin-filemulti-preview-${testKey}-${fieldKey}`}>
          {list.map((src, i) => (
            isValidImage(src) ? (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-full h-16 rounded-lg object-cover border border-border" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  data-testid={`admin-filemulti-remove-${testKey}-${fieldKey}-${i}`}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white grid place-items-center text-[10px]"
                  aria-label="Quitar foto"
                >
                  <X size={10} />
                </button>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}

function FilePdfField({ testKey, fieldKey, value, onChange }) {
  const ref = useRef(null);
  const [name, setName] = useState(() => {
    if (!value) return "";
    if (typeof value === "string" && value.startsWith("data:application/pdf")) return "Documento PDF adjunto";
    if (typeof value === "string") return value.split("/").pop() || "Documento";
    return "";
  });

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Selecciona un archivo PDF");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      toast.error(`El PDF pesa más de ${MAX_PDF_MB} MB. Reduce el peso e inténtalo de nuevo.`);
      return;
    }
    try {
      const data = await readAsDataUrl(file);
      onChange(data);
      setName(file.name);
    } catch {
      toast.error("No se pudo leer el PDF");
    } finally {
      if (ref.current) ref.current.value = "";
    }
  };

  const clear = () => { onChange(""); setName(""); };

  return (
    <div className="mt-1 space-y-2">
      <input
        ref={ref}
        type="file"
        accept="application/pdf,.pdf"
        onChange={onPick}
        data-testid={`admin-filepdf-input-${testKey}-${fieldKey}`}
        className="hidden"
      />
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          data-testid={`admin-filepdf-pick-${testKey}-${fieldKey}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta-dark)] text-xs font-semibold"
        >
          <FileUp size={13} /> Seleccionar PDF de carta/menú
        </button>
        {value && (
          <button
            type="button"
            onClick={clear}
            data-testid={`admin-filepdf-clear-${testKey}-${fieldKey}`}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-muted text-xs font-semibold"
          >
            <X size={12} /> Quitar
          </button>
        )}
      </div>
      {value && (
        <div
          data-testid={`admin-filepdf-preview-${testKey}-${fieldKey}`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-xs font-mono text-foreground/80"
        >
          <FileText size={14} className="text-[color:var(--terracotta)]" />
          <span className="truncate max-w-[220px]">{name || "Documento PDF"}</span>
        </div>
      )}
    </div>
  );
}

// ---------- Tablón (unchanged structure, kept for completeness) ----------
function AdminTablon() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async () => {
    try {
      const r = await api.get("/anuncios/all");
      setItems(mergeWithLocal("/anuncios", r.data));
    } catch {
      setItems(mergeWithLocal("/anuncios", []));
      toast.message("Modo offline: mostrando anuncios locales");
    }
  };
  useEffect(() => { load(); }, []);

  const setActive = async (a, es_activo) => {
    if (a._local) {
      patchLocal("/anuncios", a.id, { es_activo });
      toast.success(es_activo ? "Anuncio aprobado (local)" : "Ocultado (local)");
      load();
      return;
    }
    try {
      await api.patch(`/anuncios/${a.id}`, { es_activo });
      toast.success(es_activo ? "Anuncio aprobado" : "Anuncio ocultado");
      load();
    } catch {
      patchLocal("/anuncios", a.id, { es_activo });
      toast.success("Guardado offline");
      load();
    }
  };

  const remove = async (a) => {
    if (a._local) {
      removeLocal("/anuncios", a.id);
      toast.success("Eliminado (local)");
      load();
      return;
    }
    try {
      await api.delete(`/anuncios/${a.id}`);
      toast.success("Eliminado");
      load();
    } catch {
      removeLocal("/anuncios", a.id);
      toast.success("Eliminado localmente");
      load();
    }
  };

  const saveEdit = async (a) => {
    const patch = { ...draft };
    if (a._local) {
      patchLocal("/anuncios", a.id, patch);
      toast.success("Guardado (local)");
      setEditing(null); setDraft({}); load();
      return;
    }
    try {
      await api.patch(`/anuncios/${a.id}`, patch);
      toast.success("Guardado");
      setEditing(null); setDraft({}); load();
    } catch {
      patchLocal("/anuncios", a.id, patch);
      toast.success("Guardado offline");
      setEditing(null); setDraft({}); load();
    }
  };

  const pending = items.filter((i) => !i.es_activo);
  const active = items.filter((i) => i.es_activo);

  const Row = ({ a }) => {
    const isEditing = editing === a.id;
    return (
      <div
        data-testid={`admin-tablon-item-${a.id}`}
        className={`rounded-2xl border p-3 space-y-2 ${
          a.es_activo ? "border-border/70 bg-card" : "border-amber-400/50 bg-amber-50 dark:bg-amber-500/10"
        }`}
      >
        {isEditing ? (
          <div className="space-y-2">
            {["titulo", "precio", "descripcion", "whatsapp", "autor", "categoria"].map((k) => (
              <input
                key={k}
                value={draft[k] ?? a[k] ?? ""}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                data-testid={`admin-tablon-edit-${k}-${a.id}`}
                placeholder={k}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs outline-none focus:border-[color:var(--terracotta)]"
              />
            ))}
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(a)}
                data-testid={`admin-tablon-save-${a.id}`}
                className="flex-1 py-1.5 rounded-full bg-[color:var(--terracotta)] text-white text-xs font-semibold inline-flex items-center justify-center gap-1"
              >
                <Save size={12} /> Guardar
              </button>
              <button
                onClick={() => { setEditing(null); setDraft({}); }}
                className="flex-1 py-1.5 rounded-full bg-muted text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.categoria === "venta" ? "bg-emerald-100 text-emerald-800"
                      : a.categoria === "compra" ? "bg-sky-100 text-sky-800"
                        : "bg-[color:var(--secondary)]/25 text-[color:var(--terracotta-dark)]"
                  }`}>{a.categoria?.toUpperCase()}</span>
                  {!a.es_activo && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">PENDIENTE</span>
                  )}
                  {a._local && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200">OFFLINE</span>}
                </div>
                <p className="font-display font-bold text-[14px] mt-1 leading-tight">{a.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.descripcion}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {a.autor} · WA {a.whatsapp} · {a.precio}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {a.es_activo ? (
                <button
                  onClick={() => setActive(a, false)}
                  data-testid={`admin-tablon-hide-${a.id}`}
                  className="flex-1 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <X size={12} /> Ocultar
                </button>
              ) : (
                <button
                  onClick={() => setActive(a, true)}
                  data-testid={`admin-tablon-approve-${a.id}`}
                  className="flex-1 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center justify-center gap-1"
                >
                  <Check size={12} /> Aprobar
                </button>
              )}
              <button
                onClick={() => { setEditing(a.id); setDraft({}); }}
                data-testid={`admin-tablon-edit-${a.id}`}
                className="px-3 py-1.5 rounded-full bg-muted text-xs font-semibold inline-flex items-center gap-1"
              >
                <Pencil size={12} /> Editar
              </button>
              <button
                onClick={() => remove(a)}
                data-testid={`admin-tablon-delete-${a.id}`}
                className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 grid place-items-center"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <section data-testid="admin-tablon">
      <p className="font-display font-bold text-[14px] px-1">
        Tablón de anuncios · moderación vecinal
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 px-1">
        Los anuncios enviados por los vecinos aparecen aquí. Puedes aprobarlos, editarlos u ocultarlos.
      </p>

      {pending.length > 0 && (
        <>
          <p className="mt-4 mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300 font-semibold px-1">
            {pending.length} pendientes de aprobación
          </p>
          <div className="space-y-2">
            {pending.map((a) => <Row key={a.id} a={a} />)}
          </div>
        </>
      )}

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        {active.length} anuncios activos
      </p>
      <div className="space-y-2">
        {active.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Sin anuncios activos.</p>
        )}
        {active.map((a) => <Row key={a.id} a={a} />)}
      </div>
    </section>
  );
}
