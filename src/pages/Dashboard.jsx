import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoMonostyle from '../../assets/logo.png';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://umvfiaquovixeeolamks.supabase.co';
const supabaseKey = 'sb_publishable_iA1xLGhu60gA4_q0cVURkw_id6lf...'; // Asegúrate de colocar tu llave válida aquí
const supabase = createClient(supabaseUrl, supabaseKey);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('SuperAdmin');

  // Estados para las métricas reales
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [totalServicios, setTotalServicios] = useState(0);
  const [alertasStock, setAlertasStock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener usuario logueado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAdminName(userData.username || userData.nombre || 'SuperAdmin');
      } catch (e) {
        console.error("Error al obtener usuario:", e);
      }
    }

    // Consultar métricas en Supabase
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Contar clientes
        const { count: countClientes } = await supabase
          .from('cliente')
          .select('*', { count: 'exact', head: true });

        // 2. Contar empleados
        const { count: countEmpleados } = await supabase
          .from('empleado')
          .select('*', { count: 'exact', head: true });

        // Suma total de usuarios registrados (Clientes + Empleados)
        setTotalUsuarios((countClientes || 0) + (countEmpleados || 0));

        // 3. Contar órdenes registradas
        const { count: countOrdenes } = await supabase
          .from('orden')
          .select('*', { count: 'exact', head: true });

        setTotalOrdenes(countOrdenes || 0);

        // 4. Contar servicios (si tienes la tabla, de lo contrario se queda en 0 o se ajusta)
        const { count: countServicios } = await supabase
          .from('categoria') // O la tabla de servicios si la tienes
          .select('*', { count: 'exact', head: true });

        setTotalServicios(countServicios || 0);

      } catch (error) {
        console.error('Error al cargar métricas del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Barra Lateral / Sidebar */}
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

      {/* Contenido Principal */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>Panel de Control</h2>
            <p style={styles.pageSubtitle}>Bienvenido al sistema de gestión de MonoStyle</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>👤</div>
            <div>
              <p style={styles.userName}>{adminName}</p>
              <span style={styles.userRole}>Administrador</span>
            </div>
          </div>
        </header>

        {/* Tarjetas de Métricas (Dashboard Cards) */}
        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>👥</div>
            <div>
              <p style={styles.cardValue}>{loading ? '...' : totalUsuarios}</p>
              <p style={styles.cardTitle}>Usuarios Registrados</p>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🛠️</div>
            <div>
              <p style={styles.cardValue}>{loading ? '...' : totalOrdenes}</p>
              <p style={styles.cardTitle}>Órdenes Registradas</p>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>⚙️</div>
            <div>
              <p style={styles.cardValue}>{loading ? '...' : totalServicios}</p>
              <p style={styles.cardTitle}>Categorías / Servicios</p>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📦</div>
            <div>
              <p style={styles.cardValue}>{loading ? '...' : alertasStock}</p>
              <p style={styles.cardTitle}>Alertas de Stock</p>
            </div>
          </div>
        </div>

        {/* Sección de Resumen o Accesos Rápidos */}
        <div style={styles.sectionContainer}>
          <h3 style={styles.sectionTitle}>Acciones Rápidas del Sistema</h3>
          <div style={styles.quickActionsGrid}>
            <Link to="/users" style={styles.actionCard}>
              <span style={styles.actionIcon}>👤</span>
              <h4>Gestionar Usuarios</h4>
              <p>Ver clientes y empleados sincronizados</p>
            </Link>
            <Link to="/inventory" style={styles.actionCard}>
              <span style={styles.actionIcon}>📦</span>
              <h4>Revisar Inventario</h4>
              <p>Control de repuestos y existencias</p>
            </Link>
            <Link to="/reports" style={styles.actionCard}>
              <span style={styles.actionIcon}>📊</span>
              <h4>Ver Reportes</h4>
              <p>Estadísticas y análisis de órdenes</p>
            </Link>
          </div>
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