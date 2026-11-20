import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

interface ProductoRow {
    id: any;
    columnaId: string;
    columnaStock: string;
    tieneEstadoEnBd: boolean;
    producto: string;
    categoria: string;
    stock: number;
    precio: number;
    estado: string;
}

export default function InventoryList() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState<ProductoRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [editandoId, setEditandoId] = useState<any>(null);
    const [stockTemporal, setStockTemporal] = useState<number>(0);

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

        fetchProductos();
    }, []);

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const calcularEstadoStock = (stockNum: number, estadoActual?: string) => {
        if (stockNum <= 0) return 'Agotado';
        if (stockNum <= 5) return 'Stock bajo';
        return estadoActual && estadoActual !== 'Stock bajo' && estadoActual !== 'Agotado'
            ? estadoActual
            : 'Disponible';
    };

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('referencia').select('*');
            if (error) throw error;

            const mapeados: ProductoRow[] = (data || []).map((p: any) => {
                const colId = 'id_referencia' in p ? 'id_referencia' : 'id';
                const colStock = 'stock' in p ? 'stock' : 'cantidad';
                const tieneEstado = 'estado' in p;
                const stockVal = Number(p[colStock] ?? 0);

                return {
                    id: p[colId],
                    columnaId: colId,
                    columnaStock: colStock,
                    tieneEstadoEnBd: tieneEstado,
                    producto: p.nombre || p.producto || p.descripcion || 'Sin nombre',
                    categoria: p.categoria || (p.id_categoria ? `Categoría ${p.id_categoria}` : 'General'),
                    stock: stockVal,
                    precio: Number(p.precio ?? 0),
                    estado: tieneEstado && p.estado ? p.estado : calcularEstadoStock(stockVal)
                };
            });

            setProductos(mapeados);
        } catch (err) {
            console.error('Error al cargar inventario:', err);
        } finally {
            setLoading(false);
        }
    };

    const iniciarEdicionStock = (prod: ProductoRow) => {
        setEditandoId(prod.id);
        setStockTemporal(prod.stock);
    };

    const guardarStock = async (prod: ProductoRow) => {
        const nuevoStock = Math.max(0, Number(stockTemporal));
        const nuevoEstado = calcularEstadoStock(nuevoStock, prod.estado);

        try {
            const payload: Record<string, any> = {
                [prod.columnaStock]: nuevoStock
            };

            if (prod.tieneEstadoEnBd) {
                payload.estado = nuevoEstado;
            }

            const { error } = await supabase
                .from('referencia')
                .update(payload)
                .eq(prod.columnaId, prod.id);

            if (error) throw error;

            setProductos((prev) =>
                prev.map((item) =>
                    item.id === prod.id
                        ? { ...item, stock: nuevoStock, estado: nuevoEstado }
                        : item
                )
            );
            setEditandoId(null);
        } catch (err) {
            console.error('Error al actualizar stock:', err);
        }
    };

    const handleDelete = async (prod: ProductoRow) => {
        try {
            const { error } = await supabase
                .from('referencia')
                .delete()
                .eq(prod.columnaId, prod.id);

            if (error) throw error;

            setProductos((prev) => prev.filter((item) => item.id !== prod.id));
        } catch (err) {
            console.error('Error al eliminar producto:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const productosFiltrados = productos.filter(
        (p) =>
            p.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    );

    const getEstadoStyle = (estado: string) => {
        const lower = estado.toLowerCase();
        if (lower.includes('agot')) return { color: '#ef4444', borderColor: '#ef4444' };
        if (lower.includes('bajo')) return { color: '#f59e0b', borderColor: '#f59e0b' };
        return { color: '#10b981', borderColor: '#10b981' };
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
                        <Link to="/inventory" style={{ ...styles.navLink, ...styles.activeLink }}>Inventario</Link>
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
                        <h2 style={styles.pageTitle}>Gestión de Inventario</h2>
                        <p style={styles.pageSubtitle}>Gestiona los productos de inventario</p>
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
                    <button onClick={() => navigate('/inventory/new')} style={styles.newButton}>
                        + Agregar producto
                    </button>

                    <div style={styles.searchContainer}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar producto..."
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
                                <th style={styles.th}>Producto</th>
                                <th style={styles.th}>Categoría</th>
                                <th style={styles.th}>Stock</th>
                                <th style={styles.th}>Precio</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Cargando inventario...
                                    </td>
                                </tr>
                            ) : productosFiltrados.length > 0 ? (
                                productosFiltrados.map((prod) => {
                                    const badgeColor = getEstadoStyle(prod.estado);
                                    const estaEditando = editandoId === prod.id;

                                    return (
                                        <tr key={prod.id} style={styles.trBody}>
                                            <td style={styles.td}>{prod.id}</td>
                                            <td style={styles.td}>{prod.producto}</td>
                                            <td style={styles.td}>{prod.categoria}</td>
                                            <td style={styles.td}>
                                                {estaEditando ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={stockTemporal}
                                                            onChange={(e) => setStockTemporal(Number(e.target.value))}
                                                            style={styles.stockInput}
                                                        />
                                                        <button
                                                            onClick={() => guardarStock(prod)}
                                                            style={styles.saveBtn}
                                                            title="Guardar stock"
                                                        >
                                                            💾
                                                        </button>
                                                        <button
                                                            onClick={() => setEditandoId(null)}
                                                            style={styles.cancelBtn}
                                                            title="Cancelar"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span>{prod.stock}</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>${prod.precio.toLocaleString()}</td>
                                            <td style={styles.td}>
                                                <span
                                                    style={{
                                                        ...styles.badge,
                                                        color: badgeColor.color,
                                                        borderColor: badgeColor.borderColor
                                                    }}
                                                >
                                                    {prod.estado}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <button
                                                    onClick={() => iniciarEdicionStock(prod)}
                                                    style={styles.editBtn}
                                                    title="Editar stock"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prod)}
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
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No se encontraron productos registrados.
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
    stockInput: { width: '70px', backgroundColor: '#070a14', color: '#fff', border: '1px solid #3b82f6', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', outline: 'none' },
    saveBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px' },
    cancelBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' },
    badge: { backgroundColor: '#070a14', border: '1px solid', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    editBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '8px' },
    deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ef4444' }
};