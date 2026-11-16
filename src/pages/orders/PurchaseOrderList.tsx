import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

const PAGE_SIZE = 5;
const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Hoy en formato YYYY-MM-DD (hora local)
const today = () => new Date().toLocaleDateString('en-CA');

// "2026-11-07" -> "07-Nov-26"
const formatFecha = (s: string): string => {
    if (!s) return '-';
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return s;
    return `${m[3]}-${NOMBRES_MES[Number(m[2]) - 1]}-${m[1].slice(2)}`;
};

const formatCOP = (n: any) => `$${Number(n || 0).toLocaleString('es-CO')}`;

const emptyHeader = () => ({
    id_proveedor: '',
    fecha: today(),
    observaciones: ''
});

const emptyItem = () => ({
    id_referencia: '',
    cantidad: '1',
    precio: ''
});

export default function PurchaseOrderList() {
    const navigate = useNavigate();

    const [adminName, setAdminName] = useState('SuperAdmin');
    const [ordenes, setOrdenes] = useState<any[]>([]);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [referencias, setReferencias] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Formulario
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [header, setHeader] = useState(emptyHeader());
    const [itemSel, setItemSel] = useState(emptyItem());
    const [items, setItems] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

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
        fetchOrdenes();
        fetchProveedores();
        fetchReferencias();
    }, []);

    const fetchOrdenes = async () => {
        setLoading(true);
        const { data: ords, error: errO } = await supabase
            .from('orden_compra')
            .select('*')
            .order('id_orden_compra', { ascending: false });
        const { data: dets, error: errD } = await supabase
            .from('detalle_orden_compra')
            .select('*');

        if (errO || errD) {
            console.error('Error al cargar órdenes de compra:', errO || errD);
            setError('No se pudieron cargar las órdenes de compra.');
        } else {
            setOrdenes(ords || []);
            setDetalles(dets || []);
            setError('');
        }
        setLoading(false);
    };

    const fetchProveedores = async () => {
        const { data, error } = await supabase.from('proveedor').select('*');
        if (error) console.error('Error al cargar proveedores:', error);
        else setProveedores(data || []);
    };

    const fetchReferencias = async () => {
        const { data, error } = await supabase.from('referencia').select('*').order('descripcion', { ascending: true });
        if (error) console.error('Error al cargar productos:', error);
        else setReferencias(data || []);
    };

    const getProveedorNombre = (id: any) =>
        proveedores.find(p => String(p.id_proveedor) === String(id))?.nombre_empresa || `Proveedor #${id}`;

    const getProductoNombre = (id: any) =>
        referencias.find(r => String(r.id) === String(id))?.descripcion || `Producto #${id}`;

    const detallesDe = (idOrden: number) => detalles.filter(d => d.id_orden_compra === idOrden);

    const totalDe = (o: any) => {
        const suma = detallesDe(o.id_orden_compra)
            .reduce((s, d) => s + Number(d.cantidad) * Number(d.precio_unitario), 0);
        return Number(o.total) > 0 ? Number(o.total) : suma;
    };

    // ---------- Formulario ----------
    const openForm = () => {
        setHeader(emptyHeader());
        setItemSel(emptyItem());
        setItems([]);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setHeader(emptyHeader());
        setItemSel(emptyItem());
        setItems([]);
    };

    const handleClear = () => {
        setHeader(emptyHeader());
        setItemSel(emptyItem());
        setItems([]);
    };

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setHeader({ ...header, [name]: value });
    };

    // Al elegir un producto se sugiere su precio actual (se puede cambiar)
    const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const ref = referencias.find(r => String(r.id) === id);
        setItemSel({
            ...itemSel,
            id_referencia: id,
            precio: ref && ref.precio ? String(ref.precio) : itemSel.precio
        });
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItemSel({ ...itemSel, [name]: value });
    };

    const handleAddItem = () => {
        const ref = referencias.find(r => String(r.id) === itemSel.id_referencia);
        const cantidad = Number(itemSel.cantidad);
        const precio = Number(itemSel.precio);

        if (!ref) { alert('Selecciona un producto.'); return; }
        if (Number.isNaN(cantidad) || cantidad <= 0) { alert('La cantidad debe ser mayor a 0.'); return; }
        if (itemSel.precio === '' || Number.isNaN(precio) || precio < 0) { alert('Ingresa un precio unitario válido.'); return; }
        if (items.some(i => i.id_referencia === ref.id)) {
            alert('Ese producto ya está en la lista. Elimínalo si quieres cambiar su cantidad o precio.');
            return;
        }

        setItems([...items, {
            id_referencia: ref.id,
            nombre: ref.descripcion,
            cantidad,
            precio,
            subtotal: cantidad * precio
        }]);
        setItemSel(emptyItem());
    };

    const handleRemoveItem = (idReferencia: number) => {
        setItems(items.filter(i => i.id_referencia !== idReferencia));
    };

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!header.id_proveedor) { alert('Selecciona un proveedor.'); return; }
        if (!header.fecha) { alert('Selecciona la fecha de la orden.'); return; }
        if (items.length === 0) { alert('Agrega al menos un producto.'); return; }

        setSaving(true);
        // La función de la base de datos guarda la orden, sus productos y suma el stock en un solo paso
        const { error } = await supabase.rpc('registrar_orden_compra', {
            p_id_proveedor: Number(header.id_proveedor),
            p_fecha: header.fecha,
            p_descripcion: header.observaciones.trim() || null,
            p_items: items.map(i => ({
                id_referencia: i.id_referencia,
                cantidad: i.cantidad,
                precio_unitario: i.precio
            }))
        });
        setSaving(false);

        if (error) {
            console.error('Error al registrar la orden de compra:', error);
            alert('No se pudo registrar la orden de compra. Revisa la consola (F12).');
            return;
        }

        alert('Orden de compra registrada. El stock de los productos se actualizó.');
        closeForm();
        fetchOrdenes();
        fetchReferencias();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // ---------- Lista ----------
    const term = searchTerm.toLowerCase();
    const filtered = ordenes.filter(o =>
        getProveedorNombre(o.id_proveedor).toLowerCase().includes(term) ||
        String(o.id_orden_compra).includes(term)
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibles = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        <Link to="/reports" style={styles.navLink}>Reportes</Link>
                        <Link to="/register" style={styles.navLink}>Registro</Link>
                        <Link to="/orders" style={{ ...styles.navLink, ...styles.activeLink }}>Órdenes</Link>
                    </nav>
                </div>

                <div style={styles.logoutContainer}>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>
                            {isFormOpen ? 'Nueva Orden de Compra' : 'Órdenes de Compra'}
                        </h2>
                        <p style={styles.pageSubtitle}>
                            {isFormOpen ? 'Crea una nueva orden de compra' : 'Administra las órdenes de compra a proveedores'}
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

                {!isFormOpen ? (
                    <>
                        <div style={styles.toolbar}>
                            <button onClick={openForm} style={styles.addButton}>
                                + Nueva Orden
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar por proveedor o número..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                style={styles.searchBox}
                            />
                        </div>

                        {error && <div style={styles.errorAlert}>{error}</div>}

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.trHead}>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Proveedor</th>
                                        <th style={styles.th}>Fecha</th>
                                        <th style={styles.th}>Productos</th>
                                        <th style={styles.th}>Total</th>
                                        <th style={styles.th}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} style={styles.emptyCell}>Cargando órdenes...</td>
                                        </tr>
                                    ) : visibles.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={styles.emptyCell}>No hay órdenes de compra.</td>
                                        </tr>
                                    ) : (
                                        visibles.map(o => {
                                            const dets = detallesDe(o.id_orden_compra);
                                            const abierto = expandedId === o.id_orden_compra;
                                            return (
                                                <React.Fragment key={o.id_orden_compra}>
                                                    <tr style={styles.trBody}>
                                                        <td style={styles.td}>{o.id_orden_compra}</td>
                                                        <td style={styles.td}>{getProveedorNombre(o.id_proveedor)}</td>
                                                        <td style={styles.td}>{formatFecha(o.fecha)}</td>
                                                        <td style={styles.td}>{dets.length}</td>
                                                        <td style={styles.td}>{formatCOP(totalDe(o))}</td>
                                                        <td style={styles.td}>
                                                            <button
                                                                onClick={() => setExpandedId(abierto ? null : o.id_orden_compra)}
                                                                style={styles.linkBtn}
                                                            >
                                                                {abierto ? 'Ocultar' : 'Ver detalle'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {abierto && (
                                                        <tr style={styles.trBody}>
                                                            <td colSpan={6} style={styles.detailCell}>
                                                                {o.descripcion && (
                                                                    <p style={styles.detailNote}>Observaciones: {o.descripcion}</p>
                                                                )}
                                                                {dets.length === 0 ? (
                                                                    <p style={styles.detailNote}>Esta orden no tiene productos registrados.</p>
                                                                ) : (
                                                                    dets.map(d => (
                                                                        <div key={d.id_detalle_compra} style={styles.detailRow}>
                                                                            <span style={{ flex: 3 }}>{getProductoNombre(d.id_referencia)}</span>
                                                                            <span style={{ flex: 1, textAlign: 'center' }}>{d.cantidad} und.</span>
                                                                            <span style={{ flex: 1, textAlign: 'right' }}>{formatCOP(d.precio_unitario)}</span>
                                                                            <span style={{ flex: 1, textAlign: 'right' }}>
                                                                                {formatCOP(Number(d.cantidad) * Number(d.precio_unitario))}
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div style={styles.pagination}>
                            <button
                                style={styles.pageBtn}
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                Anterior
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    style={{ ...styles.pageBtn, ...(n === currentPage ? styles.pageBtnActive : {}) }}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                style={styles.pageBtn}
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSave}>
                        {/* Proveedor y fecha */}
                        <div style={styles.card}>
                            <div style={styles.grid2Cols}>
                                <div>
                                    <label style={styles.labelField}>Proveedor *</label>
                                    <select
                                        name="id_proveedor"
                                        value={header.id_proveedor}
                                        onChange={handleHeaderChange}
                                        style={styles.input}
                                        required
                                    >
                                        <option value="">Selecciona proveedor</option>
                                        {proveedores.map(p => (
                                            <option key={p.id_proveedor} value={p.id_proveedor}>
                                                {p.nombre_empresa}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.labelField}>Fecha de la Orden *</label>
                                    <input
                                        type="date"
                                        name="fecha"
                                        value={header.fecha}
                                        onChange={handleHeaderChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Productos */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Productos</h3>

                            <div style={styles.addRow}>
                                <select
                                    value={itemSel.id_referencia}
                                    onChange={handleProductoChange}
                                    style={{ ...styles.input, flex: 3 }}
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {referencias.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.descripcion} (stock: {r.stock})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    name="cantidad"
                                    min={1}
                                    step={1}
                                    placeholder="Cantidad"
                                    value={itemSel.cantidad}
                                    onChange={handleItemChange}
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <input
                                    type="number"
                                    name="precio"
                                    min={0}
                                    step={100}
                                    placeholder="Precio unitario"
                                    value={itemSel.precio}
                                    onChange={handleItemChange}
                                    style={{ ...styles.input, flex: 1.5 }}
                                />
                                <button type="button" onClick={handleAddItem} style={styles.addProductBtn}>
                                    + Agregar Producto
                                </button>
                            </div>

                            <div style={styles.tableHeaderRow}>
                                <span style={{ flex: 3 }}>Producto</span>
                                <span style={{ flex: 1, textAlign: 'center' }}>Cantidad</span>
                                <span style={{ flex: 1.5, textAlign: 'right' }}>Precio Unitario</span>
                                <span style={{ flex: 1.5, textAlign: 'right' }}>Subtotal</span>
                                <span style={{ width: 36 }} />
                            </div>

                            {items.length === 0 ? (
                                <p style={styles.emptyText}>No hay productos agregados</p>
                            ) : (
                                items.map(i => (
                                    <div key={i.id_referencia} style={styles.tableBodyRow}>
                                        <span style={{ flex: 3 }}>{i.nombre}</span>
                                        <span style={{ flex: 1, textAlign: 'center' }}>{i.cantidad}</span>
                                        <span style={{ flex: 1.5, textAlign: 'right' }}>{formatCOP(i.precio)}</span>
                                        <span style={{ flex: 1.5, textAlign: 'right' }}>{formatCOP(i.subtotal)}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(i.id_referencia)}
                                            style={{ ...styles.iconBtn, width: 36 }}
                                            title="Quitar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Observaciones y total */}
                        <div style={styles.bottomRow}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.labelField}>Observaciones</label>
                                <textarea
                                    name="observaciones"
                                    placeholder="Agregar observaciones..."
                                    value={header.observaciones}
                                    onChange={handleHeaderChange}
                                    style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                                />
                            </div>
                            <div style={styles.totalBox}>
                                <span style={styles.totalLabel}>Total:</span>
                                <span style={styles.totalValue}>{formatCOP(total)}</span>
                            </div>
                        </div>

                        <div style={styles.footerActions}>
                            <button type="submit" style={styles.saveBtn} disabled={saving}>
                                {saving ? 'Registrando...' : '✔ Registrar Orden'}
                            </button>
                            <button type="button" onClick={handleClear} style={styles.cancelBtn}>
                                🔄 Limpiar
                            </button>
                            <button type="button" onClick={closeForm} style={styles.cancelBtn}>
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}

// Estilos Ciber-Industrial (mismos que Servicios, Citas e Inventario)
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
    searchBox: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 15px', color: '#fff', width: '280px', outline: 'none' },
    tableContainer: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    trHead: { borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '15px' },
    trBody: { borderBottom: '1px solid #1e293b', fontSize: '14px' },
    td: { padding: '15px' },
    emptyCell: { textAlign: 'center', padding: '20px', color: '#94a3b8' },
    linkBtn: { backgroundColor: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' },
    detailCell: { padding: '10px 20px 18px', backgroundColor: '#080c18' },
    detailNote: { color: '#94a3b8', fontSize: '13px', margin: '6px 0' },
    detailRow: { display: 'flex', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #1e293b', color: '#e2e8f0' },
    errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
    pagination: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' },
    pageBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
    pageBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6', color: '#fff' },
    card: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#3b82f6' },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    labelField: { fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
    addRow: { display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' },
    addProductBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 0 10px rgba(29, 78, 216, 0.3)' },
    tableHeaderRow: { display: 'flex', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' },
    tableBodyRow: { display: 'flex', alignItems: 'center', fontSize: '14px', padding: '8px 0', borderBottom: '1px solid #1e293b' },
    emptyText: { textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '15px 0' },
    iconBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
    bottomRow: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
    totalBox: { minWidth: '220px', backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
    totalLabel: { fontSize: '14px', color: '#94a3b8' },
    totalValue: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' },
    footerActions: { display: 'flex', gap: '15px', marginTop: '20px' },
    saveBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)' },
    cancelBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};