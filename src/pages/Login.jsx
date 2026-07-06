import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, AlertCircle, Dumbbell } from 'lucide-react';
import { loginAPI } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await loginAPI(credenciales.email, credenciales.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gym-dark">
      {/* Fondo de Gimnasio con filtro oscuro */}
      <div 
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      {/* Tarjeta de Login (Efecto Cristal Oscuro) */}
      <div className="z-10 max-w-md w-full bg-neutral-900/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-neutral-800 m-4">
        <div className="p-8">
          
          <div className="flex justify-center mb-4">
            <div className="bg-gym-yellow p-4 rounded-full shadow-lg shadow-yellow-500/20">
              <Dumbbell className="h-8 w-8 text-gym-dark" />
            </div>
          </div>
          
          <h2 className="text-center text-3xl font-black text-white tracking-wider mb-2">
            GYM KING <span className="text-gym-yellow">SPORT</span>
          </h2>
          <p className="text-center text-gray-400 mb-8 text-sm">Sistema de Gestión Integral</p>

          {error && (
            <div className="mb-6 bg-red-900/50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 pr-3 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow focus:border-transparent transition-colors placeholder-gray-500"
                placeholder="Correo electrónico"
                value={credenciales.email}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full pl-10 pr-3 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gym-yellow focus:border-transparent transition-colors placeholder-gray-500"
                placeholder="Contraseña"
                value={credenciales.password}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-extrabold text-gym-dark uppercase tracking-wider transition-all ${
                cargando 
                  ? 'bg-yellow-600 cursor-not-allowed opacity-70' 
                  : 'bg-gym-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-gym-yellow hover:scale-[1.02]'
              }`}
            >
              {cargando ? 'Accediendo...' : 'Iniciar Sesión'}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}