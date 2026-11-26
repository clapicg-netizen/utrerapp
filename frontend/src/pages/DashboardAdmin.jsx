import MarketAdmin from '../market/MarketAdmin';
import { marketEnabled } from '../market/config';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, BarChart3, Calendar, ChevronRight, LayoutDashboard, LogOut,
  Megaphone, Menu, Newspaper, Settings, Store, Users, X,
} from 'lucide-react';
import { eliminarComercio } from '../lib/comerciosService';
import { supabase } from '../lib/supabaseClient';
import AccesoAdministracion from './AccesoAdministracion';
import logo from './logo-utrera-portada.webp';
import { Aviso, Dialogo } from './admin/Controles';
import { DirectorioAnuncios, DirectorioComercios } from './admin/Directorios';
import EditorAnuncio from './admin/EditorAnuncio';
import EditorComercio from './admin/EditorComercio';
import { categoriasBase, leerFilas } from './admin/modelos';
import ResumenAdmin from './admin/ResumenAdmin';
import VistaFicha from './admin/VistaFicha';
import GestorCultural from '../cultura/Gestor';
import { culturaDB, culturaPruebas } from '../cultura/supabaseCultural';
import './admin/dashboard.css';

const modulos = [
  ['inicio', 'Inicio', LayoutDashboard], ['comercios', 'Comercios', Store], ['anuncios', 'Anuncios', Megaphone],
  ['agenda', 'Agenda', Calendar, !culturaDB], ['noticias', 'Noticias', Newspaper, true], ['sanidad', 'Sanidad', Activity, true],
  ['usuarios', 'Usuarios', Users, true], ['estadisticas', 'Estadísticas', BarChart3, true],
  ...(marketEnabled ? [['utreramarket', 'UtreraMarket', Store]] : []),
  ['configuracion', 'Configuración', Settings, true],
];

export default function DashboardAdmin({ soloAgenda = false }) {
  if (soloAgenda && culturaPruebas) return <Panel soloAgenda />;
  return <AccesoAdministracion>
    {(salir, mensajeAcceso, adminId) => <Panel salir={salir} mensajeAcceso={mensajeAcceso} adminId={adminId} />}
  </AccesoAdministracion>;
}

function Panel({ salir, mensajeAcceso, adminId, soloAgenda = false }) {
  const [seccion, setSeccion] = useState(soloAgenda ? 'agenda' : 'inicio');
  const [menu, setMenu] = useState(false);
  const [editor, setEditor] = useState(null);
  const [pendiente, setPendiente] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [vista, setVista] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const encabezado = useRef(null);

  const comercios = useQuery({ enabled: !soloAgenda, queryKey: ['administracion', adminId, 'comercios'], queryFn: ({ signal }) => leerFilas('comercios_utrera', signal) });
  const anuncios = useQuery({ enabled: !soloAgenda, queryKey: ['administracion', adminId, 'anuncios'], queryFn: ({ signal }) => leerFilas('anuncios', signal) });
  const [, titulo, Icono, sinDesarrollar] = modulos.find(([id]) => id === seccion);
  const categorias = [...new Set([...categoriasBase, ...(comercios.data || []).map(fila => fila.categoria).filter(Boolean)])];

  useEffect(() => {
    if (!pendiente && !ocupado) return;
    function impedirCierre(event) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', impedirCierre);
    return () => window.removeEventListener('beforeunload', impedirCierre);
  }, [pendiente, ocupado]);

  function puedeSalir() {
    return !ocupado && (!pendiente || window.confirm('Hay cambios sin guardar. ¿Quieres descartarlos?'));
  }

  function navegar(destino, registro) {
    if (!puedeSalir()) return;
    setEditor(registro);
    setSeccion(destino);
    setPendiente(false);
    setMensaje(null);
    setMenu(false);
    window.scrollTo(0, 0);
    encabezado.current?.focus({ preventScroll: true });
  }

  function guardado(texto) {
    const consulta = seccion === 'comercios' ? comercios : anuncios;
    consulta.refetch();
    setEditor(null);
    setPendiente(false);
    setMensaje({ texto });
    window.scrollTo(0, 0);
    encabezado.current?.focus({ preventScroll: true });
  }

  async function borrar() {
    const { tipo, fila } = confirmacion;
    setOcupado(true);
    setMensaje(null);
    try {
      if (tipo === 'comercios') {
        const resultado = await eliminarComercio(fila.id);
        if (!resultado.success) throw new Error(resultado.message);
        comercios.refetch();
      } else {
        const { error } = await supabase.from('anuncios').delete().eq('id', fila.id).select('id').single();
        if (error) throw error;
        anuncios.refetch();
      }
      setMensaje({ texto: tipo === 'comercios' ? 'Comercio eliminado.' : 'Anuncio eliminado.' });
    } catch (error) {
      setMensaje({ error: true, texto: `No se pudo eliminar el registro. ${error.message}` });
    } finally {
      setOcupado(false);
      setConfirmacion(null);
    }
  }

  async function activar(anuncio, activo) {
    setOcupado(true);
    setMensaje(null);
    try {
      const { error } = await supabase.from('anuncios').update({ activo }).eq('id', anuncio.id).select('id').single();
      if (error) throw error;
      await anuncios.refetch();
      setMensaje({ texto: activo ? 'Anuncio activado.' : 'Anuncio desactivado.' });
    } catch (error) {
      setMensaje({ error: true, texto: `No se pudo cambiar el estado del anuncio. ${error.message}` });
    } finally {
      setOcupado(false);
    }
  }

  const consultas = seccion === 'inicio' ? [[comercios, 'comercios'], [anuncios, 'anuncios']]
    : ['comercios','utreramarket'].includes(seccion) ? [[comercios, 'comercios']]
    : seccion === 'anuncios' ? [[anuncios, 'anuncios']] : [];

  return <div className="admin-layout">
    {menu && <button className="admin-backdrop" aria-label="Cerrar menú" onClick={() => setMenu(false)} />}
    <aside id="admin-sidebar" className={`admin-sidebar ${menu ? 'admin-sidebar-open' : ''}`}>
      <div className="admin-brand"><img src={logo} alt="" width="42" height="42" />
        <div><strong>UtrerApp</strong><small>Administración</small></div>
        <button type="button" className="admin-icon admin-menu-close" aria-label="Cerrar menú" onClick={() => setMenu(false)}><X size={20} /></button>
      </div>
      <nav aria-label="Módulos de administración">
        {(soloAgenda ? modulos.filter(([id]) => id === 'agenda') : modulos).map(([id, nombre, IconoModulo, pendienteModulo]) =>
          <button type="button" key={id} aria-current={seccion === id ? 'page' : undefined}
            disabled={ocupado} onClick={() => navegar(id, null)}>
            <IconoModulo size={19} aria-hidden="true" /><span>{nombre}</span>
            {pendienteModulo && <small>Pendiente</small>}
          </button>)}
      </nav>
    </aside>
    <div className="admin-workspace">
      <header className="admin-header">
        <button className="admin-icon admin-menu-button" type="button" aria-label="Abrir menú" aria-expanded={menu}
          aria-controls="admin-sidebar" onClick={() => setMenu(!menu)}><Menu size={23} /></button>
        <div className="admin-breadcrumb" aria-label="Ubicación"><span>UtrerApp</span><ChevronRight size={15} aria-hidden="true" /><strong>{titulo}</strong></div>
        {!soloAgenda && <button type="button" disabled={ocupado} className="admin-button admin-logout" onClick={() => { if (puedeSalir()) salir(); }}>
          <LogOut size={17} /> Cerrar sesión
        </button>}
      </header>
      <main className="admin-main">
        <div className="admin-page-heading"><span className="admin-section-icon"><Icono size={24} aria-hidden="true" /></span>
          <h1 ref={encabezado} tabIndex={-1}>{titulo}</h1></div>
        {mensajeAcceso && <Aviso mensaje={{ texto: mensajeAcceso, error: mensajeAcceso.startsWith('No se pudo') }} />}
        <Aviso mensaje={mensaje} />
        {consultas.map(([consulta, nombre]) => consulta.isPending ? <p key={nombre} role="status">Cargando {nombre}…</p>
          : consulta.isError ? <div key={nombre} className="admin-load-error">
            <Aviso mensaje={{ error: true, texto: `No se pudieron cargar los ${nombre}.` }} />
            <button type="button" className="admin-button" onClick={() => consulta.refetch()}>Reintentar</button>
          </div> : null)}
        {seccion === 'inicio' && <ResumenAdmin comercios={comercios.data} anuncios={anuncios.data}
          crearComercio={() => navegar('comercios', { fila: null })} crearAnuncio={() => navegar('anuncios', { fila: null })} />}
        {seccion === 'utreramarket' && comercios.data && <MarketAdmin rows={comercios.data} />}
        {seccion === 'comercios' && (editor
          ? <EditorComercio ficha={editor.fila} categorias={categorias} adminId={adminId} pendiente={setPendiente}
              ocupado={setOcupado} cancelar={() => navegar('comercios', null)} guardado={guardado} />
          : comercios.data && <DirectorioComercios filas={comercios.data} crear={() => navegar('comercios', { fila: null })}
              editar={fila => navegar('comercios', { fila })} ver={setVista} eliminar={fila => setConfirmacion({ tipo: 'comercios', fila })} />)}
        {seccion === 'anuncios' && (editor
          ? <EditorAnuncio anuncio={editor.fila} pendiente={setPendiente} ocupado={setOcupado}
              cancelar={() => navegar('anuncios', null)} guardado={guardado} />
          : anuncios.data && <DirectorioAnuncios filas={anuncios.data} crear={() => navegar('anuncios', { fila: null })} ocupado={ocupado}
              editar={fila => navegar('anuncios', { fila })} activar={activar} eliminar={fila => setConfirmacion({ tipo: 'anuncios', fila })} />)}
        {seccion === 'agenda' && culturaDB && <GestorCultural onDirty={setPendiente} onBusy={setOcupado} />}
        {sinDesarrollar && <section className="admin-surface admin-empty admin-pending">
          <Icono size={30} aria-hidden="true" /><h2>Pendiente de desarrollo</h2>
          <p>La gestión de {titulo.toLowerCase()} todavía no está disponible en este panel.</p>
        </section>}
      </main>
    </div>
    {vista && <VistaFicha ficha={vista} cerrar={() => setVista(null)} />}
    {confirmacion && <Dialogo titulo={confirmacion.tipo === 'comercios' ? 'Eliminar comercio' : 'Eliminar anuncio'}
      cerrar={() => { if (!ocupado) setConfirmacion(null); }}>
      <p>¿Quieres eliminar <strong>{confirmacion.fila.nombre || confirmacion.fila.titulo}</strong>? Esta acción es permanente.</p>
      <div className="admin-confirm-actions">
        <button type="button" className="admin-button" autoFocus disabled={ocupado} onClick={() => setConfirmacion(null)}>Cancelar</button>
        <button type="button" className="admin-button admin-delete" disabled={ocupado} onClick={borrar}>{ocupado ? 'Eliminando…' : 'Eliminar registro'}</button>
      </div>
    </Dialogo>}
  </div>;
}
