import { useState, useEffect } from 'react';
import { User, Package, Dumbbell, Clock, CheckCircle, Truck, ArrowLeft, Loader2, Activity, XCircle } from 'lucide-react';
import { obtenerHistorialPedidos } from '../../services/web/pedidoWebService';
import { obtenerRutinasCliente } from '../../services/web/rutinaWebService';

export default function MiCuenta({ usuarioLogueado, onVolverTienda }) {
  const [pestañaActiva, setPestañaActiva] = useState('pedidos');
  
  const [misPedidos, setMisPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  
  const [misRutinas, setMisRutinas] = useState([]); 
  const [cargandoRutinas, setCargandoRutinas] = useState(false);

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
      PAGADO: "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm",
      PREPARANDO: "bg-blue-100 text-blue-800 border-blue-300 shadow-sm",
      LISTO_RECOJO: "bg-orange-100 text-orange-800 border-orange-300 shadow-sm",
      ENTREGADO: "bg-green-100 text-green-800 border-green-300 shadow-sm",
      CANCELADO: "bg-red-100 text-red-800 border-red-300 shadow-sm"
    };
    
    const iconos = {
      PAGADO: <Clock className="w-4 h-4 mr-1"/>,
      PREPARANDO: <Package className="w-4 h-4 mr-1"/>,
      LISTO_RECOJO: <Truck className="w-4 h-4 mr-1"/>,
      ENTREGADO: <CheckCircle className="w-4 h-4 mr-1"/>,
      CANCELADO: <XCircle className="w-4 h-4 mr-1"/>
    };

    return (
      <span className={`flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide border uppercase ${estilos[estado] || "bg-gray-100 border-gray-200"}`}>
        {iconos[estado]} {estado ? estado.replace('_', ' ') : ''}
      </span>
    );
  };

  // LÓGICA DE FECHA CORREGIDA (Soporta Arrays y Strings ISO)
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    try {
      if (typeof fecha === 'string') {
        const d = new Date(fecha);
        return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      }
      if (Array.isArray(fecha)) {
        const [year, month, day, hour, minute] = fecha;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    } catch (e) { return fecha; }
    return fecha;
  };

  return (
    // 1. Oscurecemos ligeramente el fondo principal (bg-gray-100) para que lo blanco resalte
    <div className="min-h-screen bg-gray-100 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del Perfil */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-5">
            <div className="h-20 w-20 bg-gradient-to-tr from-gym-yellow to-yellow-300 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <User className="h-10 w-10 text-gym-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gym-dark uppercase tracking-tight drop-shadow-sm">Mi Perfil</h1>
              <p className="text-gray-500 font-medium mt-1">{usuarioLogueado?.nombre} • {usuarioLogueado?.email}</p>
            </div>
          </div>
          <button onClick={onVolverTienda} className="flex items-center px-5 py-2.5 bg-white text-gray-700 hover:text-gym-dark hover:bg-gray-50 hover:shadow-md rounded-xl font-bold transition-all shadow-sm border border-gray-200">
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver a la Tienda
          </button>
        </div>

        {/* 2. Pestañas rediseñadas como "botones flotantes" en lugar de líneas planas */}
        <div className="flex space-x-3 mb-6">
          <button 
            onClick={() => setPestañaActiva('pedidos')} 
            className={`flex items-center px-6 py-3.5 font-black text-sm uppercase tracking-wider rounded-t-xl transition-all ${pestañaActiva === 'pedidos' ? 'bg-white text-gym-dark shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-gym-yellow' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700'}`}
          >
            <Package className="w-5 h-5 mr-2" /> Mis Pedidos Web
          </button>
          <button 
            onClick={() => setPestañaActiva('rutinas')} 
            className={`flex items-center px-6 py-3.5 font-black text-sm uppercase tracking-wider rounded-t-xl transition-all ${pestañaActiva === 'rutinas' ? 'bg-white text-gym-dark shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-gym-yellow' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700'}`}
          >
            <Dumbbell className="w-5 h-5 mr-2" /> Mis Rutinas
          </button>
        </div>

        {/* 3. Contenedor principal con sombra XL para despegarlo del fondo */}
        <div className="bg-white rounded-b-3xl rounded-tr-3xl shadow-xl border border-gray-100 p-8 min-h-[500px]">
          
          {pestañaActiva === 'pedidos' && (
            <div>
              {cargandoPedidos ? (
                <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-12 h-12 animate-spin text-gym-yellow mb-4" /><p className="text-gray-400 font-bold uppercase">Cargando compras...</p></div>
              ) : misPedidos.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Package className="w-20 h-20 text-gray-300 mb-4" />
                  <h3 className="text-xl font-black text-gray-500">Aún no has realizado ninguna compra</h3>
                  <p className="text-gray-400 font-medium mt-2">Tus suplementos comprados aparecerán aquí.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {misPedidos.map(pedido => (
                    // 4. Tarjeta de Pedido con borde lateral (Ribbon) para darle carácter
                    <div key={pedido.transaccionId} className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      {/* Borde lateral amarillo decorativo */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gym-yellow"></div>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-6 pl-10">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orden N°</p>
                          <p className="text-lg font-black text-gym-dark">{pedido.transaccionId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Compra</p>
                          <p className="text-sm font-bold text-gray-700">{formatearFecha(pedido.fechaCreacion)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pagado</p>
                          <p className="text-xl font-black text-gym-dark">S/ {pedido.total.toFixed(2)}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {getEstadoBadge(pedido.estado)}
                        </div>
                      </div>
                      
                      <div className="p-8 pl-10">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                          <Package className="w-4 h-4 mr-2"/> Resumen de Productos
                        </h4>
                        <div className="grid gap-3">
                          {pedido.detalles.map((detalle, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:border-gray-200 transition-colors">
                              <div className="flex items-center">
                                <span className="flex items-center justify-center h-8 w-8 text-xs font-black text-gym-dark bg-white shadow-sm border border-gray-200 rounded-lg mr-4">
                                  {detalle.cantidad}x
                                </span>
                                <span className="font-bold text-gray-700">{detalle.productoNombre}</span>
                              </div>
                              <span className="font-black text-gray-800 text-base">S/ {detalle.subtotal.toFixed(2)}</span>
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

          {pestañaActiva === 'rutinas' && (
            <div>
              {cargandoRutinas ? (
                <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-12 h-12 animate-spin text-gym-yellow mb-4" /><p className="text-gray-400 font-bold uppercase">Cargando rutinas...</p></div>
              ) : misRutinas.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Dumbbell className="w-20 h-20 text-gray-300 mb-4" />
                  <h3 className="text-xl font-black text-gray-500">No tienes rutinas asignadas</h3>
                  <p className="text-gray-400 font-medium mt-2">Solicita a tu entrenador que te asigne un plan de entrenamiento.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {misRutinas.map(rutina => (
                    // 5. Tarjeta de Rutina con fuerte contraste oscuro en la cabecera
                    <div key={rutina.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      
                      <div className="bg-gym-dark text-white px-8 py-6 flex items-center justify-between border-b-4 border-gym-yellow">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mr-5 backdrop-blur-sm">
                            <Activity className="h-6 w-6 text-gym-yellow" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-wide">{rutina.nombre}</h3>
                            <p className="text-sm text-gray-300 font-medium mt-1">{rutina.objetivo}</p>
                          </div>
                        </div>
                        <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 shadow-sm">
                          {rutina.nivel || 'General'}
                        </span>
                      </div>
                      
                      <div className="p-8">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Ejercicios Asignados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {rutina.ejercicios.map((ejercicio, idx) => (
                            <div key={idx} className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
                              <div className="h-12 w-12 bg-gym-yellow shadow-inner rounded-xl flex items-center justify-center font-black text-xl text-gym-dark mr-4">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-800">{ejercicio.nombre}</p>
                                <p className="text-xs text-gray-500 font-bold mt-1.5 bg-white inline-block px-2 py-0.5 rounded border border-gray-200">
                                  {ejercicio.series} series × {ejercicio.repeticiones} reps
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