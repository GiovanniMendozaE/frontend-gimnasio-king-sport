import { useState } from 'react';
import { X, Mail, Lock, User, Phone, CreditCard, Loader2 } from 'lucide-react';
import { registrarCliente, loginCliente } from '../../services/web/authWebService'; 

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);

  // AHORA EL ESTADO TIENE NOMBRE Y APELLIDO SEPARADOS
  const [formData, setFormData] = useState({
    email: '', password: '', documento: '', nombre: '', apellido: '', telefono: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      if (esRegistro) {
        const respuesta = await registrarCliente(formData);
        alert(respuesta.mensaje);
        setEsRegistro(false); 
      } else {
        const credenciales = {
          email: formData.email,
          password: formData.password
        };
        
        const clienteBD = await loginCliente(credenciales);
        
        onLoginSuccess({
          id: clienteBD.id,
          nombre: clienteBD.nombreCompleto, 
          email: clienteBD.email,
          rol: 'CLIENTE'
        });
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-black text-gym-dark uppercase">{esRegistro ? 'Crea tu Cuenta' : 'Inicia Sesión'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {esRegistro && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Documento (DNI/CE)</label>
                <div className="relative"><CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input required name="documento" value={formData.documento} onChange={handleChange} type="text" maxLength="15" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow" /></div>
              </div>
              
              {/* CAMPOS SEPARADOS DE NOMBRE Y APELLIDO */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre</label>
                  <div className="relative"><User className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input required name="nombre" value={formData.nombre} onChange={handleChange} type="text" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow" /></div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Apellido</label>
                  <div className="relative"><User className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input required name="apellido" value={formData.apellido} onChange={handleChange} type="text" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow" /></div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Teléfono</label>
                <div className="relative"><Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input required name="telefono" value={formData.telefono} onChange={handleChange} type="text" maxLength="15" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow" /></div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
            <div className="relative"><Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow" /></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contraseña</label>
            <div className="relative"><Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input required name="password" value={formData.password} onChange={handleChange} type="password" className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gym-yellow focus:ring-1 focus:ring-gym-yellow" /></div>
          </div>
          <button type="submit" disabled={cargando} className="w-full py-4 mt-2 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-black text-sm uppercase rounded-xl transition-colors flex justify-center items-center">
            {cargando ? <Loader2 className="animate-spin h-5 w-5" /> : (esRegistro ? 'Registrarme' : 'Ingresar y Pagar')}
          </button>
        </form>
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <button type="button" onClick={() => setEsRegistro(!esRegistro)} className="text-xs font-bold text-gray-500 hover:text-gym-dark transition-colors uppercase">
            {esRegistro ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Eres nuevo? Crea tu cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}