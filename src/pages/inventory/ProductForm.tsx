import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function ProductForm() {
    const navigate = useNavigate();

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [referencia, setReferencia] = useState('');
    const [categoria, setCategoria] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [imagen, setImagen] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Datos del usuario logueado
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

    const handleClear = () => {
        setNombre('');
        setReferencia('');
        setCategoria('');
        setProveedor('');
        setPrecio('');
        setStock('');
        setImagen(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const { error } = await supabase.from('inventario').insert([
                {
                    producto: nombre,
                    referencia: referencia,
                    categoria: categoria,
                    proveedor: proveedor,
                    precio: Number(precio),
                    stock: Number(stock),
                    estado: Number(stock) === 0 ? 'Agotado' : Number(stock) <= 5 ? 'Stock bajo' : 'Disponible'
                }
            ]);

            if (error) throw error;

            alert('¡Producto registrado con éxito en el inventario!');
            navigate('/inventory');
        } catch (err) {
            console.error('Error al registrar producto:', err);
            alert('Error al guardar el producto en la base de datos.');
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
                        <Link to="/inventory" style={{ ...styles.navLink, ...styles.activeLink }}>Inventario</Link>
                        {isAdmin && <Link to="/reports" style={styles.navLink}>Reportes</Link>}
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
                        <h2 style={styles.pageTitle}>Nuevo Producto</h2>
                        <p style={styles.pageSubtitle}>Registra un nuevo producto en inventario</p>
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
                    <div style={styles.formGrid}>
                        {/* Columna Izquierda: Imagen */}
                        <div style={styles.imageColumn}>
                            <label style={styles.imageUploadBox}>
                                <div style={styles.cameraIcon}>📷</div>
                                <span style={styles.imageText}>Selecciona Imagen</span>
                                <span style={styles.imageSubtext}>(opcional)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => e.target.files && setImagen(e.target.files[0])}
                                />
                            </label>
                            {imagen && <span style={styles.fileName}>{imagen.name}</span>}
                        </div>

                        {/* Columna Derecha: Campos del Formulario */}
                        <div style={styles.fieldsColumn}>
                            <div style={styles.row2Cols}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nombre del Producto *</label>
                                    <input
                                        type="text"
                                        placeholder="Ingrese el nombre del producto"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Referencia *</label>
                                    <input
                                        type="text"
                                        placeholder="Ingrese la referencia"
                                        value={referencia}
                                        onChange={(e) => setReferencia(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.row2Cols}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Categoría *</label>
                                    <input
                                        type="text"
                                        placeholder="Selecciona la categoría"
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Proveedor *</label>
                                    <input
                                        type="text"
                                        placeholder="Selecciona el proveedor"
                                        value={proveedor}
                                        onChange={(e) => setProveedor(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.row2Cols}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Precio *</label>
                                    <input
                                        type="number"
                                        placeholder="Ingrese el precio"
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Stock *</label>
                                    <input
                                        type="number"
                                        placeholder="Ingrese la cantidad"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones inferiores */}
                    <div style={styles.footerButtons}>
                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            💾 Registrar Producto
                        </button>
                        <button type="button" onClick={handleClear} style={styles.clearBtn}>
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
    formGrid: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '30px', alignItems: 'center' },
    imageColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    imageUploadBox: { width: '100%', height: '240px', backgroundColor: '#050811', border: '1px dashed #1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', textAlign: 'center', padding: '10px' },
    cameraIcon: { fontSize: '36px', marginBottom: '8px' },
    imageText: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    imageSubtext: { fontSize: '11px', color: '#64748b' },
    fileName: { fontSize: '11px', color: '#38bdf8', textAlign: 'center', wordBreak: 'break-all' },
    fieldsColumn: { display: 'flex', flexDirection: 'column', gap: '15px' },
    row2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
    footerButtons: { display: 'flex', gap: '15px', marginTop: '30px', borderTop: '1px solid #1e293b', paddingTop: '20px' },
    submitBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    clearBtn: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }
};