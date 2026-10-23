import comerciosService from "./comerciosService";
import { supabase } from "./supabaseClient";

export const api = {
  get: async (endpoint) => {
    if (typeof comerciosService.get === "function") {
      return comerciosService.get(endpoint);
    }
    return { data: [] };
  },
  post: async (endpoint, body) => {
    if (typeof comerciosService.post === "function") {
      return comerciosService.post(endpoint, body);
    }
    return { data: null };
  }
};

export { supabase };

// Funciones comodín globales por si algún componente las requiere directamente
export const obtenerComercios = async () => [];
export const subirArchivoComercio = async () => null;
export const actualizarComercio = async () => null;
export const eliminarComercio = async () => null;
export const crearComercio = async () => null;