import { useState, useEffect } from 'react';
import { Plus, Search, FileText, X, Trash2, CheckCircle, XCircle, Printer, Receipt } from 'lucide-react';
import { obtenerOrdenes, crearOrden, recibirOrden, rechazarOrden, obtenerOrdenPorId } from '../../services/ordenCompraService';
import { obtenerProveedores } from '../../services/proveedorService';
import { obtenerProductos } from '../../services/productoService';

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Estados Formulario de Creación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [proveedorId, setProveedorId] = useState('');
  const [numeroOrden, setNumeroOrden] = useState('');
  const [detalles, setDetalles] = useState([]);

  // Estados del Documento (Impresión)
  const [modalDocumentoAbierto, setModalDocumentoAbierto] = useState(false);
  const [ordenActual, setOrdenActual] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      const [dataOrdenes, dataProv, dataProd] = await Promise.all([
        obtenerOrdenes(), obtenerProveedores(true), obtenerProductos(true) 
      ]);
      setOrdenes(dataOrdenes);
      setProveedores(dataProv);
      setProductos(dataProd);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCreacion = () => {
    setProveedorId('');
    setNumeroOrden(`OC-${Math.floor(100000 + Math.random() * 900000)}`);
    setDetalles([{ productoId: '', cantidad: 1, precioCompra: 0 }]);
    setModalAbierto(true);
  };
  const cerrarModal = () => setModalAbierto(false);

  const agregarFila = () => setDetalles([...detalles, { productoId: '', cantidad: 1, precioCompra: 0 }]);
  const eliminarFila = (index) => setDetalles(detalles.filter((_, i) => i !== index));

  const handleChangeDetalle = (index, campo, valor) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][campo] = valor;
    if (campo === 'productoId') {
      const prodSeleccionado = productos.find(p => p.id.toString() === valor.toString());
      if (prodSeleccionado && prodSeleccionado.precioCompra) {
        nuevosDetalles[index].precioCompra = prodSeleccionado.precioCompra;
      }
    }
    setDetalles(nuevosDetalles);
  };

  const totalCalculado = detalles.reduce((acc, item) => acc + (Number(item.cantidad) * Number(item.precioCompra)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const detallesValidos = detalles.filter(d => d.productoId !== '' && d.cantidad > 0);
    if (detallesValidos.length === 0) return alert("Debe agregar al menos un producto.");

    setGuardando(true);
    try {
      const payload = {
        proveedorId: parseInt(proveedorId),
        numeroOrden: numeroOrden,
        detalles: detallesValidos.map(d => ({
          productoId: parseInt(d.productoId), cantidad: parseInt(d.cantidad), precioCompra: parseFloat(d.precioCompra)
        }))
      };
      await crearOrden(payload);
      await cargarDatosIniciales();
      cerrarModal();
      alert("Orden Generada (PENDIENTE).");
    } catch (error) {
      alert("Error al generar la orden.");
    } finally {
      setGuardando(false);
    }
  };

  const handleRecibir = async (id, numero) => {
    if (window.confirm(`¿Confirmas que la mercadería de la orden ${numero} ha llegado?`)) {
      try {
        await recibirOrden(id);
        await cargarDatosIniciales();
        alert("¡Stock actualizado!");
      } catch (error) { alert("Error al recibir."); }
    }
  };

  const handleRechazar = async (id, numero) => {
    if (window.confirm(`¿Deseas RECHAZAR la orden ${numero}?`)) {
      try {
        await rechazarOrden(id);
        await cargarDatosIniciales();
      } catch (error) { alert("Error al rechazar."); }
    }
  };

  const handleVerDocumento = async (id) => {
    try {
      const datosDocumento = await obtenerOrdenPorId(id);
      setOrdenActual(datosDocumento);
      setModalDocumentoAbierto(true);
    } catch (error) {
      alert("Error al cargar el documento.");
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const ordenesFiltradas = ordenes.filter(item => 
    item.numeroOrden.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    item.proveedorNombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  return (
    <div className="space-y-4 print:bg-white print:m-0 print:p-0">
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow" placeholder="Buscar por N° Orden o Proveedor..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {filtroBusqueda && <button onClick={() => setFiltroBusqueda('')} className="px-4 py-2.5 bg-white text-gray-600 font-bold text-sm rounded-lg border border-gray-300">Limpiar</button>}
          <button onClick={abrirModalCreacion} className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm">
            <Plus className="h-5 w-5 mr-1" /> Generar Orden
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">N° Orden</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Proveedor</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Cargando...</td></tr> : 
               ordenesFiltradas.length === 0 ? <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No hay órdenes.</td></tr> : 
               ordenesFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center text-sm font-bold text-gym-dark"><FileText className="h-4 w-4 mr-2 text-gray-400" /> {item.numeroOrden}</div></td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{item.proveedorNombre}</td>
                    <td className="px-6 py-4 text-center text-sm font-black text-gym-dark">S/ {item.total?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.estado === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : item.estado === 'RECIBIDA' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-2">
                        {/* Botón Ver Documento AHORA CON ICONO DE BOLETA */}
                        <button onClick={() => handleVerDocumento(item.id)} className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-bold" title="Ver Boleta / Documento">
                          <Receipt className="h-4 w-4" />
                        </button>
                        
                        {item.estado === 'PENDIENTE' && (
                          <>
                            <button onClick={() => handleRecibir(item.id, item.numeroOrden)} className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-md text-xs font-bold"><CheckCircle className="h-4 w-4 mr-1" /> Recibir</button>
                            <button onClick={() => handleRechazar(item.id, item.numeroOrden)} className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-md text-xs font-bold"><XCircle className="h-4 w-4 mr-1" /> Rechazar</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-black text-gym-dark flex items-center"><FileText className="h-5 w-5 mr-2 text-gym-yellow" /> Nueva Orden de Ingreso</h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">N° Documento</label>
                    <input type="text" readOnly value={numeroOrden} className="w-full px-3 py-2 bg-gray-200 border border-gray-200 rounded-lg text-sm font-bold text-gray-500" />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Proveedor</label>
                    <select required value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gym-dark">
                      <option value="" disabled>-- Seleccione proveedor --</option>
                      {proveedores.map(prov => <option key={prov.id} value={prov.id}>{prov.ruc} - {prov.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</label>
                    <button type="button" onClick={agregarFila} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center"><Plus className="h-3 w-3 mr-1" /> Añadir Fila</button>
                  </div>
                  <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
                      <tr>
                        <th className="p-3 w-5/12">Artículo</th><th className="p-3 w-2/12 text-center">Cant.</th><th className="p-3 w-2/12 text-center">Costo Unit</th><th className="p-3 w-2/12 text-center">Subtotal</th><th className="p-3 w-1/12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detalles.map((fila, index) => (
                        <tr key={index}>
                          <td className="p-2"><select required value={fila.productoId} onChange={(e) => handleChangeDetalle(index, 'productoId', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"><option value="" disabled>Seleccione...</option>{productos.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}</select></td>
                          <td className="p-2"><input type="number" min="1" required value={fila.cantidad} onChange={(e) => handleChangeDetalle(index, 'cantidad', e.target.value)} className="w-full p-2 bg-gray-50 border text-center outline-none" /></td>
                          <td className="p-2"><input type="number" step="0.01" min="0" required value={fila.precioCompra} onChange={(e) => handleChangeDetalle(index, 'precioCompra', e.target.value)} className="w-full p-2 bg-gray-50 border text-center outline-none" /></td>
                          <td className="p-2 text-center text-sm font-black">{(fila.cantidad * fila.precioCompra).toFixed(2)}</td>
                          <td className="p-2 text-center">{detalles.length > 1 && <button type="button" onClick={() => eliminarFila(index)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center shrink-0">
                <div className="flex flex-col"><span className="text-xs font-bold text-gray-400">Total</span><span className="text-2xl font-black">S/ {totalCalculado.toFixed(2)}</span></div>
                <div className="flex gap-3"><button type="button" onClick={cerrarModal} className="px-6 py-3 bg-white border text-gray-500 font-bold rounded-lg">Cancelar</button><button type="submit" disabled={guardando} className="px-8 py-3 bg-gym-yellow text-gym-dark font-black rounded-lg">Generar OC</button></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDocumentoAbierto && ordenActual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/80 backdrop-blur-sm print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0 print:hidden">
              <h3 className="text-sm font-bold text-gray-500 uppercase">Vista Previa del Documento</h3>
              <div className="flex space-x-2">
                <button onClick={handleImprimir} className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  <Printer className="h-4 w-4 mr-2" /> Imprimir / PDF
                </button>
                <button onClick={() => setModalDocumentoAbierto(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors">
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-10 overflow-y-auto text-gym-dark print:overflow-visible" id="documento-impresion">
              <div className="flex justify-between items-start border-b-2 border-gym-dark pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter">GYM KING SPORT</h1>
                  <p className="text-sm font-medium text-gray-500 mt-1">Gimnasio y Tienda Deportiva</p>
                  <p className="text-xs text-gray-400 mt-1">Av. Principal 123, Lima, Perú</p>
                  <p className="text-xs text-gray-400">RUC: 20123456789 | Tel: (01) 555-4321</p>
                </div>
                <div className="text-right">
                  <div className="border-2 border-gym-dark p-3 rounded-lg text-center bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Orden de Compra</p>
                    <p className="text-xl font-black text-gym-dark">{ordenActual.numeroOrden}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mt-2">Fecha: {new Date(ordenActual.fechaEmision).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del Proveedor</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-bold text-gray-600">Señor(es):</span> {ordenActual.proveedorNombre}</div>
                  <div><span className="font-bold text-gray-600">RUC:</span> {ordenActual.proveedorRuc || 'No registrado'}</div>
                  <div><span className="font-bold text-gray-600">Teléfono:</span> {ordenActual.proveedorTelefono || 'No registrado'}</div>
                  <div><span className="font-bold text-gray-600">Email:</span> {ordenActual.proveedorEmail || 'No registrado'}</div>
                </div>
              </div>

              <table className="w-full text-left border-collapse mb-6">
                <thead>
                  <tr className="bg-gym-dark text-white text-xs uppercase tracking-wider">
                    <th className="p-3 font-bold border border-gym-dark rounded-tl-lg">Descripción del Artículo</th>
                    <th className="p-3 font-bold text-center border border-gym-dark">Cant.</th>
                    <th className="p-3 font-bold text-center border border-gym-dark">Precio Unit.</th>
                    <th className="p-3 font-bold text-center border border-gym-dark rounded-tr-lg">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenActual.detalles.map((det, index) => (
                    <tr key={index} className="border-b border-gray-200 text-sm">
                      <td className="p-3 font-medium">{det.productoNombre}</td>
                      <td className="p-3 text-center">{det.cantidad}</td>
                      <td className="p-3 text-center">S/ {det.precioCompra?.toFixed(2)}</td>
                      <td className="p-3 text-center font-bold">S/ {det.subtotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-16">
                <div className="w-64">
                  <div className="flex justify-between items-center py-2 text-sm font-bold text-gray-500">
                    <span>Subtotal:</span>
                    <span>S/ {(ordenActual.total / 1.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm font-bold text-gray-500 border-b border-gray-200">
                    <span>IGV (18%):</span>
                    <span>S/ {(ordenActual.total - (ordenActual.total / 1.18)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 text-xl font-black text-gym-dark">
                    <span>TOTAL:</span>
                    <span>S/ {ordenActual.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-center mt-12">
                <div>
                  <div className="border-t border-gray-400 mx-8 pt-2">
                    <p className="text-xs font-bold text-gray-600">Área de Compras</p>
                    <p className="text-[10px] text-gray-400">Gym King Sport S.A.C.</p>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 mx-8 pt-2">
                    <p className="text-xs font-bold text-gray-600">Recibí Conforme</p>
                    <p className="text-[10px] text-gray-400">Firma del Proveedor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}