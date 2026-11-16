import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink, MapPin, RefreshCw } from 'lucide-react';
import { fuelTypes, getUtreraFuelPrices } from '../lib/fuelService';
import './GasolinerasWidget.css';

const euros = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const price = value => euros.format(value) + ' €/l';

function Station({ station, fuel, minimum }) {
  const amount = station.prices[fuel];
  const location = station.lat != null && station.lon != null
    ? station.lat + ',' + station.lon
    : [station.name, station.address, station.locality, 'Sevilla'].filter(Boolean).join(', ');
  const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(location);

  return (
    <li className="fuel-station">
      <div className="fuel-station-main">
        <div>
          <h3>{station.name}</h3>
          <p className="fuel-address"><MapPin size={14} aria-hidden="true" />
            <span>{[station.address, station.locality].filter(Boolean).join(' · ')}</span>
          </p>
          <a href={maps} target="_blank" rel="noreferrer">Cómo llegar <ExternalLink size={12} aria-hidden="true" /></a>
        </div>
        <div className="fuel-station-price">
          <strong>{price(amount)}</strong>
          <small>{amount === minimum ? 'Precio más bajo' : '+' + price(amount - minimum)}</small>
        </div>
      </div>
      <details className="fuel-details">
        <summary>Horario y otros precios</summary>
        <p><Clock size={14} aria-hidden="true" /> {station.hours || 'Horario sin publicar'}</p>
        <dl>
          {fuelTypes.filter(({ id }) => id !== fuel && station.prices[id] != null).map(({ id, label }) => (
            <div key={id}><dt>{label}</dt><dd>{price(station.prices[id])}</dd></div>
          ))}
        </dl>
      </details>
    </li>
  );
}

export default function GasolinerasWidget() {
  const [fuel, setFuel] = useState('gasolina95');
  const [request, setRequest] = useState(0);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;
    const timeout = setTimeout(() => controller.abort(), 19000);
    setBusy(true);
    getUtreraFuelPrices(controller.signal).then(result => {
      if (canceled) return;
      setData(result);
      setError(false);
    }).catch(() => {
      if (!canceled) {
        setData(null);
        setError(true);
      }
    }).finally(() => {
      clearTimeout(timeout);
      if (!canceled) setBusy(false);
    });
    return () => {
      canceled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [request]);

  const stations = data?.stations ?? [];
  const visibleFuels = fuelTypes.filter(({ id }) =>
    id === fuel || id === 'gasolina95' || id === 'diesel' || stations.some(station => station.prices[id] != null));
  const ranked = stations.filter(station => station.prices[fuel] != null)
    .sort((a, b) => a.prices[fuel] - b.prices[fuel] || a.name.localeCompare(b.name, 'es'));
  const minimum = ranked[0]?.prices[fuel];
  const label = fuelTypes.find(item => item.id === fuel).label;
  const count = ranked.length;

  return (
    <section className="fuel-comparator" aria-label="Comparar precios de carburantes">
      <div className="fuel-toolbar">
        <div className="fuel-tabs" role="group" aria-label="Carburante">
          {visibleFuels.map(({ id, shortLabel }) => (
            <button key={id} type="button" aria-pressed={fuel === id} onClick={() => setFuel(id)}>{shortLabel}</button>
          ))}
        </div>
        <button className="fuel-refresh" type="button" aria-label="Actualizar precios" title="Actualizar precios"
          disabled={busy} onClick={() => setRequest(value => value + 1)}>
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="fuel-summary" role="status">
        {busy ? <p>Consultando los precios oficiales…</p>
          : error ? <p>No se han podido consultar los precios. Pulsa el botón de actualizar para reintentar.</p>
          : !count ? <p>Sin precios publicados para {label} en Utrera.</p>
          : <><p>{count === 1 ? '1 estación' : count + ' estaciones'} · De menor a mayor precio</p>
            {data.publishedAt && <small>Fecha de la consulta oficial: {data.publishedAt}</small>}</>}
      </div>
      {count > 0 && (
        <>
          <div className="fuel-best">
            <div><p>Precio más bajo</p><strong>{price(minimum)}</strong></div>
            <div><p>{label}</p><strong>{ranked.filter(station => station.prices[fuel] === minimum).map(station => station.name).join(' · ')}</strong></div>
          </div>
          <ul className="fuel-stations">
            {ranked.map(station => <Station key={station.id} station={station} fuel={fuel} minimum={minimum} />)}
          </ul>
        </>
      )}
    </section>
  );
}
