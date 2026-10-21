import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || '', 
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

export default function CarruselAvisos({ intervalo = 3000, tamanoTexto = 'text-base' }) {
  const [avisos, setAvisos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function cargarAvisos() {
      const { data, error } = await supabase
        .from('avisos_inicio')
        .select('*')
        .eq('activo', true);
      
      if (data && data.length > 0) {
        setAvisos(data);
      }
    }
    cargarAvisos();
  }, []);

  useEffect(() => {
    if (avisos.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % avisos.length);
    }, intervalo);
    return () => clearInterval(timer);
  }, [avisos, intervalo]);

  if (avisos.length === 0) {
    return (
      <div className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center text-xs text-zinc-500 my-4">
        Cargando avisos de Utrera...
      </div>
    );
  }

  const avisoActual = avisos[currentIndex];

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm my-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          {avisoActual.tipo || 'Aviso'}
        </span>
      </div>
      <h3 className={`font-bold text-zinc-900 ${tamanoTexto}`}>
        {avisoActual.titulo}
      </h3>
      <p className={`text-zinc-600 mt-1 ${tamanoTexto === 'text-lg' ? 'text-base' : 'text-sm'}`}>
        {avisoActual.descripcion}
      </p>
    </div>
  );
}