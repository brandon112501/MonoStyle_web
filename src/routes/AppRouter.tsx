import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import InventoryList from '../pages/inventory/InventoryList';
import ProductForm from '../pages/inventory/ProductForm';
import AppointmentList from '../pages/appointments/AppointmentList';
import AppointmentForm from '../pages/appointments/AppointmentForm';
import PurchaseOrderList from '../pages/orders/PurchaseOrderList';
import PurchaseOrderForm from '../pages/orders/PurchaseOrderForm';
import ServiceOrderForm from '../pages/orders/ServiceOrderForm';
import ServiceList from '../pages/services/ServiceList';
import UserList from '../pages/users/UserList';
import UserForm from '../pages/users/UserForm';
import Reports from '../pages/reports/Reports';
import Login from '../pages/auth/Login';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública de Autenticación */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Dashboards */}
                <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/employee/dashboard" element={<PrivateRoute><EmployeeDashboard /></PrivateRoute>} />

                {/* Módulo de Inventario */}
                <Route path="/inventory" element={<PrivateRoute><InventoryList /></PrivateRoute>} />
                <Route path="/inventory/new" element={<PrivateRoute><ProductForm /></PrivateRoute>} />

                {/* Módulo de Citas */}
                <Route path="/appointments" element={<PrivateRoute><AppointmentList /></PrivateRoute>} />
                <Route path="/appointments/new" element={<PrivateRoute><AppointmentForm /></PrivateRoute>} />

                {/* Módulo de Órdenes */}
                <Route path="/orders" element={<PrivateRoute><PurchaseOrderList /></PrivateRoute>} />
                <Route path="/orders/new" element={<PrivateRoute><PurchaseOrderForm /></PrivateRoute>} />
                <Route path="/orders/service" element={<PrivateRoute><ServiceOrderForm /></PrivateRoute>} />

                {/* Módulos Adicionales */}
                <Route path="/services" element={<PrivateRoute><ServiceList /></PrivateRoute>} />
                <Route path="/services/new" element={<PrivateRoute><ServiceOrderForm /></PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute><UserList /></PrivateRoute>} />
                <Route path="/users/new" element={<PrivateRoute><UserForm /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

                {/* Redirección por defecto si la ruta no existe */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}