import { useState, useEffect } from 'react';
import { Package, Search, Eye, CheckCircle, Clock, Truck, XCircle, ShoppingBag, History, User, AlertTriangle } from 'lucide-react';
import { obtenerPedidosAdmin, cambiarEstadoPedido } from '../../services/admin/pedidoAdminService';

export default function PedidosWeb() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');
  
  const [tabActiva, setTabActiva] = useState('PROCESO'); 
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
      // Confirmación extra solo para cancelaciones
      if (nuevoEstado === 'CANCELADO') {
        const confirmar = window.confirm("¿Estás seguro de cancelar este pedido? Se devolverá el stock automáticamente y el cliente no podrá recogerlo.");
        if (!confirmar) return;
      }

      const pedidoActualizado = await cambiarEstadoPedido(id, nuevoEstado);
      setPedidoSeleccionado(pedidoActualizado); 
      cargarPedidos(); 
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
      <span className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${estilos[estado] || "bg-gray-100 border-gray-200"}`}>
        {iconos[estado]} {estado.replace('_', ' ')}
      </span>
    );
  };

  const formatearFecha = (fechaOriginal) => {
    if (!fechaOriginal) return '';
    try {
      if (typeof fechaOriginal === 'string') {
        const fecha = new Date(fechaOriginal);
        return fecha.toLocaleString('es-PE', { 
          day: '2-digit', month: '2-digit', year: 'numeric', 
          hour: '2-digit', minute: '2-digit', hour12: false 
        });
      }
      if (Array.isArray(fechaOriginal)) {
        const [year, month, day, hour, minute] = fechaOriginal;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
      return fechaOriginal;
    } catch (e) {
      return fechaOriginal;
    }
  };

  const filtrados = pedidos.filter(p => {
    const coincideBusqueda = p.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) || 
                             p.clienteDocumento.includes(filtro) ||
                             p.transaccionId.toLowerCase().includes(filtro.toLowerCase());
    
    if (!coincideBusqueda) return false;

    if (tabActiva === 'PROCESO') {
      return ['PAGADO', 'PREPARANDO', 'LISTO_RECOJO'].includes(p.estado);
    } else if (tabActiva === 'FINALIZADOS') {
      return ['ENTREGADO', 'CANCELADO'].includes(p.estado);
    }
    return true; 
  });

  const verHistorialCliente = (documento) => {
    setFiltro(documento); 
    setTabActiva('TODOS'); 
  };

  return (
    <div className="p-6">
      {/* HEADER FUSIONADO: Pestañas a la izquierda, Buscador a la derecha */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-6 border-b border-gray-200 pb-2 gap-4">
        
        <div className="flex space-x-6 overflow-x-auto w-full sm:w-auto">
          <button onClick={() => setTabActiva('PROCESO')} className={`pb-3 text-sm font-black uppercase tracking-wider transition-colors whitespace-nowrap ${tabActiva === 'PROCESO' ? 'border-b-2 border-gym-yellow text-gym-dark' : 'text-gray-400 hover:text-gray-600'}`}>
            En Proceso
          </button>
          <button onClick={() => setTabActiva('FINALIZADOS')} className={`pb-3 text-sm font-black uppercase tracking-wider transition-colors whitespace-nowrap ${tabActiva === 'FINALIZADOS' ? 'border-b-2 border-gym-yellow text-gym-dark' : 'text-gray-400 hover:text-gray-600'}`}>
            Finalizados
          </button>
          <button onClick={() => setTabActiva('TODOS')} className={`pb-3 text-sm font-black uppercase tracking-wider transition-colors whitespace-nowrap ${tabActiva === 'TODOS' ? 'border-b-2 border-gym-yellow text-gym-dark' : 'text-gray-400 hover:text-gray-600'}`}>
            Historial Completo
          </button>
        </div>

        <div className="relative w-full sm:w-72 pb-2">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar DNI, Cliente o N° Orden" 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow w-full transition-all"
          />
          {filtro && (
            <button onClick={() => setFiltro('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500">
              <XCircle className="w-5 h-5" />
            </button>
          )}
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
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No se encontraron pedidos en esta sección.</td></tr>
              ) : (
                filtrados.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-800">{pedido.transaccionId}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatearFecha(pedido.fechaCreacion)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-800 line-clamp-1">{pedido.clienteNombre}</div>
                      <div className="text-xs text-gray-500 mt-1">Doc: {pedido.clienteDocumento}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                        {pedido.metodoPago}
                      </span>
                    </td>
                    <td className="p-4 font-black text-gym-dark">S/ {pedido.total.toFixed(2)}</td>
                    <td className="p-4">{getEstadoBadge(pedido.estado)}</td>
                    <td className="p-4 flex justify-center space-x-2">
                      <button 
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Detalles y Gestionar"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => verHistorialCliente(pedido.clienteDocumento)}
                        className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gym-dark rounded-lg transition-colors"
                        title="Ver historial de compras de este cliente"
                      >
                        <History className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-black text-gray-800 flex items-center">
                  Orden: {pedidoSeleccionado.transaccionId}
                </h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <User className="w-4 h-4 mr-1"/> {pedidoSeleccionado.clienteNombre}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {getEstadoBadge(pedidoSeleccionado.estado)}
                <button onClick={() => setPedidoSeleccionado(null)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle className="w-7 h-7"/></button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest flex items-center">
                <Package className="w-4 h-4 mr-2"/> Productos a Despachar
              </h3>
              
              <div className="space-y-3 mb-8">
                {pedidoSeleccionado.detalles.map((detalle, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-black text-gray-500 shadow-sm">
                        {detalle.cantidad}x
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{detalle.productoNombre}</p>
                        <p className="text-xs text-gray-500 mt-1">S/ {detalle.precioUnitario.toFixed(2)} unidad</p>
                      </div>
                    </div>
                    <div className="font-black text-gym-dark text-lg">
                      S/ {detalle.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* CONTROLES ADMINISTRATIVOS */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><Truck className="w-4 h-4 mr-2"/> Actualizar Progreso Logístico</span>
                </h3>
                
                <div className="flex justify-between items-end gap-6">
                  {/* Máquina de Estados (Izquierda) */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(() => {
                      const niveles = { 'PAGADO': 1, 'PREPARANDO': 2, 'LISTO_RECOJO': 3, 'ENTREGADO': 4, 'CANCELADO': 99 };
                      const nivelActual = niveles[pedidoSeleccionado.estado] || 0;

                      return (
                        <>
                          <button disabled={true} className={`px-2 py-3 text-xs font-bold rounded-xl border transition-all ${nivelActual >= 1 && nivelActual !== 99 ? 'bg-yellow-50 border-yellow-400 text-yellow-800' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                            1. Pagado
                          </button>
                          
                          <button 
                            disabled={nivelActual !== 1}
                            onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'PREPARANDO')} 
                            className={`px-2 py-3 text-xs font-bold rounded-xl border transition-all ${nivelActual >= 2 && nivelActual !== 99 ? 'bg-blue-50 border-blue-400 text-blue-800' : (nivelActual === 1 ? 'bg-white text-blue-600 border-blue-400 shadow-md hover:bg-blue-600 hover:text-white cursor-pointer' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed')}`}
                          >
                            2. Preparando
                          </button>
                          
                          <button 
                            disabled={nivelActual !== 2}
                            onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'LISTO_RECOJO')} 
                            className={`px-2 py-3 text-xs font-bold rounded-xl border transition-all ${nivelActual >= 3 && nivelActual !== 99 ? 'bg-orange-50 border-orange-400 text-orange-800' : (nivelActual === 2 ? 'bg-white text-orange-600 border-orange-400 shadow-md hover:bg-orange-600 hover:text-white cursor-pointer' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed')}`}
                          >
                            3. Listo p/ Recojo
                          </button>
                          
                          <button 
                            disabled={nivelActual !== 3}
                            onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'ENTREGADO')} 
                            className={`px-2 py-3 text-xs font-bold rounded-xl border transition-all ${nivelActual >= 4 && nivelActual !== 99 ? 'bg-green-50 border-green-400 text-green-800' : (nivelActual === 3 ? 'bg-white text-green-600 border-green-400 shadow-md hover:bg-green-600 hover:text-white cursor-pointer' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed')}`}
                          >
                            4. Entregado
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  {/* Botón de Cancelación (Derecha) */}
                  {pedidoSeleccionado.estado !== 'ENTREGADO' && pedidoSeleccionado.estado !== 'CANCELADO' && (
                    <button 
                      onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'CANCELADO')}
                      className="flex flex-col items-center justify-center px-4 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-500 rounded-xl transition-all h-[100%]"
                      title="Devolver stock y cancelar"
                    >
                      <AlertTriangle className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-black uppercase text-center leading-tight">Cancelar<br/>Pedido</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}