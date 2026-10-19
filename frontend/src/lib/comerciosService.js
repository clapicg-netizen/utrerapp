import { supabase } from './supabaseClient';

// Obtener todos los comercios de la nueva tabla limpia
export const obtenerComercios = async () => {
  const { data, error } = await supabase
    .from('guia_local')
    .select('*');
  
  if (error) throw error;
  return data;
};

// Crear un nuevo comercio
export const crearComercio = async (comercio) => {
  const { data, error } = await supabase
    .from('guia_local')
    .insert([comercio]);
    
  if (error) throw error;
  return data;
};

// Actualizar un comercio existente
export const actualizarComercio = async (id, comercio) => {
  const { data, error } = await supabase
    .from('guia_local')
    .update(comercio)
    .eq('id', id);
    
  if (error) throw error;
  return data;
};

// Eliminar un comercio
export const eliminarComercio = async (id) => {
  const { data, error } = await supabase
    .from('guia_local')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return data;
};

// Subir archivo al Storage de Supabase
export const subirArchivoComercio = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('comercios').upload(fileName, file);
  if (error) throw error;
  return data;
};