import { useState, useEffect } from 'react';
import { Package, Search, Eye, CheckCircle, Clock, Truck, XCircle, ShoppingBag } from 'lucide-react';
import { obtenerPedidosAdmin, cambiarEstadoPedido } from '../../services/admin/pedidoAdminService';

export default function PedidosWeb() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');
  
  // Modal de detalles
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const data = await obtenerPedidosAdmin();
      setPedidos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoPedido(id, nuevoEstado);
      cargarPedidos(); // Recargamos para reflejar el cambio
    } catch (error) {
      alert(error.message);
    }
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      PAGADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PREPARANDO: "bg-blue-100 text-blue-800 border-blue-200",
      LISTO_RECOJO: "bg-orange-100 text-orange-800 border-orange-200",
      ENTREGADO: "bg-green-100 text-green-800 border-green-200",
      CANCELADO: "bg-red-100 text-red-800 border-red-200"
    };
    
    const iconos = {
      PAGADO: <Clock className="w-4 h-4 mr-1"/>,
      PREPARANDO: <Package className="w-4 h-4 mr-1"/>,
      LISTO_RECOJO: <Truck className="w-4 h-4 mr-1"/>,
      ENTREGADO: <CheckCircle className="w-4 h-4 mr-1"/>,
      CANCELADO: <XCircle className="w-4 h-4 mr-1"/>
    };

    return (
      <span className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${estilos[estado]}`}>
        {iconos[estado]} {estado.replace('_', ' ')}
      </span>
    );
  };

  // Formato para que la fecha se vea humana: "12/05/2026 14:30"
  const formatearFecha = (fechaArray) => {
    if (!fechaArray) return '';
    const [year, month, day, hour, minute] = fechaArray;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const filtrados = pedidos.filter(p => 
    p.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) || 
    p.transaccionId.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center">
            <ShoppingBag className="mr-3 text-gym-yellow h-8 w-8" /> 
            Gestión de Pedidos Web
          </h1>
          <p className="text-gray-500 mt-1">Administra y despacha las compras realizadas por internet.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o N° Orden..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="text-center py-10 text-gray-500 font-medium">Cargando pedidos...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">N° Orden / Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Pago</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado Actual</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay pedidos registrados.</td></tr>
              ) : (
                filtrados.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-800">{pedido.transaccionId}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatearFecha(pedido.fechaCreacion)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-800">{pedido.clienteNombre}</div>
                      <div className="text-xs text-gray-500 mt-1">Doc: {pedido.clienteDocumento}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                        {pedido.metodoPago}
                      </span>
                    </td>
                    <td className="p-4 font-black text-gym-dark">S/ {pedido.total.toFixed(2)}</td>
                    <td className="p-4">{getEstadoBadge(pedido.estado)}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Detalles y Gestionar"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE GESTIÓN DEL PEDIDO */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-black text-gray-800">Orden: {pedidoSeleccionado.transaccionId}</h2>
                <p className="text-sm text-gray-500">Cliente: {pedidoSeleccionado.clienteNombre}</p>
              </div>
              <button onClick={() => setPedidoSeleccionado(null)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">Productos a Despachar</h3>
              <div className="space-y-4 mb-8">
                {pedidoSeleccionado.detalles.map((detalle, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center font-black text-gray-500">
                        {detalle.cantidad}x
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{detalle.productoNombre}</p>
                        <p className="text-xs text-gray-500">S/ {detalle.precioUnitario.toFixed(2)} c/u</p>
                      </div>
                    </div>
                    <div className="font-black text-gray-800">
                      S/ {detalle.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">Gestión de Estado</h3>
                <div className="flex flex-wrap gap-3">
                  {(() => {
                    // Jerarquía de estados (Máquina de Estados)
                    const niveles = { 'PAGADO': 1, 'PREPARANDO': 2, 'LISTO_RECOJO': 3, 'ENTREGADO': 4 };
                    const nivelActual = niveles[pedidoSeleccionado.estado] || 0;

                    return (
                      <>
                        <button 
                          disabled={nivelActual >= 1}
                          onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'PAGADO')} 
                          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${nivelActual >= 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          1. Pagado
                        </button>
                        
                        <button 
                          disabled={nivelActual >= 2}
                          onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'PREPARANDO')} 
                          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${nivelActual >= 2 ? (pedidoSeleccionado.estado === 'PREPARANDO' ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed') : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                        >
                          2. Preparando
                        </button>
                        
                        <button 
                          disabled={nivelActual >= 3}
                          onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'LISTO_RECOJO')} 
                          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${nivelActual >= 3 ? (pedidoSeleccionado.estado === 'LISTO_RECOJO' ? 'bg-orange-100 border-orange-400 text-orange-800' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed') : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                        >
                          3. Listo para Recojo
                        </button>
                        
                        <button 
                          disabled={nivelActual >= 4}
                          onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'ENTREGADO')} 
                          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${nivelActual >= 4 ? (pedidoSeleccionado.estado === 'ENTREGADO' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed') : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}
                        >
                          4. Entregado
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}