import React from 'react';
import TarjetaSanidad from '../components/TarjetaSanidad';

export default function Sanidad() {
  // Lista de ejemplo para probar
  const centrosSanitarios = [
    {
      nombre: "Clínica Dental Sonrisa Utrera",
      categoria: "Odontología Avanzada",
      registroSanitario: "NICA 45123",
      eslogan: "Tu sonrisa en las mejores manos",
      especialidades: ["Ortodoncia Invisible", "Implantes 3D", "Blanqueamiento LED"],
      tecnologia: "Escáner intraoral 3D sin radiación",
      medico: "Dr. Alejandro Pérez (Col. 41410)",
      financiacion: "Hasta 36 meses sin intereses",
      mutuas: "Sanitas, Adeslas, Asisa",
      direccion: "Av. San Juan Bosco, 45, Utrera",
      horario: "L-V: 9:00 - 14:00 y 16:30 - 20:30",
      whatsapp: "34600000000",
      telefono: "955000000"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-xl mx-auto mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Salud y Estética Privada</h1>
        <p className="text-sm text-slate-600 mt-1">Centros médicos, clínicas dentales y estética avanzada verificados en Utrera</p>
      </div>

      <div>
        {centrosSanitarios.map((centro, index) => (
          <TarjetaSanidad key={index} centro={centro} />
        ))}
      </div>
    </div>
  );
}