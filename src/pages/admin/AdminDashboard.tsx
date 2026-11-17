import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function AdminDashboard() {
    const [adminName, setAdminName] = useState('SuperAdmin');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        usuarios: 0,
        citas: 0,
        servicios: 0,
        alertasStock: 0
    });

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setAdminName(userData.username || userData.nombre || 'SuperAdmin');
            } catch (e) {
                console.error(e);
            }
        }
        fetchAdminMetrics();
    }, []);

    // Consulta real a todas las tablas clave en Supabase
    const fetchAdminMetrics = async () => {
        try {
            setLoading(true);

            // 1. Contar usuarios o clientes registrados
            const { count: countClientes } = await supabase
                .from('cliente')
                .select('*', { count: 'exact', head: true });

            // 2. Contar citas registradas
            const { count: countCitas } = await supabase
                .from('cita')
                .select('*', { count: 'exact', head: true });

            // 3. Contar servicios / órdenes registradas
            const { count: countOrdenes } = await supabase
                .from('orden')
                .select('*', { count: 'exact', head: true });

            // 4. Contar productos con stock bajo en inventario (referencias)
            const { data: refData } = await supabase
                .from('referencia')
                .select('stock');

            let stockBajo = 0;
            if (refData) {
                stockBajo = refData.filter(r => Number(r.stock) <= 5).length;
            }

            setStats({
                usuarios: countClientes || 0,
                citas: countCitas || 0,
                servicios: countOrdenes || 0,
                alertasStock: stockBajo
            });

        } catch (err) {
            console.error('Error al cargar métricas del administrador:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            {/* Barra lateral */}
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandContainer}>
                        <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
                    </div>

                    <nav style={styles.nav}>
                        <Link to="/admin/dashboard" style={{ ...styles.navLink, ...styles.activeLink }}>Inicio</Link>
                        <Link to="/users" style={styles.navLink}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        <Link to="/reports" style={styles.navLink}>Reportes</Link>
                        <Link to="/register" style={styles.navLink}>Registro</Link>
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
                        <h2 style={styles.pageTitle}>Panel de Administrador</h2>
                        <p style={styles.pageSubtitle}>Control Total del Sistema</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{adminName}</p>
                            <span style={styles.userRole}>Administrador</span>
                        </div>
                    </div>
                </header>

                {/* Grid de 4 Tarjetas de Métricas Reales */}
                <div style={styles.grid4Cols}>
                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>👥</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.usuarios}</h3>
                            <p style={styles.statLabel}>Usuarios Registrados</p>
                        </div>
                    </div>

                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>📅</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.citas}</h3>
                            <p style={styles.statLabel}>Citas este mes</p>
                        </div>
                    </div>

                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>🛠️</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.servicios}</h3>
                            <p style={styles.statLabel}>Servicios Registrados</p>
                        </div>
                    </div>

                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>📦</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.alertasStock}</h3>
                            <p style={styles.statLabel}>Alertas de Stock</p>
                        </div>
                    </div>
                </div>

                {/* Sección Inferior: Resumen y Actividad */}
                <div style={styles.grid2Cols}>
                    <div style={styles.mainCard}>
                        <h3 style={styles.cardTitle}>Resumen General</h3>
                        <div style={styles.chartPlaceholder}>
                            <p style={{ color: '#64748b' }}>Gráfico de Servicios y Ventas por Mes</p>
                            <span style={{ fontSize: '13px', color: '#3b82f6', marginTop: '5px' }}>
                                Total servicios activos: {stats.servicios}
                            </span>
                        </div>
                    </div>

                    <div style={styles.mainCard}>
                        <h3 style={styles.cardTitle}>Actividad Reciente</h3>
                        <div style={styles.activityItem}>
                            <span style={{ fontSize: '18px' }}>💡</span>
                            <div>
                                <h4 style={styles.activityTitle}>Sistema conectado y listo</h4>
                                <p style={styles.activityTime}>Base de datos Supabase sincronizada</p>
                            </div>
                        </div>
                    </div>
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
    pageTitle: { fontSize: '22px', fontWeight: 'bold' },
    pageSubtitle: { color: '#64748b', fontSize: '13px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    userAvatar: { fontSize: '20px' },
    userName: { fontSize: '14px', fontWeight: 'bold' },
    userRole: { fontSize: '11px', color: '#3b82f6' },
    grid4Cols: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
    cardStat: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    cardIcon: { fontSize: '28px', backgroundColor: '#050811', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' },
    statNumber: { fontSize: '24px', fontWeight: 'bold', margin: '0 0 2px 0' },
    statLabel: { color: '#94a3b8', fontSize: '12px', margin: 0 },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' },
    mainCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', minHeight: '220px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#fff' },
    chartPlaceholder: { border: '1px dashed #1e293b', borderRadius: '8px', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050811' },
    activityItem: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#050811', padding: '12px 15px', borderRadius: '8px', border: '1px solid #1e293b' },
    activityTitle: { fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' },
    activityTime: { fontSize: '12px', color: '#94a3b8', margin: 0 }
};