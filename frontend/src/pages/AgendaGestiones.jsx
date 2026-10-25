import React from "react";
import { ArrowLeft, Landmark, Building, GraduationCap, Phone, ExternalLink, MapPin } from "lucide-react";

export default function AgendaGestiones({ setPaginaActual }) {
  const administraciones = [
    {
      nombre: "Ayuntamiento de Utrera",
      tipo: "Administración Local",
      telefono: "955 86 45 00",
      direccion: "Plaza de Gibaxa, 1",
      web: "https://www.utrera.org"
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
    }
  ];

  const suministros = [
    {
      nombre: "Acciona (Agua Potable - Giahsa / EMASÚ)",
      tipo: "Agua y Saneamiento",
      telefono: "900 81 28 12",
      detalle: "Averías, altas y gestiones del agua"
    },
    {
      nombre: "Endesa / e-distribución",
      tipo: "Electricidad (Luz)",
      telefono: "800 76 07 06",
      detalle: "Urgencias de red y atención comercial"
    },
    {
      nombre: "Naturgy / Nedgia",
      type: "Gas Natural",
      telefono: "900 10 02 51",
      detalle: "Inspecciones, acometidas y urgencias de gas"
    }
  ];

  const educacion = [
    {
      categoria: "Guarderías y Escuelas Infantiles",
      items: [
        "Escuela Infantil Municipal",
        "Centros de Educación Infantil autorizados en Utrera"
      ]
    },
    {
      categoria: "Colegios de Educación Primaria (CEIP)",
      items: [
        "CEIP Álvarez Quintero",
        "CEIP Al-Ándalus",
        "CEIP Rodrigo Caro",
        "CEIP Sagrada Familia",
        "CEIP La Fontanilla"
      ]
    },
    {
      categoria: "Institutos de Educación Secundaria (IES) y Bachillerato",
      items: [
        "IES Ruiz Gijón",
        "IES Ponce de León",
        "IES José María Infantes",
        "IES Maestro Juan Calero"
      ]
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-6 animate-fadeIn font-sans text-slate-800">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-2">
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
        <h1 className="text-xl font-black tracking-tight relative z-10 pt-2">Agenda de Gestiones</h1>
        <p className="text-xs text-slate-300 relative z-10">Directorio completo de administraciones públicas, suministros y centros educativos en Utrera.</p>
      </div>

      {/* SECCIÓN 1: ADMINISTRACIONES PÚBLICAS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Landmark size={18} className="text-amber-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Administraciones Públicas</h2>
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
                    <Phone size={13} className="text-amber-600 shrink-0" />
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

      {/* SECCIÓN 2: SUMINISTROS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <Building size={18} className="text-blue-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Suministros (Agua, Luz y Gas)</h2>
        </div>

        <div className="space-y-3">
          {suministros.map((sum, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                {sum.tipo}
              </span>
              <h3 className="text-sm font-black text-slate-900">{sum.nombre}</h3>
              <p className="text-[11px] text-slate-500">{sum.detalle}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Atención / Urgencias:</span>
                <a
                  href={`tel:${sum.telefono.replace(/\s+/g, '')}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Phone size={12} />
                  <span>{sum.telefono}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: EDUCACIÓN */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <GraduationCap size={18} className="text-purple-600" />
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">Educación en Utrera</h2>
        </div>

        <div className="space-y-3">
          {educacion.map((edu, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-black text-purple-900 uppercase tracking-wide">{edu.categoria}</h3>
              <ul className="space-y-1.5 pt-1">
                {edu.items.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-center gap-2 bg-purple-50/50 p-2 rounded-xl border border-purple-100/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}