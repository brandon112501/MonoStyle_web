import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

export default function AppointmentForm() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);
    const [usarServicioManual, setUsarServicioManual] = useState(false);
    const [debugMsg, setDebugMsg] = useState('Buscando servicios...');

    // Estados del formulario
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [vehiculo, setVehiculo] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [servicioManual, setServicioManual] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [hora, setHora] = useState('');
    const [observaciones, setObservaciones] = useState('');
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

        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            // 1. Cargar clientes
            const { data: cliData } = await supabase.from('cliente').select('*');
            setClientes(cliData || []);

            // 2. Cargar servicios
            const { data: servData } = await supabase.from('referencia').select('*');
            if (servData && servData.length > 0) {
                setServicios(servData);
                setDebugMsg(`Servicios cargados (${servData.length})`);
            } else {
                setUsarServicioManual(true);
            }
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setUsarServicioManual(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const nombreServicioFinal = usarServicioManual
                ? servicioManual
                : servicios.find(s => String(s.id || s.id_referencia) === servicioSeleccionado)?.descripcion || servicioSeleccionado;

            // Objeto con el id_cliente requerido por la base de datos
            const nuevaCita = {
                id_cliente: Number(clienteSeleccionado),
                estado: 'Pendiente',
                fecha: fecha,
                hora: hora,
                observaciones: observaciones || 'EMPTY',
                servicio: nombreServicioFinal || 'General',
                vehiculo: vehiculo
            };

            const { error } = await supabase.from('cita').insert([nuevaCita]);

            if (error) throw error;

            alert('¡Cita agendada con éxito!');
            navigate('/appointments');
        } catch (err: any) {
            console.error('Error al agendar cita:', err);
            alert(`Error al registrar la cita: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = userRole === 'Administrador';
    const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <div>
                    <div style={styles.brandContainer}>
                        <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
                    </div>

                    <nav style={styles.nav}>
                        <Link to={homeRoute} style={styles.navLink}>Inicio</Link>
                        <Link to="/users" style={styles.navLink}>Usuario</Link>
                        <Link to="/services" style={styles.navLink}>Servicios</Link>
                        <Link to="/appointments" style={{ ...styles.navLink, ...styles.activeLink }}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        {isAdmin && <Link to="/reports" style={styles.navLink}>Reportes</Link>}
                        <Link to="/orders" style={styles.navLink}>Órdenes</Link>
                    </nav>
                </div>

                <div style={styles.logoutContainer}>
                    <button onClick={handleLogout} style={styles.logoutButton}>🚪 Cerrar Sesión</button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>Agendar Cita</h2>
                        <p style={styles.pageSubtitle}>Programa la cita del Servicio</p>
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
                    <div style={styles.grid2Cols}>
                        <div style={styles.column}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Cliente *</label>
                                <select
                                    value={clienteSeleccionado}
                                    onChange={(e) => setClienteSeleccionado(e.target.value)}
                                    required
                                    style={styles.input}
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {clientes.map((cli) => (
                                        <option key={cli.id || cli.id_cliente} value={cli.id || cli.id_cliente}>
                                            {cli.nombre || cli.nombre_completo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Vehículo *</label>
                                <input
                                    type="text"
                                    placeholder="Ej. AKT TTX 180 - GKI06E"
                                    value={vehiculo}
                                    onChange={(e) => setVehiculo(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={styles.label}>Servicio *</label>
                                    <button
                                        type="button"
                                        onClick={() => setUsarServicioManual(!usarServicioManual)}
                                        style={styles.toggleModeBtn}
                                    >
                                        {usarServicioManual ? 'Usar Selector' : 'Escribir Manual'}
                                    </button>
                                </div>

                                {usarServicioManual ? (
                                    <input
                                        type="text"
                                        placeholder="Ej. Frenos, Revisión general"
                                        value={servicioManual}
                                        onChange={(e) => setServicioManual(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                ) : (
                                    <select
                                        value={servicioSeleccionado}
                                        onChange={(e) => setServicioSeleccionado(e.target.value)}
                                        required
                                        style={styles.input}
                                    >
                                        <option value="">Seleccionar servicio...</option>
                                        {servicios.map((serv) => (
                                            <option key={serv.id || serv.id_referencia} value={serv.id || serv.id_referencia}>
                                                {serv.descripcion} - ${Number(serv.precio || 0).toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div style={styles.buttonRow}>
                                <button type="submit" disabled={loading} style={styles.submitBtn}>📅 Agendar Cita</button>
                                <button type="button" onClick={() => { setClienteSeleccionado(''); setVehiculo(''); setServicioSeleccionado(''); setHora(''); setObservaciones(''); }} style={styles.clearBtn}>🔄 Limpiar</button>
                            </div>
                        </div>

                        <div style={styles.column}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Fecha *</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Hora *</label>
                                <input
                                    type="time"
                                    value={hora}
                                    onChange={(e) => setHora(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Observaciones</label>
                                <textarea
                                    placeholder="Descripción del servicio (opcional)..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    rows={4}
                                    style={{ ...styles.input, resize: 'none', height: '110px' }}
                                />
                            </div>
                        </div>
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
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    column: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', color: '#cbd5e1', fontWeight: '500' },
    input: { backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
    toggleModeBtn: { background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' },
    buttonRow: { display: 'flex', gap: '15px', marginTop: '10px' },
    submitBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    clearBtn: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }
};