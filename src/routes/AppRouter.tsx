import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import { UserList } from '../pages/users/UserList'; // Ruta corregida y limpia
import ServiceList from '../pages/services/ServiceList';
import AppointmentList from '../pages/appointments/AppointmentList';
import InventoryList from '../pages/inventory/InventoryList';
import Reports from '../pages/reports/Reports';
import ServiceOrderForm from '../pages/orders/ServiceOrderForm';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirigir la raíz directamente al Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Ruta de Login */}
                <Route path="/login" element={<Login />} />

                {/* Panel de Administración */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Módulos y Gestión del Sistema */}
                <Route path="/users" element={<UserList />} />
                <Route path="/services" element={<ServiceList />} />
                <Route path="/appointments" element={<AppointmentList />} />
                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/orders" element={<ServiceOrderForm />} />
                <Route path="/register" element={<Register />} />

                {/* Panel de Empleado */}
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

                {/* Ruta por defecto para cualquier otra URL no encontrada */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}