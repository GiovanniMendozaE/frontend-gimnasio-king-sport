import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Archive, RotateCcw } from 'lucide-react';
import { 
  obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor, habilitarProveedor 
} from '../../services/proveedorService';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [viendoActivos, setViendoActivos] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    ruc: '', nombre: '', contacto: '', telefono: '', email: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [viendoActivos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProveedores(viendoActivos);
      setProveedores(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (idEdicion) await actualizarProveedor(idEdicion, formulario);
      else await crearProveedor(formulario);
      
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      alert("Error al procesar el proveedor. Revisa que el RUC no esté duplicado.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCreacion = () => {
    setIdEdicion(null);
    setFormulario({ ruc: '', nombre: '', contacto: '', telefono: '', email: '' });
    setModalAbierto(true);
  };

  const abrirModalEdicion = (prov) => {
    setIdEdicion(prov.id);
    setFormulario({
      ruc: prov.ruc, nombre: prov.nombre, contacto: prov.contacto || '', 
      telefono: prov.telefono || '', email: prov.email || ''
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Inhabilitar este proveedor? Ya no aparecerá en las nuevas órdenes de compra.")) {
      try { await eliminarProveedor(id); await cargarDatos(); } 
      catch (error) { alert("Error al inhabilitar."); }
    }
  };

  const handleRestaurar = async (id) => {
    if (window.confirm("¿Restaurar este proveedor al catálogo activo?")) {
      try { await habilitarProveedor(id); await cargarDatos(); } 
      catch (error) { alert("Error al restaurar."); }
    }
  };
  
  const cerrarModal = () => { setModalAbierto(false); setIdEdicion(null); };

  const proveedoresFiltrados = proveedores.filter(item => 
    item.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    item.ruc.includes(filtroBusqueda)
  );

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
            placeholder="Buscar por RUC o Razón Social..."
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

          <button 
            onClick={() => setViendoActivos(!viendoActivos)}
            className={`flex items-center px-4 py-2.5 font-bold text-sm rounded-lg border transition-colors ${viendoActivos ? 'bg-white text-gray-600 border-gray-300' : 'bg-gym-dark text-gym-yellow border-gym-dark'}`}
          >
            <Archive className="h-4 w-4 mr-2" /> {viendoActivos ? 'Inhabilitados' : 'Activos'}
          </button>
          
          {viendoActivos && (
            <button onClick={abrirModalCreacion} className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm transition-transform active:scale-95">
              <Plus className="h-5 w-5 mr-1 shrink-0" /> Registrar Proveedor
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">RUC</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Razón Social</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Teléfono / Email</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Cargando directorio...</td></tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No se encontraron proveedores.</td></tr>
              ) : (
                proveedoresFiltrados.map((item) => (
                  <tr key={item.id} className={`transition-colors ${viendoActivos ? 'hover:bg-gray-50/40' : 'bg-red-50/30'}`}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">{item.ruc}</td>
                    <td className="px-6 py-4 text-sm text-gym-dark font-bold">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.contacto || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-700">{item.telefono || '-'}</div>
                      <div className="text-xs text-gray-400">{item.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-1">
                        {viendoActivos ? (
                          <>
                            <button onClick={() => abrirModalEdicion(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleEliminar(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRestaurar(item.id)} className="flex items-center px-3 py-1.5 text-gym-dark hover:text-white bg-gym-yellow hover:bg-yellow-600 rounded-md text-xs font-bold">
                            <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-black text-gym-dark tracking-wide">
                {idEdicion ? 'Editar Proveedor' : 'Ficha de Proveedor'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">RUC (11 dígitos)</label>
                  <input type="text" maxLength="11" name="ruc" required value={formulario.ruc} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none text-sm font-bold text-gym-dark" placeholder="Ej. 20123456789" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teléfono / Celular</label>
                  <input type="text" name="telefono" value={formulario.telefono} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none text-sm font-bold text-gym-dark" placeholder="Ej. 987654321" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Razón Social o Nombre</label>
                <input type="text" name="nombre" required value={formulario.nombre} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none text-sm font-bold text-gym-dark" placeholder="Ej. Corporación Sport S.A.C." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Representante / Contacto</label>
                  <input type="text" name="contacto" value={formulario.contacto} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none text-sm font-bold text-gym-dark" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input type="email" name="email" value={formulario.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none text-sm font-bold text-gym-dark" placeholder="ventas@empresa.com" />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
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