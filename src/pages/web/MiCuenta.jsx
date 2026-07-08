import { useState, useEffect } from 'react';
import { User, Package, Dumbbell, Clock, CheckCircle, Truck, ArrowLeft, Loader2, Activity } from 'lucide-react';
import { obtenerHistorialPedidos } from '../../services/web/pedidoWebService';
import { obtenerRutinasCliente } from '../../services/web/rutinaWebService'; // IMPORTAMOS EL NUEVO SERVICIO

export default function MiCuenta({ usuarioLogueado, onVolverTienda }) {
  const [pestañaActiva, setPestañaActiva] = useState('pedidos');
  
  const [misPedidos, setMisPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  
  const [misRutinas, setMisRutinas] = useState([]); 
  const [cargandoRutinas, setCargandoRutinas] = useState(false);

  // Efecto inteligente: Solo carga lo que el usuario está viendo
  useEffect(() => {
    if (usuarioLogueado?.id) {
      if (pestañaActiva === 'pedidos') {
        cargarMisPedidos(usuarioLogueado.id);
      } else if (pestañaActiva === 'rutinas') {
        cargarMisRutinas(usuarioLogueado.id);
      }
    }
  }, [usuarioLogueado, pestañaActiva]);

  const cargarMisPedidos = async (clienteId) => {
    try {
      setCargandoPedidos(true);
      const data = await obtenerHistorialPedidos(clienteId);
      setMisPedidos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoPedidos(false);
    }
  };

  const cargarMisRutinas = async (clienteId) => {
    try {
      setCargandoRutinas(true);
      const data = await obtenerRutinasCliente(clienteId);
      setMisRutinas(data);
    } catch (error) {
      console.error("Aún no hay backend para rutinas:", error.message);
    } finally {
      setCargandoRutinas(false);
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
      ENTREGADO: <CheckCircle className="w-4 h-4 mr-1"/>
    };

    return (
      <span className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${estilos[estado] || "bg-gray-100 border-gray-200"}`}>
        {iconos[estado]} {estado ? estado.replace('_', ' ') : ''}
      </span>
    );
  };

  const formatearFecha = (fechaArray) => {
    if (!fechaArray) return '';
    const [year, month, day, hour, minute] = fechaArray;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gym-yellow rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <User className="h-8 w-8 text-gym-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gym-dark uppercase tracking-tight">Mi Perfil</h1>
              <p className="text-gray-500 font-medium">{usuarioLogueado?.nombre} • {usuarioLogueado?.email}</p>
            </div>
          </div>
          <button onClick={onVolverTienda} className="flex items-center px-4 py-2 bg-white text-gray-600 hover:text-gym-dark hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-sm border border-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la Tienda
          </button>
        </div>

        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button onClick={() => setPestañaActiva('pedidos')} className={`flex items-center px-6 py-4 font-black text-sm uppercase tracking-wider border-b-2 transition-colors ${pestañaActiva === 'pedidos' ? 'border-gym-yellow text-gym-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Package className="w-5 h-5 mr-2" /> Mis Pedidos Web
          </button>
          <button onClick={() => setPestañaActiva('rutinas')} className={`flex items-center px-6 py-4 font-black text-sm uppercase tracking-wider border-b-2 transition-colors ${pestañaActiva === 'rutinas' ? 'border-gym-yellow text-gym-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Dumbbell className="w-5 h-5 mr-2" /> Mis Rutinas
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
          
          {/* PESTAÑA: PEDIDOS */}
          {pestañaActiva === 'pedidos' && (
            <div>
              {cargandoPedidos ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gym-yellow" /></div>
              ) : misPedidos.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <Package className="w-16 h-16 text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-gray-400">Aún no has realizado ninguna compra</h3>
                  <p className="text-gray-400 text-sm mt-1">Tus suplementos comprados aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {misPedidos.map(pedido => (
                    <div key={pedido.transaccionId} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Orden N°</p>
                          <p className="font-black text-gym-dark">{pedido.transaccionId}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Fecha</p>
                          <p className="font-bold text-gray-700">{formatearFecha(pedido.fechaCreacion)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Total</p>
                          <p className="font-black text-gym-dark">S/ {pedido.total.toFixed(2)}</p>
                        </div>
                        <div>
                          {getEstadoBadge(pedido.estado)}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Productos</h4>
                        <div className="space-y-3">
                          {pedido.detalles.map((detalle, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex items-center">
                                <span className="font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md mr-3">{detalle.cantidad}x</span>
                                <span className="font-bold text-gray-700">{detalle.productoNombre}</span>
                              </div>
                              <span className="font-bold text-gray-600">S/ {detalle.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: RUTINAS */}
          {pestañaActiva === 'rutinas' && (
            <div>
              {cargandoRutinas ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gym-yellow" /></div>
              ) : misRutinas.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <Dumbbell className="w-16 h-16 text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-gray-400">No tienes rutinas asignadas</h3>
                  <p className="text-gray-400 text-sm mt-1">Solicita a tu entrenador que te asigne un plan de entrenamiento.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {misRutinas.map(rutina => (
                    <div key={rutina.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      
                      {/* Cabecera de la Rutina */}
                      <div className="bg-gym-dark text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-6 w-6 text-gym-yellow mr-3" />
                          <div>
                            <h3 className="text-lg font-black uppercase tracking-wide">{rutina.nombre}</h3>
                            <p className="text-xs text-gray-400 font-bold">{rutina.objetivo}</p>
                          </div>
                        </div>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                          {rutina.nivel || 'General'}
                        </span>
                      </div>
                      
                      {/* Lista de Ejercicios */}
                      <div className="p-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Ejercicios Asignados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {rutina.ejercicios.map((ejercicio, idx) => (
                            <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="h-10 w-10 bg-gym-yellow rounded-lg flex items-center justify-center font-black text-gym-dark mr-4">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm text-gray-800">{ejercicio.nombre}</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                  {ejercicio.series} series x {ejercicio.repeticiones} repeticiones
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}