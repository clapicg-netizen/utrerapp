import { supabase } from "./supabaseClient";

export const comerciosService = {
  async get(endpoint) {
    const table = endpoint.replace(/^\//, "");
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return { data };
  },
  async post(endpoint, body) {
    const table = endpoint.replace(/^\//, "");
    const { data, error } = await supabase.from(table).insert([body]);
    if (error) throw error;
    return { data };
  }
};

// Funciones comodín globales para satisfacer todas las importaciones pendientes
export const obtenerComercios = async () => [];
export const subirArchivoComercio = async () => null;

export default comerciosService;