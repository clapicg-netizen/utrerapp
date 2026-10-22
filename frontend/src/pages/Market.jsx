import React, { useState, useEffect } from "react";
import { Phone, Navigation, Globe, Search, MapPin, ExternalLink, ShoppingCart, Plus, Minus, CheckCircle } from "lucide-react";
import { obtenerComercios, obtenerEspecial1Items, obtenerEspecial2Items } from "../lib/comerciosService";

export default function Market() {
  const [comercios, setComercios] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("Todos");
  const [comercioSel, setComercioSel] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados para Ficha Especial 1 (Inmobiliarias)
  const [especial1Items, setEspecial1Items] = useState([]);
  const [filtroModalidad, setFiltroModalidad] = useState("Todos");

  // Estados para Ficha Especial 2 (Comida a domicilio / Encargos)
  const [especial2Items, setEspecial2Items] = useState([]);
  const [carrito, setCarrito] = useState({}); // { itemId: cantidad }
  const [datosCliente, setDatosCliente] = useState({ nombre: "", direccion: "", notas: "", tipoEntrega: "A domicilio", pago: "Bizum" });

  const categorias = ["Todos", "Hostelería", "Inmobiliarias", "Comercio", "Servicios", "Salud y Belleza"];

  useEffect(() => {
    cargarComercios();
  }, [categoriaSel]);

  const cargarComercios = async () => {
    setCargando(true);
    const data = await obtenerComercios(categoriaSel);
    setComercios(data || []);
    setCargando(false);
  };

  // Al abrir un comercio, comprobamos si tiene fichas especiales asociadas
  const abrirComercio = async (comercio) => {
    setComercioSel(comercio);
    setCarrito({});
    setEspecial1Items([]);
    setEspecial2Items([]);

    if (comercio.tipo_ficha === "especial_1" || comercio.categoria === "Inmobiliarias") {
      const items = await obtenerEspecial1Items(comercio.id);
      setEspecial1Items(items || []);
    } else if (comercio.tipo_ficha === "especial_2" || comercio.categoria === "Hostelería") {
      const items = await obtenerEspecial2Items(comercio.id);
      setEspecial2Items(items || []);
    }
  };

  const comerciosFiltrados = comercios.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.subcategoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirMapa = (comercio) => {
    const direccionEscapada = encodeURIComponent(`${comercio.direccion || comercio.nombre}, Utrera`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${direccionEscapada}`, "_blank");
  };

  // Lógica Carrito Ficha 2
  const actualizarCantidad = (id, delta) => {
    setCarrito(prev => {
      const actual = prev[id] || 0;
      const nuevo = actual + delta;
      if (nuevo <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nuevo };
    });
  };

  const calcularTotalCarrito = () => {
    return Object.entries(carrito).reduce((total, [id, cant]) => {
      const item = especial2Items.find(i => i.id == id);
      return total + (item ? Number(item.precio) * cant : 0);
    }, 0);
  };

  const enviarPedidoWhatsApp = () => {
    if (!comercioSel?.whatsapp) return;
    let mensaje = `🛒 *NUEVO PEDIDO - Utrerapp*\n*Comercio:* ${comercioSel.nombre}\n\n`;
    
    Object.entries(carrito).forEach(([id, cant]) => {
      const item = especial2Items.find(i => i.id == id);
      if (item) {
        mensaje += `• ${cant}x ${item.nombre_producto} (${(item.precio * cant).toFixed(2)}€)\n`;
      }
    });

    const total = calcularTotalCarrito();
    const envio = comercioSel.coste_envio || 0;
    const totalConEnvio = total + (typeof envio === 'number' ? envio : 0);

    mensaje += `\n*Subtotal:* ${total.toFixed(2)}€`;
    if (comercioSel.coste_envio) mensaje += `\n*Envío:* ${comercioSel.coste_envio}`;
    mensaje += `\n*TOTAL A PAGAR:* ${totalConEnvio.toFixed(2)}€\n\n`;
    mensaje += `👤 *Cliente:* ${datosCliente.nombre || "No especificado"}\n`;
    mensaje += `📍 *Entrega:* ${datosCliente.tipoEntrega} - ${datosCliente.direccion || "No especificada"}\n`;
    mensaje += `💳 *Pago:* ${datosCliente.pago}\n`;
    if (datosCliente.notas) mensaje += `📝 *Notas:* ${datosCliente.notas}\n`;

    const url = `https://wa.me/${comercioSel.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800 font-sans">
      
      {/* Cabecera */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold">Guía Comercial Utrera</h1>
        <p className="text-xs text-slate-400 mt-1">Encuentra los mejores comercios y servicios locales</p>
        
        {/* Buscador */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Buscar comercio, servicio o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-2xl text-sm border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        </div>
      </div>

      {/* Categorías */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSel(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              categoriaSel === cat
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Comercios */}
      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        {cargando ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando guía comercial...</div>
        ) : comerciosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-500 font-medium text-sm">No se encontraron comercios</p>
          </div>
        ) : (
          comerciosFiltrados.map((comercio) => (
            <div
              key={comercio.id}
              onClick={() => abrirComercio(comercio)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              {comercio.destacado && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                  ⭐ PREMIUM
                </span>
              )}

              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                  <img
                    src={comercio.portada_url || comercio.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                    alt={comercio.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate">{comercio.nombre}</h3>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                    {comercio.subcategoria || comercio.categoria}
                  </p>
                  
                  {comercio.direccion && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{comercio.direccion}</span>
                    </p>
                  )}

                  {comercio.descripcion && (
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                      {comercio.descripcion}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  abrirComercio(comercio);
                }}
                className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center flex items-center justify-center gap-1.5"
              >
                👁️ Ver Ficha {comercio.tipo_ficha === 'especial_1' ? 'Inmobiliaria' : comercio.tipo_ficha === 'especial_2' ? 'Catálogo & Pedidos' : 'Completa'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL / VISTA DINÁMICA DE COMERCIO */}
      {comercioSel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-5">
            
            {/* Botón Cerrar */}
            <button
              onClick={() => setComercioSel(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10"
            >
              ✕
            </button>

            {/* ---------------------------------------------------- */}
            {/* FICHA ESPECIAL 1: INMOBILIARIAS                      */}
            {/* ---------------------------------------------------- */}
            {comercioSel.tipo_ficha === 'especial_1' || comercioSel.categoria === 'Inmobiliarias' ? (
              <div>
                {/* Cabecera Inmobiliaria */}
                <div className="h-44 bg-slate-900 rounded-2xl overflow-hidden relative mb-4 p-5 flex flex-col justify-end text-white">
                  <div className="absolute inset-0 opacity-40">
                    <img src={comercioSel.portada_url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa"} alt="Portada" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10">
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Inmobiliaria Destacada</span>
                    <h2 className="text-xl font-bold mt-1">{comercioSel.nombre}</h2>
                    <p className="text-xs text-slate-300">{comercioSel.descripcion}</p>
                  </div>
                </div>

                {/* Botón de Captación */}
                {comercioSel.mostrar_boton_captacion !== false && (
                  <a
                    href={`https://wa.me/${(comercioSel.whatsapp || '').replace(/\+/g, "")}?text=${encodeURIComponent("Hola, me pongo en contacto desde Utrerapp para solicitar una valoración / información.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 mb-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    💬 {comercioSel.texto_boton_captacion || "Solicitar valoración / Preguntar inmueble"}
                  </a>
                )}

                {/* Filtros de Inmuebles */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {["Todos", "Venta", "Alquiler", "Pisos", "Casas"].map(mod => (
                    <button
                      key={mod}
                      onClick={() => setFiltroModalidad(mod)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filtroModalidad === mod ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>

                {/* Listado de Propiedades (especial1_items) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{comercioSel.titulo_seccion_catalogo || "Inmuebles Disponibles"}</h3>
                  {especial1Items.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No hay inmuebles cargados actualmente en este catálogo.</p>
                  ) : (
                    especial1Items
                      .filter(item => filtroModalidad === "Todos" || item.modalidad === filtroModalidad || item.titulo?.includes(filtroModalidad))
                      .map(prop => (
                        <div key={prop.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2">
                          <div className="flex gap-3">
                            <img src={prop.imagenes?.[0] || comercioSel.portada_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"} alt={prop.titulo} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">{prop.etiqueta_destacado || prop.modalidad}</span>
                                <span className="text-xs font-bold text-slate-400">{prop.referencia_interna}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{prop.titulo}</h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={11} /> {prop.subtitulo_zona}</p>
                              <p className="text-base font-black text-amber-600 mt-1">{prop.precio ? `${Number(prop.precio).toLocaleString()} €` : ''}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{prop.descripcion}</p>
                          <a
                            href={`https://wa.me/${(comercioSel.whatsapp || '').replace(/\+/g, "")}?text=${encodeURIComponent(`Hola, me interesa el inmueble Ref: ${prop.referencia_interna} - ${prop.titulo}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            💬 Consultar por WhatsApp
                          </a>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : 

            /* ---------------------------------------------------- */
            /* FICHA ESPECIAL 2: COMIDA A DOMICILIO / PEDIDOS       */
            /* ---------------------------------------------------- */
            comercioSel.tipo_ficha === 'especial_2' || comercioSel.categoria === 'Hostelería' ? (
              <div>
                {/* Cabecera Hostelería */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={comercioSel.logo_url || comercioSel.portada_url} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{comercioSel.nombre}</h2>
                    <p className="text-xs text-slate-500">{comercioSel.horario_pedidos || comercioSel.horario_texto || "Horario disponible en local"}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">Pedido mín: {comercioSel.pedido_minimo || 0}€</span>
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">Envío: {comercioSel.coste_envio || "Consultar"}</span>
                    </div>
                  </div>
                </div>

                {/* Catálogo de Productos */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Carta / Menú Disponible</h3>
                  {especial2Items.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No hay productos cargados en la carta actualmente.</p>
                  ) : (
                    especial2Items.map(prod => {
                      const cantidad = carrito[prod.id] || 0;
                      return (
                        <div key={prod.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex gap-3 items-center">
                          {prod.imagen_producto && (
                            <img src={prod.imagen_producto} alt={prod.nombre_producto} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{prod.nombre_producto}</h4>
                              <span className="text-sm font-black text-amber-600">{Number(prod.precio).toFixed(2)}€</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{prod.descripcion_ingredientes}</p>
                            
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-3 mt-2">
                              {prod.disponible === false ? (
                                <span className="text-[10px] font-bold text-red-500 uppercase">Agotado temporalmente</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => actualizarCantidad(prod.id, -1)} disabled={cantidad === 0} className="w-7 h-7 bg-white border border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-700 disabled:opacity-30">
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center">{cantidad}</span>
                                  <button onClick={() => actualizarCantidad(prod.id, 1)} className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                                    <Plus size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Resumen Carrito y Formulario de Envío si hay productos */}
                {Object.keys(carrito).length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
                      <ShoppingCart size={15} /> Tu Pedido Actual ({Object.values(carrito).reduce((a,b)=>a+b,0)} productos)
                    </h4>
                    
                    <div className="space-y-1 text-xs text-slate-700">
                      {Object.entries(carrito).map(([id, cant]) => {
                        const item = especial2Items.find(i => i.id == id);
                        if (!item) return null;
                        return (
                          <div key={id} className="flex justify-between">
                            <span>{cant}x {item.nombre_producto}</span>
                            <span className="font-bold">{(item.precio * cant).toFixed(2)}€</span>
                          </div>
                        );
                      })}
                      <div className="border-t border-amber-200 pt-2 flex justify-between font-black text-sm text-amber-900">
                        <span>Total estimado:</span>
                        <span>{calcularTotalCarrito().toFixed(2)}€</span>
                      </div>
                    </div>

                    {/* Formulario rápido datos de entrega */}
                    <div className="space-y-2 pt-2 border-t border-amber-200">
                      <input
                        type="text"
                        placeholder="Tu Nombre y Apellidos"
                        value={datosCliente.nombre}
                        onChange={e => setDatosCliente({...datosCliente, nombre: e.target.value})}
                        className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Dirección de entrega (Calle, Número...)"
                        value={datosCliente.direccion}
                        onChange={e => setDatosCliente({...datosCliente, direccion: e.target.value})}
                        className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={datosCliente.tipoEntrega}
                          onChange={e => setDatosCliente({...datosCliente, tipoEntrega: e.target.value})}
                          className="text-xs bg-white border border-amber-300 rounded-xl px-2 py-2 focus:outline-none"
                        >
                          <option value="A domicilio">A domicilio</option>
                          <option value="Recogida en local">Recogida en local</option>
                        </select>
                        <select
                          value={datosCliente.pago}
                          onChange={e => setDatosCliente({...datosCliente, pago: e.target.value})}
                          className="text-xs bg-white border border-amber-300 rounded-xl px-2 py-2 focus:outline-none"
                        >
                          <option value="Bizum">Bizum</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta en entrega</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={enviarPedidoWhatsApp}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
                    >
                      🚀 Enviar Pedido por WhatsApp
                    </button>
                  </div>
                )}
              </div>
            ) : (

            /* ---------------------------------------------------- */
            /* FICHA ESTÁNDAR (Resto de comercios)                  */
            /* ---------------------------------------------------- */
            <div>
              {/* Imagen Principal / Portada */}
              <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative mb-4 border border-slate-100">
                <img
                  src={comercioSel.portada_url || comercioSel.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                  alt={comercioSel.nombre}
                  className="w-full h-full object-cover"
                />
                {comercioSel.destacado && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    ⭐ PREMIUM
                  </span>
                )}
              </div>

              {/* Cabecera con Logo y Nombre */}
              <div className="flex items-center gap-3">
                {comercioSel.logo_url && comercioSel.portada_url && (
                  <img 
                    src={comercioSel.logo_url} 
                    alt="Logo" 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" 
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 leading-tight">{comercioSel.nombre}</h2>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-0.5">
                    {comercioSel.subcategoria || comercioSel.categoria}
                  </p>
                </div>
              </div>

              {/* Dirección */}
              {comercioSel.direccion && (
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                  📍 {comercioSel.direccion}
                </p>
              )}

              {/* Horario */}
              {comercioSel.horario_texto && (
                <p className="text-xs text-slate-600 mt-1">
                  ⏰ <span className="font-medium">{comercioSel.horario_texto}</span>
                </p>
              )}

              {/* Descripción */}
              {comercioSel.descripcion && (
                <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {comercioSel.descripcion}
                </p>
              )}

              {/* Contacto Directo: WhatsApp y Llamada */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {comercioSel.whatsapp && (
                  <a
                    href={`https://wa.me/${comercioSel.whatsapp.replace(/\+/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    💬 WhatsApp
                  </a>
                )}

                {comercioSel.telefono && (
                  <a
                    href={`tel:${comercioSel.telefono}`}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Phone size={14} className="text-emerald-600" /> Llamar
                  </a>
                )}
              </div>

              {/* Botón Cómo Llegar */}
              <button
                onClick={() => abrirMapa(comercioSel)}
                className="mt-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Navigation size={14} className="text-sky-600" /> Cómo Llegar
              </button>

              {/* Sitios Web y Tienda Online */}
              <div className="mt-3 space-y-2">
                {(comercioSel.sitio_web || comercioSel.web_url) && (
                  <a
                    href={(comercioSel.sitio_web || comercioSel.web_url).startsWith('http') ? (comercioSel.sitio_web || comercioSel.web_url) : `https://${comercioSel.sitio_web || comercioSel.web_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Globe size={15} /> Sitio Web Oficial <ExternalLink size={12} />
                  </a>
                )}

                {comercioSel.tienda_online && (
                  <a
                    href={comercioSel.tienda_online.startsWith('http') ? comercioSel.tienda_online : `https://${comercioSel.tienda_online}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    🛒 Tienda Online <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Redes Sociales */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-center">
                {comercioSel.facebook && (
                  <a href={comercioSel.facebook.startsWith('http') ? comercioSel.facebook : `https://${comercioSel.facebook}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">📘 Facebook</a>
                )}
                {comercioSel.instagram && (
                  <a href={comercioSel.instagram.startsWith('http') ? comercioSel.instagram : `https://instagram.com/${comercioSel.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-bold">📸 Instagram</a>
                )}
                {comercioSel.tiktok && (
                  <a href={comercioSel.tiktok.startsWith('http') ? comercioSel.tiktok : `https://tiktok.com/@${comercioSel.tiktok.replace('@','')}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">🎵 TikTok</a>
                )}
              </div>
            </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}