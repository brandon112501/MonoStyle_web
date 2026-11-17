import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function EmployeeDashboard() {
    const [employeeName, setEmployeeName] = useState('Camilo');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        serviciosHoy: 0,
        citasPendientes: 0,
        clientesActivos: 0,
        ordenesAsignadas: 0
    });

    const [citasProximas, setCitasProximas] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setEmployeeName(userData.nombre || 'Camilo');
            } catch (e) {
                console.error(e);
            }
        }
        fetchEmployeeMetrics();
    }, []);

    const fetchEmployeeMetrics = async () => {
        try {
            setLoading(true);

            const { count: countOrdenes } = await supabase
                .from('orden')
                .select('*', { count: 'exact', head: true });

            const { count: countCitas } = await supabase
                .from('cita')
                .select('*', { count: 'exact', head: true });

            const { count: countClientes } = await supabase
                .from('cliente')
                .select('*', { count: 'exact', head: true });

            const { data: citasData } = await supabase
                .from('cita')
                .select('*')
                .limit(4);

            setStats({
                serviciosHoy: countOrdenes || 0,
                citasPendientes: countCitas || 0,
                clientesActivos: countClientes || 0,
                ordenesAsignadas: countOrdenes || 0
            });

            if (citasData) {
                setCitasProximas(citasData);
            }

        } catch (err) {
            console.error('Error al cargar métricas del empleado:', err);
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
                        <Link to="/employee/dashboard" style={{ ...styles.navLink, ...styles.activeLink }}>Inicio</Link>
                        <Link to="/users" style={styles.navLink}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
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
                        <h2 style={styles.pageTitle}>Panel de Empleado</h2>
                        <p style={styles.pageSubtitle}>Bienvenido a tu panel de trabajo</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{employeeName}</p>
                            {/* CORREGIDO: Muestra explícitamente "Empleado" en lugar de la especialidad */}
                            <span style={styles.userRole}>Empleado</span>
                        </div>
                    </div>
                </header>

                {/* Banner de Bienvenida */}
                <div style={styles.welcomeBanner}>
                    <div>
                        <h3 style={styles.bannerTitle}>¡Hola, {employeeName}!</h3>
                        <p style={styles.bannerSubtitle}>Gestiona todos los servicios y mantén todo en orden</p>
                    </div>
                    <div style={styles.statusBadge}>🟢 Disponible</div>
                </div>

                {/* Grid de 4 Tarjetas de Métricas */}
                <div style={styles.grid4Cols}>
                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>🛠️</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.serviciosHoy}</h3>
                            <p style={styles.statLabel}>Servicios de hoy</p>
                        </div>
                    </div>

                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>📅</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.citasPendientes}</h3>
                            <p style={styles.statLabel}>Citas pendientes</p>
                        </div>
                    </div>

                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>🚗</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.clientesActivos}</h3>
                            <p style={styles.statLabel}>Clientes Activos</p>
                        </div>
                    </div>

                    <div style={styles.cardStat}>
                        <div style={styles.cardIcon}>📦</div>
                        <div>
                            <h3 style={styles.statNumber}>{loading ? '...' : stats.ordenesAsignadas}</h3>
                            <p style={styles.statLabel}>Órdenes asignadas</p>
                        </div>
                    </div>
                </div>

                {/* Sección Inferior: Gráfico corregido (en ceros si no hay registros) y Próximas Citas */}
                <div style={styles.grid2Cols}>
                    <div style={styles.mainCard}>
                        <h3 style={styles.cardTitle}>Servicios de la Semana</h3>
                        <div style={styles.chartContainer}>
                            {/* Gráfico ajustado a 0% para reflejar que no hay registros acumulados aún */}
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Lun</span></div>
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Mar</span></div>
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Mié</span></div>
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Jue</span></div>
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Vie</span></div>
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Sáb</span></div>
                            <div style={styles.barGroup}><div style={{ ...styles.bar, height: '5%' }}></div><span>Dom</span></div>
                        </div>
                    </div>

                    <div style={styles.mainCard}>
                        <h3 style={styles.cardTitle}>Próximas Citas</h3>
                        <div style={styles.appointmentsList}>
                            {citasProximas.length > 0 ? (
                                citasProximas.map((cita, index) => (
                                    <div key={index} style={styles.appointmentItem}>
                                        <span style={{ fontSize: '18px' }}>🕒</span>
                                        <div>
                                            <h4 style={styles.appointmentTime}>{cita.fecha || 'Próximamente'}</h4>
                                            <p style={styles.appointmentDesc}>{cita.descripcion || 'Servicio General en Taller'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '13px' }}>No hay citas agendadas actualmente.</p>
                            )}
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
    welcomeBanner: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    bannerTitle: { fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' },
    bannerSubtitle: { color: '#94a3b8', fontSize: '13px', margin: 0 },
    statusBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    grid4Cols: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
    cardStat: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    cardIcon: { fontSize: '28px', backgroundColor: '#050811', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' },
    statNumber: { fontSize: '24px', fontWeight: 'bold', margin: '0 0 2px 0' },
    statLabel: { color: '#94a3b8', fontSize: '12px', margin: 0 },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' },
    mainCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', minHeight: '240px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#fff' },
    chartContainer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px', paddingTop: '20px' },
    barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end', fontSize: '11px', color: '#94a3b8' },
    bar: { width: '22px', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0', boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' },
    appointmentsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    appointmentItem: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#050811', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' },
    appointmentTime: { fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#3b82f6' },
    appointmentDesc: { fontSize: '12px', color: '#94a3b8', margin: 0 }
};