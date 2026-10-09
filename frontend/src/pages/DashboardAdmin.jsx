import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import {
  Building2,
  Utensils,
  Home as HomeIcon,
  Cross,
  Plus,
  Trash2,
  Search,
  Globe,
  MapPin,
  Instagram,
  Facebook,
  Phone,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function DashboardAdmin() {
  const [tab, setTab] = useState("comercios");
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    categoria: "moda",
    descripcion: "",
    direccion: "",
    telefono: "",
    url: "",
    imagen: "",
    imagen_2: "",
    imagen_3: "",
    lat: "37.1820",
    lng: "-5.7811",
    instagram: "",
    tiktok: "",
    facebook: "",
    tag: "",
    de_guardia: false,
  });

  const cargarDatos = () => {
    setCargando(true);
    api
      .get(`/${tab}`)
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, [tab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post(`/${tab}`, form)
      .then(() => {
        setMensaje("¡Registro guardado con éxito!");
        setForm({
          nombre: "",
          categoria: "moda",
          descripcion: "",
          direccion: "",
          telefono: "",
          url: "",
          imagen: "",
          imagen_2: "",
          imagen_3: "",
          lat: "37.1820",
          lng: "-5.7811",
          instagram: "",
          tiktok: "",
          facebook: "",
          tag: "",
          de_guardia: false,
        });
        cargarDatos();
        setTimeout(() => setMensaje(""), 4000);
      })
      .catch((err) => {
        setMensaje("Error al guardar: " + (err.response?.data?.detail || err.message));
      });
  };

  const eliminarItem = (id) => {
    if (!confirm("¿Seguro que deseas eliminar este registro de Utrerapp?")) return;
    api
      .delete(`/${tab}/${id}`)
      .then(() => cargarDatos())
      .catch((err) => alert("Error al borrar: " + err.message));
  };

  const filtrados = items.filter(
    (it) =>
      it.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      it.direccion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 font-sans p-4 lg:p-8 pb-24" data-testid="dashboard-admin">
      <TopBar title="Escritorio de Gestión · Admin" back testId="dashboard-topbar" />

      {/* Cabecera Principal */}
      <div className="mt-2 p-5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[color:var(--terracotta)] grid place-items-center font-bold text-xl text-white shadow-sm">
            U
          </div>
          <div>
            <h1 className="font-display font-bold text-xl leading-tight">
              Panel de Administración · Utrerapp
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión de Comercios, Hostelería, Farmacias e Inmuebles de Utrera
            </p>
          </div>
        </div>

        <button
          onClick={cargarDatos}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors border border-slate-700"
        >
          <RefreshCw size={15} className={cargando ? "animate-spin" : ""} /> Actualizar Datos
        </button>
      </div>

      {/* Selector de Módulos */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold shadow-sm">
        <button
          onClick={() => setTab("comercios")}
          className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            tab === "comercios"
              ? "bg-slate-900 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 size={18} /> Comercios & Tiendas
        </button>

        <button
          onClick={() => setTab("hosteleria")}
          className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            tab === "hosteleria"
              ? "bg-slate-900 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Utensils size={18} /> Bares / Tapas
        </button>

        <button
          onClick={() => setTab("farmacias")}
          className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            tab === "farmacias"
              ? "bg-slate-900 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Cross size={18} /> Farmacias
        </button>

        <button
          onClick={() => setTab("inmuebles")}
          className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            tab === "inmuebles"
              ? "bg-slate-900 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <HomeIcon size={18} /> Inmuebles
        </button>
      </div>

      {mensaje && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" /> {mensaje}
        </div>
      )}

      {/* Módulo Principal en 2 Columnas Anchas */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario Espacioso (7 columnas) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-base flex items-center gap-2 text-slate-900">
              <Plus size={20} className="text-[color:var(--terracotta)]" /> Alta / Edición en {tab.toUpperCase()}
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold block text-slate-700 mb-1">
                Nombre Oficial del Negocio *
              </label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Bar Alonsi / Modas Esperanza"
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-sm font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block text-slate-700 mb-1">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium"
                >
                  <option value="moda">Moda & Calzado</option>
                  <option value="alimentacion">Alimentación</option>
                  <option value="hogar">Hogar & Decó</option>
                  <option value="deportes">Deportes</option>
                  <option value="hosteleria">Bares / Tapas</option>
                  <option value="servicios">Servicios</option>
                </select>
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Etiqueta Promocional</label>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="Ej: Envío Gratis / -10%"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block text-slate-700 mb-1">Descripción Breve</label>
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Resumen atractivo para los vecinos de Utrera..."
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block text-slate-700 mb-1">Dirección en Utrera</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Plaza del Altozano, 4"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="95486XXXX"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium"
                />
              </div>
            </div>

            {/* Enlace Tienda Web */}
            <div>
              <label className="font-bold block text-[color:var(--terracotta)] mb-1 flex items-center gap-1.5">
                <Globe size={15} /> Tienda Online / Página Web Oficial
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://su-tienda-online.com"
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium"
              />
            </div>

            {/* Galería de 3 Fotos */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold block text-slate-700 flex items-center gap-1.5">
                <ImageIcon size={15} /> Galería de Fotos (3 Imágenes)
              </label>
              <input
                type="text"
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                placeholder="Foto 1: Portada Principal (URL)"
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
              <input
                type="text"
                value={form.imagen_2}
                onChange={(e) => setForm({ ...form, imagen_2: e.target.value })}
                placeholder="Foto 2: Muestra de productos / local (URL)"
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
              <input
                type="text"
                value={form.imagen_3}
                onChange={(e) => setForm({ ...form, imagen_3: e.target.value })}
                placeholder="Foto 3: Catálogo secundario (URL)"
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            {/* Coordenadas GPS */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="font-bold block text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} /> Latitud GPS
                </label>
                <input
                  type="text"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                />
              </div>
              <div>
                <label className="font-bold block text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} /> Longitud GPS
                </label>
                <input
                  type="text"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold block text-slate-700">Redes Sociales del Comercio</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="Instagram URL"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
                <input
                  type="text"
                  value={form.tiktok}
                  onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                  placeholder="TikTok URL"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
                <input
                  type="text"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="Facebook URL"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-4 rounded-xl bg-[color:var(--terracotta)] hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Publicar Establecimiento en Utrerapp
          </button>
        </form>

        {/* Columna Derecha: Registros y Buscador (5 columnas) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-base text-slate-900">
              Registros en {tab.toUpperCase()} ({filtrados.length})
            </h3>

            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o dirección..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {cargando && (
              <p className="text-xs text-slate-400 text-center py-8">Cargando datos de Utrerapp...</p>
            )}

            {!cargando && filtrados.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">
                No hay registros introducidos en esta categoría.
              </p>
            )}

            {filtrados.map((it) => (
              <div
                key={it.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-start justify-between gap-3 transition-colors shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-900">{it.nombre}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    {it.direccion || "Sin dirección asignada"}
                  </p>
                  {it.url && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mt-1">
                      🛒 Tienda Online Activa
                    </span>
                  )}
                </div>

                <button
                  onClick={() => eliminarItem(it.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}