import { supabase } from './supabaseClient';

export const obtenerComercios = async () => {
  const { data, error } = await supabase.from('comercios').select('*');
  if (error) throw error;
  return data;
};

export const crearComercio = async (comercio) => {
  const { data, error } = await supabase.from('comercios').insert([comercio]);
  if (error) throw error;
  return data;
};

export const actualizarComercio = async (id, comercio) => {
  const { data, error } = await supabase.from('comercios').update(comercio).eq('id', id);
  if (error) throw error;
  return data;
};

export const eliminarComercio = async (id) => {
  const { data, error } = await supabase.from('comercios').delete().eq('id', id);
  if (error) throw error;
  return data;
};

export const subirArchivoComercio = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('comercios').upload(fileName, file);
  if (error) throw error;
  return data;
};