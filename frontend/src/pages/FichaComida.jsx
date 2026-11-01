// src/pages/FichaComida.jsx (o src/components/FichaComida.jsx)
import React, { useState, useEffect } from "react";
import { ShoppingBag, Plus, Minus, Send, Clock, Bike } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function FichaComida({ negocioId }) {
  const [negocio, setNegocio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("Todos");
  const [carrito, setCarrito] = useState({});
  const [nombreCliente, setNombreCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("A domicilio");
  const [metodoPago, setMetodoPago] = useState("Bizum");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchComidaData() {
      setCargando(true);
      try {
        const { data: negData } = await supabase.from("especial2_negocio").select("*").maybeSingle();
        if (negData) setNegocio(negData);

        const { data: prodData, error } = await supabase.from("especial2_items").select("*").eq("disponible", true);
        if (error) throw error;
        if (prodData) setProductos(prodData);
      } catch (err) {
        console.error("Error al cargar datos de comida:", err);
      } finally {
        setCargando(false);
      }
    }
    fetchComidaData();
  }, [negocioId]);

  const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria))];

  const productosFiltrados = productos.filter((p) => {
    if (categoriaSel === "Todos") return true;
    return p.categoria?.toLowerCase() === categoriaSel.toLowerCase();
  });

  const agregarAlCarrito = (prod) => {
    setCarrito((prev) => ({
      ...prev,
      [prod.id]: {
        ...prod,
        cantidad: (prev[prod.id]?.cantidad || 0) + 1
      }
    }));
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => {
      const nuevo = { ...prev };
      if (nuevo[id].cantidad > 1) {
        nuevo[id].cantidad -= 1;
      } else {
        delete nuevo[id];
      }
      return nuevo;
    });
  };

  const totalProductos = Object.values(carrito).reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const costeEnvio = tipoEntrega === "A domicilio" ? (negocio?.coste_envio || 2.0) : 0;
  const totalGeneral = totalProductos + (totalProductos > 0 ? costeEnvio : 0);

  const enviarPedidoWhatsApp = () => {
    if (!nombreCliente || !direccionCliente) {
      alert("Por favor, introduce tu nombre y dirección de entrega.");
      return;
    }

    let mensaje = `🛒 *NUEVO PEDIDO - Utrerapp*\n\n`;
    mensaje += `👤 *Cliente:* ${nombreCliente}\n`;
    mensaje += `📍 *Dirección:* ${direccionCliente}\n`;
    mensaje += `🛵 *Entrega:* ${tipoEntrega}\n`;
    mensaje += `💳 *Pago:* ${metodoPago}\n\n*Detalle del pedido:*\n`;

    Object.values(carrito).forEach((item) => {
      mensaje += `- ${item.cantidad}x ${item.nombre_producto} (${(item.precio * item.cantidad).toFixed(2)}€)\n`;
    });

    if (tipoEntrega === "A domicilio") {
      mensaje += `📦 Envío: ${costeEnvio.toFixed(2)}€\n`;
    }

    mensaje += `\n💰 *TOTAL A PAGAR: ${totalGeneral.toFixed(2)}€*`;

    const whatsappNum = negocio?.whatsapp_recepcion_pedidos || "34600000000";
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  if (cargando) {
    return <div className="text-center py-16 text-slate-500 font-bold text-sm">Cargando carta digital...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36 text-slate-800 font-sans">
      
      {/* Cabecera del Negocio */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-black">{negocio?.nombre_negocio || "Gastronomía Selecta Utrera"}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-300">
          <span className="flex items-center gap-1"><Clock size={12} className="text-amber-400" /> {negocio?.horario_pedidos || "13:00 - 23:30"}</span>
          <span className="flex items-center gap-1"><Bike size={12} className="text-amber-400" /> Mínimo: {negocio?.pedido_minimo || 12}€</span>
        </div>
      </div>

      {/* Categorías del Menú */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSel(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoriaSel === cat ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Productos */}
      <div className="px-4 mt-4 space-y-3 max-w-lg mx-auto">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border p-6 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">No hay productos disponibles en esta categoría.</p>
          </div>
        ) : (
          productosFiltrados.map((prod) => (
            <div key={prod.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{prod.nombre_producto}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.descripcion_ingredientes}</p>
                <p className="text-xs font-black text-amber-600 mt-2">{prod.precio?.toFixed(2)} €</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {prod.imagen_producto && (
                  <img src={prod.imagen_producto} alt={prod.nombre_producto} className="w-16 h-16 rounded-xl object-cover border" />
                )}
                <button
                  onClick={() => agregarAlCarrito(prod)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} /> Añadir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carrito Flotante Inferior */}
      {Object.keys(carrito).length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-slate-900 text-white p-4 rounded-t-3xl shadow-2xl max-w-lg mx-auto border-t border-slate-800 space-y-3 z-40">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="font-bold text-sm flex items-center gap-2"><ShoppingBag size={16} className="text-amber-400" /> Tu Pedido</h2>
            <span className="font-black text-amber-400 text-base">{totalGeneral.toFixed(2)} €</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {Object.values(carrito).map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="truncate flex-1">{item.cantidad}x {item.nombre_producto}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{(item.precio * item.cantidad).toFixed(2)}€</span>
                  <button onClick={() => quitarDelCarrito(item.id)} className="p-1 bg-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer"><Minus size={12} /></button>
                  <button onClick={() => agregarAlCarrito(item)} className="p-1 bg-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer"><Plus size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Tu Nombre *"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Dirección de entrega o recogida *"
              value={direccionCliente}
              onChange={(e) => setDireccionCliente(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={enviarPedidoWhatsApp}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} /> Enviar Pedido por WhatsApp
            </button>
          </div>
        </div>
      )}

    </div>
  );
}