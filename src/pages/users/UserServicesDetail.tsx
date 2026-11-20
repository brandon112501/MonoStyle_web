import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

interface UsuarioInfo {
    id: string | number;
    nombre: string;
    telefono: string;
    correo: string;
    rol: string;
    estado: string;
}

interface ServicioPendiente {
    id: string | number;
    titulo: string;
    descripcion: string;
    fecha: string;
    estado: string;
    origen: 'Orden' | 'Cita';
}

export default function UserServicesDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const stateUser = (location.state as { usuario?: UsuarioInfo } | null)?.usuario;

    const [usuario, setUsuario] = useState<UsuarioInfo | null>(stateUser || null);
    const [serviciosPendientes, setServiciosPendientes] = useState<ServicioPendiente[]>([]);
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
    }, []);

    useEffect(() => {
        const cargarDetalleYServicios = async () => {
            if (!id) return;
            setLoading(true);

            try {
                let currentUser = stateUser || null;

                if (!currentUser) {
                    const { data: clienteData } = await supabase
                        .from('cliente')
                        .select('*')
                        .or(`id_cliente.eq.${id},id.eq.${id}`)
                        .maybeSingle();

                    if (clienteData) {
                        const c: any = clienteData;
                        currentUser = {
                            id: c.id_cliente ?? c.id ?? id,
                            nombre: c.nombre_completo || c.nombre || `Usuario #${id}`,
                            telefono: c.telefono || 'N/A',
                            correo: c.correo || c.email || 'N/A',
                            rol: 'Cliente',
                            estado: c.estado || 'Activo'
                        };
                    } else {
                        const { data: empData } = await supabase
                            .from('empleado')
                            .select('*')
                            .or(`id_empleado.eq.${id},id.eq.${id}`)
                            .maybeSingle();

                        if (empData) {
                            const e: any = empData;
                            currentUser = {
                                id: e.id_empleado ?? e.id ?? id,
                                nombre: e.nombre_completo || e.nombre || `Empleado #${id}`,
                                telefono: e.telefono || 'N/A',
                                correo: e.correo || e.email || 'N/A',
                                rol: 'Empleado',
                                estado: e.estado || 'Activo'
                            };
                        }
                    }
                }

                if (!currentUser) {
                    currentUser = {
                        id,
                        nombre: `Usuario #${id}`,
                        telefono: 'N/A',
                        correo: 'N/A',
                        rol: 'Cliente',
                        estado: 'Activo'
                    };
                }

                setUsuario(currentUser);

                const pendientes: ServicioPendiente[] = [];

                const { data: ordenesData } = await supabase
                    .from('orden')
                    .select('*')
                    .or(`id_cliente.eq.${id},id_empleado.eq.${id}`);

                if (ordenesData && ordenesData.length > 0) {
                    for (const ord of ordenesData as any[]) {
                        const estadoTexto = String(ord.estado || ord.id_estado_orden || 'Pendiente');
                        const esCompletada =
                            estadoTexto.toLowerCase().includes('complet') ||
                            estadoTexto.toLowerCase().includes('finaliz') ||
                            estadoTexto.toLowerCase().includes('entreg');

                        if (!esCompletada) {
                            pendientes.push({
                                id: ord.id_orden ?? ord.id,
                                titulo: ord.servicio || ord.tipo_servicio || `Orden de Servicio #${ord.id_orden ?? ord.id}`,
                                descripcion: ord.descripcion || ord.observaciones || 'Servicio pendiente por atender',
                                fecha: ord.fecha || ord.created_at || 'Sin fecha',
                                estado: estadoTexto,
                                origen: 'Orden'
                            });
                        }
                    }
                }

                const { data: citasData } = await supabase
                    .from('cita')
                    .select('*')
                    .or(`id_cliente.eq.${id},id_empleado.eq.${id}`);

                if (citasData && citasData.length > 0) {
                    for (const cita of citasData as any[]) {
                        const estadoCita = String(cita.estado || 'Pendiente');
                        const esFinalizada =
                            estadoCita.toLowerCase().includes('complet') ||
                            estadoCita.toLowerCase().includes('cancel');

                        if (!esFinalizada) {
                            pendientes.push({
                                id: cita.id_cita ?? cita.id,
                                titulo: cita.motivo || cita.servicio || `Cita #${cita.id_cita ?? cita.id}`,
                                descripcion: cita.descripcion || cita.observaciones || 'Cita programada pendiente',
                                fecha: cita.fecha || cita.fecha_cita || 'Sin fecha',
                                estado: estadoCita,
                                origen: 'Cita'
                            });
                        }
                    }
                }

                setServiciosPendientes(pendientes);
            } catch (error) {
                console.error('Error cargando servicios pendientes del usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDetalleYServicios();
    }, [id, stateUser]);

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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
                        <h2 style={styles.pageTitle}>Servicios Pendientes del Usuario</h2>
                        <p style={styles.pageSubtitle}>
                            Detalle de usuario y servicios o citas por completar
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

                <div style={styles.topActions}>
                    <button onClick={() => navigate('/users')} style={styles.backButton}>
                        ← Volver a Usuarios
                    </button>
                    <button onClick={() => navigate('/services')} style={styles.primaryButton}>
                        Ir a Servicios
                    </button>
                </div>

                {usuario && (
                    <section style={styles.profileCard}>
                        <div style={styles.profileGrid}>
                            <div>
                                <span style={styles.metaLabel}>Nombre Completo</span>
                                <div style={styles.metaValue}>{usuario.nombre}</div>
                            </div>
                            <div>
                                <span style={styles.metaLabel}>Rol</span>
                                <div style={styles.metaValue}>{usuario.rol}</div>
                            </div>
                            <div>
                                <span style={styles.metaLabel}>Teléfono</span>
                                <div style={styles.metaValue}>{usuario.telefono}</div>
                            </div>
                            <div>
                                <span style={styles.metaLabel}>Correo / Credencial</span>
                                <div style={styles.metaValue}>{usuario.correo}</div>
                            </div>
                        </div>
                    </section>
                )}

                <section style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>
                            Servicios Pendientes ({serviciosPendientes.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div style={styles.emptyBox}>Consultando servicios pendientes...</div>
                    ) : serviciosPendientes.length > 0 ? (
                        <div style={styles.listGrid}>
                            {serviciosPendientes.map((item) => (
                                <div key={`${item.origen}-${item.id}`} style={styles.serviceItem}>
                                    <div style={styles.serviceTop}>
                                        <div>
                                            <span style={styles.badgeOrigen}>{item.origen}</span>
                                            <strong style={styles.serviceTitle}>{item.titulo}</strong>
                                        </div>
                                        <span style={styles.badgePendiente}>{item.estado}</span>
                                    </div>
                                    <p style={styles.serviceDesc}>{item.descripcion}</p>
                                    <div style={styles.serviceFooter}>
                                        <span>ID: #{item.id}</span>
                                        <span>Fecha: {item.fecha}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.emptyBox}>
                            Este usuario no tiene servicios pendientes registrados en este momento.
                        </div>
                    )}
                </section>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' },
    pageTitle: { fontSize: '22px', fontWeight: 'bold', margin: 0 },
    pageSubtitle: { color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    userAvatar: { fontSize: '20px' },
    userName: { fontSize: '14px', fontWeight: 'bold', margin: 0 },
    userRole: { fontSize: '11px', color: '#3b82f6', margin: 0 },
    topActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    backButton: { backgroundColor: '#0d1322', color: '#cbd5e1', border: '1px solid #1e293b', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    primaryButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
    profileCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
    profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
    metaLabel: { display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' },
    metaValue: { fontSize: '15px', fontWeight: 600, color: '#f1f5f9' },
    sectionCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '22px' },
    sectionHeader: { marginBottom: '16px' },
    sectionTitle: { margin: 0, fontSize: '17px', fontWeight: 600 },
    listGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    serviceItem: { backgroundColor: '#070a14', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' },
    serviceTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px' },
    serviceTitle: { fontSize: '15px', color: '#fff', marginLeft: '10px' },
    badgeOrigen: { backgroundColor: '#1e293b', color: '#93c5fd', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 },
    badgePendiente: { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid #3b82f6', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
    serviceDesc: { margin: '0 0 10px 0', color: '#94a3b8', fontSize: '13px' },
    serviceFooter: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' },
    emptyBox: { textAlign: 'center', padding: '36px', color: '#94a3b8', backgroundColor: '#070a14', borderRadius: '10px', border: '1px dashed #1e293b' }
};