import React from 'react';
import { Car, Fuel, Pill, Train } from 'lucide-react';
import { PARKING_URL } from '../lib/parking';
import './conso-preview.css';

const services = [
  { id: 'farmacias', label: 'Farmacias', detail: 'Farmacias de guardia', Icon: Pill },
  { id: 'trenes', label: 'Trenes', detail: 'Horarios de trenes', Icon: Train },
  { id: 'aparcamientos', label: 'Aparcamientos', detail: 'Mapa de aparcamientos', Icon: Car, href: PARKING_URL },
  { id: 'gasolineras', label: 'Gasolineras', detail: 'Precios del combustible', Icon: Fuel },
];

export default function ConsoQuickLinks({ hrefFor }) {
  return <nav className="conso-quick-links" aria-label="Servicios de Utrera">
    {services.map(({ id, label, detail, Icon, href }) =>
      <a key={id} href={href || hrefFor(id)} target={href ? '_blank' : undefined} rel={href ? 'noopener noreferrer' : undefined}>
        <Icon size={20} aria-hidden="true" />
        <span><strong>{label}</strong><small>{detail}{href ? ' · Nueva pestaña' : ''}</small></span>
      </a>
    )}
  </nav>;
}
