import { useState, useEffect } from 'react';
import { AlertTriangle, Search, PackageX, ArrowRight, CheckCircle } from 'lucide-react';
import { obtenerProductosStockBajo } from '../../services/productoService';
import { Link } from 'react-router-dom';

export default function StockBajo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductosStockBajo();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando el stock bajo:", error);
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(item => 
    item.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    item.codigo.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  // Estadísticas rápidas
  const agotados = productos.filter(p => p.stockActual === 0).length;
  const enRiesgo = productos.filter(p => p.stockActual > 0).length;

  return (
    <div className="space-y-6">
      
      {/* TARJETAS DE INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex items-center">
          <div className="bg-red-50 p-3 rounded-lg mr-4">
            <PackageX className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Totalmente Agotados</p>
            <p className="text-2xl font-black text-red-600">{agotados} Artículos</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100 flex items-center">
          <div className="bg-yellow-50 p-3 rounded-lg mr-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">En Riesgo (Stock Mínimo)</p>
            <p className="text-2xl font-black text-yellow-600">{enRiesgo} Artículos</p>
          </div>
        </div>

        <div className="bg-gym-dark p-5 rounded-xl shadow-sm border border-neutral-800 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-bold text-gray-400 mb-2">¿Necesitas reabastecer?</p>
          <Link to="/dashboard/ordenes" className="flex items-center px-4 py-2 bg-gym-yellow text-gym-dark font-black text-xs rounded-lg hover:bg-yellow-500 transition-colors uppercase tracking-wider">
            Generar Orden de Compra <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow transition-colors placeholder-gray-400 font-medium"
            placeholder="Buscar artículo en riesgo por código o nombre..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE ALERTAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Código SKU</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Producto y Categoría</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">Analizando inventario...</td></tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-gray-500 font-bold">¡Todo en orden!</p>
                      <p className="text-sm text-gray-400">No hay productos con stock bajo en este momento.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((item) => {
                  const isAgotado = item.stockActual === 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{item.codigo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gym-dark">{item.nombre}</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">{item.categoriaNombre}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-gray-500">{item.stockMinimo} unds.</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-lg font-black ${isAgotado ? 'text-red-600' : 'text-yellow-600'}`}>
                          {item.stockActual}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isAgotado ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                            <PackageX className="w-3 h-3 mr-1" /> Agotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-200">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Crítico
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}