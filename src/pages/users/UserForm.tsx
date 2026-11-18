import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function UserForm() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('Cliente');
    const [especialidad, setEspecialidad] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [userName] = useState('Jair Candil');
    const [userRole] = useState('Administrador');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleLimpiar = () => {
        setNombre('');
        setCorreo('');
        setTelefono('');
        setPassword('');
        setConfirmPassword('');
        setRol('Cliente');
        setEspecialidad('');
        setErrorMsg('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        // Validar contraseña si el rol lo requiere o si se ingresó alguna
        if (rol !== 'Cliente' || password) {
            if (password !== confirmPassword) {
                setErrorMsg('Las contraseñas no coinciden.');
                return;
            }
        }

        setLoading(true);

        try {
            let tablaDestino = 'cliente';
            let datosNuevoRegistro: any = {};

            if (rol === 'Cliente') {
                tablaDestino = 'cliente';
                datosNuevoRegistro = { nombre, correo, telefono };
            } else if (rol === 'Empleado') {
                tablaDestino = 'empleado';
                datosNuevoRegistro = { nombre, correo, telefono, password, especialidad };
            } else if (rol === 'Administrador') {
                tablaDestino = 'administrador';
                datosNuevoRegistro = { nombre, correo, telefono, password };
            }

            const { error } = await supabase.from(tablaDestino).insert([datosNuevoRegistro]);

            if (error) {
                console.error("Error al insertar:", error);
                setErrorMsg('Error al registrar en la base de datos: ' + error.message);
            } else {
                alert('¡Registro exitoso!');
                navigate('/users');
            }
        } catch (err) {
            console.error('Excepción:', err);
            setErrorMsg('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
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
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        <Link to="/reports" style={styles.navLink}>Reportes</Link>
                        <Link to="/users/new" style={{ ...styles.navLink, ...styles.activeLink }}>Registro</Link>
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
                        <p style={styles.pageSubtitle}>Registra un nuevo Usuario, Empleado o Administrador</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{userName}</p>
                            <span style={styles.userRole}>{userRole}</span>
                        </div>
                    </div>
                </header>

                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit} style={styles.formGrid}>
                        {/* Columna Izquierda */}
                        <div style={styles.column}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Ingrese el nombre completo"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Correo Electrónico *</label>
                                <input
                                    type="text"
                                    placeholder="correo@ejemplo.com"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Teléfono *</label>
                                <input
                                    type="text"
                                    placeholder="Ingrese el número telefónico"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Rol *</label>
                                <select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="Cliente">Cliente</option>
                                    <option value="Empleado">Empleado</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div style={styles.column}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Especialidad * (solo empleados)</label>
                                <select
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                    disabled={rol !== 'Empleado'}
                                    style={{
                                        ...styles.input,
                                        opacity: rol === 'Empleado' ? 1 : 0.5,
                                        cursor: rol === 'Empleado' ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <option value="">Selecciona la especialidad</option>
                                    <option value="Mecánica General">Mecánica General</option>
                                    <option value="Electricidad">Electricidad</option>
                                    <option value="Suspensión">Suspensión</option>
                                    <option value="Motor">Motor</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Contraseña * {rol === 'Cliente' ? '(Opcional)' : ''}</label>
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={rol !== 'Cliente'}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirmar Contraseña * {rol === 'Cliente' ? '(Opcional)' : ''}</label>
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={rol !== 'Cliente'}
                                    style={styles.input}
                                />
                            </div>

                            {errorMsg && (
                                <div style={styles.errorBox}>
                                    {errorMsg}
                                </div>
                            )}

                            <div style={styles.rightBottomContainer}>
                                <p style={styles.infoText}>Completa la información para hacer un nuevo registro</p>
                                <div style={styles.buttonGroup}>
                                    <button
                                        type="button"
                                        onClick={handleLimpiar}
                                        style={styles.clearButton}
                                    >
                                        🔄 Limpiar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={styles.submitButton}
                                    >
                                        {loading ? 'Registrando...' : '→ Registrar Usuario'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
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
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    column: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' },
    errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '13px' },
    rightBottomContainer: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' },
    infoText: { color: '#64748b', fontSize: '13px', textAlign: 'right', margin: 0 },
    buttonGroup: { display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' },
    submitButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    clearButton: { backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #1e293b', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }
};