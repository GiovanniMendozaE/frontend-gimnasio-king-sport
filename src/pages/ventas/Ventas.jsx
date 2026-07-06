import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Receipt, X, Trash2, Plus, Minus, Store, XCircle, Printer } from 'lucide-react';
import { obtenerVentas, realizarVenta, anularVenta, obtenerVentaPorId } from '../../services/ventaService';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerProductos } from '../../services/productoService';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Estados del POS (Nueva Venta)
  const [modalPOSAbierto, setModalPOSAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [carrito, setCarrito] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');

  // Estados del Recibo
  const [modalReciboAbierto, setModalReciboAbierto] = useState(false);
  const [reciboActual, setReciboActual] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      const [dataVentas, dataClientes, dataProductos] = await Promise.all([
        obtenerVentas(),
        obtenerClientes(true), // Solo clientes activos
        obtenerProductos(true) // Solo productos activos
      ]);
      setVentas(dataVentas);
      setClientes(dataClientes);
      // Filtramos productos que tengan stock > 0 para el POS
      setProductos(dataProductos.filter(p => p.stockActual > 0)); 
    } catch (error) {
      console.error("Error cargando el módulo:", error);
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA DEL CARRITO (POS) ---
  const abrirPOS = () => {
    setClienteId('');
    setMetodoPago('EFECTIVO');
    setCarrito([]);
    setBusquedaProducto('');
    setModalPOSAbierto(true);
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.productoId === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad + 1 > producto.stockActual) return alert("Stock máximo alcanzado");
      setCarrito(carrito.map(item => 
        item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { 
        productoId: producto.id, 
        nombre: producto.nombre, 
        precio: producto.precioVenta, 
        cantidad: 1,
        stockMaximo: producto.stockActual 
      }]);
    }
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.productoId === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.stockMaximo) {
          return { ...item, cantidad: nuevaCantidad };
        }
      }
      return item;
    }));
  };

  const quitarDelCarrito = (id) => setCarrito(carrito.filter(item => item.productoId !== id));

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  const procesarVenta = async () => {
    if (!clienteId) return alert("Selecciona un cliente");
    if (carrito.length === 0) return alert("El carrito está vacío");

    setGuardando(true);
    try {
      const payload = {
        clienteId: parseInt(clienteId),
        origen: 'FÍSICA',
        metodoPago: metodoPago,
        detalles: carrito.map(item => ({ productoId: item.productoId, cantidad: item.cantidad }))
      };
      await realizarVenta(payload);
      await cargarDatosIniciales(); // Recarga ventas y actualiza el stock en pantalla
      setModalPOSAbierto(false);
      alert("¡Venta procesada con éxito!");
    } catch (error) {
      alert(error.message);
    } finally {
      setGuardando(false);
    }
  };

  // --- LÓGICA DE HISTORIAL Y RECIBOS ---
  const handleAnular = async (id, operacion) => {
    if (window.confirm(`¿Estás seguro de ANULAR la venta ${operacion}? Los productos regresarán al inventario.`)) {
      try {
        await anularVenta(id);
        await cargarDatosIniciales();
        alert("Venta anulada y stock restaurado.");
      } catch (error) { alert("Error al anular la venta."); }
    }
  };

  const handleVerRecibo = async (id) => {
    try {
      const datos = await obtenerVentaPorId(id);
      setReciboActual(datos);
      setModalReciboAbierto(true);
    } catch (error) { alert("Error al cargar el recibo."); }
  };

  const ventasFiltradas = ventas.filter(item => 
    item.numeroOperacion.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    item.clienteNombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="space-y-4 print:m-0 print:p-0">
      
      {/* HEADER DE VENTAS (Oculto al imprimir) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg outline-none focus:ring-2 focus:ring-gym-yellow" placeholder="Buscar por N° Operación o Cliente..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>
        <button onClick={abrirPOS} className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm transition-transform active:scale-95">
          <ShoppingCart className="h-5 w-5 mr-2 shrink-0" /> Abrir Caja (Nueva Venta)
        </button>
      </div>

      {/* TABLA DE HISTORIAL DE VENTAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">N° Operación</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Cliente</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Total (S/)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">Cargando operaciones...</td></tr> : 
               ventasFiltradas.length === 0 ? <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">No hay ventas registradas.</td></tr> : 
               ventasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><div className="text-sm font-bold text-gym-dark">{item.numeroOperacion}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.fechaVenta).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{item.clienteNombre}</td>
                    <td className="px-6 py-4 text-center text-sm font-black text-gym-dark">S/ {item.total?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.estado === 'ANULADA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-2">
                        <button onClick={() => handleVerRecibo(item.id)} className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-bold" title="Ver Recibo">
                          <Receipt className="h-4 w-4" />
                        </button>
                        {item.estado !== 'ANULADA' && (
                          <button onClick={() => handleAnular(item.id, item.numeroOperacion)} className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-xs font-bold" title="Anular Venta">
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

      {/* PANTALLA COMPLETA DEL PUNTO DE VENTA (POS) */}
      {modalPOSAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-gym-dark/80 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex overflow-hidden">
            
            {/* LADO IZQUIERDO: CATÁLOGO Y BÚSQUEDA (60%) */}
            <div className="w-3/5 bg-gray-50 flex flex-col border-r border-gray-200">
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-black text-gym-dark flex items-center"><Store className="h-5 w-5 mr-2 text-gym-yellow"/> Catálogo Rápido</h2>
                <div className="relative w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" className="w-full pl-9 pr-3 py-2 bg-gray-100 border-none text-sm rounded-lg outline-none focus:ring-2 focus:ring-gym-yellow" placeholder="Buscar producto..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} />
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productosFiltrados.map(p => (
                    <div key={p.id} onClick={() => agregarAlCarrito(p)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-gym-yellow hover:shadow-md cursor-pointer transition-all flex flex-col h-full active:scale-95">
                      <div className="text-xs font-bold text-gray-400 mb-1">{p.codigo}</div>
                      <div className="text-sm font-bold text-gym-dark leading-tight flex-1">{p.nombre}</div>
                      <div className="mt-3 flex justify-between items-end">
                        <span className="text-xs font-medium text-gray-500">Stock: <span className="font-bold text-gym-dark">{p.stockActual}</span></span>
                        <span className="text-lg font-black text-gym-yellow">S/{p.precioVenta.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LADO DERECHO: CARRITO Y COBRO (40%) */}
            <div className="w-2/5 bg-white flex flex-col relative">
              <button onClick={() => setModalPOSAbierto(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-10"><X className="h-6 w-6" /></button>
              
              <div className="p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-xl font-black text-gym-dark mb-4">Detalle de Venta</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cliente</label>
                    <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark outline-none focus:ring-2 focus:ring-gym-yellow">
                      <option value="">-- Seleccionar --</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.documento} - {c.nombreCompleto}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Método de Pago</label>
                    <div className="flex gap-2">
                      {['EFECTIVO', 'YAPE', 'TARJETA'].map(metodo => (
                        <button key={metodo} onClick={() => setMetodoPago(metodo)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${metodoPago === metodo ? 'bg-gym-dark text-gym-yellow border-gym-dark' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                          {metodo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista del Carrito */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {carrito.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm font-bold">Carrito vacío</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {carrito.map(item => (
                      <div key={item.productoId} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                        <div className="flex-1 pr-3">
                          <p className="text-sm font-bold text-gym-dark leading-tight line-clamp-2">{item.nombre}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1">S/ {item.precio.toFixed(2)} c/u</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-gray-100 rounded-md border border-gray-200">
                            <button onClick={() => actualizarCantidad(item.productoId, -1)} className="p-1 text-gray-500 hover:text-gym-dark"><Minus className="h-4 w-4" /></button>
                            <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                            <button onClick={() => actualizarCantidad(item.productoId, 1)} className="p-1 text-gray-500 hover:text-gym-dark"><Plus className="h-4 w-4" /></button>
                          </div>
                          <span className="text-sm font-black text-gym-dark w-16 text-right">S/{(item.cantidad * item.precio).toFixed(2)}</span>
                          <button onClick={() => quitarDelCarrito(item.productoId)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pie (Cobrar) */}
              <div className="p-6 bg-white border-t border-gray-200 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-bold text-gray-400 uppercase">Total a Cobrar</span>
                  <span className="text-3xl font-black text-gym-dark">S/ {totalCarrito.toFixed(2)}</span>
                </div>
                <button onClick={procesarVenta} disabled={guardando || carrito.length === 0} className="w-full py-4 bg-gym-yellow text-gym-dark font-black text-lg rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 uppercase tracking-widest flex justify-center items-center">
                  {guardando ? 'Procesando...' : <><Receipt className="h-6 w-6 mr-2" /> Emitir Comprobante</>}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL DEL RECIBO (Ticket) */}
      {modalReciboAbierto && reciboActual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/80 backdrop-blur-sm print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col print:max-w-none print:shadow-none print:w-full font-mono text-sm">
            
            <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gray-50 shrink-0 print:hidden font-sans">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Ticket de Venta</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-1.5 bg-blue-600 text-white rounded-md"><Printer className="h-4 w-4" /></button>
                <button onClick={() => setModalReciboAbierto(false)} className="p-1.5 text-gray-500 bg-white border border-gray-200 rounded-md"><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="p-6 text-center text-gray-800 print:p-0">
              <h1 className="text-2xl font-black mb-1">GYM KING SPORT</h1>
              <p className="text-xs">Av. Principal 123, Lima</p>
              <p className="text-xs">RUC: 20123456789</p>
              <p className="text-xs mt-2 font-bold border-y border-dashed border-gray-400 py-1">TICKET: {reciboActual.numeroOperacion}</p>
              
              <div className="text-left text-xs my-4 space-y-1">
                <p>Fecha: {new Date(reciboActual.fechaVenta).toLocaleString()}</p>
                <p>Cliente: {reciboActual.clienteNombre}</p>
                <p>DNI: {reciboActual.clienteDocumento}</p>
                <p>Atendido por: {reciboActual.vendedorNombre}</p>
                <p>Método: {reciboActual.metodoPago}</p>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
                <div className="flex justify-between font-bold text-xs mb-2"><span>Cant. Descripción</span><span>Total</span></div>
                {reciboActual.detalles.map((det, i) => (
                  <div key={i} className="flex justify-between text-xs mb-1">
                    <span className="text-left flex-1">{det.cantidad}x {det.productoNombre}</span>
                    <span>S/{det.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 flex justify-between items-center">
                <span className="font-bold">TOTAL A PAGAR</span>
                <span className="font-black text-lg">S/ {reciboActual.total.toFixed(2)}</span>
              </div>
              
              <p className="text-[10px] text-center mt-6 uppercase font-bold tracking-widest text-gray-500">¡Gracias por tu preferencia!</p>
              {reciboActual.estado === 'ANULADA' && (
                <div className="mt-4 text-center border-4 border-red-600 text-red-600 font-black text-xl py-2 transform -rotate-6 uppercase">Documento Anulado</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}