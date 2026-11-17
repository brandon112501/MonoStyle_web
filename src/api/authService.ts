import axiosClient from './axiosClient';
import { supabase } from './supabaseCliente';

export interface LoginCredentials {
    username: string;
    password: string;
}

export const authService = {
    login: async (credentials: LoginCredentials) => {
        try {
            console.log("Intentando login para:", credentials.username);

            // Consultamos la tabla 'administrador'
            const { data: adminData, error: adminErr } = await supabase.from('administrador').select('*');

            console.log("Datos de la tabla 'administrador' en Supabase:", adminData);

            if (!adminErr && adminData) {
                const adminEncontrado = adminData.find((adm: any) => {
                    // Verificamos de forma flexible cualquier coincidencia en los campos comunes
                    const camposValidos = [
                        adm.nombre,
                        adm.usuario,
                        adm.correo,
                        adm.username,
                        adm.email
                    ].map(c => c?.toLowerCase().trim());

                    const matchUser = camposValidos.includes(credentials.username.toLowerCase().trim());

                    const matchPass = (adm.password === credentials.password) ||
                                      (adm.contrasena === credentials.password) ||
                                      (adm.clave === credentials.password) ||
                                      !adm.password; // Si no tiene contraseña registrada

                    return matchUser && matchPass;
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

            // Consultamos la tabla 'empleado'
            const { data: empleadoData, error: empErr } = await supabase.from('empleado').select('*');

            if (!empErr && empleadoData) {
                const empleadoEncontrado = empleadoData.find((emp: any) => {
                    const camposValidos = [
                        emp.nombre,
                        emp.usuario,
                        emp.correo,
                        emp.credenciales,
                        emp.username
                    ].map(c => c?.toLowerCase().trim());

                    const matchUser = camposValidos.includes(credentials.username.toLowerCase().trim());
                    const matchPass = (emp.password === credentials.password) ||
                                      (emp.contrasena === credentials.password) ||
                                      (emp.credenciales === credentials.password);

                    return matchUser && matchPass;
                });

                if (empleadoEncontrado) {
                    console.log("¡Empleado autenticado con éxito!", empleadoEncontrado);
                    const userSession = {
                        nombre: empleadoEncontrado.nombre || 'Empleado',
                        rol: 'Empleado',
                        email: empleadoEncontrado.correo || credentials.username
                    };
                    localStorage.setItem('token', 'employee-token-secure');
                    localStorage.setItem('user', JSON.stringify(userSession));
                    return { success: true, rol: 'Empleado', user: userSession };
                }
            }

            return { success: false, message: "Credenciales incorrectas o usuario no encontrado" };

        } catch (error) {
            console.error("Excepción en authService.login:", error);
            return { success: false, message: "Error de conexión con el servidor" };
        }
    }
};