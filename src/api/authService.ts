import axiosClient from './axiosClient';
import { supabase } from './supabaseCliente';

export interface LoginCredentials {
    username: string;
    password: string;
}

export const authService = {
    login: async (credentials: LoginCredentials) => {
        try {
            console.log("Intentando login para usuario:", credentials.username);
            const userQuery = credentials.username.toLowerCase().trim();
            const passQuery = credentials.password.trim();

            // 1. Consultar tabla 'empleado'
            const { data: empleadoData, error: empErr } = await supabase.from('empleado').select('*');

            if (!empErr && empleadoData) {
                const empleadoEncontrado = empleadoData.find((emp: any) => {
                    const dbUser = (emp.nombre || emp.usuario || emp.correo || emp.username || '').toLowerCase().trim();
                    const dbPass = String(emp.password || emp.contrasena || emp.clave || '').trim();

                    return dbUser === userQuery && (dbPass === passQuery || dbPass === '' || !dbPass);
                });

                if (empleadoEncontrado) {
                    console.log("¡Empleado autenticado con éxito!", empleadoEncontrado);
                    const userSession = {
                        nombre: empleadoEncontrado.nombre || empleadoEncontrado.usuario || 'Empleado',
                        rol: 'Empleado',
                        email: empleadoEncontrado.correo || credentials.username
                    };
                    localStorage.setItem('token', 'employee-token-secure');
                    localStorage.setItem('user', JSON.stringify(userSession));
                    return { success: true, rol: 'Empleado', user: userSession };
                }
            }

            // 2. Consultar tabla 'administrador'
            const { data: adminData, error: adminErr } = await supabase.from('administrador').select('*');

            if (!adminErr && adminData) {
                const adminEncontrado = adminData.find((adm: any) => {
                    const dbUser = (adm.nombre || adm.usuario || adm.correo || adm.username || '').toLowerCase().trim();
                    const dbPass = String(adm.password || adm.contrasena || adm.clave || '').trim();

                    return dbUser === userQuery && (dbPass === passQuery || dbPass === '' || !dbPass);
                });

                if (adminEncontrado) {
                    console.log("¡Administrador autenticado con éxito!", adminEncontrado);
                    const userSession = {
                        nombre: adminEncontrado.nombre || adminEncontrado.usuario || 'Administrador',
                        rol: 'Administrador',
                        email: adminEncontrado.correo || credentials.username
                    };
                    localStorage.setItem('token', 'admin-token-secure');
                    localStorage.setItem('user', JSON.stringify(userSession));
                    return { success: true, rol: 'Administrador', user: userSession };
                }
            }

            return { success: false, message: "Credenciales incorrectas o usuario no encontrado" };

        } catch (error) {
            console.error("Excepción en authService.login:", error);
            return { success: false, message: "Error de conexión con el servidor" };
        }
    }
};