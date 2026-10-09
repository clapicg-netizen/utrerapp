import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { api } from "@/lib/api";
import {
  MapPin,
  Phone,
  Globe,
  Search,
  ChevronRight,
  X,
  Navigation,
  FileText,
  Tag,
} from "lucide-react";

// BASE DE DATOS INICIAL CON FOTOS E INFORMACIÓN COMPLETA
const COMERCIOS_OFICIALES = [
  {
    id: "c_digital_gm",
    nombre: "DIGITAL GM",
    categoria: "hogar",
    descripcion:
      "Le ofrecemos los mejores PRECIOS y SERVICIOS. Trabajamos con las principales MARCAS del mercado. Contamos con más de 5000 referencias en stock. Nos encargamos de la gestión de la GARANTÍA. Financiación a medida: Pague hasta en 12 meses sin intereses.",
    direccion: "Avda. María Auxiliadora, 40, Utrera",
    telefono: "679612288",
    url: "https://www.digitalgm.es/",
    tag: "Servicio Técnico & Electro",
    oferta: "Financiación a medida: Pague hasta en 12 meses sin intereses.",
    imagen: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    imagen_2: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80",
    lat: "37.1861",
    lng: "-5.7738",
  },
  {
    id: "c_innpresionante",
    nombre: "Innpresionante",
    categoria: "moda",
    descripcion:
      "Tienda de camisetas personalizadas, sudaderas y ropa con diseños exclusivos. Impresión digital y regalos personalizados en Utrera.",
    direccion: "Utrera, Sevilla",
    telefono: "954860000",
    url: "https://innpresionante.com/",
    tag: "Moda & Personalización",
    imagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    lat: "37.1820",
    lng: "-5.7811",
  },
];

export default function Market() {
  const [comercios, setComercios] = useState(COMERCIOS_OFICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [comercioSel, setComercioSel] = useState(null);

  useEffect(() => {
    const cargarComercios = async () => {
      // 1. Leemos lo que haya guardado localmente
      const locales = JSON.parse(localStorage.getItem("local_comercios") || "[]");

      try {
        // 2. Intentamos pedir al servidor
        const res = await api.get("/comercios");
        const apiComercios = Array.isArray(res.data) ? res.data : [];

        // 3. Fusionamos todo (Base Oficial + Servidor + Guardado Local)
        const todos = [...COMERCIOS_OFICIALES, ...apiComercios, ...locales];
        const mapa = new Map();

        todos.forEach((item) => {
          const key = (item.nombre || item.titulo || "").toLowerCase().trim();
          if (key) mapa.set(key, item);
        });

        setComercios(Array.from(mapa.values()));
      } catch (error) {
        // Si no responde la API, fusionamos base oficial + datos locales
        const todos = [...COMERCIOS_OFICIALES, ...locales];
        const mapa = new Map();
        todos.forEach((item) => {
          const key = (item.nombre || item.titulo || "").toLowerCase().trim();
          if (key) mapa.set(key, item);
        });
        setComercios(Array.from(mapa.values()));
      }
    };

    cargarComercios();
  }, []);

  const filtrados = comercios.filter((c) => {
    const nombre = c.nombre || c.titulo || "";
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto =
      !texto ||
      nombre.toLowerCase().includes(texto) ||
      (c.descripcion || "").toLowerCase().includes(texto) ||
      (c.direccion || "").toLowerCase().includes(texto);

    const catNormalizada = (c.categoria || "").toLowerCase();
    const coincideCat =
      categoria === "todos" ||
      catNormalizada === categoria.toLowerCase() ||
      (categoria === "hogar" &&
        (catNormalizada.includes("hogar") || catNormalizada.includes("electro")));

    return coincideTexto && coincideCat;
  });

  const abrirMapa = (c) => {
    if (c.lat && c.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, "_blank");
    } else if (c.direccion) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          (c.nombre || c.titulo) + " " + c.direccion + " Utrera"
        )}`,
        "_blank"
      );
    }
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <TopBar title="Utrera Market · Comercio Local" back />

      {/* Buscador */}
      <div className="p-4 bg-white border-b border-slate-100 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar comercios en Utrera..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:bg-white focus:border-slate-400 transition-all"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: "todos", label: "Todos" },
            { id: "hogar", label: "Hogar & Electro" },
            { id: "moda", label: "Moda" },
            { id: "alimentacion", label: "Alimentación" },
            { id: "deportes", label: "Deportes" },
            { id: "servicios", label: "Servicios" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                categoria === cat.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Comercios */}
      <div className="p-4 space-y-3">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-xs font-bold text-slate-600">
              No hay comercios guardados en esta categoría.
            </p>
            <p className="text-[11px] text-slate-400">
              Selecciona "Todos" para ver el catálogo completo.
            </p>
          </div>
        ) : (
          filtrados.map((comercio) => {
            const nombre = comercio.nombre || comercio.titulo;
            return (
              <div
                key={comercio.id || nombre}
                onClick={() => setComercioSel(comercio)}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{nombre}</h3>
                      {comercio.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {comercio.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{comercio.descripcion}</p>
                  </div>

                  {comercio.imagen && comercio.imagen.length > 10 && (
                    <img
                      src={comercio.imagen}
                      alt={nombre}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border"
                    />
                  )}
                </div>

                {comercio.oferta && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200/60">
                    <Tag size={13} className="text-amber-600 shrink-0" />
                    <span className="line-clamp-1">{comercio.oferta}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {comercio.direccion || "Utrera"}
                  </span>

                  <span className="font-bold text-[color:var(--terracotta)] flex items-center gap-0.5">
                    Ver Ficha <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Ficha Completa */}
      {comercioSel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 p-5 relative">
            <button
              onClick={() => setComercioSel(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 z-10"
            >
              <X size={18} />
            </button>

            {/* Foto Principal */}
            {comercioSel.imagen && comercioSel.imagen.length > 10 && (
              <img
                src={comercioSel.imagen}
                alt={comercioSel.nombre || comercioSel.titulo}
                className="w-full h-48 rounded-2xl object-cover border"
              />
            )}

            {/* Fotos Adicionales */}
            {(comercioSel.imagen_2 || comercioSel.imagen_3) && (
              <div className="grid grid-cols-2 gap-2">
                {comercioSel.imagen_2 && comercioSel.imagen_2.length > 10 && (
                  <img
                    src={comercioSel.imagen_2}
                    alt="Foto 2"
                    className="w-full h-24 rounded-xl object-cover border"
                  />
                )}
                {comercioSel.imagen_3 && comercioSel.imagen_3.length > 10 && (
                  <img
                    src={comercioSel.imagen_3}
                    alt="Foto 3"
                    className="w-full h-24 rounded-xl object-cover border"
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <h2 className="font-display font-bold text-lg text-slate-900">
                {comercioSel.nombre || comercioSel.titulo}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">{comercioSel.descripcion}</p>
            </div>

            {/* Promoción u Oferta */}
            {comercioSel.oferta && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} /> Promoción / Evento
                </p>
                <p className="text-xs text-amber-900 font-medium">{comercioSel.oferta}</p>
              </div>
            )}

            {/* Ver Carta / Menú en PDF */}
            {comercioSel.pdf && (
              <a
                href={comercioSel.pdf}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow hover:bg-slate-800 transition-colors"
              >
                <FileText size={16} /> Ver Carta / Menú en PDF
              </a>
            )}

            {/* Contacto y Botones */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {comercioSel.direccion && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin size={15} className="text-[color:var(--terracotta)] shrink-0" />
                  <span>{comercioSel.direccion}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                {comercioSel.telefono && (
                  <a
                    href={`tel:${comercioSel.telefono}`}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Phone size={14} className="text-emerald-600" /> Llamar
                  </a>
                )}

                <button
                  onClick={() => abrirMapa(comercioSel)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5"
                >
                  <Navigation size={14} className="text-sky-600" /> Cómo llegar
                </button>
              </div>

              {comercioSel.url && (
                <a
                  href={comercioSel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 w-full py-3 rounded-xl bg-[color:var(--terracotta)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Globe size={15} /> Visitar Web / Tienda Online
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}