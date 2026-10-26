// src/lib/comerciosService.js
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

// --- FUNCIÓN AUXILIAR DE SANEAMIENTO ---
// Traduce nombres de campos del formulario a los nombres reales de la tabla de Supabase
const limpiarDatosComercio = (formData) => {
  const datosLimpios = { ...formData };

  // Mapeo seguro de columnas
  if (datosLimpios.instagram_url !== undefined) {
    datosLimpios.instagram_username = datosLimpios.instagram_url;
    delete datosLimpios.instagram_url;
  }
  if (datosLimpios.sitio_web !== undefined) {
    datosLimpios.web_url = datosLimpios.sitio_web;
    delete datosLimpios.sitio_web;
  }
  if (datosLimpios.pin !== undefined) {
    datosLimpios.pin_acceso = datosLimpios.pin;
    delete datosLimpios.pin;
  }

  return datosLimpios;
};

// --- FUNCIONES REALES CONECTADAS A SUPABASE (TABLA: comercios_utrera) ---

// 1. Obtener todos los comercios
export const obtenerComercios = async (categoria = 'Todos') => {
  try {
    let query = supabase.from('comercios_utrera').select('*').order('created_at', { ascending: false });
    
    if (categoria && categoria !== 'Todos') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error al obtener comercios:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Excepción en obtenerComercios:", err);
    return [];
  }
};

// 2. Crear un nuevo comercio
export const crearComercio = async (formData) => {
  try {
    const datosSaneados = limpiarDatosComercio(formData);
    const { data, error } = await supabase
      .from('comercios_utrera')
      .insert([datosSaneados])
      .select();

    if (error) {
      console.error("Error Supabase al crear comercio:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Excepción en crearComercio:", err);
    return { success: false, message: err.message };
  }
};

// 3. Actualizar comercio existente
export const actualizarComercio = async (id, pinMaestro, formData) => {
  try {
    const datosSaneados = limpiarDatosComercio(formData);
    const { data, error } = await supabase
      .from('comercios_utrera')
      .update(datosSaneados)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error al actualizar comercio:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Excepción en actualizarComercio:", err);
    return { success: false, message: err.message };
  }
};

// 4. Eliminar comercio
export const eliminarComercio = async (id) => {
  try {
    const { error } = await supabase
      .from('comercios_utrera')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error al eliminar comercio:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Excepción en eliminarComercio:", err);
    return { success: false, message: err.message };
  }
};

// 5. Subir archivos al Storage de Supabase (Blindado)
export const subirArchivoComercio = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('comercios')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("Error al subir archivo al Storage:", uploadError.message);
      return { success: false, message: uploadError.message };
    }

    const { data } = supabase.storage
      .from('comercios')
      .getPublicUrl(filePath);

    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      return { success: false, message: "No se pudo obtener la URL pública del archivo" };
    }

    console.log("URL pública generada con éxito:", publicUrl);
    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("Excepción en subirArchivoComercio:", err);
    return { success: false, message: err.message };
  }
};

export default comerciosService;