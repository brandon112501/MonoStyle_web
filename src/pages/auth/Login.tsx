import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import fondoLogin from '../../assets/fondoLogin.png'; // Asegúrate de que tu imagen de fondo esté en assets o ajusta la ruta si se llama diferente
import { authService } from '../../api/authService';

export default function Login() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const result = await authService.login({ username: usuario, password: password });

            if (result.success) {
                if (result.rol === 'Administrador') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/employee/dashboard');
                }
            } else {
                setErrorMsg(result.message || 'Credenciales incorrectas o usuario no encontrado');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Ocurrió un error inesperado al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <img src={logoMonostyle} alt="MonoStyle" style={styles.logo} />
                </div>
                <h2 style={styles.title}>Bienvenido a MONOSTYLE</h2>
                <p style={styles.subtitle}>Ingresa a tu cuenta para acceder</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario</label>
                        <input
                            type="text"
                            placeholder="Usuario o correo"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    {errorMsg && (
                        <div style={styles.errorBox}>
                            {errorMsg}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Validando...' : '→ Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Estilos Ciber-Industrial con la imagen de fondo recuperada
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(5, 8, 17, 0.7), rgba(5, 8, 17, 0.85)), url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    card: {
        backgroundColor: 'rgba(13, 19, 34, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
        textAlign: 'center'
    },
    logoContainer: { marginBottom: '20px' },
    logo: { width: '80px', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 0 15px rgba(0, 123, 255, 0.3)' },
    title: { fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' },
    subtitle: { fontSize: '13px', color: '#64748b', margin: '0 0 25px 0' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none' },
    errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', textAlign: 'center' },
    button: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px', boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)', transition: '0.2s' }
};