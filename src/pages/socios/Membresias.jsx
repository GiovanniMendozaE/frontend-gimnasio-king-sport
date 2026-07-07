import { useState, useEffect } from 'react';
import { Plus, Search, ShieldCheck, ShieldAlert, X, Activity, XCircle, History, Clock } from 'lucide-react';
import { obtenerMembresias, asignarMembresia, anularMembresia } from '../../services/membresiaService';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerPlanes } from '../../services/planService';

export default function Membresias() {
  const [membresias, setMembresias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Estados de Modales
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Para ver el historial
  
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState({ clienteId: '', planId: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataMembresias, dataClientes, dataPlanes] = await Promise.all([
        obtenerMembresias(),
        obtenerClientes(true),
        obtenerPlanes(true)
      ]);
      setMembresias(dataMembresias);
      setClientes(dataClientes);
      setPlanes(dataPlanes);
    } catch (error) {
      console.error("Error cargando el módulo de membresías:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await asignarMembresia({
        clienteId: parseInt(formulario.clienteId),
        planId: parseInt(formulario.planId)
      });
      await cargarDatos();
      setModalAsignarAbierto(false);
      alert("¡Membresía asignada con éxito!");
    } catch (error) {
      // AQUÍ SE MUESTRA EL MENSAJE DE REGLA DE NEGOCIO DE TU BACKEND
      alert(error.message); 
    } finally {
      setGuardando(false);
    }
  };

  const handleAnular = async (id, cliente) => {
    if (window.confirm(`¿Seguro que deseas ANULAR la membresía de ${cliente}?`)) {
      try {
        await anularMembresia(id);
        await cargarDatos();
      } catch (error) {
        alert("Error al anular.");
      }
    }
  };

  // --- LÓGICA DE AGRUPACIÓN (Para escalar a 1000+ clientes) ---
  const membresiasAgrupadas = [];
  const nombresUnicos = [...new Set(membresias.map(m => m.clienteNombre))];
  
  nombresUnicos.forEach(nombre => {
    const historialCliente = membresias.filter(m => m.clienteNombre === nombre);
    // Ordenar de la más nueva a la más antigua
    historialCliente.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    
    const membresiaActiva = historialCliente.find(m => m.estado === 'ACTIVA');
    const membresiaMostrar = membresiaActiva || historialCliente[0]; // Mostrar la activa, o la última que tuvo
    
    membresiasAgrupadas.push({
      clienteNombre: nombre,
      membresiaActual: membresiaMostrar,
      historial: historialCliente
    });
  });

  const filtradas = membresiasAgrupadas.filter(item => 
    item.clienteNombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  // Estadísticas KPI (Basado en el total global, no en las agrupadas)
  const activas = membresias.filter(m => m.estado === 'ACTIVA').length;
  const vencidas = membresias.filter(m => m.estado === 'VENCIDA').length;

  return (
    <div className="space-y-6">
      
      {/* TARJETAS DE INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 flex items-center">
          <div className="bg-green-50 p-3 rounded-lg mr-4"><ShieldCheck className="h-6 w-6 text-green-600" /></div>
          <div><p className="text-sm font-bold text-gray-500 uppercase">Socios Activos</p><p className="text-2xl font-black text-green-600">{activas}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex items-center">
          <div className="bg-red-50 p-3 rounded-lg mr-4"><ShieldAlert className="h-6 w-6 text-red-600" /></div>
          <div><p className="text-sm font-bold text-gray-500 uppercase">Membresías Vencidas</p><p className="text-2xl font-black text-red-600">{vencidas}</p></div>
        </div>
        <div className="bg-gym-dark p-5 rounded-xl shadow-sm border border-neutral-800 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-bold text-gray-400 mb-2">Renovaciones y Nuevos</p>
          <button onClick={() => { setFormulario({ clienteId: '', planId: '' }); setModalAsignarAbierto(true); }} className="flex items-center px-4 py-2 bg-gym-yellow text-gym-dark font-black text-xs rounded-lg hover:bg-yellow-500 uppercase">
            <Plus className="h-4 w-4 mr-2" /> Asignar Plan
          </button>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow" placeholder="Buscar socio..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>
      </div>

      {/* TABLA PRINCIPAL AGRUPADA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Cliente / Socio</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Plan Actual / Último</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Vigencia</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Estado Actual</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Cargando registros...</td></tr> : 
               filtradas.length === 0 ? <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No hay membresías registradas.</td></tr> : 
               filtradas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gym-dark">{item.clienteNombre}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-600">{item.membresiaActual.planNombre}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-gray-600">{new Date(item.membresiaActual.fechaInicio).toLocaleDateString()} <span className="text-gray-300 mx-1">➜</span> {new Date(item.membresiaActual.fechaFin).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${item.membresiaActual.estado === 'ACTIVA' ? 'bg-green-50 text-green-600 border-green-200' : item.membresiaActual.estado === 'VENCIDA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {item.membresiaActual.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => { setClienteSeleccionado(item); setModalHistorialAbierto(true); }} className="px-3 py-1.5 flex items-center text-xs font-bold bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                          <History className="h-4 w-4 mr-1" /> Historial
                        </button>
                        {item.membresiaActual.estado === 'ACTIVA' && (
                          <button onClick={() => handleAnular(item.membresiaActual.id, item.clienteNombre)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Anular Membresía Actual">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE HISTORIAL */}
      {modalHistorialAbierto && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-black text-gym-dark flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gym-yellow" /> Historial de: {clienteSeleccionado.clienteNombre}
              </h3>
              <button onClick={() => setModalHistorialAbierto(false)} className="text-gray-400 hover:text-red-500"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-white border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Plan</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase">Período</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase">Pagado</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clienteSeleccionado.historial.map(hist => (
                    <tr key={hist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-sm text-gray-700">{hist.planNombre}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 text-center">{new Date(hist.fechaInicio).toLocaleDateString()} - {new Date(hist.fechaFin).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-700 text-center">S/ {hist.precioPagado.toFixed(2)}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${hist.estado === 'ACTIVA' ? 'bg-green-50 text-green-600 border-green-200' : hist.estado === 'VENCIDA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {hist.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN DE PLAN */}
      {modalAsignarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-black text-gym-dark flex items-center"><Activity className="h-5 w-5 mr-2 text-gym-yellow" /> Asignar Plan a Socio</h3>
              <button onClick={() => setModalAsignarAbierto(false)} className="text-gray-400 hover:text-red-500"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Seleccionar Cliente</label>
                  <select required name="clienteId" value={formulario.clienteId} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none">
                    <option value="" disabled>-- Elige un socio --</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.documento} - {c.nombreCompleto}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Plan de Entrenamiento</label>
                  <select required name="planId" value={formulario.planId} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none">
                    <option value="" disabled>-- Elige un plan --</option>
                    {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} (S/ {p.precio})</option>)}
                  </select>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setModalAsignarAbierto(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 px-4 py-3 bg-gym-yellow text-gym-dark font-black text-sm rounded-lg hover:bg-yellow-500 disabled:opacity-50 uppercase tracking-wider">
                  {guardando ? 'Procesando...' : 'Activar Pase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}