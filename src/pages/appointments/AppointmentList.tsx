import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function AppointmentList() {
    const navigate = useNavigate();
    const [citas, setCitas] = useState<any[]>([]);
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

        fetchCitas();
    }, []);

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const fetchCitas = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cita')
                .select('*')
                .order('id_cita', { ascending: true });

            if (error) throw error;

            const mapeadas = (data || []).map((c: any) => ({
                id: c.id_cita,
                vehiculo: c.vehiculo || 'Sin vehículo',
                servicio: c.servicio || 'Sin servicio',
                fechaHora: c.hora ? `${c.fecha || ''} - ${c.hora}` : (c.fecha || ''),
                estado: c.estado || 'Pendiente'
            }));

            setCitas(mapeadas);
        } catch (err) {
            console.error('Error al cargar citas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEstado = async (id: string | number, nuevoEstado: string) => {
        try {
            const { error } = await supabase
                .from('cita')
                .update({ estado: nuevoEstado })
                .eq('id_cita', id);

            if (error) throw error;

            setCitas((prev) =>
                prev.map((cita) => (cita.id === id ? { ...cita, estado: nuevoEstado } : cita))
            );
        } catch (err) {
            console.error('Error al actualizar estado de la cita:', err);
        }
    };

    const handleDelete = async (id: string | number) => {
        try {
            const { error } = await supabase
                .from('cita')
                .delete()
                .eq('id_cita', id);

            if (error) throw error;
            setCitas((prev) => prev.filter((cita) => cita.id !== id));
        } catch (err) {
            console.error('Error al eliminar cita:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const citasFiltradas = citas.filter(
        (c) =>
            c.vehiculo.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.servicio.toLowerCase().includes(busqueda.toLowerCase())
    );

    const getEstadoColor = (estado: string) => {
        if (estado === 'Confirmada' || estado === 'Completada') return '#10b981';
        if (estado === 'Cancelada') return '#ef4444';
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
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={{ ...styles.navLink, ...styles.activeLink }}>Citas</Link>
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
                        <h2 style={styles.pageTitle}>Gestión de Citas</h2>
                        <p style={styles.pageSubtitle}>Administra las citas de los usuarios del sistema</p>
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
                    <button onClick={() => navigate('/appointments/new')} style={styles.newButton}>
                        + Agendar Cita
                    </button>

                    <div style={styles.searchContainer}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar cita..."
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
                                <th style={styles.th}>Vehículo / Cliente</th>
                                <th style={styles.th}>Servicio</th>
                                <th style={styles.th}>Fecha / Hora</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Cargando citas...
                                    </td>
                                </tr>
                            ) : citasFiltradas.length > 0 ? (
                                citasFiltradas.map((cita) => {
                                    const colorEstado = getEstadoColor(cita.estado);
                                    return (
                                        <tr key={cita.id} style={styles.trBody}>
                                            <td style={styles.td}>{cita.id}</td>
                                            <td style={styles.td}>{cita.vehiculo}</td>
                                            <td style={styles.td}>{cita.servicio}</td>
                                            <td style={styles.td}>{cita.fechaHora}</td>
                                            <td style={styles.td}>
                                                <select
                                                    value={cita.estado}
                                                    onChange={(e) => handleChangeEstado(cita.id, e.target.value)}
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
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Confirmada">Confirmada</option>
                                                    <option value="Completada">Completada</option>
                                                    <option value="Cancelada">Cancelada</option>
                                                </select>
                                            </td>
                                            <td style={styles.td}>
                                                <button style={styles.actionBtn} title="Editar">✏️</button>
                                                <button
                                                    onClick={() => handleDelete(cita.id)}
                                                    style={{ ...styles.actionBtn, color: '#ef4444' }}
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
                                        No se encontraron citas registradas.
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
    actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '8px', color: '#3b82f6' }
};