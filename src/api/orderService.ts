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

  // Obtener todas las órdenes de compra
  async getPurchaseOrders() {
    const { data, error } = await supabase
      .from('orden_compra')
      .select('*')
      .order('id_orden_compra', { ascending: true });

    if (error) {
      console.error('Error al obtener órdenes de compra:', error);
      throw error;
    }
    return data;
  },

  // Crear orden de servicio
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

  // Crear orden de compra en la tabla orden_compra
  async createPurchaseOrder(purchaseOrderData: {
    descripcion: string;
    id_proveedor?: number | null;
  }) {
    let proveedorId: number | null = purchaseOrderData.id_proveedor ?? null;

    if (proveedorId === null) {
      const { data: proveedores, error: provError } = await supabase
        .from('proveedor')
        .select('*')
        .limit(1);

      if (provError) {
        console.error('Error consultando proveedores:', provError);
      }

      if (proveedores && proveedores.length > 0) {
        const primero: any = proveedores[0];
        proveedorId = Number(primero.id_proveedor ?? primero.id);
      } else {
        const nuevoProvPayload: Record<string, any> = {
          nombre_empresa: 'Proveedor General',
          categoria_repuestos: 'General',
          tiempo_promedio_entrega: '3 días'
        };

        const { data: refData } = await supabase
          .from('referencia')
          .select('*')
          .limit(1);

        if (refData && refData.length > 0) {
          const refPrimero: any = refData[0];
          const refId = refPrimero.id_referencia ?? refPrimero.id;
          if (refId !== undefined && refId !== null) {
            nuevoProvPayload.id_referencia = refId;
          }
        }

        const { data: provCreado, error: crearProvError } = await supabase
          .from('proveedor')
          .insert([nuevoProvPayload])
          .select()
          .single();

        if (!crearProvError && provCreado) {
          proveedorId = Number((provCreado as any).id_proveedor ?? (provCreado as any).id);
        }
      }
    }

    const payload: Record<string, any> = {
      descripcion: purchaseOrderData.descripcion
    };

    if (proveedorId !== null && !Number.isNaN(proveedorId)) {
      payload.id_proveedor = proveedorId;
    }

    const { data, error } = await supabase
      .from('orden_compra')
      .insert([payload])
      .select();

    if (error) {
      console.error('Error al crear orden de compra en Supabase:', error);
      throw error;
    }
    return data;
  },

  async addDetalles(
    detalles: { cantidad: number; precio: number; id_orden: number; id_referencia: number }[]
  ) {
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
  },

  // Eliminar una orden de compra por su ID
  async deletePurchaseOrder(id: number) {
    const { error } = await supabase
      .from('orden_compra')
      .delete()
      .eq('id_orden_compra', id);

    if (error) {
      console.error('Error al eliminar orden de compra:', error);
      throw error;
    }
    return true;
  }
};