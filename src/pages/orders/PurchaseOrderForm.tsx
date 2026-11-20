import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { orderService } from '../../api/orderService';

interface ItemOrden {
    id: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
}

export default function PurchaseOrderForm() {
    const navigate = useNavigate();

    const [proveedor, setProveedor] = useState('');
    const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
    const [observaciones, setObservaciones] = useState('');
    const [items, setItems] = useState<ItemOrden[]>([
        { id: 1, producto: 'Aceite Mobil 20W50', cantidad: 10, precioUnitario: 35000 },
        { id: 2, producto: 'Filtro de aceite', cantidad: 10, precioUnitario: 15000 }
    ]);
    const [guardando, setGuardando] = useState(false);

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

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const total = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);

    const agregarProducto = () => {
        setItems((prev) => [
            ...prev,
            { id: Date.now(), producto: '', cantidad: 1, precioUnitario: 0 }
        ]);
    };

    const actualizarItem = (id: number, campo: keyof ItemOrden, valor: string | number) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
        );
    };

    const eliminarItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const limpiarFormulario = () => {
        setProveedor('');
        setObservaciones('');
        setItems([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!proveedor.trim()) {
            alert('Por favor ingresa el proveedor.');
            return;
        }

        try {
            setGuardando(true);

            const resumenProductos = items
                .filter((i) => i.producto.trim() !== '')
                .map((i) => `${i.producto} (x${i.cantidad})`)
                .join(', ');

            const descripcionArmada = [
                `Proveedor: ${proveedor.trim()}`,
                `Fecha: ${fecha}`,
                resumenProductos ? `Productos: ${resumenProductos}` : '',
                observaciones.trim() ? `Obs: ${observaciones.trim()}` : '',
                `Total: $${total.toLocaleString()}`
            ]
                .filter(Boolean)
                .join(' | ');

            const esIdNumerico = /^\d+$/.test(proveedor.trim());

            await orderService.createPurchaseOrder({
                descripcion: descripcionArmada,
                id_proveedor: esIdNumerico ? Number(proveedor.trim()) : null
            });

            navigate('/orders');
        } catch (err) {
            console.error('Error al registrar orden:', err);
            alert('Error al registrar la orden en el sistema.');
        } finally {
            setGuardando(false);
        }
    };

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
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Proveedor *</label>
                            <input
                                type="text"
                                value={proveedor}
                                onChange={(e) => setProveedor(e.target.value)}
                                placeholder="Nombre o ID de proveedor"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Fecha de la Orden *</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.section}>
                        <label style={styles.label}>Productos</label>
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
                                {items.map((item) => (
                                    <tr key={item.id} style={styles.trBody}>
                                        <td style={styles.td}>
                                            <input
                                                type="text"
                                                value={item.producto}
                                                onChange={(e) => actualizarItem(item.id, 'producto', e.target.value)}
                                                placeholder="Producto"
                                                style={styles.input}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.cantidad}
                                                onChange={(e) => actualizarItem(item.id, 'cantidad', Number(e.target.value))}
                                                style={{ ...styles.input, width: '90px' }}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.precioUnitario}
                                                onChange={(e) =>
                                                    actualizarItem(item.id, 'precioUnitario', Number(e.target.value))
                                                }
                                                style={{ ...styles.input, width: '130px' }}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            ${(item.cantidad * item.precioUnitario).toLocaleString()}
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                type="button"
                                                onClick={() => eliminarItem(item.id)}
                                                style={styles.deleteBtn}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button type="button" onClick={agregarProducto} style={styles.secondaryBtn}>
                            + Agregar Producto
                        </button>
                    </div>

                    <div style={styles.section}>
                        <label style={styles.label}>Observaciones</label>
                        <textarea
                            rows={3}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Agregar observaciones..."
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.totalBox}>
                        <span>Total:</span>
                        <strong>${total.toLocaleString()}</strong>
                    </div>

                    <div style={styles.actions}>
                        <button type="submit" disabled={guardando} style={styles.primaryBtn}>
                            {guardando ? 'Guardando...' : '✓ Registrar Orden'}
                        </button>
                        <button type="button" onClick={limpiarFormulario} style={styles.clearBtn}>
                            Limpiar
                        </button>
                    </div>
                </form>
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
    formCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    section: { display: 'flex', flexDirection: 'column', gap: '12px' },
    label: { fontSize: '13px', color: '#94a3b8', fontWeight: 600 },
    input: { backgroundColor: '#070a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    textarea: { backgroundColor: '#070a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    trHead: { borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '10px' },
    trBody: { borderBottom: '1px solid #1e293b' },
    td: { padding: '10px', color: '#cbd5e1' },
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ef4444' },
    secondaryBtn: { alignSelf: 'flex-start', backgroundColor: '#070a14', color: '#fff', border: '1px solid #1e293b', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    totalBox: { display: 'flex', justifyContent: 'flex-end', gap: '16px', fontSize: '18px', paddingTop: '10px', borderTop: '1px solid #1e293b' },
    actions: { display: 'flex', gap: '12px' },
    primaryBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
    clearBtn: { backgroundColor: '#1e293b', color: '#cbd5e1', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }
};