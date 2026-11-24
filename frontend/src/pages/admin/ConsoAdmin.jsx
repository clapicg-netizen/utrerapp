import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const toggles = {
  enabled: 'Activar Conso IA',
  directory: 'Directorio de UtrerApp',
  pharmacies: 'Calendario público de farmacias',
  official: 'Referencias a organismos públicos',
  commercialPriority: 'Priorizar comercios destacados',
  externalSearch: 'Búsquedas externas con Google',
};

const topics = {
  commercial: 'Comercios', pharmacy: 'Farmacias', transport: 'Transporte', municipal: 'Gestiones municipales',
  tourism: 'Turismo', events: 'Agenda', essential: 'Servicios esenciales', other: 'Otras consultas locales',
  outside: 'Fuera del ámbito', private: 'Solicitudes restringidas',
};

async function request(signal) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Vuelve a iniciar sesión.');
  const response = await fetch('/api/conso-admin', {
    signal, headers: { Authorization: 'Bearer ' + session.access_token },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo acceder a Conso IA.');
  return result;
}

export default function ConsoAdmin() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    request(controller.signal).then(setData).catch(error => {
      if (!controller.signal.aborted) setMessage(error.message);
    });
    return () => controller.abort();
  }, []);

  if (!data) return <p role="status">{message || 'Cargando Conso IA…'}</p>;

  const { settings } = data;
  return (
    <div className="space-y-5">
      {!data.billingConfirmed && <p role="status">Activación pendiente de confirmar la facturación del proveedor.</p>}
      <p>La configuración de Preview se gestiona en Vercel.</p>
      <dl>
        {Object.entries(toggles).map(([key, label]) => (
          <div className="flex gap-2" key={key}><dt>{label}</dt><dd>{settings[key] ? 'Sí' : 'No'}</dd></div>
        ))}
        <div><dt>Proveedor</dt><dd>{settings.provider}</dd></div>
        <div><dt>Modelo</dt><dd>{settings.model}</dd></div>
        <div><dt>Personalidad</dt><dd>{settings.personality}</dd></div>
        <div><dt>Consultas diarias por visitante</dt><dd>{settings.userLimit}</dd></div>
        <div><dt>Consultas diarias globales</dt><dd>{settings.globalLimit}</dd></div>
      </dl>
      <h3 className="font-bold">Consumo</h3>
      {!data.today && <p role="status">Contadores de Preview no disponibles.</p>}
      {data.today && <>
      <table className="w-full text-left">
        <thead><tr><th>Concepto</th><th>Hoy</th><th>Este mes</th></tr></thead>
        <tbody>
          {Object.entries({ queries: 'Consultas', calls: 'Llamadas a Gemini', searches: 'Llamadas con búsqueda',
            input: 'Tokens de entrada', output: 'Tokens de salida', failures: 'Errores' }).map(([key, label]) => (
            <tr key={key}><th scope="row">{label}</th><td>{data.today[key] || 0}</td><td>{data.month[key] || 0}</td></tr>
          ))}
          <tr><th scope="row">Coste estimado de tokens (USD)</th>
            {[data.today, data.month].map((period, index) => <td key={index}>{((period.nanoUsd || 0) / 1e9).toFixed(4)}</td>)}</tr>
        </tbody>
      </table>
      <h3 className="font-bold">Temas consultados este mes</h3>
      <ul>{Object.entries(topics).map(([key, label]) => (
        <li key={key}>{label} · {data.month['topic_' + key] || 0}</li>
      ))}</ul>
      </>}
    </div>
  );
}
