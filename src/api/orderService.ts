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

async create(orderData: {
  descripcion: string;
  id_cliente: number;
  id_empleado: number;
  id_estado_orden: number;
  id_motocicleta: number;
  fecha: string;
}) {
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

async addDetalles(detalles: { cantidad: number; precio: number; id_orden: number; id_referencia: number }[]) {
  const { error } = await supabase.from('detalle_orden').insert(detalles);
  if (error) {
    console.error('Error al guardar productos de la orden:', error);
    throw error;
  }
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