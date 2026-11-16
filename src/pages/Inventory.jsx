import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { referenciaService } from '../api/referenciaService';

export default function Inventory() {
    const [referencias, setReferencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        referenciaService.getAll()
            .then(data => {
                setReferencias(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Error al cargar el inventario desde Spring Boot');
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Inventario de Referencias y Repuestos</h2>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Volver al Dashboard
                </button>
            </div>

            {loading && <p>Cargando datos del servidor...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Referencia</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referencias.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.id || index + 1}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.nombre || item.referencia || 'N/A'}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.descripcion || 'Sin descripción'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
