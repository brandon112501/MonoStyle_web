import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();


  const menuItems = [
    { name: 'Inicio', path: '/admin' },
    { name: 'Usuarios', path: '/users' },
    { name: 'Servicios', path: '/services' },
    { name: 'Citas', path: '/appointments' },
    { name: 'Inventario', path: '/inventory' },
    { name: 'Reportes', path: '/reports' },
    { name: 'Órdenes', path: '/orders' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen p-4 text-white">
      <div>
        {/* Logo y Título */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mb-2">
            {/* Aquí puedes poner la imagen del simio o un icono */}
            <span className="text-xl font-bold">🐵</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-wider">MONOSTYLE</h1>
          <p className="text-xs text-slate-400 mt-1">Panel de Administrador</p>
        </div>

        {/* Menú de navegación */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Botón de Cerrar Sesión */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          → Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}