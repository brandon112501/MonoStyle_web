import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService'; // Ajusta la ruta si tu api/authService está en otra carpeta

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(credentials);
            console.log("Respuesta del servidor:", data);

            if (data && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    nombre: credentials.username,
                    token: data.token
                }));
            }

            // Redirección limpia al panel de administración (AdminDashboard)
            navigate('/admin/dashboard', { replace: true });

        } catch (err) {
            console.error("Error en login:", err);
            setError('Error al conectar con el servidor. Revisa tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #050b14 0%, #0c1b33 100%)',
            fontFamily: 'sans-serif',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Contenedor principal estilo tarjeta futurista/taller */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: '#0d1526',
                border: '2px solid #1e3a8a',
                borderRadius: '16px',
                padding: '40px 30px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 123, 255, 0.2)',
                zIndex: 1,
                color: '#fff',
                textAlign: 'center'
            }}>
                {/* Logo / Ícono superior */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        margin: '0 auto 15px auto',
                        background: '#1e3a8a',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(0, 123, 255, 0.5)',
                        fontSize: '32px'
                    }}>
                        🏍️
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '1px' }}>
                        Bienvenido a <span style={{ color: '#3b82f6' }}>MONOSTYLE</span>
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                        Ingresa a tu cuenta para acceder
                    </p>
                </div>

                <div style={{ width: '100%', height: '1px', background: '#1e3a8a', margin: '20px 0' }}></div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                            Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="ej. Brandon o SuperAdmin"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '12px',
                            background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Conectando...' : '➔ Iniciar Sesión'}
                    </button>
                </form>

                {error && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '15px' }}>{error}</p>}

                <div style={{ marginTop: '25px', borderTop: '1px solid #1e3a8a', paddingTop: '20px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 10px 0' }}>¿No tienes una cuenta?</p>
                    <Link
                        to="/register"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px',
                            background: 'transparent',
                            border: '1px solid #3b82f6',
                            color: '#60a5fa',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'background 0.2s'
                        }}
                    >
                        Crear Cuenta
                    </Link>
                </div>
            </div>
        </div>
    );
}