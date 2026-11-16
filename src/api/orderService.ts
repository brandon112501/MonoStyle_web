import { supabase } from './supabaseCliente';

export const orderService = {
  // Obtener todas las órdenes / servicios
  async getAll() {
    const { data, error } = await supabase
      .from('orden')
      .select('*')
      .order('id_orden', { ascending: true });

    if (error) {
      console.error('Error al obtener órdenes:', error);
      throw error;
    }
    return data;
  },

  // Crear una nueva orden / servicio (Conectado al formulario)
  async create(orderData: { descripcion: string; id_cliente: number; id_empleado: number; id_estado_orden: number }) {
    const { data, error } = await supabase
      .from('orden')
      .insert([orderData])
      .select();

    if (error) {
      console.error('Error al crear orden en Supabase:', error);
      throw error;
    }
    return data;
  },

  // Eliminar una orden por su ID
  async delete(id: number) {
    const { error } = await supabase
      .from('orden')
      .delete()
      .eq('id_orden', id);

    if (error) {
      console.error('Error al eliminar orden:', error);
      throw error;
    }
    return true;
  }
};