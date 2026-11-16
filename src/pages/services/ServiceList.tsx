import React, { useState, useEffect } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import logoMonostyle from '../../assets/logo.png';
 import { orderService } from '../../api/orderService';
 import { supabase } from '../../api/supabaseCliente';

 export default function ServiceList() {
     const [adminName, setAdminName] = useState('SuperAdmin');
     const [clientes, setClientes] = useState<any[]>([]);
     const [empleados, setEmpleados] = useState<any[]>([]);
     const [motos, setMotos] = useState<any[]>([]);
     const [referencias, setReferencias] = useState<any[]>([]);

     const [isCreating, setIsCreating] = useState(false);
     const [orders, setOrders] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [error, setError] = useState('');

     const [prodSel, setProdSel] = useState('');
     const [cantidadSel, setCantidadSel] = useState(1);

     const [formData, setFormData] = useState({
         id_cliente: '',
         fecha: new Date().toISOString().split('T')[0],
         id_motocicleta: '',
         observaciones: '',
         servicio: '',
         id_empleado: ''
     });

     const [productos, setProductos] = useState<any[]>([]);
     const navigate = useNavigate();

     // Carga inicial: usuario, órdenes y listas para el formulario
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
         fetchOrders();
         fetchDirectFromSupabase();
     }, []);

     // Cuando cambia el cliente, cargar sus motocicletas
     useEffect(() => {
         setFormData(prev => ({ ...prev, id_motocicleta: '' }));
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

     const fetchOrders = async () => {
         try {
             setLoading(true);
             const data = await orderService.getAll();
             setOrders(data || []);
             setError('');
         } catch (err: any) {
             console.error('Error al cargar órdenes:', err);
             setError('No se pudieron cargar los servicios.');
         } finally {
             setLoading(false);
         }
     };

     // Carga clientes, empleados y productos desde Supabase
     const fetchDirectFromSupabase = async () => {
         const { data: clientesData, error: errC } = await supabase.from('cliente').select('*');
         if (errC) console.error('Error clientes:', errC);
         else setClientes(clientesData || []);

         const { data: empleadosData, error: errE } = await supabase.from('empleado').select('*');
         if (errE) console.error('Error empleados:', errE);
         else setEmpleados(empleadosData || []);

         const { data: refData, error: errR } = await supabase.from('referencia').select('*');
         if (errR) console.error('Error productos:', errR);
         else setReferencias(refData || []);
     };

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setFormData({ ...formData, [name]: value });
     };

     const handleAddProduct = () => {
         const ref = referencias.find(r => String(r.id) === prodSel);
         if (!ref) { alert('Selecciona un producto.'); return; }
         if (cantidadSel <= 0) { alert('La cantidad debe ser mayor a 0.'); return; }

         const yaAgregado = productos
             .filter(p => p.id_referencia === ref.id)
             .reduce((s, p) => s + p.cantidad, 0);
         if (yaAgregado + cantidadSel > Number(ref.stock)) {
             alert(`Stock insuficiente. Disponible: ${ref.stock}`);
             return;
         }

         const precio = Number(ref.precio) || 0;
         setProductos([...productos, {
             id: Date.now(),
             id_referencia: ref.id,
             nombre: ref.descripcion,
             cantidad: cantidadSel,
             precio,
             subtotal: precio * cantidadSel
         }]);
         setProdSel('');
         setCantidadSel(1);
     };

     const handleRemoveProduct = (id: number) => {
         setProductos(productos.filter(p => p.id !== id));
     };

     const escapeHtml = (s: string) =>
         s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

     const handleGenerateQuote = () => {
         if (!formData.id_cliente || !formData.id_motocicleta || !formData.servicio) {
             alert('Selecciona cliente, vehículo y servicio para generar la cotización.');
             return;
         }

         const cliente = clientes.find(c => String(c.id_cliente || c.id) === formData.id_cliente);
         const moto = motos.find(m => String(m.id_motocicleta) === formData.id_motocicleta);
         const empleado = empleados.find(e => String(e.id_empleado) === formData.id_empleado);
         const total = productos.reduce((s, p) => s + p.subtotal, 0);

         const filas = productos.length === 0
             ? '<tr><td colspan="4" style="text-align:center;color:#666">Sin productos</td></tr>'
             : productos.map(p => `
                 <tr>
                     <td>${escapeHtml(p.nombre)}</td>
                     <td style="text-align:center">${p.cantidad}</td>
                     <td style="text-align:right">$${p.precio}</td>
                     <td style="text-align:right">$${p.subtotal}</td>
                 </tr>`).join('');

         const html = `
             <html>
             <head>
                 <title>Cotización MonoStyle</title>
                 <style>
                     body { font-family: Segoe UI, Arial, sans-serif; padding: 40px; color: #111; }
                     h1 { margin-bottom: 0; }
                     .sub { color: #555; margin-top: 4px; }
                     table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                     th, td { border-bottom: 1px solid #ccc; padding: 8px; text-align: left; }
                     .datos p { margin: 4px 0; }
                     .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 16px; }
                 </style>
             </head>
             <body>
                 <h1>MonoStyle - Cotización</h1>
                 <p class="sub">Fecha: ${escapeHtml(formData.fecha)}</p>
                 <div class="datos">
                     <p><b>Cliente:</b> ${escapeHtml(cliente?.nombre || '')}</p>
                     <p><b>Vehículo:</b> ${escapeHtml(moto ? `${moto.modelo} - ${moto.placa}` : '')}</p>
                     <p><b>Servicio:</b> ${escapeHtml(formData.servicio)}</p>
                     <p><b>Empleado:</b> ${escapeHtml(empleado?.nombre || 'Sin asignar')}</p>
                     <p><b>Observaciones:</b> ${escapeHtml(formData.observaciones || '-')}</p>
                 </div>
                 <table>
                     <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
                     <tbody>${filas}</tbody>
                 </table>
                 <p class="total">Total productos: $${total}</p>
                 <script>window.onload = () => window.print();</script>
             </body>
             </html>`;

         const win = window.open('', '_blank');
         if (!win) {
             alert('El navegador bloqueó la ventana. Permite las ventanas emergentes para esta página.');
             return;
         }
         win.document.write(html);
         win.document.close();
     };

     const handleSaveService = async (e: React.FormEvent) => {
         e.preventDefault();

         if (!formData.id_cliente || !formData.id_motocicleta || !formData.id_empleado) {
             alert('Selecciona cliente, vehículo y empleado.');
             return;
         }

         try {
             const creada = await orderService.create({
                 descripcion: formData.observaciones
                     ? `${formData.servicio} - ${formData.observaciones}`
                     : formData.servicio,
                 id_cliente: Number(formData.id_cliente),
                 id_empleado: Number(formData.id_empleado),
                 id_estado_orden: 1,
                 id_motocicleta: Number(formData.id_motocicleta),
                 fecha: formData.fecha
             });

             const idOrden = creada[0].id_orden;
             if (productos.length > 0) {
                 await orderService.addDetalles(productos.map(p => ({
                     cantidad: p.cantidad,
                     precio: p.precio,
                     id_orden: idOrden,
                     id_referencia: p.id_referencia
                 })));
             }

             alert('¡Orden de servicio registrada con éxito!');
             setIsCreating(false);
             setFormData({
                 id_cliente: '',
                 fecha: new Date().toISOString().split('T')[0],
                 id_motocicleta: '',
                 observaciones: '',
                 servicio: '',
                 id_empleado: ''
             });
             setProductos([]);
             fetchOrders();
         } catch (err) {
             console.error('Error al guardar:', err);
             alert('Error al registrar la orden.');
         }
     };

     const handleDelete = async (id: number) => {
         if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
             try {
                 await orderService.delete(id);
                 fetchOrders();
             } catch (err) {
                 console.error('Error al eliminar:', err);
             }
         }
     };

     const handleLogout = () => {
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         navigate('/login');
     };

     const filteredOrders = orders.filter(ord =>
         ord.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
     );

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
                         <Link to="/services" style={{ ...styles.navLink, ...styles.activeLink }}>Servicios</Link>
                         <Link to="/appointments" style={styles.navLink}>Citas</Link>
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

             {/* Contenido Principal */}
             <main style={styles.mainContent}>
                 <header style={styles.header}>
                     <div>
                         <h2 style={styles.pageTitle}>
                             {isCreating ? 'Nueva Orden de Servicio' : 'Gestión de Servicios'}
                         </h2>
                         <p style={styles.pageSubtitle}>
                             {isCreating ? 'Registra una nueva orden de servicio al cliente' : 'Administra los servicios del taller'}
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

                 {!isCreating ? (
                     <>
                         <div style={styles.toolbar}>
                             <button
                                 onClick={() => {
                                     setIsCreating(true);
                                     fetchDirectFromSupabase();
                                 }}
                                 style={styles.addButton}
                             >
                                 + Agregar Servicio
                             </button>
                             <input
                                 type="text"
                                 placeholder="Buscar servicio..."
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 style={styles.searchBox}
                             />
                         </div>

                         {error && <div style={styles.errorAlert}>{error}</div>}

                         <div style={styles.tableContainer}>
                             <table style={styles.table}>
                                 <thead>
                                     <tr style={styles.trHead}>
                                         <th style={styles.th}>ID</th>
                                         <th style={styles.th}>Descripción (Servicio)</th>
                                         <th style={styles.th}>ID Cliente</th>
                                         <th style={styles.th}>ID Empleado</th>
                                         <th style={styles.th}>Estado</th>
                                         <th style={styles.th}>Acciones</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {loading ? (
                                         <tr>
                                             <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                                 Cargando servicios...
                                             </td>
                                         </tr>
                                     ) : filteredOrders.length === 0 ? (
                                         <tr>
                                             <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                                 No se encontraron registros.
                                             </td>
                                         </tr>
                                     ) : (
                                         filteredOrders.map((ord) => (
                                             <tr key={ord.id_orden} style={styles.trBody}>
                                                 <td style={styles.td}>{ord.id_orden}</td>
                                                 <td style={styles.td}>{ord.descripcion}</td>
                                                 <td style={styles.td}>{ord.id_cliente}</td>
                                                 <td style={styles.td}>{ord.id_empleado}</td>
                                                 <td style={styles.td}>
                                                     <span style={styles.activeBadge}>Activo</span>
                                                 </td>
                                                 <td style={styles.td}>
                                                     <div style={styles.actionButtons}>
                                                         <button onClick={() => handleDelete(ord.id_orden)} style={styles.deleteBtn} title="Eliminar">
                                                             🗑️
                                                         </button>
                                                     </div>
                                                 </td>
                                             </tr>
                                         ))
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </>
                 ) : (
                     <form onSubmit={handleSaveService}>
                         <div style={styles.card}>
                             <h3 style={styles.cardTitle}>⚙️ Información del Servicio</h3>

                             <div style={styles.grid2Cols}>
                                 <div>
                                     <label style={styles.labelField}>Cliente *</label>
                                     <select
                                         name="id_cliente"
                                         value={formData.id_cliente}
                                         onChange={handleInputChange}
                                         style={styles.input}
                                         required
                                     >
                                         <option value="">Seleccionar cliente...</option>
                                         {clientes.map(c => (
                                             <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>
                                                 {c.nombre || c.nombres}
                                             </option>
                                         ))}
                                     </select>
                                 </div>
                                 <div>
                                     <label style={styles.labelField}>Fecha *</label>
                                     <div style={styles.inputWithIcon}>
                                         <input
                                             type="date"
                                             name="fecha"
                                             value={formData.fecha}
                                             onChange={handleInputChange}
                                             style={styles.input}
                                             required
                                         />
                                         <span style={styles.inputIcon}>📅</span>
                                     </div>
                                 </div>
                             </div>

                             <div style={{ ...styles.grid2Cols, marginTop: '15px' }}>
                                 <div>
                                     <label style={styles.labelField}>Vehículo *</label>
                                     <select
                                         name="id_motocicleta"
                                         value={formData.id_motocicleta}
                                         onChange={handleInputChange}
                                         style={styles.input}
                                         disabled={!formData.id_cliente}
                                         required
                                     >
                                         <option value="">
                                             {!formData.id_cliente ? 'Primero selecciona un cliente...' : 'Seleccionar vehículo...'}
                                         </option>
                                         {motos.map(m => (
                                             <option key={m.id_motocicleta} value={m.id_motocicleta}>
                                                 {m.modelo} · {m.placa} ({m.anio}, {m.color})
                                             </option>
                                         ))}
                                     </select>
                                 </div>
                                 <div>
                                     <label style={styles.labelField}>Empleado Asignado *</label>
                                     <select
                                         name="id_empleado"
                                         value={formData.id_empleado}
                                         onChange={handleInputChange}
                                         style={styles.input}
                                         required
                                     >
                                         <option value="">Seleccionar empleado...</option>
                                         {empleados.map(emp => {
                                             const libre = [1, 3].includes(Number(emp.id_disponibilidad_empleado));
                                             return (
                                                 <option key={emp.id_empleado} value={emp.id_empleado} disabled={!libre}>
                                                     {emp.nombre} — {emp.especialidad} ({libre ? 'Disponible' : 'No disponible'})
                                                 </option>
                                             );
                                         })}
                                     </select>
                                 </div>
                             </div>

                             <div style={{ marginTop: '15px' }}>
                                 <label style={styles.labelField}>Servicio *</label>
                                 <select
                                     name="servicio"
                                     value={formData.servicio}
                                     onChange={handleInputChange}
                                     style={styles.input}
                                     required
                                 >
                                     <option value="">Seleccionar servicio...</option>
                                     <option value="Cambio de aceite y filtros">Cambio de aceite y filtros</option>
                                     <option value="Mantenimiento general">Mantenimiento general</option>
                                     <option value="Revisión de frenos">Revisión de frenos</option>
                                 </select>
                             </div>

                             <div style={{ marginTop: '15px' }}>
                                 <label style={styles.labelField}>Observaciones</label>
                                 <textarea
                                     name="observaciones"
                                     placeholder="Descripción del servicio..."
                                     value={formData.observaciones}
                                     onChange={handleInputChange}
                                     style={{ ...styles.input, height: '70px', resize: 'vertical' }}
                                 />
                             </div>
                         </div>

                         {/* Tarjeta: Productos Utilizados */}
                         <div style={styles.card}>
                             <div style={styles.cardHeaderFlex}>
                                 <h3 style={styles.cardTitleNoMargin}>📦 Productos Utilizados</h3>
                             </div>

                             <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                 <select value={prodSel} onChange={(e) => setProdSel(e.target.value)} style={{ ...styles.input, flex: 3 }}>
                                     <option value="">Seleccionar producto...</option>
                                     {referencias.map(r => (
                                         <option key={r.id} value={r.id} disabled={Number(r.stock) <= 0}>
                                             {r.descripcion} (stock: {r.stock})
                                         </option>
                                     ))}
                                 </select>
                                 <input
                                     type="number"
                                     min={1}
                                     value={cantidadSel}
                                     onChange={(e) => setCantidadSel(Number(e.target.value))}
                                     style={{ ...styles.input, flex: 1 }}
                                 />
                                 <button type="button" onClick={handleAddProduct} style={styles.addProductBtn}>
                                     + Agregar
                                 </button>
                             </div>

                             <div style={styles.tableHeaderRow}>
                                 <span style={{ flex: 2 }}>Producto</span>
                                 <span style={{ flex: 1, textAlign: 'center' }}>Cantidad</span>
                                 <span style={{ flex: 1, textAlign: 'right' }}>Precio</span>
                                 <span style={{ flex: 1, textAlign: 'right' }}>Subtotal</span>
                                 <span style={{ width: 30 }} />
                             </div>

                             {productos.length === 0 ? (
                                 <p style={styles.emptyText}>No hay productos agregados</p>
                             ) : (
                                 <>
                                     {productos.map((p) => (
                                         <div key={p.id} style={styles.tableBodyRow}>
                                             <span style={{ flex: 2 }}>{p.nombre}</span>
                                             <span style={{ flex: 1, textAlign: 'center' }}>{p.cantidad}</span>
                                             <span style={{ flex: 1, textAlign: 'right' }}>${p.precio}</span>
                                             <span style={{ flex: 1, textAlign: 'right' }}>${p.subtotal}</span>
                                             <button
                                                 type="button"
                                                 onClick={() => handleRemoveProduct(p.id)}
                                                 style={{ ...styles.deleteBtn, width: 30 }}
                                             >
                                                 ✕
                                             </button>
                                         </div>
                                     ))}
                                     <div style={{ textAlign: 'right', marginTop: '10px', fontWeight: 'bold' }}>
                                         Total: ${productos.reduce((s, p) => s + p.subtotal, 0)}
                                     </div>
                                 </>
                             )}
                         </div>

                         {/* Botones Inferiores */}
                         <div style={styles.footerActions}>
                             <button type="submit" style={styles.saveBtn}>
                                 💾 Guardar Servicio
                             </button>
                             <button type="button" onClick={() => setIsCreating(false)} style={styles.cancelBtn}>
                                 ❌ Cancelar
                             </button>
                             <button type="button" onClick={handleGenerateQuote} style={styles.quoteBtn}>
                                 Generar cotización
                             </button>
                         </div>
                     </form>
                 )}
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
     activeBadge: { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', border: '1px solid #22c55e' },
     actionButtons: { display: 'flex', gap: '10px' },
     deleteBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' },
     errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' },
     card: { backgroundColor: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
     cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#3b82f6' },
     cardTitleNoMargin: { fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', margin: 0 },
     cardHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
     grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
     labelField: { fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' },
     input: { width: '100%', padding: '10px 14px', backgroundColor: '#050811', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
     inputWithIcon: { position: 'relative' },
     inputIcon: { position: 'absolute', right: '12px', top: '10px', fontSize: '14px', cursor: 'pointer' },
     addProductBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(29, 78, 216, 0.3)' },
     tableHeaderRow: { display: 'flex', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' },
     tableBodyRow: { display: 'flex', fontSize: '14px', padding: '8px 0', borderBottom: '1px solid #1e293b' },
     emptyText: { textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '15px 0' },
     footerActions: { display: 'flex', gap: '15px', marginTop: '20px' },
     saveBtn: { backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(29, 78, 216, 0.4)' },
     cancelBtn: { backgroundColor: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
     quoteBtn: { backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
 };