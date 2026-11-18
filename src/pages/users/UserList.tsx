import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function UserList() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'clientes', 'empleados'

    const [userName, setUserName] = useState('Usuario');
    const [userRole, setUserRole] = useState('Empleado');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUserName(userData.nombre || 'Usuario');
                setUserRole(userData.rol || 'Empleado');
            }
        } catch (e) {
            console.error(e);
        }

        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            let listaUsuarios: any[] = [];

            // 1. Obtener Clientes
            const { data: clientes, error: errCli } = await supabase.from('cliente').select('*');
            if (!errCli && clientes) {
                const cliMapeados = clientes.map(c => ({
                    id: c.id || c.id_cliente || `cli-${Math.random()}`,
                    nombre: c.nombre || c.nombre_cliente || 'Sin nombre',
                    telefono: c.telefono || c.celular || 'N/A',
                    correo: c.correo || c.email || c.credenciales || 'N/A',
                    rol: 'Cliente',
                    estado: c.estado || 'Activo'
                }));
                listaUsuarios = [...listaUsuarios, ...cliMapeados];
            }

            // 2. Si es Administrador, permitir ver empleados y administradores también
            // (Los empleados pueden ver clientes o tener restricciones si se desea)
            const { data: empleados, error: errEmp } = await supabase.from('empleado').select('*');
            if (!errEmp && empleados) {
                const empMapeados = empleados.map(e => ({
                    id: e.id || e.id_empleado || `emp-${Math.random()}`,
                    nombre: e.nombre || e.usuario || 'Sin nombre',
                    telefono: e.telefono || 'N/A',
                    correo: e.correo || e.credenciales || 'N/A',
                    rol: 'Empleado',
                    estado: e.estado || 'Activo'
                }));
                listaUsuarios = [...listaUsuarios, ...empMapeados];
            }

            if (userRole === 'Administrador') {
                const { data: admins, error: errAdmin } = await supabase.from('administrador').select('*');
                if (!errAdmin && admins) {
                    const adminMapeados = admins.map(a => ({
                        id: a.id || a.id_administrador || `admin-${Math.random()}`,
                        nombre: a.nombre || a.usuario || 'Sin nombre',
                        telefono: a.telefono || 'N/A',
                        correo: a.correo || 'N/A',
                        rol: 'Administrador',
                        estado: a.estado || 'Activo'
                    }));
                    listaUsuarios = [...listaUsuarios, ...adminMapeados];
                }
            }

            setUsuarios(listaUsuarios);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const matchTexto = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           u.correo.toLowerCase().includes(busqueda.toLowerCase());

        if (filtroTipo === 'clientes') return matchTexto && u.rol === 'Cliente';
        if (filtroTipo === 'empleados') return matchTexto && (u.rol === 'Empleado' || u.rol === 'Administrador');
        return matchTexto;
    });

    return (
        <div style={styles.container}>
            {/* Barra lateral dinámica */}
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandContainer}>
                        <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
                    </div>

                    <nav style={styles.nav}>
                        <Link to={userRole === 'Administrador' ? "/admin/dashboard" : "/employee/dashboard"} style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={{ ...styles.navLink, ...styles.activeLink }}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        <Link to="/reports" style={styles.navLink}>Reportes</Link>
                        {userRole === 'Administrador' && (
                            <Link to="/users/new" style={styles.navLink}>Registro</Link>
                        )}
                        <Link to="/orders" style={styles.navLink}>Órdenes</Link>
                    </nav>
                </div>

                <div style={styles.logoutContainer}>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>Gestión de Usuarios y Personal</h2>
                        <p style={styles.pageSubtitle}>Registros sincronizados del sistema</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{userName}</p>
                            <span style={styles.userRole}>{userRole}</span>
                        </div>
                    </div>
                </header>

                <div style={styles.toolbar}>
                    <div style={styles.filterGroup}>
                        <button
                            onClick={() => setFiltroTipo('todos')}
                            style={filtroTipo === 'todos' ? styles.filterBtnActive : styles.filterBtn}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltroTipo('clientes')}
                            style={filtroTipo === 'clientes' ? styles.filterBtnActive : styles.filterBtn}
                        >
                            Clientes
                        </button>
                        {userRole === 'Administrador' && (
                            <button
                                onClick={() => setFiltroTipo('empleados')}
                                style={filtroTipo === 'empleados' ? styles.filterBtnActive : styles.filterBtn}
                            >
                                Empleados
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* El botón de nuevo registro solo aparece si es Administrador */}
                        {userRole === 'Administrador' && (
                            <button
                                onClick={() => navigate('/users/new')}
                                style={styles.newButton}
                            >
                                + Nuevo Registro
                            </button>
                        )}
                        <div style={styles.searchContainer}>
                            <span style={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.trHead}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Nombre Completo</th>
                                <th style={styles.th}>Teléfono</th>
                                <th style={styles.th}>Correo / Credencial</th>
                                <th style={styles.th}>Rol</th>
                                <th style={styles.th}>Estado</th>
                                {userRole === 'Administrador' && <th style={styles.th}>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={userRole === 'Administrador' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Cargando registros...
                                    </td>
                                </tr>
                            ) : usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((usr, idx) => (
                                    <tr key={usr.id || idx} style={styles.trBody}>
                                        <td style={styles.td}>{usr.id}</td>
                                        <td style={styles.td}>{usr.nombre}</td>
                                        <td style={styles.td}>{usr.telefono}</td>
                                        <td style={styles.td}>{usr.correo}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                backgroundColor: usr.rol === 'Administrador' ? 'rgba(239, 68, 68, 0.1)' : usr.rol === 'Empleado' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: usr.rol === 'Administrador' ? '#ef4444' : usr.rol === 'Empleado' ? '#3b82f6' : '#10b981',
                                                border: `1px solid ${usr.rol === 'Administrador' ? '#ef4444' : usr.rol === 'Empleado' ? '#3b82f6' : '#10b981'}`,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {usr.rol}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                border: '1px solid #10b981',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {usr.estado}
                                            </span>
                                        </td>
                                        {userRole === 'Administrador' && (
                                            <td style={styles.td}>
                                                <button style={styles.actionBtn} title="Editar">✏️</button>
                                                <button style={{ ...styles.actionBtn, color: '#ef4444' }} title="Eliminar">🗑️</button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={userRole === 'Administrador' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No se encontraron usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

// Estilos Ciber-Industrial
const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#050811', color: '#fff', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#070a14', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' },
    brandContainer: { textAlign: 'center', marginBottom: '25px' },
    logoImage: { width: '100%', maxWidth: '160px', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 0 15px rgba(0, 123, 255, 0.2)' },
    nav: { display: 'flex', flexDirection: 'column', gap: '6px' },
    navLink: { color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px', transition: '0.2s', fontSize: '14px' },
    activeLink: { backgroundColor: '#1d4ed8', color: '#fff', fontWeight: '500', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    logoutContainer: { borderTop: '1px solid #1e293b', paddingTop: '15px' },
    logoutButton: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px' },
    mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' },
    pageTitle: { fontSize: '22px', fontWeight: 'bold', margin: 0 },
    pageSubtitle: { color: '#64748b', fontSize: '13px', margin: 0 },
    userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    userAvatar: { fontSize: '20px' },
    userName: { fontSize: '14px', fontWeight: 'bold', margin: 0 },
    userRole: { fontSize: '11px', color: '#3b82f6', margin: 0 },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    filterGroup: { display: 'flex', gap: '10px' },
    filterBtn: { backgroundColor: '#0d1322', color: '#94a3b8', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
    filterBtnActive: { backgroundColor: '#1d4ed8', color: '#fff', border: '1px solid #1d4ed8', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    newButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    searchContainer: { position: 'relative' },
    searchIcon: { position: 'absolute', left: '12px', top: '10px', fontSize: '13px' },
    searchInput: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '8px', padding: '9px 12px 9px 35px', color: '#fff', fontSize: '13px', outline: 'none', width: '220px' },
    tableCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    trHead: { backgroundColor: '#070a14', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '15px 20px', fontWeight: '600' },
    trBody: { borderBottom: '1px solid #1e293b', transition: 'background 0.2s' },
    td: { padding: '15px 20px', color: '#cbd5e1' },
    actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '8px', color: '#3b82f6' }
};