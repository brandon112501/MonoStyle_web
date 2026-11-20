import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

interface UsuarioFila {
    id: number | string;
    nombre: string;
    telefono: string;
    correo: string;
    rol: 'Cliente' | 'Empleado';
    estado: string;
}

export default function UserList() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<UsuarioFila[]>([]);
    const [filtroRol, setFiltroRol] = useState<'Todos' | 'Cliente' | 'Empleado'>('Todos');
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

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

        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const lista: UsuarioFila[] = [];

            const { data: clientes } = await supabase.from('cliente').select('*');
            if (clientes) {
                for (const c of clientes as any[]) {
                    lista.push({
                        id: c.id_cliente ?? c.id,
                        nombre: c.nombre_completo || c.nombre || 'Sin nombre',
                        telefono: c.telefono || 'N/A',
                        correo: c.correo || c.email || 'N/A',
                        rol: 'Cliente',
                        estado: c.estado || 'Activo'
                    });
                }
            }

            const { data: empleados } = await supabase.from('empleado').select('*');
            if (empleados) {
                for (const e of empleados as any[]) {
                    lista.push({
                        id: e.id_empleado ?? e.id,
                        nombre: e.nombre_completo || e.nombre || 'Sin nombre',
                        telefono: e.telefono || 'N/A',
                        correo: e.correo || e.email || 'N/A',
                        rol: 'Empleado',
                        estado: e.estado || 'Activo'
                    });
                }
            }

            setUsuarios(lista);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (u: UsuarioFila) => {
        try {
            if (u.rol === 'Cliente') {
                await supabase.from('cliente').delete().eq('id_cliente', u.id);
            } else {
                await supabase.from('empleado').delete().eq('id_empleado', u.id);
            }
            setUsuarios((prev) => prev.filter((item) => !(item.id === u.id && item.rol === u.rol)));
        } catch (err) {
            console.error('Error eliminando usuario:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const usuariosFiltrados = usuarios.filter((u) => {
        const coincideRol = filtroRol === 'Todos' || u.rol === filtroRol;
        const texto = busqueda.trim().toLowerCase();
        const coincideTexto =
            !texto ||
            String(u.id).toLowerCase().includes(texto) ||
            u.nombre.toLowerCase().includes(texto) ||
            u.telefono.toLowerCase().includes(texto) ||
            u.correo.toLowerCase().includes(texto);
        return coincideRol && coincideTexto;
    });

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandContainer}>
                        <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
                    </div>

                    <nav style={styles.nav}>
                        <Link to={homeRoute} style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={{ ...styles.navLink, ...styles.activeLink }}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        {isAdmin && <Link to="/reports" style={styles.navLink}>Reportes</Link>}
                        {isAdmin && <Link to="/users/new" style={styles.navLink}>Registro</Link>}
                        <Link to="/orders" style={styles.navLink}>Órdenes</Link>
                    </nav>
                </div>

                <div style={styles.logoutContainer}>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>Gestión de Usuarios y Personal</h2>
                        <p style={styles.pageSubtitle}>
                            Registros sincronizados del sistema (clic en un usuario para ver servicios pendientes)
                        </p>
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
                            type="button"
                            onClick={() => setFiltroRol('Todos')}
                            style={{ ...styles.filterBtn, ...(filtroRol === 'Todos' ? styles.filterBtnActive : {}) }}
                        >
                            Todos
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroRol('Cliente')}
                            style={{ ...styles.filterBtn, ...(filtroRol === 'Cliente' ? styles.filterBtnActive : {}) }}
                        >
                            Clientes
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroRol('Empleado')}
                            style={{ ...styles.filterBtn, ...(filtroRol === 'Empleado' ? styles.filterBtnActive : {}) }}
                        >
                            Empleados
                        </button>
                    </div>

                    <div style={styles.rightActions}>
                        <button onClick={() => navigate('/users/new')} style={styles.newButton}>
                            + Nuevo Registro
                        </button>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar usuario..."
                            style={styles.searchInput}
                        />
                    </div>
                </div>

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
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((u) => (
                                    <tr
                                        key={`${u.rol}-${u.id}`}
                                        onClick={() => navigate(`/users/${u.id}`, { state: { usuario: u } })}
                                        style={{ ...styles.trBody, cursor: 'pointer' }}
                                    >
                                        <td style={styles.td}>{u.id}</td>
                                        <td style={styles.td}>{u.nombre}</td>
                                        <td style={styles.td}>{u.telefono}</td>
                                        <td style={styles.td}>{u.correo}</td>
                                        <td style={styles.td}>
                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    borderColor: u.rol === 'Cliente' ? '#10b981' : '#3b82f6',
                                                    color: u.rol === 'Cliente' ? '#34d399' : '#60a5fa'
                                                }}
                                            >
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    borderColor: '#10b981',
                                                    color: '#34d399'
                                                }}
                                            >
                                                {u.estado}
                                            </span>
                                        </td>
                                        <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(u)}
                                                style={styles.deleteBtn}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No se encontraron usuarios.
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
    pageSubtitle: { color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    userAvatar: { fontSize: '20px' },
    userName: { fontSize: '14px', fontWeight: 'bold', margin: 0 },
    userRole: { fontSize: '11px', color: '#3b82f6', margin: 0 },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' },
    filterGroup: { display: 'flex', gap: '8px' },
    filterBtn: { backgroundColor: '#0d1322', color: '#cbd5e1', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
    filterBtnActive: { backgroundColor: '#1d4ed8', color: '#fff', borderColor: '#1d4ed8', fontWeight: 600 },
    rightActions: { display: 'flex', gap: '12px', alignItems: 'center' },
    newButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
    searchInput: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '8px', padding: '9px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
    tableCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    trHead: { backgroundColor: '#070a14', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '15px 20px', fontWeight: '600' },
    trBody: { borderBottom: '1px solid #1e293b' },
    td: { padding: '15px 20px', color: '#cbd5e1', verticalAlign: 'middle' },
    badge: { padding: '4px 12px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: 600 },
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ef4444' }
};