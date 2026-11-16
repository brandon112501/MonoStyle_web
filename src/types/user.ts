export interface User {
  id: number;
  nombre: string;
  username?: string;
  correo?: string;
  role: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
}
