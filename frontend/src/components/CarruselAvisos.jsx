import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CarruselAvisos() {
  const [avisos, setAvisos] = useState([]);
  const [indice, setIndice] = useState(0);
  const pista = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarAvisos() {
      try {
        const { data, error } = await supabase
          .from('avisos_inicio')
          .select('id,titulo,descripcion')
          .eq('activo', true)
          .order('id')
          .abortSignal(controller.signal);

        if (!controller.signal.aborted && !error) setAvisos(data ?? []);
      } catch {
        // La portada conserva sus accesos si la consulta no está disponible.
      }
    }

    cargarAvisos();
    return () => controller.abort();
  }, []);

  function mover(delta) {
    const elemento = pista.current;
    const destino = Math.max(0, Math.min(indice + delta, avisos.length - 1));
    if (elemento) elemento.scrollLeft = destino * elemento.clientWidth;
  }

  if (!avisos.length) return null;

  return (
    <section className="mobile-notices" aria-labelledby="mobile-notices-title">
      <div className="mobile-notices__header">
        <h2 id="mobile-notices-title"><Bell size={19} aria-hidden="true" /> Avisos de interés</h2>
        {avisos.length > 1 && (
          <div className="mobile-notices__controls">
            <button type="button" onClick={() => mover(-1)} disabled={indice === 0} aria-label="Aviso anterior" aria-controls="mobile-notices-track"><ChevronLeft size={19} aria-hidden="true" /></button>
            <span aria-live="polite" aria-atomic="true"><span className="sr-only">Aviso </span>{indice + 1}<span aria-hidden="true"> / </span><span className="sr-only"> de </span>{avisos.length}</span>
            <button type="button" onClick={() => mover(1)} disabled={indice === avisos.length - 1} aria-label="Aviso siguiente" aria-controls="mobile-notices-track"><ChevronRight size={19} aria-hidden="true" /></button>
          </div>
        )}
      </div>
      <div
        id="mobile-notices-track"
        className="mobile-notices__track"
        ref={pista}
        tabIndex={avisos.length > 1 ? 0 : undefined}
        role="group"
        aria-label="Desplazar avisos ciudadanos"
        onScroll={event => {
          const elemento = event.currentTarget;
          setIndice(Math.round(elemento.scrollLeft / elemento.clientWidth));
        }}
      >
        <ul aria-label="Avisos ciudadanos">
          {avisos.map(({ id, titulo, descripcion }) => (
            <li key={id}>
              <article>
                <h3>{titulo}</h3>
                {descripcion && <p>{descripcion}</p>}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
