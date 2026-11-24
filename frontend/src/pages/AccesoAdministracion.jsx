import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AccesoAdministracion({ children }) {
  const [session, setSession] = useState(undefined);
  const [autorizada, setAutorizada] = useState(null);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const usuarioId = session?.user.id;
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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

  async function salir() {
    setMensaje('');
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      setMensaje('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } else {
      setAutorizada(null);
    }
  }

  if (session === undefined || (session && autorizada?.usuarioId !== usuarioId)) {
    return <p className="p-8 text-center" role="status">Comprobando acceso…</p>;
  }
  if (session && autorizada?.permiso) return children(salir, mensaje, session.user.id);

  return (
    <main className="max-w-md mx-auto p-6 pt-16">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 mb-5">Administración de UtrerApp</h1>
        {session ? (
          <>
            <p>Esta cuenta no tiene acceso al panel.</p>
            <button type="button" className="mt-4 underline" onClick={salir}>Cerrar sesión</button>
          </>
        ) : (
          <form onSubmit={iniciarSesion} className="space-y-4">
            <label htmlFor="correo-administracion" className="block font-bold">Correo electrónico</label>
            <input id="correo-administracion" type="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl" />
            <label htmlFor="contrasena-administracion" className="block font-bold">Contraseña</label>
            <input id="contrasena-administracion" type="password" autoComplete="current-password" required
              value={contrasena} onChange={(event) => setContrasena(event.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl" />
            <button type="submit" disabled={ocupado} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {ocupado ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}
        {mensaje && <p className="mt-4 text-sm" role="status">{mensaje}</p>}
      </div>
    </main>
  );
}
