import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../assets/logo.png';
import { supabase } from '../api/supabaseCliente';

export default function Register() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'empleado'>('cliente');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        try {
            setLoading(true);
            const tablaDestino = tipoUsuario === 'empleado' ? 'empleado' : 'cliente';

            const { error: insertError } = await supabase
                .from(tablaDestino)
                .insert([
                    {
                        nombre: nombre,
                        correo: correo,
                        telefono: telefono,
                        credenciales: password
                    }
                ]);

            if (insertError) throw insertError;

            setSuccess('¡Usuario registrado con éxito en Supabase!');
            setTimeout(() => {
                navigate('/users');
            }, 1500);

        } catch (err: any) {
            console.error('Error al registrar:', err);
            setError('Error al registrar el usuario en la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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
                        <Link to={homeRoute} style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={{ ...styles.navLink, ...styles.activeLink }}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={styles.navLink}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
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
                        <h2 style={styles.pageTitle}>Registrar Nuevo Usuario</h2>
                        <p style={styles.pageSubtitle}>Ingresa un nuevo cliente o empleado al sistema</p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{userName}</p>
                            <span style={styles.userRole}>{userRole}</span>
                        </div>
                    </div>
                </header>

                <div style={styles.formContainer}>
                    <form onSubmit={handleRegister} style={styles.formGrid}>
                        <div style={styles.fieldsColumn}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tipo de Registro *</label>
                                <select
                                    value={tipoUsuario}
                                    onChange={(e) => setTipoUsuario(e.target.value as 'cliente' | 'empleado')}
                                    style={styles.input}
                                >
                                    <option value="cliente">Cliente</option>
                                    <option value="empleado">Empleado</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nombre Completo *</label>
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
                                    type="email"
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
                                <label style={styles.label}>Contraseña / Credencial *</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirmar Contraseña *</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            {error && <p style={styles.errorText}>{error}</p>}
                            {success && <p style={styles.successText}>{success}</p>}

                            <div style={styles.buttonRow}>
                                <button type="submit" disabled={loading} style={styles.submitBtn}>
                                    {loading ? 'Registrando...' : ' Registrar Usuario'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setNombre(''); setCorreo(''); setTelefono(''); setPassword(''); setConfirmPassword(''); }}
                                    style={styles.clearBtn}
                                >
                                    🔄 Limpiar
                                </button>
                            </div>
                        </div>

                        {/* Tarjeta Lateral Decorativa */}
                        <div style={styles.cardPreview}>
                            <div style={styles.previewAvatar}>👤</div>
                            <h3 style={styles.previewTitle}>Agregar Usuario</h3>
                            <p style={styles.previewDesc}>Completa la información para registrar un nuevo usuario directamente en Supabase.</p>
                        </div>
                    </form>
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
    formContainer: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px', alignItems: 'start' },
    fieldsColumn: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
    buttonRow: { display: 'flex', gap: '15px', marginTop: '10px' },
    submitBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    clearBtn: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    errorText: { color: '#ef4444', fontSize: '13px', margin: 0 },
    successText: { color: '#10b981', fontSize: '13px', margin: 0 },
    cardPreview: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '12px', padding: '35px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' },
    previewAvatar: { fontSize: '48px', backgroundColor: '#0d1322', padding: '20px', borderRadius: '50%', border: '2px solid #3b82f6', marginBottom: '15px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' },
    previewTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' },
    previewDesc: { fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }
};