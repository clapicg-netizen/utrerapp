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

// Funciones comodín globales para cubrir todas las importaciones de servicios antiguos
export const obtenerComercios = async () => [];
export const subirArchivoComercio = async () => null;
export const actualizarComercio = async () => null;
export const eliminarComercio = async () => null;
export const crearComercio = async () => null;

export default comerciosService;