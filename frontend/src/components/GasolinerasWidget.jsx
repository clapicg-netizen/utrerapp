// frontend/src/components/GasolinerasWidget.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Fuel, RefreshCw, AlertCircle } from 'lucide-react';
import { getUtreraFuelPrices } from '../lib/fuelService';

export default function GasolinerasWidget() {
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPrices() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUtreraFuelPrices();
      if (data && Array.isArray(data)) {
        setEstaciones(data);
      }
    } catch (err) {
      console.error("Error al cargar gasolineras:", err);
      setError("No se pudieron cargar los precios oficiales en este momento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrices();
  }, []);

  const formatPrice = (price) => {
    if (price == null) return "No disponible";
    const num = typeof price === 'number' ? price : parseFloat(String(price).replace(',', '.'));
    return Number.isFinite(num) ? `${num.toFixed(3)} €/L` : "No disponible";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center text-slate-500 my-4 border border-slate-100">
        <div className="animate-spin text-2xl mb-2">⛽</div>
        <p className="text-xs font-semibold">Consultando precios oficiales en tiempo real...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 rounded-3xl shadow-sm p-6 text-center text-rose-600 my-4 border border-rose-100 text-xs font-medium space-y-3">
        <p>{error}</p>
        <button
          onClick={loadPrices}
          className="inline-flex items-center gap-1.5 bg-white border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-100 transition-colors"
        >
          <RefreshCw size={12} /> Reintentar
        </button>
      </div>
    );
  }

  if (!estaciones || estaciones.length === 0) {
    return (
      <div className="bg-amber-50 rounded-3xl shadow-sm p-6 text-center text-amber-700 my-4 border border-amber-100 text-xs flex items-center justify-center gap-2">
        <AlertCircle size={16} /> No se han encontrado estaciones de servicio activas en Utrera en este momento.
      </div>
    );
  }

  const precioMinimoG95 = estaciones.find(e => e.price95 != null)?.price95;

  return (
    <div className="space-y-3">
      {/* Tarjeta superior con el precio mínimo destacado */}
      {precioMinimoG95 != null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Mejor precio Gasolina 95</span>
            <span className="text-2xl font-black text-emerald-600">{formatPrice(precioMinimoG95)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium block">Estaciones en Utrera</span>
            <span className="text-sm font-bold text-slate-700">{estaciones.length} operativas</span>
          </div>
        </div>
      )}

      {/* Listado ordenado de gasolineras */}
      {estaciones.map((est, index) => {
        const isCheapest = precioMinimoG95 != null && est.price95 === precioMinimoG95;
        const mapsUrl = est.lat && est.lon 
          ? `https://www.google.com/maps/search/?api=1&query=${est.lat},${est.lon}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${est.name}, ${est.address}, Utrera, Sevilla`)}`;

        return (
          <div 
            key={est.id || index} 
            className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
              isCheapest ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-100"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  {isCheapest && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase">
                      Más barata
                    </span>
                  )}
                  <h4 className="font-extrabold text-base text-slate-900">{est.name}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} /> {est.address}
                </p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Abierta
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Gasolina 95 E5</span>
                <span className="text-base font-black text-blue-600 mt-0.5 block">
                  {formatPrice(est.price95)}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Diésel A</span>
                <span className="text-base font-black text-slate-800 mt-0.5 block">
                  {formatPrice(est.priceDiesel)}
                </span>
              </div>
            </div>

            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink size={14} /> Cómo llegar en Google Maps
            </a>
          </div>
        );
      })}

      <p className="text-[10px] text-slate-400 text-center pt-2">
        Fuente oficial: Ministerio para la Transición Ecológica
      </p>
    </div>
  );
}