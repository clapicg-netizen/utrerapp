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

// Función comodín solicitada por los componentes de administración
export const subirArchivoComercio = async (file) => {
  console.warn("subirArchivoComercio simulado", file);
  return null;
};

export default comerciosService;