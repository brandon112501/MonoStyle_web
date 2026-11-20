import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

interface EstadoOrden {
    id_estado_orden: number;
    nombre?: string;
    estado?: string;
    descripcion?: string;
}

export default function ServiceList() {
    const navigate = useNavigate();
    const [servicios, setServicios] = useState<any[]>([]);
    const [estados, setEstados] = useState<EstadoOrden[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

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

        fetchData();
    }, []);

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const getEstadoLabel = (est: EstadoOrden) =>
        est.nombre || est.estado || est.descripcion || `Estado ${est.id_estado_orden}`;

    const fetchData = async () => {
        try {
            setLoading(true);

            const [{ data: estadosData, error: estadosError }, { data: ordenesData, error: ordenesError }] =
                await Promise.all([
                    supabase.from('estado_orden').select('*'),
                    supabase.from('orden').select('*').order('id_orden', { ascending: true })
                ]);

            if (estadosError) console.error('Error cargando estado_orden:', estadosError);
            if (ordenesError) throw ordenesError;

            const listaEstados: EstadoOrden[] = estadosData && estadosData.length > 0
                ? estadosData
                : [
                    { id_estado_orden: 1, nombre: 'EN PROCESO' },
                    { id_estado_orden: 2, nombre: 'FINALIZADO' },
                    { id_estado_orden: 3, nombre: 'CANCELADO' }
                ];

            setEstados(listaEstados);

            const mapeados = (ordenesData || []).map((o: any) => ({
                id: o.id_orden,
                servicio: o.descripcion || `Orden #${o.id_orden}`,
                descripcion: `Orden #${o.id_orden} - Cliente ID: ${o.id_cliente ?? 'N/A'}`,
                precio: o.precio ?? 0,
                id_estado_orden: Number(o.id_estado_orden ?? 1)
            }));

            setServicios(mapeados);
        } catch (err) {
            console.error('Error al cargar órdenes/servicios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEstado = async (idOrden: number, nuevoEstadoId: number) => {
        try {
            const { error } = await supabase
                .from('orden')
                .update({ id_estado_orden: nuevoEstadoId })
                .eq('id_orden', idOrden);

            if (error) throw error;

            setServicios((prev) =>
                prev.map((srv) =>
                    srv.id === idOrden ? { ...srv, id_estado_orden: nuevoEstadoId } : srv
                )
            );
        } catch (err) {
            console.error('Error al actualizar estado de la orden:', err);
        }
    };

    const handleDelete = async (idOrden: number) => {
        try {
            const { error } = await supabase
                .from('orden')
                .delete()
                .eq('id_orden', idOrden);

            if (error) throw error;

            setServicios((prev) => prev.filter((srv) => srv.id !== idOrden));
        } catch (err) {
            console.error('Error al eliminar orden:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const serviciosFiltrados = servicios.filter(
        (s) =>
            s.servicio.toLowerCase().includes(busqueda.toLowerCase()) ||
            s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    const getEstadoColor = (idEstado: number) => {
        const encontrado = estados.find((e) => e.id_estado_orden === idEstado);
        const texto = encontrado ? getEstadoLabel(encontrado).toLowerCase() : '';
        if (texto.includes('finaliz') || texto.includes('complet')) return '#10b981';
        if (texto.includes('cancel')) return '#ef4444';
        return '#3b82f6';
    };

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandContainer}>
                        <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
                    </div>

                    <nav style={styles.nav}>
                        <Link to={homeRoute} style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={styles.navLink}>Usuario</Link>
                        <Link to="/services" style={{ ...styles.navLink, ...styles.activeLink }}>Servicios</Link>
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
                        <h2 style={styles.pageTitle}>Gestión de Servicios</h2>
                        <p style={styles.pageSubtitle}>Servicios y órdenes registradas en el taller</p>
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
                    <button onClick={() => navigate('/services/new')} style={styles.newButton}>
                        + Agregar Servicio
                    </button>

                    <div style={styles.searchContainer}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                </div>

                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.trHead}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Servicio</th>
                                <th style={styles.th}>Descripción</th>
                                <th style={styles.th}>Precio</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Cargando servicios...
                                    </td>
                                </tr>
                            ) : serviciosFiltrados.length > 0 ? (
                                serviciosFiltrados.map((srv) => {
                                    const colorEstado = getEstadoColor(srv.id_estado_orden);
                                    return (
                                        <tr key={srv.id} style={styles.trBody}>
                                            <td style={styles.td}>{srv.id}</td>
                                            <td style={styles.td}>{srv.servicio}</td>
                                            <td style={styles.td}>{srv.descripcion}</td>
                                            <td style={styles.td}>${srv.precio}</td>
                                            <td style={styles.td}>
                                                <select
                                                    value={srv.id_estado_orden}
                                                    onChange={(e) =>
                                                        handleChangeEstado(srv.id, Number(e.target.value))
                                                    }
                                                    style={{
                                                        backgroundColor: '#070a14',
                                                        color: colorEstado,
                                                        border: `1px solid ${colorEstado}`,
                                                        padding: '5px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    {estados.map((est) => (
                                                        <option
                                                            key={est.id_estado_orden}
                                                            value={est.id_estado_orden}
                                                        >
                                                            {getEstadoLabel(est)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={styles.td}>
                                                <button
                                                    onClick={() => handleDelete(srv.id)}
                                                    style={styles.deleteBtn}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No se encontraron servicios registrados.
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
    pageSubtitle: { color: '#64748b', fontSize: '13px', margin: 0 },
    userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    userAvatar: { fontSize: '20px' },
    userName: { fontSize: '14px', fontWeight: 'bold', margin: 0 },
    userRole: { fontSize: '11px', color: '#3b82f6', margin: 0 },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
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
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ef4444' }
};