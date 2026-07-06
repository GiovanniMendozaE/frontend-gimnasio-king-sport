import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../services/categoriaService';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      if (idEdicion) {
        await actualizarCategoria(idEdicion, formulario);
      } else {
        await crearCategoria(formulario);
      }
      
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      alert(`Error al ${idEdicion ? 'actualizar' : 'guardar'}. Revisa la consola.`);
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCreacion = () => {
    setIdEdicion(null);
    setFormulario({ nombre: '', descripcion: '' });
    setModalAbierto(true);
  };

  const abrirModalEdicion = (categoria) => {
    setIdEdicion(categoria.id);
    setFormulario({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría? Nota: Si hay productos usando esta categoría, la base de datos podría rechazar la acción por seguridad.")) {
      try {
        await eliminarCategoria(id);
        await cargarDatos();
      } catch (error) {
        alert("No se pudo eliminar. Es muy probable que existan productos vinculados a esta categoría.");
      }
    }
  };
  
  const cerrarModal = () => {
    setModalAbierto(false);
    setIdEdicion(null);
  };

  const categoriasFiltradas = categorias.filter(item => 
    item.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* BARRA DE HERRAMIENTAS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow transition-colors placeholder-gray-400 font-medium"
            placeholder="Buscar categoría por nombre..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {filtroBusqueda && (
            <button onClick={() => setFiltroBusqueda('')} className="px-4 py-2.5 bg-white text-gray-600 font-bold text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              Limpiar
            </button>
          )}
          <button onClick={abrirModalCreacion} className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm transition-transform active:scale-95">
            <Plus className="h-5 w-5 mr-1 shrink-0" /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* TABLA DE CATEGORÍAS (ID Oculto) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre de la Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción / Detalles</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">Cargando categorías...</td></tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">No se encontraron categorías.</td></tr>
              ) : (
                categoriasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-gym-dark font-bold">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs md:max-w-md whitespace-normal break-words">{item.descripcion || 'Sin descripción asignada'}</td>
                    
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-1">
                        <button onClick={() => abrirModalEdicion(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleEliminar(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REGISTRO / EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-black text-gym-dark tracking-wide">
                {idEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre de la Categoría</label>
                <input 
                  type="text" 
                  name="nombre" 
                  required 
                  value={formulario.nombre} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none transition-all text-sm font-bold text-gym-dark" 
                  placeholder="Ej. Ropa Deportiva" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción (Opcional)</label>
                <textarea 
                  name="descripcion" 
                  rows="3"
                  value={formulario.descripcion} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none transition-all text-sm font-bold text-gym-dark resize-none" 
                  placeholder="Breve detalle de los artículos en esta familia..." 
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 px-4 py-3 bg-gym-yellow text-gym-dark font-black text-sm rounded-lg hover:bg-yellow-500 transition-all disabled:opacity-50 uppercase tracking-wider">
                  {guardando ? 'Procesando...' : (idEdicion ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}