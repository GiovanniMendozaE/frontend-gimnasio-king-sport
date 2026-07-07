import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Activity, Archive, RotateCcw } from 'lucide-react';
import { obtenerEjercicios, crearEjercicio, actualizarEjercicio, inhabilitarEjercicio, habilitarEjercicio } from '../../services/ejercicioService';

export default function Ejercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [viendoActivos, setViendoActivos] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    nombre: '', grupoMuscular: '', descripcion: '', videoUrl: ''
  });

  useEffect(() => { cargarDatos(); }, [viendoActivos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setEjercicios(await obtenerEjercicios(viendoActivos));
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
      if (idEdicion) await actualizarEjercicio(idEdicion, formulario);
      else await crearEjercicio(formulario);
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      alert("Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Inhabilitar el ejercicio ${nombre}?`)) {
      try { await inhabilitarEjercicio(id); await cargarDatos(); } 
      catch (error) { alert("Error al eliminar."); }
    }
  };

  const handleRestaurar = async (id, nombre) => {
    if (window.confirm(`¿Deseas volver a habilitar ${nombre}?`)) {
      try { await habilitarEjercicio(id); await cargarDatos(); } 
      catch (error) { alert("Error al restaurar."); }
    }
  };

  const abrirModal = (ej = null) => {
    if (ej) {
      setIdEdicion(ej.id);
      setFormulario({ nombre: ej.nombre, grupoMuscular: ej.grupoMuscular, descripcion: ej.descripcion || '', videoUrl: ej.videoUrl || '' });
    } else {
      setIdEdicion(null);
      setFormulario({ nombre: '', grupoMuscular: '', descripcion: '', videoUrl: '' });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const filtrados = ejercicios.filter(e => e.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || e.grupoMuscular.toLowerCase().includes(filtroBusqueda.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg outline-none focus:ring-2 focus:ring-gym-yellow" placeholder="Buscar ejercicio o grupo muscular..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setViendoActivos(!viendoActivos)}
            className={`flex items-center px-4 py-2.5 font-bold text-sm rounded-lg border transition-colors ${viendoActivos ? 'bg-white text-gray-600 border-gray-300' : 'bg-gym-dark text-gym-yellow border-gym-dark'}`}
          >
            <Archive className="h-4 w-4 mr-2" /> {viendoActivos ? 'Inhabilitados' : 'Activos'}
          </button>

          {viendoActivos && (
            <button onClick={() => abrirModal()} className="flex items-center px-5 py-2.5 bg-gym-yellow text-gym-dark font-extrabold text-sm rounded-lg hover:bg-yellow-500">
              <Plus className="h-5 w-5 mr-1" /> Nuevo Ejercicio
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cargando ? <div className="col-span-3 text-center text-gray-500 py-8">Cargando...</div> : 
         filtrados.length === 0 ? <div className="col-span-3 text-center text-gray-500 py-8">No se encontraron ejercicios.</div> :
         filtrados.map(ej => (
          <div key={ej.id} className={`p-5 rounded-xl border shadow-sm ${viendoActivos ? 'bg-white border-gray-200' : 'bg-red-50/40 border-red-100'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-gym-dark">{ej.nombre}</h3>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{ej.grupoMuscular}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">{ej.descripcion || 'Sin descripción'}</p>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              {viendoActivos ? (
                <>
                  <button onClick={() => abrirModal(ej)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-md"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleEliminar(ej.id, ej.nombre)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
                </>
              ) : (
                <button onClick={() => handleRestaurar(ej.id, ej.nombre)} className="flex items-center px-4 py-2 text-gym-dark hover:text-white bg-gym-yellow hover:bg-yellow-600 rounded-md text-xs font-bold w-full justify-center">
                  <RotateCcw className="h-4 w-4 mr-2" /> Restaurar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex justify-between p-5 border-b bg-gray-50">
              <h3 className="font-black text-gym-dark flex items-center"><Activity className="h-5 w-5 mr-2 text-gym-yellow"/> {idEdicion ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nombre</label>
                <input required name="nombre" value={formulario.nombre} onChange={handleChange} className="w-full p-2.5 border rounded-lg text-sm font-medium outline-none focus:border-gym-yellow" placeholder="Ej. Press Militar" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Grupo Muscular</label>
                <select required name="grupoMuscular" value={formulario.grupoMuscular} onChange={handleChange} className="w-full p-2.5 border rounded-lg text-sm font-medium outline-none">
                  <option value="">Seleccionar...</option>
                  {['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                <textarea name="descripcion" value={formulario.descripcion} onChange={handleChange} className="w-full p-2.5 border rounded-lg text-sm font-medium outline-none" rows="2"></textarea>
              </div>
              <button type="submit" disabled={guardando} className="w-full py-3 bg-gym-yellow text-gym-dark font-black rounded-lg hover:bg-yellow-500 mt-2">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}