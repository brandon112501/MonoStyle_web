import React, { useState } from 'react';
import { authService } from '../../api/authService';

export const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    cargo: 'Mecánico',
    credenciales: '',
    idRol: 2
  });
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      await authService.registerEmployee(formData);
      setMensaje('Empleado registrado exitosamente por el Administrador.');
      setFormData({ nombre: '', correo: '', telefono: '', cargo: 'Mecánico', credenciales: '', idRol: 2 });
    } catch (err: any) {
      setError(err.response?.data || 'Error al registrar el empleado.');
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-xl max-w-lg mx-auto border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-white">Registrar Nuevo Empleado</h3>
      {mensaje && <div className="p-3 mb-4 bg-green-900 text-green-200 rounded">{mensaje}</div>}
      {error && <div className="p-3 mb-4 bg-red-900 text-red-200 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
        />
        <input
          type="password"
          placeholder="Contraseña del empleado"
          value={formData.credenciales}
          onChange={(e) => setFormData({ ...formData, credenciales: e.target.value })}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
          required
        />
        <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold">
          Registrar Empleado
        </button>
      </form>
    </div>
  );
};

export default UserForm;
