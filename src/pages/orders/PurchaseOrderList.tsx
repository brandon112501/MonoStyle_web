import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { orderService } from '../../api/orderService';

interface OrdenRow {
    id: number;
    proveedor: string;
    detalle: string;
    fecha: string;
    estado: string;
}

const parsearDescripcion = (raw: string, fallbackProveedor: string) => {
    if (!raw) {
        return { proveedor: fallbackProveedor, detalle: '', fecha: '' };
    }

    const partes = raw.split(' | ').map((p) => p.trim());
    let proveedor = fallbackProveedor;
    let fecha = '';
    const extras: string[] = [];

    for (const parte of partes) {
        if (parte.toLowerCase().startsWith('proveedor:')) {
            proveedor = parte.replace(/^proveedor:\s*/i, '').trim() || fallbackProveedor;
        } else if (parte.toLowerCase().startsWith('fecha:')) {
            fecha = parte.replace(/^fecha:\s*/i, '').trim();
        } else {
            extras.push(parte);
        }
    }

    return {
        proveedor,
        detalle: extras.join(' · '),
        fecha
    };
};

export default function PurchaseOrderList() {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState<OrdenRow[]>([]);
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

        fetchOrdenes();
    }, []);

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const fetchOrdenes = async () => {
        try {
            setLoading(true);
            const data = await orderService.getPurchaseOrders();

            const mapeadas: OrdenRow[] = (data || []).map((o: any) => {
                const fallbackProv = o.id_proveedor ? `Proveedor #${o.id_proveedor}` : 'Proveedor General';
                const parsed = parsearDescripcion(o.descripcion || '', fallbackProv);

                return {
                    id: o.id_orden_compra ?? o.id,
                    proveedor: parsed.proveedor,
                    detalle: parsed.detalle,
                    fecha: o.fecha || parsed.fecha || '—',
                    estado: o.estado || 'Pendiente'
                };
            });

            setOrdenes(mapeadas);
        } catch (err) {
            console.error('Error al cargar órdenes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEstado = (idOrden: number, nuevoEstado: string) => {
        setOrdenes((prev) =>
            prev.map((item) => (item.id === idOrden ? { ...item, estado: nuevoEstado } : item))
        );
    };

    const handleDelete = async (idOrden: number) => {
        try {
            await orderService.deletePurchaseOrder(idOrden);
            setOrdenes((prev) => prev.filter((item) => item.id !== idOrden));
        } catch (err) {
            console.error('Error al eliminar orden:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getEstadoColor = (estado: string) => {
        const lower = estado.toLowerCase();
        if (lower.includes('complet') || lower.includes('aprob')) return '#10b981';
        if (lower.includes('cancel') || lower.includes('rechaz')) return '#ef4444';
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
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        {isAdmin && <Link to="/reports" style={styles.navLink}>Reportes</Link>}
                        {isAdmin && <Link to="/users/new" style={styles.navLink}>Registro</Link>}
                        <Link to="/orders" style={{ ...styles.navLink, ...styles.activeLink }}>Órdenes</Link>
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
                        <h2 style={styles.pageTitle}>Gestión de Órdenes</h2>
                        <p style={styles.pageSubtitle}>Consulta y Administra las Órdenes</p>
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
                    <button onClick={() => navigate('/orders/new')} style={styles.newButton}>
                        + Nueva Orden
                    </button>
                </div>

                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.trHead}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Proveedor</th>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Cargando órdenes...
                                    </td>
                                </tr>
                            ) : ordenes.length > 0 ? (
                                ordenes.map((orden) => {
                                    const colorEstado = getEstadoColor(orden.estado);
                                    return (
                                        <tr key={orden.id} style={styles.trBody}>
                                            <td style={styles.td}>{orden.id}</td>
                                            <td style={styles.td}>
                                                <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{orden.proveedor}</div>
                                                {orden.detalle && (
                                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                                                        {orden.detalle}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{orden.fecha}</td>
                                            <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                                                <select
                                                    value={orden.estado}
                                                    onChange={(e) => handleChangeEstado(orden.id, e.target.value)}
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
                                                    <option value="En proceso">En proceso</option>
                                                    <option value="Completada">Completada</option>
                                                    <option value="Cancelada">Cancelada</option>
                                                </select>
                                            </td>
                                            <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                                                <button
                                                    onClick={() => handleDelete(orden.id)}
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
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No se encontraron órdenes registradas.
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
    toolbar: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '25px' },
    newButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    tableCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    trHead: { backgroundColor: '#070a14', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '15px 20px', fontWeight: '600' },
    trBody: { borderBottom: '1px solid #1e293b', transition: 'background 0.2s' },
    td: { padding: '15px 20px', color: '#cbd5e1', verticalAlign: 'middle' },
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ef4444' }
};