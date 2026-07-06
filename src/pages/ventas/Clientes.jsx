import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Users, Mail, Phone, Archive, RotateCcw } from 'lucide-react';
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente, habilitarCliente } from '../../services/clienteService';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  // Nuevo estado para el toggle de Activos/Inhabilitados
  const [viendoActivos, setViendoActivos] = useState(true);

  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    documento: '', nombreCompleto: '', telefono: '', email: ''
  });

  // Se recarga cuando cambia el toggle de viendoActivos
  useEffect(() => {
    cargarDatos();
  }, [viendoActivos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await obtenerClientes(viendoActivos);
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (idEdicion) await actualizarCliente(idEdicion, formulario);
      else await crearCliente(formulario);
      
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      alert(error.message || "Ocurrió un error al procesar el cliente.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCreacion = () => {
    setIdEdicion(null);
    setFormulario({ documento: '', nombreCompleto: '', telefono: '', email: '' });
    setModalAbierto(true);
  };

  const abrirModalEdicion = (cliente) => {
    setIdEdicion(cliente.id);
    setFormulario({
      documento: cliente.documento, nombreCompleto: cliente.nombreCompleto, 
      telefono: cliente.telefono || '', email: cliente.email || ''
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de inhabilitar al cliente ${nombre}?`)) {
      try { await eliminarCliente(id); await cargarDatos(); } 
      catch (error) { alert("Error al intentar eliminar el cliente."); }
    }
  };

  const handleRestaurar = async (id, nombre) => {
    if (window.confirm(`¿Deseas restaurar a ${nombre} y volver a habilitarlo en el sistema?`)) {
      try { await habilitarCliente(id); await cargarDatos(); } 
      catch (error) { alert("Error al intentar restaurar el cliente."); }
    }
  };
  
  const cerrarModal = () => { setModalAbierto(false); setIdEdicion(null); };

  const clientesFiltrados = clientes.filter(item => 
    item.nombreCompleto.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    item.documento.includes(filtroBusqueda)
  );

  return (
    <div className="space-y-4">
      {/* BARRA DE HERRAMIENTAS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow transition-colors placeholder-gray-400 font-medium" placeholder="Buscar por nombre o DNI/CE..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {filtroBusqueda && (
            <button onClick={() => setFiltroBusqueda('')} className="px-4 py-2.5 bg-white text-gray-600 font-bold text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
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
            <button onClick={abrirModalCreacion} className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm">
              <Plus className="h-5 w-5 mr-1 shrink-0" /> Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Contacto</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Cargando directorio de clientes...</td></tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No se encontraron clientes.</td></tr>
              ) : (
                clientesFiltrados.map((item) => (
                  <tr key={item.id} className={`transition-colors ${viendoActivos ? 'hover:bg-gray-50/50' : 'bg-red-50/30'}`}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{item.documento}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gym-yellow/20 flex items-center justify-center text-gym-dark font-bold mr-3">
                          {item.nombreCompleto.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gym-dark">{item.nombreCompleto}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm font-medium text-gray-600">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" /> {item.telefono || '-'}
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <Mail className="h-3 w-3 mr-2" /> {item.email || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        {viendoActivos ? (
                          <>
                            <button onClick={() => abrirModalEdicion(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="Editar">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleEliminar(item.id, item.nombreCompleto)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Inhabilitar">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRestaurar(item.id, item.nombreCompleto)} className="flex items-center px-3 py-1.5 text-gym-dark hover:text-white bg-gym-yellow hover:bg-yellow-600 rounded-md text-xs font-bold">
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

      {/* MODAL DE REGISTRO / EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-black text-gym-dark flex items-center">
                <Users className="h-5 w-5 mr-2 text-gym-yellow" />
                {idEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">DNI / CE</label>
                    <input type="text" name="documento" required minLength="8" maxLength="15" value={formulario.documento} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="Ej. 70123456" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Teléfono</label>
                    <input type="text" name="telefono" value={formulario.telefono} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="Opcional" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre Completo</label>
                  <input type="text" name="nombreCompleto" required value={formulario.nombreCompleto} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="Nombres y Apellidos" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Correo Electrónico</label>
                  <input type="email" name="email" value={formulario.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="cliente@correo.com" />
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg hover:bg-gray-100">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 px-4 py-3 bg-gym-yellow text-gym-dark font-black text-sm rounded-lg hover:bg-yellow-500 disabled:opacity-50 uppercase tracking-wider">
                  {guardando ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}