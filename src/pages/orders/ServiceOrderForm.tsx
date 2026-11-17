import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function ServiceOrderForm() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);

    // Estados del formulario
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [vehiculo, setVehiculo] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [observaciones, setObservaciones] = useState('');
    const [productos, setProductos] = useState<any[]>([]); // Para productos utilizados
    const [loading, setLoading] = useState(false);

    // Datos del usuario logueado
    const [userName, setUserName] = useState('Usuario');
    const [userRole, setUserRole] = useState('Empleado');

    useEffect(() => {
            // Solo leemos el usuario actual de forma segura
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!storedUser || !token) {
                // Si por alguna razón no está, redirigimos al login
                navigate('/login', { replace: true });
                return;
            }

            try {
                const userData = JSON.parse(storedUser);
                setUserName(userData.nombre || 'Usuario');
                setUserRole(userData.rol || 'Empleado');
            } catch (e) {
                console.error("Error al parsear el usuario:", e);
            }

            fetchDropdownData();
        }, [navigate]);

    const fetchDropdownData = async () => {
        try {
            const { data: cliData } = await supabase.from('cliente').select('*');
            const { data: servData } = await supabase.from('servicios').select('*');
            setClientes(cliData || []);
            setServicios(servData || []);
        } catch (err) {
            console.error('Error al cargar datos de Supabase:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Lógica para guardar la orden en Supabase (ajusta la tabla según tu esquema de órdenes)
            const { error } = await supabase.from('ordenes_servicio').insert([
                {
                    cliente_id: clienteSeleccionado,
                    vehiculo: vehiculo,
                    servicio_id: servicioSeleccionado,
                    fecha: fecha,
                    observaciones: observaciones,
                    estado: 'Activo'
                }
            ]);

            if (error) throw error;

            alert('¡Orden de servicio registrada con éxito!');
            navigate('/orders');
        } catch (err) {
            console.error('Error al guardar orden:', err);
            alert('Error al registrar la orden de servicio.');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    return (
        <div style={styles.container}>
            {/* Barra lateral con rol dinámico */}
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
                        <Link to="/orders" style={{ ...styles.navLink, ...styles.activeLink }}>Órdenes</Link>
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
                        <h2 style={styles.pageTitle}>Nueva Orden de Servicio</h2>
                        <p style={styles.pageSubtitle}>Registra una nueva orden de servicio al cliente</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{userName}</p>
                            <span style={styles.userRole}>{userRole}</span>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} style={styles.formCard}>
                    {/* Sección Información del Servicio */}
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionIcon}>🛠️</span>
                        <h3 style={styles.sectionTitle}>Información del Servicio</h3>
                    </div>

                    <div style={styles.grid2Cols}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Cliente *</label>
                            <select
                                value={clienteSeleccionado}
                                onChange={(e) => setClienteSeleccionado(e.target.value)}
                                required
                                style={styles.input}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {clientes.map((cli) => (
                                    <option key={cli.id_cliente || cli.id} value={cli.id_cliente || cli.id}>
                                        {cli.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Fecha *</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Vehículo *</label>
                            <input
                                type="text"
                                placeholder="Ej. Yamaha FZ / Placa ABC-123"
                                value={vehiculo}
                                onChange={(e) => setVehiculo(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Observaciones</label>
                            <input
                                type="text"
                                placeholder="Descripción del servicio..."
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                            <label style={styles.label}>Servicio *</label>
                            <select
                                value={servicioSeleccionado}
                                onChange={(e) => setServicioSeleccionado(e.target.value)}
                                required
                                style={styles.input}
                            >
                                <option value="">Seleccionar servicio...</option>
                                {servicios.map((serv) => (
                                    <option key={serv.id_servicio || serv.id} value={serv.id_servicio || serv.id}>
                                        {serv.nombre} - ${Number(serv.precio || 0).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sección Productos Utilizados */}
                    <div style={{ ...styles.sectionHeader, marginTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={styles.sectionIcon}>📦</span>
                            <h3 style={styles.sectionTitle}>Productos Utilizados</h3>
                        </div>
                        <button type="button" style={styles.addProductBtn}>+ Agregar</button>
                    </div>

                    <div style={styles.productsTableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.trHead}>
                                    <th style={styles.th}>Producto</th>
                                    <th style={styles.th}>Cantidad</th>
                                    <th style={styles.th}>Precio</th>
                                    <th style={styles.th}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                                        No hay productos agregados
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Botones de Acción */}
                    <div style={styles.footerButtons}>
                        <button type="submit" disabled={loading} style={styles.saveBtn}>
                            💾 Guardar Servicio
                        </button>
                        <button type="button" onClick={() => navigate('/orders')} style={styles.cancelBtn}>
                            ✕ Cancelar
                        </button>
                        <button type="button" style={styles.quoteBtn}>
                            Generar cotización
                        </button>
                    </div>
                </form>
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
    formCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionIcon: { fontSize: '16px' },
    sectionTitle: { fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#38bdf8' },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
    addProductBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    productsTableContainer: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden', marginBottom: '25px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
    trHead: { borderBottom: '1px solid #1e293b', color: '#94a3b8' },
    th: { padding: '12px 15px', fontWeight: '600' },
    footerButtons: { display: 'flex', gap: '15px', justifyContent: 'flex-start', borderTop: '1px solid #1e293b', paddingTop: '20px' },
    saveBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    cancelBtn: { backgroundColor: '#050811', color: '#ef4444', border: '1px solid #ef4444', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
    quoteBtn: { backgroundColor: '#050811', color: '#38bdf8', border: '1px solid #38bdf8', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }
};