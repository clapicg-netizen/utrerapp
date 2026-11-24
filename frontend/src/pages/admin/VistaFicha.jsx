import React, { useState } from 'react';
import EscaparateComercio, { ESCAPARATES } from '../../components/EscaparateComercio';
import FichaComercialEstandar from '../../components/FichaComercialEstandar';
import LandingComercio from '../../components/LandingComercio';
import FichaInmobiliaria from '../FichaInmobiliaria';
import FichaComida from '../FichaComida';
import { Dialogo } from './Controles';

export default function VistaFicha({ ficha, archivoLocal, cerrar }) {
  const [foto, setFoto] = useState(null);
  const escaparate = ESCAPARATES.some(({ id }) => id === String(ficha.id));
  const especial = ['especial1', 'especial2'].includes(ficha.tipo_ficha);
  let contenido;
  if (escaparate) contenido = <EscaparateComercio comercio={ficha} archivoLocal={archivoLocal} />;
  else if (especial) {
    const Ficha = ficha.tipo_ficha === 'especial1' ? FichaInmobiliaria : FichaComida;
    contenido = <Ficha negocioId={ficha.id} borrador={ficha} />;
  } else if (ficha.subcategoria?.toLowerCase().includes('landing')) {
    contenido = <LandingComercio comercio={ficha} />;
  } else {
    contenido = <FichaComercialEstandar comercio={ficha} ampliarFoto={setFoto} />;
  }
  return <Dialogo titulo="Vista previa de la ficha" cerrar={cerrar} className={escaparate ? 'admin-preview-wide' : 'admin-preview'}>
    {foto ? <>
      <button className="admin-button" onClick={() => setFoto(null)}>Volver a la ficha</button>
      <img className="admin-expanded-photo" src={foto} alt="Fotografía ampliada" />
    </> : contenido}
  </Dialogo>;
}
