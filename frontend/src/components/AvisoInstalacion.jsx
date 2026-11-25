import React, { useEffect, useRef, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';

const clavePausa = 'utrerapp:instalacion:pausa-hasta';
const pausa = 7 * 24 * 60 * 60 * 1000;

function leerPausa() {
  try {
    return Number(window.localStorage.getItem(clavePausa)) > Date.now();
  } catch {
    return false;
  }
}

export default function AvisoInstalacion() {
  const solicitud = useRef(null);
  const [instalable, setInstalable] = useState(false);
  const [instalada, setInstalada] = useState(false);
  const [pausado, setPausado] = useState(leerPausa);
  const [listo, setListo] = useState(false);
  const agente = window.navigator.userAgent;
  const android = /Android/i.test(agente);
  const iphone = /iPhone/i.test(agente) && /Safari/i.test(agente)
    && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(agente);

  useEffect(() => {
    if (!android && !iphone) return;
    const modo = window.matchMedia('(display-mode: standalone)');
    const comprobarModo = () => setInstalada(modo.matches || window.navigator.standalone === true);
    const guardarSolicitud = (evento) => {
      evento.preventDefault();
      solicitud.current = evento;
      setInstalable(true);
    };
    const confirmarInstalacion = () => {
      solicitud.current = null;
      setInstalable(false);
      setInstalada(true);
    };

    comprobarModo();
    modo.addEventListener?.('change', comprobarModo);
    window.addEventListener('beforeinstallprompt', guardarSolicitud);
    window.addEventListener('appinstalled', confirmarInstalacion);
    const espera = window.setTimeout(() => setListo(true), 2000);
    return () => {
      window.clearTimeout(espera);
      modo.removeEventListener?.('change', comprobarModo);
      window.removeEventListener('beforeinstallprompt', guardarSolicitud);
      window.removeEventListener('appinstalled', confirmarInstalacion);
    };
  }, [android, iphone]);

  function cerrar() {
    setPausado(true);
    try {
      window.localStorage.setItem(clavePausa, String(Date.now() + pausa));
    } catch {
      // Mantener cerrado durante esta visita si el navegador bloquea el almacenamiento.
    }
  }

  async function instalar() {
    const evento = solicitud.current;
    if (!evento) return;
    solicitud.current = null;
    try {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      if (outcome === 'accepted') setInstalada(true);
      else cerrar();
    } catch {
      cerrar();
    } finally {
      setInstalable(false);
    }
  }

  if (!listo || pausado || instalada || (!iphone && !(android && instalable))) return null;

  return (
    <aside
      aria-label="Instalación de UtrerApp"
      className="fixed inset-x-3 z-50 mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl"
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-start gap-3">
        <Smartphone aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[#9b3725]" />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">¡Lleva UtrerApp siempre contigo!</h2>
          <p className="mt-1 text-sm">Añádela a tu pantalla de inicio.</p>
        </div>
        <button type="button" onClick={cerrar} aria-label="Cerrar aviso de instalación" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg hover:bg-slate-100">
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      {iphone ? (
        <p className="mt-3 text-sm leading-relaxed">
          En Safari, pulsa <Share aria-hidden="true" className="inline h-4 w-4" /> <strong>Compartir</strong> y elige <strong>Añadir a pantalla de inicio</strong>. Si aparece <strong>Abrir como app web</strong>, actívalo y pulsa <strong>Añadir</strong>.
        </p>
      ) : (
        <button type="button" onClick={instalar} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#9b3725] px-4 font-semibold text-white hover:bg-[#7a2c1e]">
          <Download aria-hidden="true" className="h-5 w-5" /> Instalar UtrerApp
        </button>
      )}
    </aside>
  );
}
