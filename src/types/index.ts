export interface RolDTO {
    id: number;
    descripcion: string;
}

export interface ReferenciaDTO {
    id: number;
    descripcion: string;
    stock: number;
    idCategoria: number;
}

export interface OrdenDTO {
    idOrden: number;
    descripcion: string;
    idEmpleado: number;
    idCliente: number;
    idEstadoOrden: number;
}

export interface LoginDTO {
    nombre: string;
    credenciales: string;
}

export interface JwtAuthResponse {
    token: string;
    tipoToken: string;
}