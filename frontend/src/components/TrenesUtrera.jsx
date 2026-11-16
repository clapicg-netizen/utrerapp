import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowDownLeft, ArrowUpRight, Bell, ExternalLink, RefreshCw, TrainFront } from 'lucide-react';
import './TrenesUtrera.css';

const clock = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const date = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long',
});
const time = seconds => clock.format(seconds * 1000);
const services = { cercanias: 'Cercanías', largaDistancia: 'Media y Larga Distancia' };
const tabs = [
  { value: 'departure', label: 'Salidas', icon: ArrowUpRight },
  { value: 'arrival', label: 'Llegadas', icon: ArrowDownLeft },
];

const corridors = [
  { id: 'sevilla', label: 'Hacia Sevilla' },
  { id: 'cadiz', label: 'Hacia Lebrija y Cádiz' },
];

function TrainStatus({ train }) {
  const status = {
    programado: 'Programado',
    previsto: 'Previsión Renfe',
    retraso: '+' + Math.floor(train.delay / 60) + ' min',
    cancelado: 'Cancelado',
    'sin-parada': 'Sin parada',
  }[train.status];

  return <span className={'rail-status rail-status--' + train.status}>{status}</span>;
}

function NextTrain({ label, train, emptyText }) {
  return (
    <article className="rail-next-card">
      <h3><ArrowUpRight size={16} aria-hidden="true" /> {label}</h3>
      {train ? (
        <>
          <p className="rail-next-destination">{train.destination || 'Destino sin información'}</p>
          <p className="rail-next-line">{train.line}{train.trainNumber && ' · ' + train.trainNumber}</p>
          <div className="rail-next-timing">
            <span className="rail-next-hour">{time(train.expected ?? train.scheduled)}</span>
            <TrainStatus train={train} />
          </div>
          {train.expected != null && time(train.expected) !== time(train.scheduled) && (
            <p className="rail-next-line">Programado a las {time(train.scheduled)}</p>
          )}
        </>
      ) : <p className="rail-next-empty">{emptyText}</p>}
    </article>
  );
}

function TrainRow({ train, type }) {
  return (
    <li className="rail-row">
      <div className="rail-hour">
        {time(train.expected ?? train.scheduled)}
        {train.expected != null && time(train.expected) !== time(train.scheduled) && (
          <small>Prog. {time(train.scheduled)}</small>
        )}
      </div>
      <div className="rail-place">
        <strong>{(type === 'departure' ? train.destination : train.origin) || 'Sin información'}</strong>
        <small>{train.line}{train.trainNumber && ' · ' + train.trainNumber}</small>
      </div>
      <TrainStatus train={train} />
    </li>
  );
}

export default function TrenesUtrera() {
  const [type, setType] = useState('departure');
  const [board, setBoard] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);
  const [now, setNow] = useState(() => Date.now() / 1000);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function update() {
      setBusy(true);
      try {
        const url = (process.env.REACT_APP_TRENES_API_URL || '/api/trenes');
        const response = await fetch(url, {
          signal: typeof AbortSignal.any === 'function' && typeof AbortSignal.timeout === 'function' ? AbortSignal.any([controller.signal, AbortSignal.timeout(65000)]) : controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Error al consultar Renfe');
        const data = await response.json();
        if (!data.events || !data.coverage) throw new Error('Respuesta inválida');
        if (!controller.signal.aborted) {
          setBoard(data);
          setNow(Date.now() / 1000);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setBusy(false);
          timer = setTimeout(update, 30000);
        }
      }
    }
    update();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [request]);

  const recent = timestamp => timestamp != null && now - timestamp <= 180;
  const live = Object.values(board?.coverage ?? {}).some(source => source.schedule && recent(source.realtimeAt));
  const alertsLive = recent(board?.alertsAt);
  const available = Object.values(board?.coverage ?? {}).some(source => source.schedule);
  const visibleTrains = events => (events ?? []).map(train => {
    if (recent(board.coverage[train.service]?.realtimeAt)) return train;
    return { ...train, expected: null, status: 'programado' };
  }).filter(train => (train.expected ?? train.scheduled) >= now - 60)
    .sort((a, b) => (a.expected ?? a.scheduled) - (b.expected ?? b.scheduled));
  const departures = visibleTrains(board?.events.departure);
  const trains = type === 'departure' ? departures : visibleTrains(board?.events.arrival);
  const notices = alertsLive ? board.notices : [];
  const [limit, setLimit] = useState(8);

  return (
    <div className="rail-board">
      <header className="rail-hero">
        <div className="rail-brand"><TrainFront size={19} aria-hidden="true" /> Panel ferroviario</div>
        <h1>Estación de Utrera</h1>
        <div className="rail-hero-meta">
          <p>{date.format(now * 1000)}</p>
          <span className={live ? 'rail-live' : 'rail-live rail-live--offline'}>
            <i aria-hidden="true" />{live ? 'Con datos en tiempo real' : 'Horarios de Renfe'}
          </span>
        </div>
      </header>

      {notices.length > 0 && (
        <a className="rail-alert-strip" href="#rail-notices-title">
          <Bell size={17} aria-hidden="true" />
          <strong>{notices.length === 1 ? '1 aviso de Renfe' : notices.length + ' avisos de Renfe'}</strong>
          <span>Ver avisos <ArrowDown size={14} aria-hidden="true" /></span>
        </a>
      )}
      <section className="rail-next" aria-labelledby="rail-next-title">
        <h2 id="rail-next-title">Próximos trenes</h2>
        <div className="rail-next-grid">
          {corridors.map(({ id, label }) => (
            <NextTrain key={id} label={label} train={departures.find(train => train.corridor === id
              && train.status !== 'cancelado' && train.status !== 'sin-parada'
              && (train.expected ?? train.scheduled) >= now)}
              emptyText={!board && busy ? 'Consultando salidas…' : available
                ? 'Sin salida publicada en las próximas horas.'
                : 'Horarios no disponibles.'} />
          ))}
        </div>
      </section>

      <section className="rail-panel" aria-label="Circulaciones en Utrera">
        <div className="rail-toolbar">
          <div className="rail-tabs" role="group" aria-label="Movimiento">
            {tabs.map(({ value, label, icon: Icon }) => (
              <button type="button" key={value} aria-pressed={type === value}
                onClick={() => { setType(value); setLimit(8); }}>
                <Icon size={17} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
          <button className="rail-refresh" type="button" aria-label="Actualizar datos" title="Actualizar datos"
            disabled={busy} onClick={() => setRequest(n => n + 1)}>
            <RefreshCw size={17} aria-hidden="true" className={busy ? 'rail-spinning' : ''} />
          </button>
        </div>
        <div className="rail-sources" role="status">
          {!board && busy && 'Consultando los horarios de Renfe…'}
          {error && (board ? 'Falló la última consulta a Renfe.' : 'No se ha podido consultar Renfe.')}
          {board && Object.entries(services).map(([key, label]) => {
            const source = board.coverage[key];
            return <p key={key}>{label} · {!source?.schedule ? 'horarios no disponibles'
              : recent(source.realtimeAt) ? 'actualización ' + time(source.realtimeAt)
              : 'solo horario programado'}</p>;
          })}
        </div>
        <div className="rail-columns" aria-hidden="true">
          <span>Hora</span><span>{type === 'departure' ? 'Destino' : 'Origen'}</span><span>Estado</span>
        </div>
        {trains.length ? (
          <>
            <ul className="rail-list">
              {trains.slice(0, limit).map(train => <TrainRow key={train.id} train={train} type={type} />)}
            </ul>
            {trains.length > limit && (
              <button type="button" className="rail-more" onClick={() => setLimit(n => n + 8)}>
                Ver más {type === 'departure' ? 'salidas' : 'llegadas'}
              </button>
            )}
          </>
        ) : (
          <p className="rail-empty">{!board && busy ? 'Cargando el panel…'
            : available ? 'Sin circulaciones publicadas para las próximas horas.'
            : 'Horarios no disponibles en este momento.'}</p>
        )}
      </section>

      <section className="rail-panel rail-notices" aria-labelledby="rail-notices-title">
        <h2 id="rail-notices-title" tabIndex={-1}><Bell size={18} aria-hidden="true" /> Avisos de Cercanías</h2>
        {!alertsLive ? <p>{!board && busy ? 'Consultando avisos…' : 'Avisos en tiempo real no disponibles.'}</p>
          : notices.length === 0 ? <p>{board.coverage.cercanias?.schedule
            ? 'Renfe no publica avisos activos para Utrera o sus líneas de Cercanías.'
            : 'Renfe no publica avisos activos específicos de la estación.'}</p>
          : notices.map(({ id, title, description }) => (
            <details key={id}>
              <summary>{title || description.split(/\r?\n/)[0]}</summary>
              {description && <p>{description}</p>}
            </details>
          ))}
      </section>

      <footer className="rail-footer">
        <a href="https://data.renfe.com/" target="_blank" rel="noreferrer">Datos de Renfe · CC BY 4.0 <ExternalLink size={13} /></a>
        <span className="rail-photo-credit">
          Foto de <a href="https://commons.wikimedia.org/wiki/File:Estaci%C3%B3n_de_Utrera_-_IMG_20250710_211631.jpg" target="_blank" rel="noreferrer">El Pantera</a>
          {' · '}<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
        </span>
        <a href="https://www.adif.es/w/51200-utrera" target="_blank" rel="noreferrer">Estación en Adif <ExternalLink size={13} /></a>
      </footer>
    </div>
  );
}
