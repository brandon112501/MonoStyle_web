import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../assets/logo.png';
import { authService } from '../api/authService';

export default function Register() {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: '',
        especialidad: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [adminName, setAdminName] = useState('SuperAdmin');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setAdminName(userData.username || userData.nombre || 'SuperAdmin');
            } catch (e) {
                console.error("Error al obtener usuario:", e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (formData.contrasena !== formData.confirmarContrasena) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nombre: formData.nombre,
                email: formData.correo,
                password: formData.contrasena,
                telefono: formData.telefono,
                rol: formData.rol,
                especialidad: formData.especialidad
            };

            await authService.register(payload);
            setSuccess(true);
            setTimeout(() => {
                navigate('/users');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al registrar la cuenta');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleClear = () => {
        setFormData({
            nombre: '',
            correo: '',
            telefono: '',
            contrasena: '',
            confirmarContrasena: '',
            rol: '',
            especialidad: ''
        });
        setError('');
        setSuccess(false);
    };

    return (
        <div style={styles.container}>
            {/* Barra lateral idéntica al panel */}
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
                        <Link to="/register" style={{ ...styles.navLink, ...styles.activeLink }}>Registro</Link>
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
                        <h2 style={styles.pageTitle}>Nuevo Registro</h2>
                        <p style={styles.pageSubtitle}>Registra un nuevo Usuario o Empleado</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{adminName}</p>
                            <span style={styles.userRole}>Administrador</span>
                        </div>
                    </div>
                </header>

                <div style={styles.formCard}>
                    {error && <div style={styles.errorAlert}>{error}</div>}
                    {success && <div style={styles.successAlert}>¡Usuario registrado con éxito! Redirigiendo...</div>}

                    <form onSubmit={handleSubmit} style={styles.formGrid}>
                        {/* Columna Izquierda */}
                        <div style={styles.column}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ingrese el nombre completo"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    name="correo"
                                    placeholder="correo@ejemplo.com"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Teléfono *</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    placeholder="Ingrese el número telefónico"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Contraseña *</label>
                                <input
                                    type="password"
                                    name="contrasena"
                                    placeholder="********"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirmar Contraseña *</label>
                                <input
                                    type="password"
                                    name="confirmarContrasena"
                                    placeholder="********"
                                    value={formData.confirmarContrasena}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Rol *</label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                >
                                    <option value="">Selecciona el rol</option>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Empleado">Empleado</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div style={styles.column}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Especialidad (solo empleados)</label>
                                <input
                                    type="text"
                                    name="especialidad"
                                    placeholder="Escribe la especialidad"
                                    value={formData.especialidad}
                                    onChange={handleChange}
                                    style={styles.input}
                                    disabled={formData.rol !== 'Empleado'}
                                />
                            </div>

                            <div style={styles.infoBox}>
                                <p style={styles.infoText}>Completa la información para hacer un nuevo registro</p>
                            </div>

                            <div style={styles.actionButtons}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={styles.submitButton}
                                >
                                    {loading ? 'Registrando...' : '➕ Registrar Usuario'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    style={styles.resetButton}
                                >
                                    🔄 Limpiar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

// Estilos del panel de administración
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
    formCard: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '30px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    column: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#94a3b8', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' },
    infoBox: { padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '10px' },
    infoText: { margin: 0 },
    actionButtons: { display: 'flex', gap: '15px', marginTop: '20px' },
    submitButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)', flex: 1 },
    resetButton: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
    errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
    successAlert: { backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#22c55e', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }
};