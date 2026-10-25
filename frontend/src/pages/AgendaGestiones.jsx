import React, { useState } from "react";
import { ArrowLeft, Landmark, GraduationCap, Phone, ExternalLink, MapPin } from "lucide-react";

export default function AgendaGestiones({ setPaginaActual }) {
  const [seccionActiva, setSeccionActiva] = useState('administraciones'); // 'administraciones' o 'educacion'

  const administraciones = [
    {
      nombre: "Ayuntamiento de Utrera",
      tipo: "Administración Local",
      telefono: "955 86 45 00",
      direccion: "Plaza de Gibaxa, 1",
      web: "https://www.utrera.org"
    },
    {
      nombre: "Aguas del Huesna",
      tipo: "Suministro - Agua",
      telefono: "954 50 03 00",
      direccion: "Gestión del ciclo integral del agua en Utrera",
      web: "https://www.aguasdelhuesna.com/es/"
    },
    {
      nombre: "Seguridad Social (INSS & TGSS)",
      tipo: "Estatal",
      telefono: "901 16 65 65",
      direccion: "C. Álvarez Hazañas, 32",
      web: "https://www.seg-social.es"
    },
    {
      nombre: "Agencia Tributaria (Hacienda)",
      tipo: "Estatal",
      telefono: "91 554 87 70",
      direccion: "Delegación y asistencia tributaria",
      web: "https://www.agenciatributaria.es"
    },
    {
      nombre: "Juzgados de Utrera",
      tipo: "Justicia",
      telefono: "955 83 97 00",
      direccion: "C. Toneleros, s/n",
      web: "https://www.juntadeandalucia.es"
    },
    {
      nombre: "OPAEF (Diputación de Sevilla - Impuestos)",
      tipo: "Provincial",
      telefono: "954 50 68 00",
      direccion: "Gestión fiscal y tributaria municipal",
      web: "https://www.opaef.es"
    },
    {
      nombre: "Registro de la Propiedad de Utrera",
      tipo: "Estatal / Mercantil",
      telefono: "955 86 01 23",
      direccion: "Trámites de fincas y registros",
      web: "https://www.registradores.org"
    },
    {
      nombre: "Endesa / e-distribución",
      tipo: "Suministro - Luz",
      telefono: "800 76 07 06",
      direccion: "Urgencias de red y atención comercial",
      web: ""
    },
    {
      nombre: "Naturgy / Nedgia",
      tipo: "Suministro - Gas",
      telefono: "900 10 02 51",
      direccion: "Inspecciones, acometidas y urgencias",
      web: ""
    }
  ];

  const educacion = [
    {
      categoria: "Guarderías y Escuelas Infantiles",
      items: [
        { nombre: "Escuela Infantil Municipal", telefono: "955 86 00 00", direccion: "Utrera" },
        { nombre: "Centros de Educación Infantil autorizados", telefono: "954 86 00 00", direccion: "Utrera" }
      ]
    },
    {
      categoria: "Colegios de Educación Primaria (CEIP)",
      items: [
        { nombre: "CEIP Álvarez Quintero", telefono: "955 97 96 00", direccion: "Av. San Juan Bosco" },
        { nombre: "CEIP Al-Ándalus", telefono: "955 59 78 00", direccion: "Barriada La Mulata" },
        { nombre: "CEIP Rodrigo Caro", telefono: "955 97 96 10", direccion: "C. María Auxiliadora" },
        { nombre: "CEIP Sagrada Familia", telefono: "955 86 12 34", direccion: "Utrera" },
        { nombre: "CEIP La Fontanilla", telefono: "955 97 96 20", direccion: "Zona La Fontanilla" }
      ]
    },
    {
      categoria: "Institutos de Educación Secundaria (IES) y Bachillerato",
      items: [
        { nombre: "IES Ruiz Gijón", telefono: "955 83 95 30", direccion: "C. Ruiz Gijón" },
        { nombre: "IES Ponce de León", telefono: "955 83 95 40", direccion: "Utrera" },
        { nombre: "IES José María Infantes", telefono: "955 83 95 50", direccion: "Utrera" },
        { nombre: "IES Maestro Juan Calero", telefono: "955 83 95 60", direccion: "Utrera" }
      ]
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans text-slate-800">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 shadow-xl rounded-3xl relative overflow-hidden space-y-2">
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => setPaginaActual("home")}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Utrerapp Oficial
          </span>
        </div>
        <h1 className="text-xl font-black tracking-tight relative z-10 pt-1">Agenda Y Gestiones</h1>
        <p className="text-xs text-slate-300 relative z-10">Directorio oficial de administraciones, suministros y centros educativos en Utrera.</p>
      </div>

      {/* PESTAÑAS PRINCIPALES */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setSeccionActiva('administraciones')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${seccionActiva === 'administraciones' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          <Landmark size={16} />
          <span>Administraciones</span>
        </button>

        <button
          onClick={() => setSeccionActiva('educacion')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${seccionActiva === 'educacion' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          <GraduationCap size={16} />
          <span>Educación</span>
        </button>
      </div>

      {/* SECCIÓN 1: ADMINISTRACIONES Y SUMINISTROS */}
      {seccionActiva === 'administraciones' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="px-1 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Oficinas y Suministros Básicos</h2>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Sección 1</span>
          </div>

          <div className="space-y-3">
            {administraciones.map((admin, idx) => (
              <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                      {admin.tipo}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1">{admin.nombre}</h3>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  {admin.direccion && (
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{admin.direccion}</span>
                    </p>
                  )}
                  {admin.telefono && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-600 shrink-0" />
                      <a href={`tel:${admin.telefono.replace(/\s+/g, '')}`} className="font-bold hover:underline text-slate-900">
                        {admin.telefono}
                      </a>
                    </p>
                  )}
                </div>

                {admin.web && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <a
                      href={admin.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Sitio Web Oficial</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: EDUCACIÓN (Con tarjetas interactivas y botones de llamada) */}
      {seccionActiva === 'educacion' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="px-1 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Centros Educativos en Utrera</h2>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Sección 2</span>
          </div>

          <div className="space-y-4">
            {educacion.map((edu, idx) => (
              <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-black text-purple-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                  {edu.categoria}
                </h3>
                <div className="space-y-2">
                  {edu.items.map((cole, i) => (
                    <div key={i} className="bg-purple-50/40 p-3 rounded-2xl border border-purple-100/60 flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{cole.nombre}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin size={10} className="text-purple-400 shrink-0" />
                          <span>{cole.direccion}</span>
                        </p>
                      </div>

                      <a
                        href={`tel:${cole.telefono.replace(/\s+/g, '')}`}
                        className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-sm transition-colors shrink-0"
                        title="Llamar al centro"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}