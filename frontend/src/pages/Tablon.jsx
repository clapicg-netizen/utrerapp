import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClientClient';

export default function Tablon() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnuncios();
  }, []);

  async function fetchAnuncios() {
    try {
      const { data, error } = await supabase
        .from('anuncios_locales')
        .select('*');

      if (error) throw error;
      if (data) setAnuncios(data);
    } catch (error) {
      console.error('Error cargando los anuncios:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Cargando tablón de anuncios...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tablón de Anuncios Locales</h1>
      {anuncios.length === 0 ? (
        <p>No hay anuncios disponibles.</p>
      ) : (
        <div className="grid gap-4">
          {anuncios.map((anuncio) => (
            <div key={anuncio.id || anuncio.titulo} className="p-4 border rounded-lg shadow-sm bg-white">
              <h2 className="font-semibold text-lg">{anuncio.titulo}</h2>
              <p className="text-gray-600 mt-1">{anuncio.descripcion}</p>
              {anuncio.precio && <p className="text-green-600 font-bold mt-2">Precio: {anuncio.precio}</p>}
              {anuncio.contacto && <p className="text-sm text-gray-500 mt-1">Contacto: {anuncio.contacto}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}