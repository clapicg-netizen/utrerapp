export * as api from "./comerciosService";
import { supabase } from "./supabaseClient";
export { supabase };

// Función comodín de respaldo para evitar errores de importación faltante
export const subirArchivoComercio = async () => {
  console.warn("subirArchivoComercio no está implementado todavía");
  return null;
};