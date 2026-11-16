import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

const SERVICIOS = [
    'Cambio de aceite y filtros',
    'Mantenimiento general',
    'Revisión de frenos',
    'Revisión general'
];
const ESTADOS = ['Pendiente', 'Confirmada'];
const PAGE_SIZE = 5;

const MESES: { [key: string]: number } = {
    ene: 1, jan: 1, feb: 2, mar: 3, abr: 4, apr: 4, may: 5, jun: 6,
    jul: 7, ago: 8, aug: 8, sep: 9, oct: 10, nov: 11, dic: 12, dec: 12
};
const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Hoy en formato YYYY-MM-DD (hora local)
const today = () => new Date().toLocaleDateString('en-CA');

// Convierte "2026-11-21" o "21 Nov 2026" a "2026-11-21". Devuelve '' si no entiende el formato.
const toIsoDate = (s: string): string => {
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.trim().match(/^(\d{1,2})\s+([A-Za-zñÑ]+)\.?\s+(\d{4})$/);
    if (!m) return '';
    const mes = MESES[m[2].slice(0, 3).toLowerCase()];
    if (!mes) return '';
    return `${m[3]}-${String(mes).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
};

// Muestra la fecha como "21-Nov-26"
const formatFecha = (s: string): string => {
    const iso = toIsoDate(s);
    if (!iso) return s || '-';
    const [y, mo, d] = iso.split('-');
    return `${d}-${NOMBRES_MES[Number(mo) - 1]}-${y.slice(2)}`;
};

const motoLabel = (m: any) => `${m.modelo} - ${m.placa}`;

const emptyForm = () => ({
    id_cliente: '',
    vehiculo: '',
    servicio: '',
    fecha: today(),
    hora: '',
    observaciones: '',
    estado: 'Pendiente'
});

export default function AppointmentList() {
    const navigate = useNavigate();

    const [adminName, setAdminName] = useState('SuperAdmin');
    const [citas, setCitas] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [motos, setMotos] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [saving, setSaving] = useState(false);

    // Carga inicial
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setAdminName(userData.username || userData.nombre || 'SuperAdmin');
            } catch (e) {
                console.error(e);
            }
        }
        fetchCitas();
        fetchClientes();
    }, []);

    // Cargar las motos del cliente elegido
    useEffect(() => {
        if (!formData.id_cliente) {
            setMotos([]);
            return;
        }
        supabase
            .from('motocicleta')
            .select('id_motocicleta, modelo, placa, anio, color')
            .eq('id_cliente', Number(formData.id_cliente))
            .then(({ data, error }) => {
                if (error) console.error('Error cargando motos:', error);
                setMotos(data || []);
            });
    }, [formData.id_cliente]);

    const fetchCitas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('cita')
            .select('*')
            .order('id_cita', { ascending: true });
        if (error) {
            console.error('Error al cargar citas:', error);
            setError('No se pudieron cargar las citas.');
        } else {
            setCitas(data || []);
            setError('');
        }
        setLoading(false);
    };

    const fetchClientes = async () => {
        const { data, error } = await supabase.from('cliente').select('*');
        if (error) console.error('Error clientes:', error);
        else setClientes(data || []);
    };

    const getCliente = (id: any) =>
        clientes.find(c => String(c.id_cliente || c.id) === String(id));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Al cambiar de cliente se limpia el vehículo elegido
    const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, id_cliente: e.target.value, vehiculo: '' });
    };

    const openNew = () => {
        setEditingId(null);
        setFormData(emptyForm());
        setIsFormOpen(true);
    };

    const openEdit = (c: any) => {
        setEditingId(c.id_cita);
        setFormData({
            id_cliente: c.id_cliente ? String(c.id_cliente) : '',
            vehiculo: c.vehiculo || '',
            servicio: c.servicio || '',
            fecha: toIsoDate(c.fecha) || today(),
            hora: c.hora || '',
            observaciones: c.observaciones || '',
            estado: c.estado || 'Pendiente'
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData(emptyForm());
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.id_cliente || !formData.vehiculo || !formData.servicio || !formData.fecha || !formData.hora) {
            alert('Completa cliente, vehículo, servicio, fecha y hora.');
            return;
        }

        // Evitar dos citas a la misma fecha y hora
        const choque = citas.some(c =>
            c.id_cita !== editingId &&
            toIsoDate(c.fecha) === formData.fecha &&
            c.hora === formData.hora
        );
        if (choque) {
            alert('Ya existe una cita en esa fecha y hora. Elige otro horario.');
            return;
        }

        const payload = {
            id_cliente: Number(formData.id_cliente),
            vehiculo: formData.vehiculo,
            servicio: formData.servicio,
            fecha: formData.fecha,
            hora: formData.hora,
            observaciones: formData.observaciones.trim() || null,
            estado: formData.estado
        };

        setSaving(true);
        const { error } = editingId
            ? await supabase.from('cita').update(payload).eq('id_cita', editingId)
            : await supabase.from('cita').insert([payload]);
        setSaving(false);

        if (error) {
            console.error('Error al guardar la cita:', error);
            alert('No se pudo guardar la cita. Revisa la consola (F12).');
            return;
        }

        alert(editingId ? 'Cita actualizada.' : 'Cita agendada con éxito.');
        closeForm();
        fetchCitas();
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta cita?')) return;
        const { error } = await supabase.from('cita').delete().eq('id_cita', id);
        if (error) {
            console.error('Error al eliminar la cita:', error);
            alert('No se pudo eliminar la cita.');
            return;
        }
        fetchCitas();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Búsqueda y paginación
    const term = searchTerm.toLowerCase();
    const filtered = citas.filter(c => {
        const cli = getCliente(c.id_cliente);
        return (
            (cli?.nombre || '').toLowerCase().includes(term) ||
            (c.servicio || '').toLowerCase().includes(term) ||
            (c.vehiculo || '').toLowerCase().includes(term)
        );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibles = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const badgeStyle = (estado: string): React.CSSProperties => {
        if (estado === 'Confirmada') return { ...styles.badge, backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid #3b82f6' };
        if (estado === 'Pendiente') return { ...styles.badge, backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid #eab308' };
        return { ...styles.badge, backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid #94a3b8' };
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
                        <Link to="/appointments" style={{ ...styles.navLink, ...styles.activeLink }}>Citas</Link>
                        <Link to="/inventory" style={styles.navLink}>Inventario</Link>
                        <Link to="/reports" style={styles.navLink}>Reportes</Link>
                        <Link to="/register" style={styles.navLink}>Registro</Link>
                        <Link to="/orders" style={styles.navLink}>Órdenes</Link>
                    </nav>
                </div>

                <div style={styles.logoutContainer}>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>
                            {isFormOpen ? (editingId ? 'Editar Cita' : 'Agendar Cita') : 'Gestión de Citas'}
                        </h2>
                        <p style={styles.pageSubtitle}>
                            {isFormOpen ? 'Programa la cita del servicio' : 'Administra las citas de los usuarios del sistema'}
                        </p>
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>👤</div>
                        <div>
                            <p style={styles.userName}>{adminName}</p>
                            <span style={styles.userRole}>Administrador</span>
                        </div>
                    </div>
                </header>

                {!isFormOpen ? (
                    <>
                        <div style={styles.toolbar}>
                            <button onClick={openNew} style={styles.addButton}>
                                + Agendar Cita
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar cita..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                style={styles.searchBox}
                            />
                        </div>

                        {error && <div style={styles.errorAlert}>{error}</div>}

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.trHead}>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Nombre Completo</th>
                                        <th style={styles.th}>Teléfono</th>
                                        <th style={styles.th}>Servicio</th>
                                        <th style={styles.th}>Fecha/hora</th>
                                        <th style={styles.th}>Estado</th>
                                        <th style={styles.th}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} style={styles.emptyCell}>Cargando citas...</td>
                                        </tr>
                                    ) : visibles.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={styles.emptyCell}>No se encontraron citas.</td>
                                        </tr>
                                    ) : (
                                        visibles.map(c => {
                                            const cli = getCliente(c.id_cliente);
                                            return (
                                                <tr key={c.id_cita} style={styles.trBody}>
                                                    <td style={styles.td}>{c.id_cita}</td>
                                                    <td style={styles.td}>{cli?.nombre || `Cliente #${c.id_cliente}`}</td>
                                                    <td style={styles.td}>{cli?.telefono || '-'}</td>
                                                    <td style={styles.td}>{c.servicio}</td>
                                                    <td style={styles.td}>{formatFecha(c.fecha)} / {c.hora}</td>
                                                    <td style={styles.td}>
                                                        <span style={badgeStyle(c.estado)}>{c.estado}</span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.actionButtons}>
                                                            <button onClick={() => openEdit(c)} style={styles.iconBtn} title="Editar">✏️</button>
                                                            <button onClick={() => handleDelete(c.id_cita)} style={styles.iconBtn} title="Eliminar">🗑️</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div style={styles.pagination}>
                            <button
                                style={styles.pageBtn}
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                Anterior
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    style={{ ...styles.pageBtn, ...(n === currentPage ? styles.pageBtnActive : {}) }}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                style={styles.pageBtn}
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSave}>
                        <div style={styles.card}>
                            <div style={styles.grid2Cols}>
                                {/* Columna izquierda */}
                                <div style={styles.column}>
                                    <div>
                                        <label style={styles.labelField}>Cliente *</label>
                                        <select
                                            name="id_cliente"
                                            value={formData.id_cliente}
                                            onChange={handleClienteChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Seleccionar cliente...</option>
                                            {clientes.map(c => (
                                                <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>
                                                    {c.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Vehículo *</label>
                                        <select
                                            name="vehiculo"
                                            value={formData.vehiculo}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            disabled={!formData.id_cliente}
                                            required
                                        >
                                            <option value="">
                                                {!formData.id_cliente ? 'Primero selecciona un cliente...' : 'Seleccionar vehículo...'}
                                            </option>
                                            {formData.vehiculo && !motos.some(m => motoLabel(m) === formData.vehiculo) && (
                                                <option value={formData.vehiculo}>{formData.vehiculo}</option>
                                            )}
                                            {motos.map(m => (
                                                <option key={m.id_motocicleta} value={motoLabel(m)}>
                                                    {motoLabel(m)} ({m.anio}, {m.color})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Servicio *</label>
                                        <select
                                            name="servicio"
                                            value={formData.servicio}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Seleccionar servicio...</option>
                                            {formData.servicio && !SERVICIOS.includes(formData.servicio) && (
                                                <option value={formData.servicio}>{formData.servicio}</option>
                                            )}
                                            {SERVICIOS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Columna derecha */}
                                <div style={styles.column}>
                                    <div>
                                        <label style={styles.labelField}>Fecha *</label>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={formData.fecha}
                                            min={editingId ? undefined : today()}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label style={styles.labelField}>Hora *</label>
                                        <input
                                            type="time"
                                            name="hora"
                                            value={formData.hora}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>

                                    {editingId && (
                                        <div>
                                            <label style={styles.labelField}>Estado</label>
                                            <select
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                            >
                                                {formData.estado && !ESTADOS.includes(formData.estado) && (
                                                    <option value={formData.estado}>{formData.estado}</option>
                                                )}
                                                {ESTADOS.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label style={styles.labelField}>Observaciones</label>
                                        <textarea
                                            name="observaciones"
                                            placeholder="Descripción del servicio (opcional)..."
                                            value={formData.observaciones}
                                            onChange={handleInputChange}
                                            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.footerActions}>
                            <button type="submit" style={styles.saveBtn} disabled={saving}>
                                {saving ? 'Guardando...' : editingId ? '💾 Guardar cambios' : '💾 Agendar Cita'}
                            </button>
                            <button type="button" onClick={() => setFormData(emptyForm())} style={styles.cancelBtn}>
                                🔄 Limpiar
                            </button>
                            <button type="button" onClick={closeForm} style={styles.cancelBtn}>
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}

// Estilos Ciber-Industrial (mismos que Servicios)
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
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
    searchBox: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 15px', color: '#fff', width: '250px', outline: 'none' },
    tableContainer: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    trHead: { borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
    th: { padding: '15px' },
    trBody: { borderBottom: '1px solid #1e293b', fontSize: '14px' },
    td: { padding: '15px' },
    emptyCell: { textAlign: 'center', padding: '20px', color: '#94a3b8' },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 },
    actionButtons: { display: 'flex', gap: '10px' },
    iconBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
    errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
    pagination: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' },
    pageBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
    pageBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6', color: '#fff' },
    card: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
    column: { display: 'flex', flexDirection: 'column', gap: '15px' },
    labelField: { fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
    footerActions: { display: 'flex', gap: '15px', marginTop: '20px' },
    saveBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)' },
    cancelBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};