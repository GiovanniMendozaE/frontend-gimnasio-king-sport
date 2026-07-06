import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Archive, RotateCcw } from 'lucide-react';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto, habilitarProducto } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Nuevo estado para controlar si vemos activos o inhabilitados
  const [viendoActivos, setViendoActivos] = useState(true);

  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    codigo: '', nombre: '', precioVenta: '', stockMinimo: '', stockActual: 0, categoriaId: ''
  });

  // El useEffect ahora reacciona cada vez que cambiamos entre Activos/Inhabilitados
  useEffect(() => {
    cargarDatosIniciales();
  }, [viendoActivos]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      const [dataProductos, dataCategorias] = await Promise.all([
        obtenerProductos(viendoActivos), // Le pasamos el estado actual
        obtenerCategorias()
      ]);
      setProductos(dataProductos);
      setCategorias(dataCategorias);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoriaId' && !idEdicion) {
      const categoriaSeleccionada = categorias.find(cat => cat.id.toString() === value);
      if (categoriaSeleccionada) {
        const prefijo = categoriaSeleccionada.nombre.substring(0, 3).toUpperCase();
        const correlativo = Math.floor(1000 + Math.random() * 9000);
        setFormulario({ ...formulario, categoriaId: value, codigo: `${prefijo}-${correlativo}` });
        return; 
      }
    }
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        codigo: formulario.codigo,
        nombre: formulario.nombre,
        precioVenta: parseFloat(formulario.precioVenta),
        stockMinimo: parseInt(formulario.stockMinimo),
        stockActual: parseInt(formulario.stockActual), 
        categoriaId: parseInt(formulario.categoriaId) 
      };

      if (idEdicion) await actualizarProducto(idEdicion, payload);
      else await crearProducto(payload);
      
      await cargarDatosIniciales();
      cerrarModal();
    } catch (error) {
      alert(`Error al guardar. Revisa la consola.`);
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCreacion = () => {
    setIdEdicion(null);
    setFormulario({ codigo: '', nombre: '', precioVenta: '', stockMinimo: '', stockActual: 0, categoriaId: '' });
    setModalAbierto(true);
  };

  const abrirModalEdicion = (producto) => {
    setIdEdicion(producto.id);
    setFormulario({
      codigo: producto.codigo, nombre: producto.nombre, precioVenta: producto.precioVenta,
      stockMinimo: producto.stockMinimo, stockActual: producto.stockActual, categoriaId: producto.categoriaId
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de inhabilitar este artículo?")) {
      try {
        await eliminarProducto(id);
        await cargarDatosIniciales();
      } catch (error) { alert("Error al inhabilitar."); }
    }
  };

  // NUEVA FUNCIÓN: Restaurar producto
  const handleRestaurar = async (id) => {
    if (window.confirm("¿Deseas volver a habilitar este artículo en el catálogo?")) {
      try {
        await habilitarProducto(id);
        await cargarDatosIniciales();
      } catch (error) { alert("Error al habilitar."); }
    }
  };
  
  const cerrarModal = () => {
    setModalAbierto(false);
    setIdEdicion(null);
  };

  const productosFiltrados = productos.filter(item => {
    const coincideTexto = item.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
                          item.codigo.toLowerCase().includes(filtroBusqueda.toLowerCase());
    const coincideCategoria = filtroCategoria === '' || item.categoriaId?.toString() === filtroCategoria;
    return coincideTexto && coincideCategoria;
  });

  const limpiarFiltros = () => { setFiltroBusqueda(''); setFiltroCategoria(''); };

  return (
    <div className="space-y-4">
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow transition-colors placeholder-gray-400 font-medium"
            placeholder="Buscar por SKU o Nombre..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-56">
          <select 
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow outline-none text-gray-600 font-medium bg-white"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {(filtroBusqueda || filtroCategoria) && (
            <button onClick={limpiarFiltros} className="px-4 py-2.5 bg-white text-gray-600 font-bold text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              Limpiar
            </button>
          )}

          {/* BOTÓN TOGGLE (Inhabilitados / Activos) */}
          <button 
            onClick={() => setViendoActivos(!viendoActivos)}
            className={`flex items-center px-4 py-2.5 font-bold text-sm rounded-lg border transition-colors ${
              viendoActivos 
                ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' 
                : 'bg-gym-dark text-gym-yellow border-gym-dark hover:bg-black'
            }`}
          >
            <Archive className="h-4 w-4 mr-2" />
            {viendoActivos ? 'Ver Inhabilitados' : 'Volver a Activos'}
          </button>
          
          {viendoActivos && (
            <button onClick={abrirModalCreacion} className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm transition-transform active:scale-95">
              <Plus className="h-5 w-5 mr-1 shrink-0" /> Registrar Artículo
            </button>
          )}
        </div>
      </div>

      {/* TABLA DE ARTÍCULOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre del Artículo</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">P. Venta</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">Cargando registros...</td></tr>
              ) : productosFiltrados.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">No se encontraron artículos.</td></tr>
              ) : (
                productosFiltrados.map((item) => {
                  const esStockCritico = item.stockActual <= item.stockMinimo;
                  
                  return (
                    <tr key={item.id} className={`transition-colors ${viendoActivos ? 'hover:bg-gray-50/40' : 'bg-red-50/30'}`}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-400">{item.codigo}</td>
                      <td className="px-6 py-4 text-sm text-gym-dark font-bold">{item.nombre}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-500">
                          {item.categoriaNombre || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-red-500">S/ {item.precioVenta?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-gray-600">{item.stockActual} uds</td>
                      
                      <td className="px-6 py-4 text-center">
                        {!viendoActivos ? (
                           <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-500 border-gray-300">INHABILITADO</span>
                        ) : (
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${esStockCritico ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                             {esStockCritico ? 'BAJO' : 'OK'}
                           </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-1">
                          {viendoActivos ? (
                            <>
                              <button onClick={() => abrirModalEdicion(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleEliminar(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Inhabilitar">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                              <button onClick={() => handleRestaurar(item.id)} className="flex items-center px-3 py-1.5 text-gym-dark hover:text-white bg-gym-yellow hover:bg-yellow-600 rounded-md transition-colors text-xs font-bold" title="Restaurar">
                                <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MANTENIDO IGUAL QUE ANTES (CORTADO POR ESPACIO PERO DEBES DEJARLO) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-black text-gym-dark tracking-wide">
                {idEdicion ? 'Editar Artículo' : 'Crear Ficha de Catálogo'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Código Interno (SKU)</label>
                  <input type="text" name="codigo" readOnly value={formulario.codigo} className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg outline-none text-sm font-bold text-gray-500 cursor-not-allowed" placeholder="Autogenerado..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Familia / Categoría</label>
                  <select name="categoriaId" required value={formulario.categoriaId} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none transition-all text-sm font-bold text-gray-600 bg-white">
                    <option value="" disabled>Seleccione...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre Comercial</label>
                <input type="text" name="nombre" required value={formulario.nombre} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none transition-all text-sm font-bold text-gym-dark" placeholder="Ej. Creatina Monohidratada 500g" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">P. Venta Público (S/)</label>
                  <input type="number" step="0.01" name="precioVenta" required value={formulario.precioVenta} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none transition-all text-sm font-bold text-gym-dark" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Umbral Stock Mínimo</label>
                  <input type="number" name="stockMinimo" required value={formulario.stockMinimo} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none transition-all text-sm font-bold text-gym-dark" placeholder="Ej. 5 unidades" />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 px-4 py-3 bg-gym-yellow text-gym-dark font-black text-sm rounded-lg hover:bg-yellow-500 transition-all disabled:opacity-50 uppercase tracking-wider">
                  {guardando ? 'Procesando...' : (idEdicion ? 'Actualizar' : 'Guardar Artículo')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}