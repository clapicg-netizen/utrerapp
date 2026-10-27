// src/pages/Tablon.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, PlusCircle, Sparkles, Tag, Phone, Euro, MessageSquare } from 'lucide-react';

export default function Tablon({ setPaginaActual }) {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Estados para nuevo anuncio
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Compraventa');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetchAnuncios();
  }, []);

  async function fetchAnuncios() {
    try {
      const { data, error } = await supabase
        .from('anuncios_locales')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setAnuncios(data);
    } catch (error) {
      console.error('Error cargando los anuncios:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevaDescripcion.trim()) return;

    setEnviando(true);
    try {
      const { error } = await supabase
        .from('anuncios_locales')
        .insert([
          {
            titulo: nuevoTitulo,
            descripcion: nuevaDescripcion,
            precio: nuevoPrecio,
            contacto: nuevoContacto,
            categoria: nuevaCategoria,
            activo: true
          }
        ]);

      if (error) throw error;

      // Limpiar y recargar
      setNuevoTitulo('');
      setNuevaDescripcion('');
      setNuevoPrecio('');
      setNuevoContacto('');
      setMostrarForm(false);
      fetchAnuncios();
    } catch (err) {
      console.error('Error al publicar anuncio:', err);
      alert('Hubo un error al publicar el anuncio. Comprueba la tabla de Supabase.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* CABECERA HERO */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 text-white p-6 shadow-xl relative overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl"></div>
        <div className="max-w-md mx-auto relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setPaginaActual('home')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Tablón Local
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Tablón de Anuncios</h1>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Compra, venta, alquileres y servicios entre vecinos de Utrera.
              </p>
            </div>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            >
              <PlusCircle size={16} /> {mostrarForm ? 'Cerrar' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-4">

        {/* FORMULARIO PARA NUEVO ANUNCIO */}
        {mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3 animate-fadeIn">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              📝 Publicar nuevo anuncio gratis
            </h3>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Categoría</label>
              <select
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="Compraventa">🛒 Compraventa</option>
                <option value="Vivienda">🏠 Vivienda / Alquiler</option>
                <option value="Empleo">💼 Empleo / Servicios</option>
                <option value="Clases">📚 Clases Particulares</option>
                <option value="Otros">📦 Varios / Otros</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Título del anuncio</label>
              <input
                type="text"
                placeholder="Ej: Se vende bicicleta de montaña"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                required
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Descripción detallada</label>
              <textarea
                placeholder="Indica estado, detalles o información relevante..."
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                required
                rows="3"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Precio (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: 50 €"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Contacto (Tel/Email)</label>
                <input
                  type="text"
                  placeholder="Ej: 600000000"
                  value={nuevoContacto}
                  onChange={(e) => setNuevoContacto(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow transition-all cursor-pointer mt-2"
            >
              {enviando ? 'Publicando...' : 'Publicar Anuncio'}
            </button>
          </form>
        )}

        {/* LISTADO DE ANUNCIOS */}
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">Cargando tablón de anuncios...</div>
        ) : anuncios.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
            <div className="text-3xl">📭</div>
            <p className="font-bold text-slate-700 text-sm">No hay anuncios publicados</p>
            <p className="text-xs text-slate-500">¡Sé el primero en publicar algo útil para Utrera!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {anuncios.map((anuncio) => (
              <div key={anuncio.id || anuncio.titulo} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {anuncio.categoria || 'General'}
                  </span>
                  {anuncio.precio && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {anuncio.precio}
                    </span>
                  )}
                </div>

                <h2 className="font-bold text-slate-900 text-sm leading-snug">{anuncio.titulo}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{anuncio.descripcion}</p>

                {anuncio.contacto && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Phone size={13} className="text-amber-600" />
                    <span>Contacto: <strong className="text-slate-800">{anuncio.contacto}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}