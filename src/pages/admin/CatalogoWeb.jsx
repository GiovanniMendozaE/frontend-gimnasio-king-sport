import { useState, useEffect } from 'react';
import { Store, Search, Globe, EyeOff, Package, XCircle } from 'lucide-react';
import { obtenerCatalogoAdmin, togglePublicacionProducto } from '../../services/admin/catalogoAdminService';

export default function CatalogoWeb() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const cargarCatalogo = async () => {
    try {
      setCargando(true);
      const data = await obtenerCatalogoAdmin();
      setProductos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const actualizado = await togglePublicacionProducto(id);
      // Actualizamos solo el producto modificado en la lista para que la interfaz sea súper rápida
      setProductos(productos.map(p => p.id === id ? actualizado : p));
    } catch (error) {
      alert("Error al actualizar estado web");
    }
  };

  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    p.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Título interno eliminado para evitar duplicados. Buscador alineado a la derecha. */}
      <div className="flex justify-end items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por código o nombre" 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow w-80 shadow-sm"
          />
          {filtro && (
            <button onClick={() => setFiltro('')} className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="text-center py-10 text-gray-500">Cargando catálogo...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-right">Precio Venta</th>
                <th className="p-4 text-center">Publicado en Web</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron productos.</td></tr>
              ) : (
                filtrados.map(producto => (
                  <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="h-10 w-10 rounded object-cover border border-gray-200 mr-3" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                            <Package className="h-5 w-5 text-gray-400"/>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-gray-800">{producto.nombre}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{producto.codigo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-600">{producto.categoria}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${producto.stockActual > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {producto.stockActual} und
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-gym-dark">S/ {producto.precioVenta.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggle(producto.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${producto.publicadoWeb ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${producto.publicadoWeb ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                        {producto.publicadoWeb ? <span className="text-green-600 flex items-center justify-center"><Globe className="w-3 h-3 mr-1"/> Visible</span> : <span className="flex items-center justify-center"><EyeOff className="w-3 h-3 mr-1"/> Oculto</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}