import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function PurchaseOrderList() {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [userName, setUserName] = useState('Usuario');
    const [userRole, setUserRole] = useState('Empleado');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUserName(userData.nombre || 'Usuario');
                setUserRole(userData.rol || 'Empleado');
            }
        } catch (e) {
            console.error(e);
        }

        fetchOrdenes();
    }, []);

    const fetchOrdenes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('orden').select('*');
            if (error) {
                const { data: altData } = await supabase.from('orden_compra').select('*');
                if (altData) setOrdenes(altData);
            } else if (data) {
                setOrdenes(data);
            }
        } catch (err) {
            console.error('Error al cargar órdenes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050811', color: '#fff', fontFamily: 'sans-serif' }}>
            <aside style={{ width: '260px', backgroundColor: '#070a14', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                <div>
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <img src={logoMonostyle} alt="Logo" style={{ width: '100%', maxWidth: '160px', borderRadius: '12px' }} />
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Link to={homeRoute} style={{ color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Inicio</Link>
                        <Link to="/users" style={{ color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Usuario</Link>
                        <Link to="/services" style={{ color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Servicios</Link>
                        <Link to="/appointments" style={{ color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Citas</Link>
                        <Link to="/inventory" style={{ color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Inventario</Link>
                        {isAdmin && <Link to="/reports" style={{ color: '#94a3b8', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Reportes</Link>}
                        <Link to="/orders" style={{ backgroundColor: '#1d4ed8', color: '#fff', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>Órdenes</Link>
                    </nav>
                </div>
                <div>
                    <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', width: '100%', padding: '8px', textAlign: 'left' }}>
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Gestión de Órdenes</h2>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Consulta y Administra las Órdenes</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                        <span>👤</span>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{userName}</p>
                            <span style={{ fontSize: '11px', color: '#3b82f6' }}>{userRole}</span>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
                    <button onClick={() => navigate('/orders/new')} style={{ backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        + Nueva Orden
                    </button>
                </div>

                <div style={{ backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#070a14', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                                <th style={{ padding: '15px 20px' }}>ID</th>
                                <th style={{ padding: '15px 20px' }}>Proveedor</th>
                                <th style={{ padding: '15px 20px' }}>Fecha</th>
                                <th style={{ padding: '15px 20px' }}>Estado</th>
                                <th style={{ padding: '15px 20px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando órdenes...</td>
                                </tr>
                            ) : ordenes.length > 0 ? (
                                ordenes.map((ord, idx) => (
                                    <tr key={ord.id || idx} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '15px 20px', color: '#cbd5e1' }}>{ord.id || idx + 1}</td>
                                        <td style={{ padding: '15px 20px', color: '#cbd5e1' }}>{ord.proveedor || 'Proveedor General'}</td>
                                        <td style={{ padding: '15px 20px', color: '#cbd5e1' }}>{ord.fecha || '2026-11-16'}</td>
                                        <td style={{ padding: '15px 20px', color: '#cbd5e1' }}>
                                            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {ord.estado || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '8px' }}>✏️</button>
                                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No se encontraron órdenes registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}