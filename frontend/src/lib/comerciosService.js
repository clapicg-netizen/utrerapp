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

// --- FUNCIONES REALES CONECTADAS A SUPABASE ---

// 1. Obtener todos los comercios
export const obtenerComercios = async (categoria = 'Todos') => {
  try {
    let query = supabase.from('comercios').select('*').order('created_at', { ascending: false });
    
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
    const { data, error } = await supabase
      .from('comercios')
      .insert([formData])
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
    const { data, error } = await supabase
      .from('comercios')
      .update(formData)
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
      .from('comercios')
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

// 5. Subir archivos al Storage de Supabase
export const subirArchivoComercio = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36.substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Nota: Asegúrate de tener un bucket en Supabase llamado 'comercios' (público)
    const { error: uploadError } = await supabase.storage
      .from('comercios')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error al subir archivo:", uploadError.message);
      return { success: false, message: uploadError.message };
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from('comercios')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (err) {
    console.error("Excepción en subirArchivoComercio:", err);
    return { success: false, message: err.message };
  }
};

export default comerciosService;