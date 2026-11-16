import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

const PAGE_SIZE = 5;
const STOCK_BAJO = 10; // hasta este valor se considera "Stock bajo"
const MAX_IMAGE_MB = 2;
const BUCKET = 'productos';

const emptyForm = () => ({
    descripcion: '',
    codigo: '',
    id_categoria: '',
    id_proveedor: '',
    stock: '',
    precio: '',
    imagen_url: ''
});

const formatPrecio = (n: any) => `$${Number(n || 0).toLocaleString('es-CO')}`;

// Estado calculado a partir del stock
const getEstado = (stock: any): 'Agotado' | 'Stock bajo' | 'Disponible' => {
    const s = Number(stock) || 0;
    if (s <= 0) return 'Agotado';
    if (s <= STOCK_BAJO) return 'Stock bajo';
    return 'Disponible';
};

export default function InventoryList() {
    const navigate = useNavigate();

    const [adminName, setAdminName] = useState('SuperAdmin');
    const [productos, setProductos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [saving, setSaving] = useState(false);

    // Imagen del producto (opcional)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');

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
        fetchProductos();
        fetchCategorias();
        fetchProveedores();
    }, []);

    // Vista previa de la imagen elegida
    useEffect(() => {
        if (!imageFile) return;
        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const fetchProductos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('referencia')
            .select('*')
            .order('id', { ascending: true });
        if (error) {
            console.error('Error al cargar el inventario:', error);
            setError('No se pudo cargar el inventario.');
        } else {
            setProductos(data || []);
            setError('');
        }
        setLoading(false);
    };

    const fetchCategorias = async () => {
        const { data, error } = await supabase.from('categoria').select('*');
        if (error) console.error('Error al cargar categorías:', error);
        else setCategorias(data || []);
    };

    const fetchProveedores = async () => {
        const { data, error } = await supabase.from('proveedor').select('*');
        if (error) console.error('Error al cargar proveedores:', error);
        else setProveedores(data || []);
    };

    const getCategoriaNombre = (id: any) =>
        categorias.find(c => String(c.id_categoria) === String(id))?.descripcion || '-';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('El archivo debe ser una imagen.');
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            alert(`La imagen no puede pesar más de ${MAX_IMAGE_MB} MB.`);
            return;
        }
        setImageFile(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData({ ...formData, imagen_url: '' });
    };

    const resetImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const openNew = () => {
        setEditingId(null);
        setFormData(emptyForm());
        resetImage();
        setIsFormOpen(true);
    };

    const openEdit = (p: any) => {
        const prov = proveedores.find(pr => String(pr.id_referencia) === String(p.id));
        setEditingId(p.id);
        setFormData({
            descripcion: p.descripcion || '',
            codigo: p.codigo || '',
            id_categoria: p.id_categoria ? String(p.id_categoria) : '',
            id_proveedor: prov ? String(prov.id_proveedor) : '',
            stock: String(p.stock ?? 0),
            precio: String(p.precio ?? 0),
            imagen_url: p.imagen_url || ''
        });
        resetImage();
        setImagePreview(p.imagen_url || '');
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData(emptyForm());
        resetImage();
    };

    const handleClear = () => {
        setFormData(emptyForm());
        resetImage();
    };

    // Sube la imagen al bucket "productos" y devuelve su URL pública
    const uploadImage = async (file: File): Promise<string | null> => {
        const ext = file.name.split('.').pop() || 'png';
        const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type });
        if (error) {
            console.error('Error al subir la imagen:', error);
            return null;
        }
        return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const descripcion = formData.descripcion.trim();
        const codigo = formData.codigo.trim();
        const stock = Number(formData.stock);
        const precio = Number(formData.precio);

        if (!descripcion || !codigo || !formData.id_categoria) {
            alert('Completa el nombre, la referencia y la categoría.');
            return;
        }
        if (formData.stock === '' || Number.isNaN(stock) || stock < 0) {
            alert('El stock debe ser un número igual o mayor a 0.');
            return;
        }
        if (formData.precio === '' || Number.isNaN(precio) || precio < 0) {
            alert('El precio debe ser un número igual o mayor a 0.');
            return;
        }

        const nombreRepetido = productos.some(p =>
            p.id !== editingId &&
            (p.descripcion || '').trim().toLowerCase() === descripcion.toLowerCase()
        );
        if (nombreRepetido) {
            alert('Ya existe un producto con ese nombre.');
            return;
        }

        const codigoRepetido = productos.some(p =>
            p.id !== editingId &&
            (p.codigo || '').trim().toLowerCase() === codigo.toLowerCase()
        );
        if (codigoRepetido) {
            alert('Ya existe un producto con esa referencia.');
            return;
        }

        // Un proveedor está ligado a una sola referencia (proveedor.id_referencia)
        if (formData.id_proveedor) {
            const ligado = proveedores.find(pr =>
                String(pr.id_proveedor) === formData.id_proveedor &&
                pr.id_referencia &&
                pr.id_referencia !== editingId
            );
            if (ligado) {
                const otro = productos.find(p => p.id === ligado.id_referencia);
                const ok = window.confirm(
                    `${ligado.nombre_empresa} ya está ligado a "${otro?.descripcion || 'otro producto'}". ¿Quieres reasignarlo a este producto?`
                );
                if (!ok) return;
            }
        }

        setSaving(true);

        // Imagen (opcional)
        let imagenUrl: string | null = formData.imagen_url || null;
        if (imageFile) {
            const url = await uploadImage(imageFile);
            if (url) {
                imagenUrl = url;
            } else {
                const seguir = window.confirm('No se pudo subir la imagen. ¿Guardar el producto sin imagen?');
                if (!seguir) {
                    setSaving(false);
                    return;
                }
            }
        }

        const payload = {
            descripcion,
            codigo,
            id_categoria: Number(formData.id_categoria),
            stock,
            precio,
            imagen_url: imagenUrl
        };

        const { data: guardado, error } = editingId
            ? await supabase.from('referencia').update(payload).eq('id', editingId).select('id')
            : await supabase.from('referencia').insert([payload]).select('id');

        if (error || !guardado || guardado.length === 0) {
            setSaving(false);
            console.error('Error al guardar el producto:', error);
            alert('No se pudo guardar el producto. Revisa la consola (F12).');
            return;
        }

        // Ligar el proveedor elegido con el producto guardado
        if (formData.id_proveedor) {
            const { error: errProv } = await supabase
                .from('proveedor')
                .update({ id_referencia: guardado[0].id })
                .eq('id_proveedor', Number(formData.id_proveedor));
            if (errProv) {
                console.error('Error al ligar el proveedor:', errProv);
                alert('El producto se guardó, pero no se pudo ligar el proveedor.');
            }
        }

        setSaving(false);
        alert(editingId ? 'Producto actualizado.' : 'Producto registrado con éxito.');
        closeForm();
        fetchProductos();
        fetchProveedores();
    };

    const handleDelete = async (p: any) => {
        if (!window.confirm(`¿Eliminar "${p.descripcion}" del inventario?`)) return;
        const { error } = await supabase.from('referencia').delete().eq('id', p.id);
        if (error) {
            console.error('Error al eliminar el producto:', error);
            // 23503 = el producto está referenciado en otras tablas (órdenes, proveedores)
            if ((error as any).code === '23503') {
                alert('No se puede eliminar: el producto ya se usó en una orden o está ligado a un proveedor. Puedes dejar su stock en 0.');
            } else {
                alert('No se pudo eliminar el producto.');
            }
            return;
        }
        fetchProductos();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Búsqueda y paginación
    const term = searchTerm.toLowerCase();
    const filtered = productos.filter(p =>
        (p.descripcion || '').toLowerCase().includes(term) ||
        (p.codigo || '').toLowerCase().includes(term) ||
        getCategoriaNombre(p.id_categoria).toLowerCase().includes(term)
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibles = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const badgeStyle = (estado: string): React.CSSProperties => {
        if (estado === 'Disponible') return { ...styles.badge, backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid #22c55e' };
        if (estado === 'Stock bajo') return { ...styles.badge, backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid #eab308' };
        return { ...styles.badge, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' };
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
                        <Link to="/admin/dashboard" style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={styles.navLink}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={{ ...styles.navLink, ...styles.activeLink }}>Inventario</Link>
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

            {/* Contenido principal */}
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>
                            {isFormOpen ? (editingId ? 'Editar Producto' : 'Nuevo Producto') : 'Gestión de Inventario'}
                        </h2>
                        <p style={styles.pageSubtitle}>
                            {isFormOpen
                                ? (editingId ? 'Actualiza los datos del producto' : 'Registra un nuevo producto en inventario')
                                : 'Administra los productos de inventario'}
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
                            <button onClick={openNew} style={styles.addButton}>
                                + Registrar producto
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar producto..."
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
                                            <td colSpan={7} style={styles.emptyCell}>Cargando inventario...</td>
                                        </tr>
                                    ) : visibles.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={styles.emptyCell}>No se encontraron productos.</td>
                                        </tr>
                                    ) : (
                                        visibles.map(p => {
                                            const estado = getEstado(p.stock);
                                            return (
                                                <tr key={p.id} style={styles.trBody}>
                                                    <td style={styles.td}>{p.id}</td>
                                                    <td style={styles.td}>{p.descripcion}</td>
                                                    <td style={styles.td}>{getCategoriaNombre(p.id_categoria)}</td>
                                                    <td style={styles.td}>{p.stock}</td>
                                                    <td style={styles.td}>{formatPrecio(p.precio)}</td>
                                                    <td style={styles.td}>
                                                        <span style={badgeStyle(estado)}>{estado}</span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.actionButtons}>
                                                            <button onClick={() => openEdit(p)} style={styles.iconBtn} title="Editar">✏️</button>
                                                            <button onClick={() => handleDelete(p)} style={styles.iconBtn} title="Eliminar">🗑️</button>
                                                        </div>
                                                    </td>
                                                </tr>
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
                        <div style={styles.card}>
                            <div style={styles.formLayout}>
                                {/* Imagen */}
                                <div>
                                    <label style={styles.imageBox}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Vista previa" style={styles.imagePreview} />
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '48px' }}>📷</span>
                                                <span style={styles.imageText}>Selecciona imagen</span>
                                                <span style={styles.imageHint}>(opcional)</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {imagePreview && (
                                        <button type="button" onClick={removeImage} style={styles.removeImageBtn}>
                                            Quitar imagen
                                        </button>
                                    )}
                                </div>

                                {/* Campos */}
                                <div style={styles.grid2Cols}>
                                    <div>
                                        <label style={styles.labelField}>Nombre del Producto *</label>
                                        <input
                                            type="text"
                                            name="descripcion"
                                            placeholder="Ingrese el nombre del producto"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Referencia *</label>
                                        <input
                                            type="text"
                                            name="codigo"
                                            placeholder="Ingrese la referencia (ej: NKD-125)"
                                            value={formData.codigo}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Categoría *</label>
                                        <select
                                            name="id_categoria"
                                            value={formData.id_categoria}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Selecciona la categoría</option>
                                            {categorias.map(c => (
                                                <option key={c.id_categoria} value={c.id_categoria}>
                                                    {c.descripcion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Proveedor</label>
                                        <select
                                            name="id_proveedor"
                                            value={formData.id_proveedor}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                        >
                                            <option value="">Selecciona el proveedor</option>
                                            {proveedores.map(pr => (
                                                <option key={pr.id_proveedor} value={pr.id_proveedor}>
                                                    {pr.nombre_empresa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Precio (COP) *</label>
                                        <input
                                            type="number"
                                            name="precio"
                                            min={0}
                                            step={100}
                                            placeholder="Ingrese el precio"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Stock *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            min={0}
                                            step={1}
                                            placeholder="Ingrese la cantidad"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.footerActions}>
                            <button type="submit" style={styles.saveBtn} disabled={saving}>
                                {saving ? 'Guardando...' : editingId ? '💾 Guardar cambios' : '💾 Registrar Producto'}
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

// Estilos Ciber-Industrial (mismos que Servicios y Citas)
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
    emptyCell: { textAlign: 'center', padding: '20px', color: '#94a3b8' },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 },
    actionButtons: { display: 'flex', gap: '10px' },
    iconBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
    errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
    pagination: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' },
    pageBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
    pageBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6', color: '#fff' },
    card: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    formLayout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '25px', alignItems: 'start' },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    imageBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', height: '210px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', boxSizing: 'border-box' },
    imagePreview: { width: '100%', height: '100%', objectFit: 'cover' },
    imageText: { fontSize: '13px', color: '#e2e8f0', fontWeight: 600 },
    imageHint: { fontSize: '12px', color: '#64748b' },
    removeImageBtn: { marginTop: '8px', width: '100%', backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '6px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' },
    labelField: { fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
    footerActions: { display: 'flex', gap: '15px', marginTop: '20px' },
    saveBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)' },
    cancelBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};