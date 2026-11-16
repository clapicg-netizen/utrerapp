import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import EscaparateComercio from '../components/EscaparateComercio';
import { supabase } from '../lib/supabaseClient';

const CAMPOS_PUBLICOS = 'id,nombre,subcategoria,descripcion,portada_url,galeria_urls,carta_pdf_url,video_story_url,web_url,tienda_url,facebook_url,telefono,whatsapp,direccion,horario_texto';

export default function EscaparateDirecto({ escaparate, volver }) {
  const [comercio, setComercio] = useState(null);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let vigente = true;
    setEstado('cargando');
    setComercio(null);
    async function cargar() {
      try {
        const { data, error } = await supabase.from('comercios_utrera')
          .select(CAMPOS_PUBLICOS).eq('id', escaparate.id).maybeSingle();
        if (!vigente) return;
        if (error) throw error;
        setComercio(data);
        setEstado(data ? 'listo' : 'ausente');
      } catch {
        if (vigente) setEstado('error');
      }
    }
    cargar();
    return () => { vigente = false; };
  }, [escaparate.id]);

  return (
    <div className="mx-auto max-w-4xl px-3 pb-10 pt-4 sm:px-5">
      <button type="button" onClick={volver}
        className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
        <ArrowLeft size={16} aria-hidden="true" /> Volver a la guía
      </button>
      {comercio ? <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <EscaparateComercio comercio={comercio} />
      </div> : <p className="rounded-lg bg-white p-4 text-sm text-slate-700" role="status">
        {estado === 'cargando' ? 'Cargando el escaparate…' : estado === 'ausente'
          ? 'No se encontró este comercio.' : 'No se pudo cargar el escaparate.'}
      </p>}
    </div>
  );
}
