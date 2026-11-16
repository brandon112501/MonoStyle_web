import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('SuperAdmin');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAdminName(userData.username || userData.nombre || 'SuperAdmin');
      } catch (e) {
        console.error("Error al obtener usuario:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandContainer}>
            <img src={logoMonostyle} alt="Logo MonoStyle" style={styles.logoImage} />
          </div>

          <nav style={styles.nav}>
            <Link to="/admin/dashboard" style={{ ...styles.navLink, ...styles.activeLink }}>Inicio</Link>
            <Link to="/users" style={styles.navLink}>Usuario</Link>
            <Link to="/services" style={styles.navLink}>Servicios</Link>
            <Link to="/appointments" style={styles.navLink}>Citas</Link>
            <Link to="/inventory" style={styles.navLink}>Inventario</Link>
            <Link to="/reports" style={styles.navLink}>Reportes</Link>
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
            <h2 style={styles.pageTitle}>Panel de Administrador</h2>
            <p style={styles.pageSubtitle}>Control Total del Sistema</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>👤</div>
            <div>
              <p style={styles.userName}>{adminName}</p>
              <span style={styles.userRole}>Administrador</span>
            </div>
          </div>
        </header>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(0, 123, 255, 0.2)', color: '#3b82f6' }}>👥</div>
            <div>
              <h3 style={styles.statNumber}>0</h3>
              <p style={styles.statLabel}>Usuarios Registrados</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>📅</div>
            <div>
              <h3 style={styles.statNumber}>0</h3>
              <p style={styles.statLabel}>Citas este mes</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(37, 99, 235, 0.2)', color: '#93c5fd' }}>🛠️</div>
            <div>
              <h3 style={styles.statNumber}>0</h3>
              <p style={styles.statLabel}>Servicios Registrados</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(29, 78, 216, 0.2)', color: '#bfdbfe' }}>📦</div>
            <div>
              <h3 style={styles.statNumber}>0</h3>
              <p style={styles.statLabel}>Alertas de Stock</p>
            </div>
          </div>
        </section>

        <section style={styles.bottomGrid}>
          <div style={styles.cardBox}>
            <h3 style={styles.boxTitle}>Resumen General</h3>
            <div style={styles.chartPlaceholder}>
              <p style={{ color: '#888', textAlign: 'center', paddingTop: '80px' }}>Gráfico de Servicios y Ventas por Mes</p>
            </div>
          </div>

          <div style={styles.cardBox}>
            <h3 style={styles.boxTitle}>Actividad Reciente</h3>
            <ul style={styles.activityList}>
              <li style={styles.activityItem}>
                <span>💡</span>
                <div>
                  <p style={styles.activityText}>Sistema conectado y listo</p>
                  <span style={styles.activityTime}>Reciente</span>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#050811',
    color: '#fff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#070a14',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
  },
  brandContainer: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  logoImage: {
    width: '100%',
    maxWidth: '180px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    boxShadow: '0 0 15px rgba(0, 123, 255, 0.2)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '8px',
    transition: '0.2s',
    fontSize: '14px',
  },
  activeLink: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    fontWeight: '500',
    boxShadow: '0 0 10px rgba(29, 78, 216, 0.4)',
  },
  logoutContainer: {
    borderTop: '1px solid #1e293b',
    paddingTop: '15px',
  },
  logoutButton: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px',
  },
  mainContent: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '20px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  pageSubtitle: {
    color: '#64748b',
    fontSize: '13px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#0d1322',
    padding: '8px 15px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
  },
  userAvatar: {
    fontSize: '20px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: '11px',
    color: '#3b82f6',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#0d1322',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
  },
  cardBox: {
    backgroundColor: '#0d1322',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '20px',
  },
  boxTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  chartPlaceholder: {
    height: '200px',
    border: '1px dashed #1e293b',
    borderRadius: '8px',
  },
  activityList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
  },
  activityText: {
    fontWeight: '500',
  },
  activityTime: {
    fontSize: '11px',
    color: '#6b7280',
  },
};

export default AdminDashboard;