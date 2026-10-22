import { supabase } from './supabase';

export async function obtenerComercios(categoria = "Todos") {
  try {
    let query = supabase.from('comercios_utrera').select('*');
    
    if (categoria && categoria !== "Todos") {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error en Supabase al obtener comercios:", error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Excepción grave en obtenerComercios:", err);
    return [];
  }
}