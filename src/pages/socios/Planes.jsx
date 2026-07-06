import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Archive, RotateCcw, ClipboardList, CalendarDays, DollarSign } from 'lucide-react';
import { obtenerPlanes, crearPlan, actualizarPlan, inhabilitarPlan, habilitarPlan } from '../../services/planService';

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [viendoActivos, setViendoActivos] = useState(true);

  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracionDias: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [viendoActivos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await obtenerPlanes(viendoActivos);
      setPlanes(data);
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    // Convertir a los tipos de datos correctos para el backend
    const payload = {
      ...formulario,
      precio: parseFloat(formulario.precio),
      duracionDias: parseInt(formulario.duracionDias)
    };

    try {
      if (idEdicion) {
        await actualizarPlan(idEdicion, payload);
      } else {
        await crearPlan(payload);
      }
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      alert("Error al guardar el plan. Verifica los datos.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCreacion = () => {
    setIdEdicion(null);
    setFormulario({ nombre: '', descripcion: '', precio: '', duracionDias: '' });
    setModalAbierto(true);
  };

  const abrirModalEdicion = (plan) => {
    setIdEdicion(plan.id);
    setFormulario({
      nombre: plan.nombre,
      descripcion: plan.descripcion || '',
      precio: plan.precio,
      duracionDias: plan.duracionDias
    });
    setModalAbierto(true);
  };

  const handleInhabilitar = async (id, nombre) => {
    if (window.confirm(`¿Seguro que deseas inhabilitar el plan "${nombre}"? Ya no estará disponible para nuevas ventas.`)) {
      try {
        await inhabilitarPlan(id);
        await cargarDatos();
      } catch (error) { alert("Error al intentar inhabilitar el plan."); }
    }
  };

  const handleRestaurar = async (id, nombre) => {
    if (window.confirm(`¿Deseas volver a habilitar el plan "${nombre}" para su venta?`)) {
      try {
        await habilitarPlan(id);
        await cargarDatos();
      } catch (error) { alert("Error al intentar restaurar el plan."); }
    }
  };
  
  const cerrarModal = () => {
    setModalAbierto(false);
    setIdEdicion(null);
  };

  const planesFiltrados = planes.filter(item => 
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
          <input type="text" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow transition-colors placeholder-gray-400 font-medium" placeholder="Buscar paquete por nombre..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {filtroBusqueda && (
            <button onClick={() => setFiltroBusqueda('')} className="px-4 py-2.5 bg-white text-gray-600 font-bold text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Limpiar</button>
          )}
          
          <button 
            onClick={() => setViendoActivos(!viendoActivos)}
            className={`flex items-center px-4 py-2.5 font-bold text-sm rounded-lg border transition-colors ${viendoActivos ? 'bg-white text-gray-600 border-gray-300' : 'bg-gym-dark text-gym-yellow border-gym-dark'}`}
          >
            <Archive className="h-4 w-4 mr-2" /> {viendoActivos ? 'Inhabilitados' : 'Activos'}
          </button>

          {viendoActivos && (
            <button onClick={abrirModalCreacion} className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-extrabold text-sm rounded-lg shadow-sm">
              <Plus className="h-5 w-5 mr-1 shrink-0" /> Nuevo Plan
            </button>
          )}
        </div>
      </div>

      {/* TABLA DE PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cargando ? (
          <div className="col-span-full p-8 text-center text-sm text-gray-500">Cargando catálogo de planes...</div>
        ) : planesFiltrados.length === 0 ? (
          <div className="col-span-full p-8 text-center text-sm text-gray-500">No se encontraron planes en esta categoría.</div>
        ) : (
          planesFiltrados.map((item) => (
            <div key={item.id} className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${viendoActivos ? 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gym-yellow' : 'bg-red-50/40 border-red-100'}`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-gym-dark leading-tight">{item.nombre}</h3>
                  <div className="bg-gym-dark text-gym-yellow text-xs font-black px-2 py-1 rounded-md tracking-wider">
                    S/ {item.precio.toFixed(2)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                  {item.descripcion || 'Sin descripción detallada.'}
                </p>
                <div className="flex items-center text-sm font-bold text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit mb-4">
                  <CalendarDays className="h-4 w-4 text-gym-yellow mr-2" />
                  Duración: {item.duracionDias} días
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 mt-auto">
                {viendoActivos ? (
                  <>
                    <button onClick={() => abrirModalEdicion(item)} className="flex items-center px-3 py-1.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-md text-xs font-bold transition-colors">
                      <Edit2 className="h-3 w-3 mr-1" /> Editar
                    </button>
                    <button onClick={() => handleInhabilitar(item.id, item.nombre)} className="flex items-center px-3 py-1.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-md text-xs font-bold transition-colors">
                      <Trash2 className="h-3 w-3 mr-1" /> Archivar
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleRestaurar(item.id, item.nombre)} className="flex items-center px-4 py-2 text-gym-dark hover:text-white bg-gym-yellow hover:bg-yellow-600 rounded-md text-xs font-bold transition-colors w-full justify-center">
                    <RotateCcw className="h-4 w-4 mr-2" /> Restaurar Paquete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-black text-gym-dark flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-gym-yellow" />
                {idEdicion ? 'Editar Plan' : 'Nuevo Plan'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-red-500"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre del Plan</label>
                  <input type="text" name="nombre" required value={formulario.nombre} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="Ej. Plan Anual VIP" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 relative">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Precio (S/)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-gray-400" /></div>
                      <input type="number" step="0.01" min="0" name="precio" required value={formulario.precio} onChange={handleChange} className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Duración (Días)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDays className="h-4 w-4 text-gray-400" /></div>
                      <input type="number" min="1" name="duracionDias" required value={formulario.duracionDias} onChange={handleChange} className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none" placeholder="Ej. 30" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descripción (Opcional)</label>
                  <textarea name="descripcion" rows="3" value={formulario.descripcion} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gym-dark focus:bg-white focus:ring-2 focus:ring-gym-yellow outline-none resize-none" placeholder="Beneficios que incluye este paquete..."></textarea>
                </div>

              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 px-4 py-3 bg-gym-yellow text-gym-dark font-black text-sm rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 uppercase tracking-wider">
                  {guardando ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}