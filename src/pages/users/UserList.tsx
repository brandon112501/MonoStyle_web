import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { supabase } from '../../api/supabaseCliente';

interface User {
  id: number | string;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
}

export const UserList = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<'Todos' | 'Clientes' | 'Empleados'>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [userName, setUserName] = useState('Usuario');
  const [userRole, setUserRole] = useState('Empleado');
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.nombre || 'Usuario');
        setUserRole(userData.rol || 'Empleado');
      } catch (e) {
        console.error("Error al obtener usuario:", e);
      }
    }

    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);

      const { data: clientesData } = await supabase.from('cliente').select('*');
      const { data: empleadosData } = await supabase.from('empleado').select('*');

      const mappedClientes: User[] = (clientesData || []).map((item: any) => ({
        id: `cli-${item.id_cliente}`,
        nombreCompleto: item.nombre || 'Sin nombre',
        telefono: item.telefono || 'N/A',
        correo: item.correo || 'N/A',
        rol: 'Cliente',
        estado: 'Activo'
      }));

      const mappedEmpleados: User[] = (empleadosData || []).map((item: any) => ({
        id: `emp-${item.id_empleado || item.id}`,
        nombreCompleto: item.nombre || item.nombre_completo || 'Sin nombre',
        telefono: item.telefono || 'N/A',
        correo: item.correo || 'N/A',
        rol: 'Empleado',
        estado: 'Activo'
      }));

      setUsuarios([...mappedClientes, ...mappedEmpleados]);
    } catch (err) {
      console.error('Excepción general en Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Rutas dinámicas según el rol del usuario logueado
  const isAdmin = userRole === 'Administrador';
  const homeRoute = isAdmin ? '/admin/dashboard' : '/employee/dashboard';

  const usuariosFiltrados = usuarios.filter(user => {
    const cumpleFiltro =
      filtro === 'Todos' ? true :
      filtro === 'Clientes' ? user.rol === 'Cliente' :
      user.rol === 'Empleado';

    const cumpleBusqueda = user.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
                           user.correo.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div style={styles.container}>
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

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>Gestión de Usuarios y Personal</h2>
            <p style={styles.pageSubtitle}>Registros sincronizados de las tablas 'cliente' y 'empleado'</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>👤</div>
            <div>
              <p style={styles.userName}>{userName}</p>
              <span style={styles.userRole}>{userRole}</span>
            </div>
          </div>
        </header>

        <div style={styles.toolbar}>
          <div style={styles.filterGroup}>
            {(['Todos', 'Clientes', 'Empleados'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFiltro(tab)}
                style={{
                  ...styles.filterButton,
                  backgroundColor: filtro === tab ? '#1d4ed8' : '#0d1322',
                  border: filtro === tab ? '1px solid #3b82f6' : '1px solid #1e293b',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.actionToolbar}>
            <button
              onClick={() => navigate('/register')}
              style={styles.newButton}
            >
              + Nuevo Registro
            </button>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre Completo</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Correo / Credencial</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Cargando clientes y empleados desde Supabase...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.td}>{user.id}</td>
                    <td style={styles.td}>{user.nombreCompleto}</td>
                    <td style={styles.td}>{user.telefono}</td>
                    <td style={styles.td}>{user.correo}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badgeRole,
                        backgroundColor: user.rol === 'Cliente' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                        color: user.rol === 'Cliente' ? '#3b82f6' : '#a855f7',
                        border: `1px solid ${user.rol === 'Cliente' ? '#3b82f6' : '#a855f7'}`
                      }}>
                        {user.rol}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        border: '1px solid #22c55e'
                      }}>
                        {user.estado}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button style={styles.iconBtn} title="Editar">✏️</button>
                        <button style={styles.iconBtn} title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

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
  pageTitle: { fontSize: '22px', fontWeight: 'bold' },
  pageSubtitle: { color: '#64748b', fontSize: '13px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d1322', padding: '8px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
  userAvatar: { fontSize: '20px' },
  userName: { fontSize: '14px', fontWeight: 'bold' },
  userRole: { fontSize: '11px', color: '#3b82f6' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  filterGroup: { display: 'flex', gap: '10px' },
  filterButton: { padding: '8px 20px', borderRadius: '20px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: '0.2s' },
  actionToolbar: { display: 'flex', gap: '15px', alignItems: 'center' },
  newButton: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)' },
  searchContainer: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '12px', top: '10px', fontSize: '13px' },
  searchInput: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '8px', padding: '9px 12px 9px 35px', color: '#fff', fontSize: '13px', outline: 'none', width: '220px' },
  tableContainer: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  tableHeaderRow: { backgroundColor: '#070a14', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' },
  th: { padding: '15px 20px', fontWeight: '600' },
  tableRow: { borderBottom: '1px solid #1e293b', transition: 'background 0.2s' },
  td: { padding: '16px 20px', color: '#e2e8f0' },
  badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  badgeRole: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  actions: { display: 'flex', gap: '10px' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }
};

export default UserList;