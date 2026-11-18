import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import fondoLogin from '../../assets/fondologin.png';
import { authService } from '../../api/authService';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const response: any = await authService.login(credentials);
            console.log('Respuesta del servicio:', response);

            if (response && response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Redirección dinámica basada en el rol real detectado
                if (response.rol === 'Administrador') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/employee/dashboard', { replace: true });
                }
            } else {
                setErrorMsg(response.message || 'Credenciales incorrectas o usuario no encontrado');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setErrorMsg('Ocurrió un error inesperado al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logo} />
                </div>

                <div style={styles.headerText}>
                    <h2 style={styles.title}>Bienvenido a MONOSTYLE</h2>
                    <p style={styles.subtitle}>Ingresa a tu cuenta para acceder</p>
                </div>

                {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="ej. Camilo o Empleado"
                            value={credentials.username}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Validando...' : '→ Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>¿No tienes una cuenta?</p>
                    <Link to="/register" style={styles.link}>Crear Cuenta</Link>
                </div>
            </div>
        </div>
    );
}

// Estilos Ciber-Industrial
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(5, 8, 17, 0.8), rgba(5, 8, 17, 0.9)), url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#fff'
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(13, 19, 34, 0.85)',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '40px 30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)'
    },
    logoContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    logo: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        border: '2px solid #3b82f6',
        objectFit: 'cover',
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
    },
    headerText: {
        textAlign: 'center',
        marginBottom: '25px'
    },
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: '0 0 5px 0',
        letterSpacing: '0.5px'
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '13px',
        margin: 0
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid #ef4444',
        color: '#f87171',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        textAlign: 'center',
        marginBottom: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#cbd5e1'
    },
    input: {
        backgroundColor: '#070a14',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '12px 15px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    button: {
        backgroundColor: '#1d4ed8',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)',
        transition: 'background-color 0.2s'
    },
    footer: {
        marginTop: '25px',
        textAlign: 'center',
        borderTop: '1px solid #1e293b',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    footerText: {
        color: '#64748b',
        fontSize: '13px',
        margin: 0
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500'
    }
};