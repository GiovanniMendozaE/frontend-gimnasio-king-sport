import { useState, useEffect } from 'react';
import { 
  Banknote, Globe, Clock, UserCheck, Users, Award, 
  CheckCircle, AlertTriangle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { obtenerKpisDashboard } from '../../services/admin/dashboardService'; // Importamos tu servicio

const dataAsistencias = [
  { name: 'Lun', valor: 0 }, { name: 'Mar', valor: 0 }, { name: 'Mié', valor: 0 },
  { name: 'Jue', valor: 0 }, { name: 'Vie', valor: 0 }, { name: 'Sáb', valor: 0 }, { name: 'Dom', valor: 0 }
];

export default function Dashboard() {
  const [cargando, setCargando] = useState(true);
  
  // Estado para guardar los datos de tu DashboardResponseDTO
  const [kpis, setKpis] = useState({
    totalIngresosVentas: 0,
    totalIngresosMembresias: 0,
    gananciasTotales: 0,
    clientesActivos: 0,
    productosStockCritico: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await obtenerKpisDashboard();
      setKpis(data); // Aquí guardamos lo que responde el backend
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Panel de Control</h1>
        <p className="text-sm text-gray-500">Resumen operativo de hoy.</p>
      </div>

      {cargando ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">
          Actualizando métricas en tiempo real...
        </div>
      ) : (
        <>
          {/* FILA 1: TARJETAS DE KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            
            {/* Ganancias Totales */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
              <div className="bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                <Banknote className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ganancias Totales</p>
                <p className="text-xl font-black text-gray-800">S/ {kpis.gananciasTotales?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {/* Ingresos por Ventas */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ventas Productos</p>
                <p className="text-xl font-black text-gray-800">S/ {kpis.totalIngresosVentas?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {/* Ingresos Membresías */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
              <div className="bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Membresías</p>
                <p className="text-xl font-black text-gray-800">S/ {kpis.totalIngresosMembresias?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {/* Clientes Activos */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
              <div className="bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Clientes Activos</p>
                <p className="text-xl font-black text-gray-800">{kpis.clientesActivos || 0}</p>
                <p className="text-[10px] text-red-500 font-bold mt-1">Con plan vigente</p>
              </div>
            </div>

            {/* Stock Crítico (Alerta) */}
            <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow ${kpis.productosStockCritico > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <div className={`${kpis.productosStockCritico > 0 ? 'bg-red-100' : 'bg-orange-50'} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                <Clock className={`w-4 h-4 ${kpis.productosStockCritico > 0 ? 'text-red-600' : 'text-orange-500'}`} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${kpis.productosStockCritico > 0 ? 'text-red-700' : 'text-gray-400'}`}>Alertas de Stock</p>
                <p className={`text-xl font-black ${kpis.productosStockCritico > 0 ? 'text-red-700' : 'text-gray-800'}`}>{kpis.productosStockCritico || 0}</p>
                <p className={`text-[10px] font-bold mt-1 ${kpis.productosStockCritico > 0 ? 'text-red-600' : 'text-orange-500'}`}>
                  Productos por agotarse
                </p>
              </div>
            </div>
          </div>

          {/* FILA 2: GRÁFICAS (Se mantienen estáticas hasta conectar a BD) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-72">
              <h3 className="text-sm font-bold text-gray-800 mb-6">Actividad Semanal (Asistencias)</h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={dataAsistencias}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={[-1, 1]} tickCount={6} />
                  <Tooltip />
                  <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-72">
              <h3 className="text-sm font-bold text-gray-800 mb-6">Tendencia de Ingresos Diarios</h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={dataAsistencias}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={[-1, 1]} tickCount={6} />
                  <Tooltip />
                  <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FILA 3: TABLA INFORMATIVA DE STOCK */}
          <div className="grid grid-cols-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Estado del Inventario</h3>
              </div>
              <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[150px]">
                 {kpis.productosStockCritico === 0 ? (
                   <>
                     <div className="bg-emerald-50 h-12 w-12 rounded-full flex items-center justify-center mb-3">
                       <CheckCircle className="w-6 h-6 text-emerald-500" />
                     </div>
                     <p className="text-xs font-medium text-gray-500">Inventario 100% saludable</p>
                   </>
                 ) : (
                   <>
                     <div className="bg-red-50 h-12 w-12 rounded-full flex items-center justify-center mb-3">
                       <AlertTriangle className="w-6 h-6 text-red-500" />
                     </div>
                     <p className="text-xs font-bold text-red-600">Revisar módulo de Stock Crítico ({kpis.productosStockCritico} alertas)</p>
                   </>
                 )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}