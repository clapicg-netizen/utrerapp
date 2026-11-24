import React, { useEffect, useState } from 'react';
import { retornoRecuperacion, supabase } from '../lib/supabaseClient';

const claveRecuperacion = 'utrerapp-admin-recuperacion';
const claseCampo = 'w-full p-3 bg-slate-50 border border-slate-300 rounded-xl';
const claseBoton = 'w-full bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50';

export default function AccesoAdministracion({ children }) {
  const [session, setSession] = useState(undefined);
  const [autorizada, setAutorizada] = useState(null);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [solicitando, setSolicitando] = useState(false);
  const [enlaceRecuperacion, setEnlaceRecuperacion] = useState(() =>
    retornoRecuperacion || new URLSearchParams(window.location.search).get('recuperar') === '1'
  );
  const [recuperacionId, setRecuperacionId] = useState(() => sessionStorage.getItem(claveRecuperacion));
  const usuarioId = session?.user.id;
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajePanel, setMensajePanel] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, nextSession) => {
      if (evento === 'PASSWORD_RECOVERY' && nextSession) {
        const id = nextSession.user.id;
        sessionStorage.setItem(claveRecuperacion, id);
        setRecuperacionId(id);
        setContrasena('');
        setConfirmacion('');
      }
      setSession(nextSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!usuarioId) {
      setAutorizada(null);
      return;
    }
    let vigente = true;
    async function comprobarPermisos() {
      const { data, error } = await supabase.rpc('es_admin_comercios_utrera');
      if (!vigente) return;
      setAutorizada({ usuarioId, permiso: !error && data === true });
      if (error) setMensaje('No se pudieron comprobar tus permisos. Cierra sesión y vuelve a entrar.');
    }
    comprobarPermisos();
    return () => { vigente = false; };
  }, [usuarioId]);

  async function iniciarSesion(event) {
    event.preventDefault();
    setOcupado(true);
    setMensaje('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: contrasena,
      });
      if (error) setMensaje('No se pudo iniciar sesión. Comprueba tus credenciales y vuelve a intentarlo.');
      else setContrasena('');
    } catch {
      setMensaje('No se pudo conectar con Supabase. Vuelve a intentarlo.');
    } finally {
      setOcupado(false);
    }
  }

  function cerrarRecuperacion() {
    sessionStorage.removeItem(claveRecuperacion);
    setRecuperacionId(null);
    setEnlaceRecuperacion(false);
    setSolicitando(false);
    setContrasena('');
    setConfirmacion('');
    const url = new URL(window.location.href);
    ['recuperar', 'error', 'error_code', 'error_description'].forEach(param => url.searchParams.delete(param));
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  async function solicitarRecuperacion(event) {
    event.preventDefault();
    setOcupado(true);
    setMensaje('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://www.utrerapp.com/admin?recuperar=1',
      });
      setMensaje(error
        ? 'No se pudo solicitar el enlace. Espera un momento y vuelve a intentarlo.'
        : 'Si el correo está registrado, recibirás un enlace para crear una contraseña nueva.');
    } catch {
      setMensaje('No se pudo conectar con Supabase. Vuelve a intentarlo.');
    } finally {
      setOcupado(false);
    }
  }

  async function guardarContrasena(event) {
    event.preventDefault();
    if (contrasena !== confirmacion) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }
    setOcupado(true);
    setMensaje('');
    try {
      const { error } = await supabase.auth.updateUser({ password: contrasena });
      if (error) {
        if (error.code === 'same_password') setMensaje('Elige una contraseña distinta de la anterior.');
        else if (error.code === 'weak_password') setMensaje('Elige una contraseña más fuerte.');
        else setMensaje('No se pudo guardar la contraseña. Si el enlace caducó, solicita uno nuevo.');
        return;
      }
      cerrarRecuperacion();
      setMensajePanel('Contraseña actualizada.');
    } catch {
      setMensaje('No se pudo conectar con Supabase. Vuelve a intentarlo.');
    } finally {
      setOcupado(false);
    }
  }

  async function salir() {
    setMensaje('');
    setMensajePanel('');
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      const aviso = 'No se pudo cerrar la sesión. Inténtalo de nuevo.';
      setMensaje(aviso);
      setMensajePanel(aviso);
    } else {
      setAutorizada(null);
      cerrarRecuperacion();
    }
  }

  const cambiandoContrasena = Boolean(usuarioId && recuperacionId === usuarioId);
  if (session === undefined || (session && !cambiandoContrasena && !enlaceRecuperacion && autorizada?.usuarioId !== usuarioId)) {
    return <p className="p-8 text-center" role="status">Comprobando acceso…</p>;
  }
  if (session && autorizada?.permiso && !cambiandoContrasena && !enlaceRecuperacion) {
    return children(salir, mensajePanel, usuarioId);
  }

  return (
    <main className="max-w-md mx-auto p-6 pt-16">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 mb-5">Administración de UtrerApp</h1>
        {cambiandoContrasena ? (
          <form onSubmit={guardarContrasena} className="space-y-4">
            <label htmlFor="contrasena-nueva" className="block font-bold">Nueva contraseña</label>
            <input id="contrasena-nueva" type="password" autoComplete="new-password" required minLength={8}
              value={contrasena} onChange={(event) => setContrasena(event.target.value)} className={claseCampo} />
            <label htmlFor="confirmacion-contrasena" className="block font-bold">Repite la nueva contraseña</label>
            <input id="confirmacion-contrasena" type="password" autoComplete="new-password" required minLength={8}
              value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} className={claseCampo} />
            <button type="submit" disabled={ocupado} className={claseBoton}>
              {ocupado ? 'Guardando…' : 'Guardar nueva contraseña'}
            </button>
            <button type="button" disabled={ocupado} className="underline" onClick={salir}>Cancelar y cerrar sesión</button>
          </form>
        ) : solicitando ? (
          <form onSubmit={solicitarRecuperacion} className="space-y-4">
            <label htmlFor="correo-recuperacion" className="block font-bold">Correo electrónico</label>
            <input id="correo-recuperacion" type="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.target.value)} className={claseCampo} />
            <button type="submit" disabled={ocupado} className={claseBoton}>
              {ocupado ? 'Solicitando…' : 'Enviar enlace de recuperación'}
            </button>
            <button type="button" disabled={ocupado} className="underline" onClick={() => {
              cerrarRecuperacion();
              setMensaje('');
            }}>Volver al inicio de sesión</button>
          </form>
        ) : enlaceRecuperacion ? (
          <>
            <p>Este enlace de recuperación no es válido o ha caducado.</p>
            <button type="button" className="mt-4 underline" onClick={() => setSolicitando(true)}>Solicitar otro enlace</button>
          </>
        ) : session ? (
          <>
            <p>Esta cuenta no tiene acceso al panel.</p>
            <button type="button" className="mt-4 underline" onClick={salir}>Cerrar sesión</button>
          </>
        ) : (
          <form onSubmit={iniciarSesion} className="space-y-4">
            <label htmlFor="correo-administracion" className="block font-bold">Correo electrónico</label>
            <input id="correo-administracion" type="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.target.value)} className={claseCampo} />
            <label htmlFor="contrasena-administracion" className="block font-bold">Contraseña</label>
            <input id="contrasena-administracion" type="password" autoComplete="current-password" required
              value={contrasena} onChange={(event) => setContrasena(event.target.value)} className={claseCampo} />
            <button type="submit" disabled={ocupado} className={claseBoton}>
              {ocupado ? 'Entrando…' : 'Entrar'}
            </button>
            <button type="button" disabled={ocupado} className="underline" onClick={() => {
              setContrasena('');
              setMensaje('');
              setSolicitando(true);
            }}>¿Has olvidado tu contraseña?</button>
          </form>
        )}
        {mensaje && <p className="mt-4 text-sm" role="status">{mensaje}</p>}
      </div>
    </main>
  );
}
