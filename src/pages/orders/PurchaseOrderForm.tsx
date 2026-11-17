import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function PurchaseOrderForm() {
    const navigate = useNavigate();
    const [proveedor, setProveedor] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);

    // Productos de ejemplo dentro de la orden (como en la imagen)
    const productosOrden = [
        { id: 1, producto: 'Aceite Mobil 20W50', cantidad: 10, precioUnitario: 35000 },
        { id: 2, producto: 'Filtro de aceite', cantidad: 10, precioUnitario: 15000 }
    ];

    const totalOrden = productosOrden.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

    const [userName, setUserName] = useState('Usuario');
    const [userRole, setUserRole] = useState('Empleado');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUserName(userData.nombre || 'Usuario');
                setUserRole(userData.rol || 'Empleado');
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const nuevaOrden = {
                proveedor: proveedor || 'Proveedor General',
                fecha: fecha,
                estado: 'Pendiente',
                observaciones: observaciones || ''
            };

            const { error } = await supabase.from('orden').insert([nuevaOrden]);
            if (error) {
                const { error: errAlt } = await supabase.from('orden_compra').insert([nuevaOrden]);
                if (errAlt) throw errAlt;
            }

            alert('¡Orden registrada con éxito!');
            navigate('/orders');
        } catch (err) {
            console.error('Error al registrar orden:', err);
            alert('Error al registrar la orden en el sistema.');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

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
                        <Link to="/orders" style={{ ...styles.navLink, ...styles.activeLink }}>Órdenes</Link>
                    </nav>
                </div>

                <div style={styles.logoutContainer}>
                    <button onClick={handleLogout} style={styles.logoutButton}>🚪 Cerrar Sesión</button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>Nueva Orden de Compra</h2>
                        <p style={styles.pageSubtitle}>Crea una nueva orden de compra</p>
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
                    <div style={styles.row2Cols}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Proveedor *</label>
                            <input
                                type="text"
                                placeholder="Selecciona proveedor"
                                value={proveedor}
                                onChange={(e) => setProveedor(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Fecha de la Orden *</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Tabla de Productos de la Orden */}
                    <div style={{ marginTop: '25px' }}>
                        <label style={{ ...styles.label, marginBottom: '10px', display: 'block' }}>Productos</label>
                        <div style={styles.subTableCard}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.trHead}>
                                        <th style={styles.th}>Productos</th>
                                        <th style={styles.th}>Cantidad</th>
                                        <th style={styles.th}>Precio Unitario</th>
                                        <th style={styles.th}>Subtotal</th>
                                        <th style={styles.th}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosOrden.map((prod) => (
                                        <tr key={prod.id} style={styles.trBody}>
                                            <td style={styles.td}>{prod.producto}</td>
                                            <td style={styles.td}>{prod.cantidad}</td>
                                            <td style={styles.td}>${prod.precioUnitario.toLocaleString()}</td>
                                            <td style={styles.td}>${(prod.cantidad * prod.precioUnitario).toLocaleString()}</td>
                                            <td style={styles.td}>
                                                <button type="button" style={{ ...styles.actionBtn, color: '#ef4444' }}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button type="button" style={styles.addProdBtn}>+ Agregar Producto</button>
                    </div>

                    <div style={styles.bottomSection}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Observaciones</label>
                            <textarea
                                placeholder="Agregar observaciones..."
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={3}
                                style={{ ...styles.input, resize: 'none', height: '80px' }}
                            />
                        </div>
                        <div style={styles.totalBox}>
                            <span style={styles.totalLabel}>Total:</span>
                            <span style={styles.totalAmount}>${totalOrden.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={styles.footerButtons}>
                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            ✓ Registrar Orden
                        </button>
                        <button type="button" onClick={() => { setProveedor(''); setObservaciones(''); }} style={styles.clearBtn}>
                            🔄 Limpiar
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
    row2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
    subTableCard: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden', marginTop: '5px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    trHead: { backgroundColor: '#070a14', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '12px 15px', fontWeight: '600' },
    trBody: { borderBottom: '1px solid #1e293b' },
    td: { padding: '12px 15px', color: '#cbd5e1' },
    addProdBtn: { backgroundColor: 'transparent', color: '#38bdf8', border: '1px dashed #38bdf8', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '10px' },
    bottomSection: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginTop: '20px', alignItems: 'center' },
    totalBox: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: '16px', fontWeight: 'bold', color: '#94a3b8' },
    totalAmount: { fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' },
    footerButtons: { display: 'flex', gap: '15px', marginTop: '25px', borderTop: '1px solid #1e293b', paddingTop: '20px' },
    submitBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    clearBtn: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }
};