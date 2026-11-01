import React, { useState, useEffect } from 'react';
import { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, subirArchivoComercio } from '../lib/comerciosService';
import { supabase } from '../lib/supabaseClient';

const PIN_ADMIN_MAESTRO = "9999";

export default function DashboardAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('comercios');
  const [comercios, setComercios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const formInicial = {
    nombre: '', categoria: 'Hostelería', subcategoria: '', tipo_ficha: 'normal',
    direccion: '', telefono: '', whatsapp: '', web_url: '', tienda_url: '',
    instagram_url: '', facebook_url: '', tiktok_url: '', horario_texto: '',
    descripcion: '', oferta_flash: '', portada_url: '', logo_url: '',
    carta_pdf_url: '', galeria_urls: [], video_story_url: '', destacado: true,
    pin_acceso: '1234', datos_especiales_json: ''
  };

  const [formData, setFormData] = useState(formInicial);
  const [anuncios, setAnuncios] = useState([]);
  const [editandoAnuncioId, setEditandoAnuncioId] = useState(null);
  const formAnuncioInicial = {
    titulo: '', subtitulo: '', tipo: 'OFERTA DEL DÍA ⚡',
    color_badge: 'bg-amber-500 text-white', bg_gradient: 'from-amber-600 to-orange-700',
    icono: '⚡', accion_tab: 'market', orden: 1, activo: true
  };
  const [formAnuncio, setFormAnuncio] = useState(formAnuncioInicial);

  const cargarLista = async () => {
    try {
      const data = await obtenerComercios('Todos');
      setComercios(Array.isArray(data) ? data : []);
    } catch (err) { setComercios([]); }
  };

  const cargarAnuncios = async () => {
    try {
      const { data } = await supabase.from('anuncios').select('*').order('orden', { ascending: true });
      if (data) setAnuncios(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (autenticado) { cargarLista(); cargarAnuncios(); }
  }, [autenticado]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === PIN_ADMIN_MAESTRO) { setAutenticado(true); setMensaje({ tipo: '', texto: '' }); }
    else { setMensaje({ tipo: 'error', texto: 'PIN incorrecto' }); }
  };

  const handleFileUpload = async (e, campo, esGaleria = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(true);
    const res = await subirArchivoComercio(file);
    setSubiendo(false);
    if (res && res.success && res.url) {
      if (esGaleria) {
        setFormData(prev => ({ ...prev, galeria_urls: [...(prev.galeria_urls || []), res.url] }));
      } else {
        setFormData(prev => ({ ...prev, [campo]: res.url }));
      }
      setMensaje({ tipo: 'exito', texto: '¡Archivo subido!' });
    } else { setMensaje({ tipo: 'error', texto: res?.message || 'Error al subir' }); }
  };

  const eliminarDeGaleria = (index) => {
    setFormData(prev => ({ ...prev, galeria_urls: prev.galeria_urls.filter((_, i) => i !== index) }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria) return;
    setGuardando(true);
    let parsed = null;
    if (formData.datos_especiales_json) {
      try { parsed = JSON.parse(formData.datos_especiales_json); } catch (err) { setGuardando(false); return; }
    }
    const datos = { ...formData, galeria_urls: formData.galeria_urls || [], datos_especiales: parsed };
    delete datos.datos_especiales_json;
    if (editandoId) { await actualizarComercio(editandoId, PIN_ADMIN_MAESTRO, datos); }
    else { await crearComercio(datos); setFormData(formInicial); }
    setGuardando(false); cargarLista();
  };

  const handleGuardarAnuncio = async (e) => {
    e.preventDefault();
    if (editandoAnuncioId) {
      await supabase.from('anuncios').update(formAnuncio).eq('id', editandoAnuncioId);
    } else {
      await supabase.from('anuncios').insert([formAnuncio]);
    }
    setEditandoAnuncioId(null); setFormAnuncio(formAnuncioInicial); cargarAnuncios();
  };

  const handleEditarAnuncio = (a) => { setEditandoAnuncioId(a.id); setFormAnuncio(a); };
  const handleEliminarAnuncio = async (id) => { await supabase.from('anuncios').delete().eq('id', id); cargarAnuncios(); };

  const handleEditar = (c) => {
    setEditandoId(c.id);
    setFormData({
      ...c,
      galeria_urls: c.galeria_urls || [],
      datos_especiales_json: c.datos_especiales ? JSON.stringify(c.datos_especiales, null, 2) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => { await eliminarComercio(id); cargarLista(); };

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto p-6 pt-16">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-2xl font-black mb-4">Panel Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="PIN (9999)" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl text-center font-black"/>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-8">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl">
        <div><h1 className="text-2xl font-black">Panel Utrerapp</h1></div>
        <button onClick={() => setAutenticado(false)} className="bg-white/10 px-4 py-2 rounded-xl text-xs">Salir</button>
      </div>
      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button type="button" onClick={() => setSeccionActiva('comercios')} className={"flex-1 py-3 rounded-xl font-black text-xs " + (seccionActiva === 'comercios' ? "bg-slate-900 text-white" : "bg-slate-50")}>🏪 Comercios</button>
        <button type="button" onClick={() => setSeccionActiva('anuncios')} className={"flex-1 py-3 rounded-xl font-black text-xs " + (seccionActiva === 'anuncios' ? "bg-amber-500 text-slate-950" : "bg-slate-50")}>📢 Anuncios de Portada</button>
      </div>
      {seccionActiva === 'comercios' ? (
        <div className="bg-white p-6 rounded-3xl border space-y-6">
          <form onSubmit={handleGuardar} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl border">
              <label className="block text-xs font-black text-blue-900 mb-1">🎯 Tipo de Ficha</label>
              <select value={formData.tipo_ficha} onChange={e => setFormData({...formData, tipo_ficha: e.target.value})} className="w-full p-3 bg-white border rounded-xl text-xs font-bold">
                <option value="normal">📄 Normal</option>
                <option value="especial1">🏠 Inmobiliaria</option>
                <option value="especial2">🍔 Comida a Domicilio</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold">Nombre *</label><input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-xs" required/></div>
              <div><label className="text-xs font-bold">Categoría *</label><select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-xs"><option value="Hostelería">Hostelería</option><option value="Comercio">Comercio</option><option value="Servicios">Servicios</option><option value="Salud">Salud</option><option value="Inmobiliarias">Inmobiliarias</option><option value="Comida a domicilio">Comida a domicilio</option></select></div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-xs font-bold">🎬 Vídeo (URL o subida)</label>
                <input type="text" value={formData.video_story_url} onChange={e => setFormData({...formData, video_story_url: e.target.value})} placeholder="https://..." className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs mb-2"/>
                <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'video_story_url')} className="w-full text-xs"/>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl">💾 Guardar Comercio</button>
          </form>
          <div className="border-t pt-4 space-y-3">
            {comercios.map(c => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b">
                <span>{c.nombre}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEditar(c)} className="bg-slate-100 px-3 py-1 rounded-xl text-xs">Editar</button>
                  <button type="button" onClick={() => handleEliminar(c.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-xs">Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border space-y-6">
          <form onSubmit={handleGuardarAnuncio} className="space-y-4">
            <div><label className="text-xs font-bold">Título Anuncio</label><input type="text" value={formAnuncio.titulo} onChange={e => setFormAnuncio({...formAnuncio, titulo: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-xs" required/></div>
            <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-2xl">🚀 Guardar Anuncio</button>
          </form>
          <div className="border-t pt-4 space-y-3">
            {anuncios.map(a => (
              <div key={a.id} className="flex justify-between items-center py-2 border-b">
                <span>{a.titulo}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEditarAnuncio(a)} className="bg-slate-100 px-3 py-1 rounded-xl text-xs">Editar</button>
                  <button type="button" onClick={() => handleEliminarAnuncio(a.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-xs">Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}