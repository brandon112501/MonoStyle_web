import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { orderService } from '../../api/orderService';

export default function ServiceList() {
    const [adminName, setAdminName] = useState('SuperAdmin');
    const [clientes, setClientes] = useState<any[]>([]);
    const [empleados, setEmpleados] = useState<any[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        id_cliente: '',
        fecha: new Date().toISOString().split('T')[0],
        vehiculo: '',
        observaciones: '',
        servicio: '',
        id_empleado: ''
    });

    const [productos, setProductos] = useState<any[]>([]);
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
        fetchOrders();
        fetchDirectFromSupabase();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAll();
            setOrders(data || []);
        } catch (err: any) {
            console.error('Error al cargar órdenes:', err);
            setError('No se pudieron cargar los servicios.');
        } finally {
            setLoading(false);
        }
    };

    // Petición HTTP nativa directa a Supabase (sin tokens de sesión que fallen)
    const fetchDirectFromSupabase = async () => {
        const supabaseUrl = 'https://umvfiaquovixeeolamks.supabase.co';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmlmaWFxdW92aXhlZW9sYW1rcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM2MTU5NjU0LCJleHAiOjIwNTE3MzU2NTR9.1';

        try {
            // Cargar Clientes
            const resClientes = await fetch(`${supabaseUrl}/rest/v1/cliente?select=*`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`
                }
            });
            if (resClientes.ok) {
                const dataC = await resClientes.json();
                setClientes(dataC);
            }

            // Cargar Empleados
            const resEmpleados = await fetch(`${supabaseUrl}/rest/v1/empleado?select=*`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`
                }
            });
            if (resEmpleados.ok) {
                const dataE = await resEmpleados.json();
                setEmpleados(dataE);
            }
        } catch (err) {
            console.error('Error en fetch directo:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddProduct = () => {
        const nuevoProd = { id: Date.now(), nombre: 'Aceite Motor 4T', cantidad: 1, precio: 35000, subtotal: 35000 };
        setProductos([...productos, nuevoProd]);
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await orderService.create({
                descripcion: formData.observaciones || formData.servicio,
                id_cliente: Number(formData.id_cliente),
                id_empleado: Number(formData.id_empleado),
                id_estado_orden: 1
            });

            alert('¡Orden de servicio registrada con éxito!');
            setIsCreating(false);
            setFormData({ id_cliente: '', fecha: new Date().toISOString().split('T')[0], vehiculo: '', observaciones: '', servicio: '', id_empleado: '' });
            setProductos([]);
            fetchOrders();
        } catch (err: any) {
            console.error('Error al crear:', err);
            alert('Error al registrar el servicio.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
            try {
                await orderService.delete(id);
                fetchOrders();
            } catch (err) {
                console.error('Error al eliminar:', err);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const filteredOrders = orders.filter(ord =>
        ord.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            {/* Barra lateral */}
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandContainer}>
                        <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
                    </div>

                    <nav style={styles.nav}>
                        <Link to="/admin/dashboard" style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={styles.navLink}>Usuario</Link>
                        <Link to="/services" style={{ ...styles.navLink, ...styles.activeLink }}>Servicios</Link>
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
                        <h2 style={styles.pageTitle}>
                            {isCreating ? 'Nueva Orden de Servicio' : 'Gestión de Servicios'}
                        </h2>
                        <p style={styles.pageSubtitle}>
                            {isCreating ? 'Registra una nueva orden de servicio al cliente' : 'Administra los servicios del taller'}
                        </p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{adminName}</p>
                            <span style={styles.userRole}>Administrador</span>
                        </div>
                    </div>
                </header>

                {!isCreating ? (
                    <>
                        <div style={styles.toolbar}>
                            <button
                                onClick={() => {
                                    setIsCreating(true);
                                    fetchDirectFromSupabase();
                                }}
                                style={styles.addButton}
                            >
                                + Agregar Servicio
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar servicio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchBox}
                            />
                        </div>

                        {error && <div style={styles.errorAlert}>{error}</div>}

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.trHead}>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Descripción (Servicio)</th>
                                        <th style={styles.th}>ID Cliente</th>
                                        <th style={styles.th}>ID Empleado</th>
                                        <th style={styles.th}>Estado</th>
                                        <th style={styles.th}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                                Cargando servicios...
                                            </td>
                                        </tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                                No se encontraron registros.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((ord) => (
                                            <tr key={ord.id_orden} style={styles.trBody}>
                                                <td style={styles.td}>{ord.id_orden}</td>
                                                <td style={styles.td}>{ord.descripcion}</td>
                                                <td style={styles.td}>{ord.id_cliente}</td>
                                                <td style={styles.td}>{ord.id_empleado}</td>
                                                <td style={styles.td}>
                                                    <span style={styles.activeBadge}>Activo</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.actionButtons}>
                                                        <button onClick={() => handleDelete(ord.id_orden)} style={styles.deleteBtn} title="Eliminar">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSaveService}>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>⚙️ Información del Servicio</h3>

                            <div style={styles.grid2Cols}>
                                <div>
                                    <label style={styles.labelField}>Cliente *</label>
                                    <select
                                        name="id_cliente"
                                        value={formData.id_cliente}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {clientes.map(c => (
                                            <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>
                                                {c.nombre || c.nombres}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.labelField}>Fecha *</label>
                                    <div style={styles.inputWithIcon}>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                        <span style={styles.inputIcon}>📅</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ ...styles.grid2Cols, marginTop: '15px' }}>
                                <div>
                                    <label style={styles.labelField}>Vehículo *</label>
                                    <input
                                        type="text"
                                        name="vehiculo"
                                        placeholder="Escribir vehículo..."
                                        value={formData.vehiculo}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={styles.labelField}>Empleado Asignado *</label>
                                    <select
                                        name="id_empleado"
                                        value={formData.id_empleado}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    >
                                        <option value="">Seleccionar empleado...</option>
                                        {empleados.map(emp => (
                                            <option key={emp.id_empleado || emp.id} value={emp.id_empleado || emp.id}>
                                                {emp.nombre || emp.nombres}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.labelField}>Servicio *</label>
                                <select
                                    name="servicio"
                                    value={formData.servicio}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Seleccionar servicio...</option>
                                    <option value="Cambio de aceite y filtros">Cambio de aceite y filtros</option>
                                    <option value="Mantenimiento general">Mantenimiento general</option>
                                    <option value="Revisión de frenos">Revisión de frenos</option>
                                </select>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.labelField}>Observaciones</label>
                                <textarea
                                    name="observaciones"
                                    placeholder="Descripción del servicio..."
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    style={{ ...styles.input, height: '70px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Tarjeta: Productos Utilizados */}
                        <div style={styles.card}>
                            <div style={styles.cardHeaderFlex}>
                                <h3 style={styles.cardTitleNoMargin}>📦 Productos Utilizados</h3>
                                <button type="button" onClick={handleAddProduct} style={styles.addProductBtn}>
                                    + Agregar
                                </button>
                            </div>

                            <div style={styles.tableHeaderRow}>
                                <span style={{ flex: 2 }}>Producto</span>
                                <span style={{ flex: 1, textAlign: 'center' }}>Cantidad</span>
                                <span style={{ flex: 1, textAlign: 'right' }}>Precio</span>
                                <span style={{ flex: 1, textAlign: 'right' }}>Subtotal</span>
                            </div>

                            {productos.length === 0 ? (
                                <p style={styles.emptyText}>No hay productos agregados</p>
                            ) : (
                                productos.map((p) => (
                                    <div key={p.id} style={styles.tableBodyRow}>
                                        <span style={{ flex: 2 }}>{p.nombre}</span>
                                        <span style={{ flex: 1, textAlign: 'center' }}>{p.cantidad}</span>
                                        <span style={{ flex: 1, textAlign: 'right' }}>${p.precio}</span>
                                        <span style={{ flex: 1, textAlign: 'right' }}>${p.subtotal}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Botones Inferiores */}
                        <div style={styles.footerActions}>
                            <button type="submit" style={styles.saveBtn}>
                                💾 Guardar Servicio
                            </button>
                            <button type="button" onClick={() => setIsCreating(false)} style={styles.cancelBtn}>
                                ❌ Cancelar
                            </button>
                            <button type="button" onClick={() => alert('Generando cotización...')} style={styles.quoteBtn}>
                                Generar cotización
                            </button>
                        </div>
                    </form>
                )}
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
    logoutButton: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignContent: 'center', gap: '8px', width: '100%', padding: '8px' },
    mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' },
    pageTitle: { fontSize: '22px', fontWeight: 'bold' },
    pageSubtitle: { color: '#64748b', fontSize: '13px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    userAvatar: { fontSize: '20px' },
    userName: { fontSize: '14px', fontWeight: 'bold' },
    userRole: { fontSize: '11px', color: '#3b82f6' },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    searchBox: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 15px', color: '#fff', width: '250px', outline: 'none' },
    tableContainer: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    trHead: { borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '15px' },
    trBody: { borderBottom: '1px solid #1e293b', fontSize: '14px' },
    td: { padding: '15px' },
    activeBadge: { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', border: '1px solid #22c55e' },
    actionButtons: { display: 'flex', gap: '10px' },
    deleteBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
    errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
    card: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#3b82f6' },
    cardTitleNoMargin: { fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', margin: 0 },
    cardHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    labelField: { fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
    inputWithIcon: { position: 'relative' },
    inputIcon: { position: 'absolute', right: '12px', top: '10px', fontSize: '14px', cursor: 'pointer' },
    addProductBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(29, 78, 216, 0.3)' },
    tableHeaderRow: { display: 'flex', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' },
    tableBodyRow: { display: 'flex', fontSize: '14px', padding: '8px 0', borderBottom: '1px solid #1e293b' },
    emptyText: { textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '15px 0' },
    footerActions: { display: 'flex', gap: '15px', marginTop: '20px' },
    saveBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)' },
    cancelBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    quoteBtn: { backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};