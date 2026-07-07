import { useState, useEffect } from 'react';
import { Plus, Search, ShieldAlert, Trash2, X, UserCog, Archive, RotateCcw } from 'lucide-react';
import { obtenerUsuarios, crearUsuario, inhabilitarUsuario, habilitarUsuario } from '../../services/usuarioService';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [viendoActivos, setViendoActivos] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Adaptado a tu entidad Usuario.java exacta
  const [formulario, setFormulario] = useState({
    nombre: '', apellido: '', username: '', email: '', password: '', rol: ''
  });

  useEffect(() => { cargarDatos(); }, [viendoActivos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setUsuarios(await obtenerUsuarios(viendoActivos));
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearUsuario(formulario);
      await cargarDatos();
      cerrarModal();
      alert("Usuario registrado con éxito.");
    } catch (error) {
      alert(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombrePersona) => {
    if (window.confirm(`¿Revocar acceso al usuario ${nombrePersona}?`)) {
      try { await inhabilitarUsuario(id); await cargarDatos(); } 
      catch (error) { alert("Error al eliminar."); }
    }
  };

  const handleRestaurar = async (id, nombrePersona) => {
    if (window.confirm(`¿Devolver acceso al usuario ${nombrePersona}?`)) {
      try { await habilitarUsuario(id); await cargarDatos(); } 
      catch (error) { alert("Error al restaurar."); }
    }
  };

  const abrirModal = () => {
    setFormulario({ nombre: '', apellido: '', username: '', email: '', password: '', rol: '' });
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  // Filtrar por nombre, apellido, username o email
  const filtrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    u.apellido.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    u.username.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    u.email.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg outline-none focus:ring-2 focus:ring-gym-yellow" placeholder="Buscar por nombre, usuario o correo..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setViendoActivos(!viendoActivos)} className={`flex items-center px-4 py-2.5 font-bold text-sm rounded-lg border transition-colors ${viendoActivos ? 'bg-white text-gray-600 border-gray-300' : 'bg-gym-dark text-gym-yellow border-gym-dark'}`}>
            <Archive className="h-4 w-4 mr-2" /> {viendoActivos ? 'Inhabilitados' : 'Activos'}
          </button>
          {viendoActivos && (
            <button onClick={abrirModal} className="flex items-center px-5 py-2.5 bg-gym-yellow text-gym-dark font-extrabold text-sm rounded-lg hover:bg-yellow-500">
              <Plus className="h-5 w-5 mr-1" /> Nuevo Empleado
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Personal (Nombre y Usuario)</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Rol Asignado</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr> : 
               filtrados.length === 0 ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay usuarios registrados.</td></tr> : 
               filtrados.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gym-dark">{u.nombre} {u.apellido}</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">{u.email} | <span className="text-gym-dark font-bold">@{u.username}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gym-dark text-gym-yellow text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">{u.rol}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold border ${u.activo ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {u.activo ? 'ACCESO PERMITIDO' : 'ACCESO REVOCADO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    {viendoActivos ? (
                      <button onClick={() => handleEliminar(u.id, `${u.nombre} ${u.apellido}`)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 rounded-md transition-colors" title="Revocar Acceso">
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleRestaurar(u.id, `${u.nombre} ${u.apellido}`)} className="p-1.5 text-gray-400 hover:text-green-600 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-md transition-colors" title="Restaurar Acceso">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex justify-between p-5 border-b bg-gray-50">
              <h3 className="font-black text-gym-dark flex items-center"><UserCog className="h-5 w-5 mr-2 text-gym-yellow"/> Registrar Personal</h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</label>
                  <input required name="nombre" value={formulario.nombre} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-gym-yellow transition-colors" placeholder="Ej. Juan" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Apellido</label>
                  <input required name="apellido" value={formulario.apellido} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-gym-yellow transition-colors" placeholder="Ej. Pérez" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Username (Usuario)</label>
                <input required name="username" value={formulario.username} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-gym-yellow transition-colors" placeholder="Ej. jperez_coach" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico (Login)</label>
                <input type="email" required name="email" value={formulario.email} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-gym-yellow transition-colors" placeholder="jperez@gymking.com" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contraseña Temporal</label>
                <input type="password" required name="password" value={formulario.password} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-gym-yellow transition-colors" placeholder="••••••••" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rol de Sistema</label>
                <select required name="rol" value={formulario.rol} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-gym-yellow transition-colors text-gym-dark">
                  <option value="" disabled>-- Seleccionar rol --</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="VENDEDOR">Vendedor / Cajero</option>
                  <option value="ALMACENERO">Almacenero</option>
                  <option value="ENTRENADOR">Entrenador (Coach)</option>
                  <option value="CONTADOR">Contador</option>
                </select>
              </div>
              
              <button type="submit" disabled={guardando} className="w-full py-3 bg-gym-yellow text-gym-dark font-black text-sm rounded-lg hover:bg-yellow-500 mt-4 uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Crear Cuenta de Empleado'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}