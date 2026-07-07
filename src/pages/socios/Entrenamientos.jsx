import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2, Save, Calendar, User, Target } from 'lucide-react';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerEjercicios } from '../../services/ejercicioService';
import { crearRutina } from '../../services/rutinaService';

export default function Entrenamientos() {
  const [clientes, setClientes] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estado de la Cabecera (Maestro)
  const [cabecera, setCabecera] = useState({
    clienteId: '',
    nombre: '',
    objetivo: '',
    fechaInicio: '',
    fechaFin: ''
  });

  // Estado del Detalle (Arreglo de ejercicios)
  const [detalles, setDetalles] = useState([
    { diaSemana: 'LUNES', ejercicioId: '', series: 4, repeticiones: 12, descanso: '60 seg' }
  ]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dataClientes, dataEjercicios] = await Promise.all([
        obtenerClientes(true),
        obtenerEjercicios()
      ]);
      setClientes(dataClientes);
      setEjercicios(dataEjercicios);
    } catch (error) {
      console.error("Error cargando dependencias:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleCabeceraChange = (e) => setCabecera({ ...cabecera, [e.target.name]: e.target.value });

  const handleDetalleChange = (index, campo, valor) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][campo] = valor;
    setDetalles(nuevosDetalles);
  };

  const agregarFila = () => {
    setDetalles([...detalles, { diaSemana: 'LUNES', ejercicioId: '', series: 4, repeticiones: 12, descanso: '60 seg' }]);
  };

  const quitarFila = (index) => {
    if (detalles.length === 1) return alert("La rutina debe tener al menos un ejercicio.");
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles);
  };

  const guardarRutina = async (e) => {
    e.preventDefault();
    if (!cabecera.clienteId) return alert("Selecciona un cliente.");
    if (detalles.some(d => !d.ejercicioId)) return alert("Todos los detalles deben tener un ejercicio seleccionado.");

    setGuardando(true);
    try {
      const payload = {
        clienteId: parseInt(cabecera.clienteId),
        nombre: cabecera.nombre,
        objetivo: cabecera.objetivo,
        fechaInicio: cabecera.fechaInicio,
        fechaFin: cabecera.fechaFin,
        detalles: detalles.map(d => ({
          ...d,
          ejercicioId: parseInt(d.ejercicioId),
          series: parseInt(d.series),
          repeticiones: parseInt(d.repeticiones)
        }))
      };
      
      await crearRutina(payload);
      alert("¡Rutina asignada con éxito!");
      
      // Limpiar formulario
      setCabecera({ clienteId: '', nombre: '', objetivo: '', fechaInicio: '', fechaFin: '' });
      setDetalles([{ diaSemana: 'LUNES', ejercicioId: '', series: 4, repeticiones: 12, descanso: '60 seg' }]);
    } catch (error) {
      alert(error.message); // Aquí saltará la validación si la membresía está vencida
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gym-dark flex items-center">
            <Dumbbell className="h-6 w-6 text-gym-yellow mr-2" /> Creador de Rutinas
          </h2>
          <p className="text-sm text-gray-500 mt-1">Asigna planes de entrenamiento personalizados a socios activos.</p>
        </div>
      </div>

      {cargando ? (
        <div className="p-12 text-center text-gray-500">Cargando módulos...</div>
      ) : (
        <form onSubmit={guardarRutina}>
          {/* CABECERA (DATOS GENERALES) */}
          <div className="p-6 space-y-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">1. Datos Generales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2"><User className="inline h-4 w-4 mr-1"/> Socio (Cliente)</label>
                <select required name="clienteId" value={cabecera.clienteId} onChange={handleCabeceraChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-gym-yellow">
                  <option value="" disabled>-- Selecciona el socio --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.documento} - {c.nombreCompleto}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre de la Rutina</label>
                <input type="text" required name="nombre" value={cabecera.nombre} onChange={handleCabeceraChange} placeholder="Ej. Fase de Volumen - Mes 1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-gym-yellow" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2"><Calendar className="inline h-4 w-4 mr-1"/> Fecha de Inicio</label>
                <input type="date" required name="fechaInicio" value={cabecera.fechaInicio} onChange={handleCabeceraChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-gym-yellow" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2"><Calendar className="inline h-4 w-4 mr-1"/> Fecha de Fin</label>
                <input type="date" required name="fechaFin" value={cabecera.fechaFin} onChange={handleCabeceraChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-gym-yellow" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2"><Target className="inline h-4 w-4 mr-1"/> Objetivo Específico</label>
                <input type="text" name="objetivo" value={cabecera.objetivo} onChange={handleCabeceraChange} placeholder="Ej. Hipertrofia en tren superior y mejora de resistencia..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-gym-yellow" />
              </div>
            </div>
          </div>

          {/* DETALLES (EJERCICIOS) */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">2. Plan de Ejercicios</h3>
              <button type="button" onClick={agregarFila} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gym-dark font-bold text-xs rounded-lg hover:bg-gray-100 shadow-sm transition-colors">
                <Plus className="h-4 w-4 mr-1" /> Agregar Ejercicio
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm items-end">
                  
                  <div className="w-full md:w-32">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Día</label>
                    <select value={detalle.diaSemana} onChange={(e) => handleDetalleChange(index, 'diaSemana', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none">
                      {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'].map(dia => <option key={dia} value={dia}>{dia}</option>)}
                    </select>
                  </div>

                  <div className="w-full md:flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ejercicio</label>
                    <select required value={detalle.ejercicioId} onChange={(e) => handleDetalleChange(index, 'ejercicioId', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-gym-yellow">
                      <option value="" disabled>-- Elige ejercicio --</option>
                      {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre} ({ej.grupoMuscular})</option>)}
                    </select>
                  </div>

                  <div className="w-full md:w-20">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Series</label>
                    <input type="number" min="1" required value={detalle.series} onChange={(e) => handleDetalleChange(index, 'series', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none text-center" />
                  </div>

                  <div className="w-full md:w-24">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reps</label>
                    <input type="number" min="1" required value={detalle.repeticiones} onChange={(e) => handleDetalleChange(index, 'repeticiones', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none text-center" />
                  </div>

                  <div className="w-full md:w-28">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descanso</label>
                    <input type="text" value={detalle.descanso} onChange={(e) => handleDetalleChange(index, 'descanso', e.target.value)} placeholder="Ej. 60s" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none text-center" />
                  </div>

                  <button type="button" onClick={() => quitarFila(index)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Eliminar fila">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={guardando} className="flex items-center px-8 py-3 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-black text-sm rounded-xl shadow-sm transition-transform active:scale-95 disabled:opacity-50 uppercase tracking-widest">
              {guardando ? 'Guardando...' : <><Save className="h-5 w-5 mr-2" /> Guardar Rutina</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}