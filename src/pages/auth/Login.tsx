import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import logoImage from '../../assets/logo.png';
import fondoLoginImage from '../../assets/fondoLogin.png';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
           e.preventDefault();
           setError('');
           setLoading(true);

           try {
               // Le pasamos el objeto con las propiedades que authService.ts espera
               const data = await authService.login({
                   username: username,
                   password: password
               });

               if (data?.accessToken) {
                   localStorage.setItem('token', data.accessToken);
                   localStorage.setItem('user', JSON.stringify(data));
               }
               navigate('/admin/dashboard', { replace: true });
           } catch (err: any) {
               console.error(err);
               setError('Credenciales incorrectas o error de conexión con el servidor.');
           } finally {
               setLoading(false);
           }
       };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${fondoLoginImage}), linear-gradient(to bottom, #030712, #070d1a)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif',
            color: '#fff',
            zIndex: 9999,
            boxSizing: 'border-box'
        }}>
            {/* Tarjeta Estilo Cyber con los assets originales */}
            <div style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: 'rgba(10, 16, 29, 0.9)',
                border: '1px solid #1e3a8a',
                borderRadius: '16px',
                padding: '45px 35px',
                boxShadow: '0 0 40px rgba(29, 78, 216, 0.4), inset 0 0 20px rgba(29, 78, 216, 0.1)',
                backdropFilter: 'blur(8px)',
                position: 'relative',
                boxSizing: 'border-box',
                textAlign: 'center'
            }}>
                {/* Logo Real del Proyecto (logo.png) */}
                <div style={{
                    width: '85px',
                    height: '85px',
                    margin: '0 auto 15px auto',
                    borderRadius: '50%',
                    backgroundColor: '#090e1b',
                    border: '2px solid #38bdf8',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
                    overflow: 'hidden'
                }}>
                    <img
                        src={logoImage}
                        alt="MonoStyle Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    margin: '0 0 6px 0',
                    letterSpacing: '0.8px',
                    color: '#ffffff'
                }}>
                    Bienvenido a <span style={{ color: '#38bdf8' }}>MONOSTYLE</span>
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 30px 0' }}>
                    Ingresa a tu cuenta para acceder
                </p>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
                            Usuario
                        </label>
                        <input
                            type="text"
                            placeholder="ej. Brandon o SuperAdmin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={inputCyberStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputCyberStyle}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#ef4444',
                            fontSize: '13px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading ? 'Cargando...' : '➔ Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const inputCyberStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#030712',
    border: '1px solid #1e4ed8',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
};