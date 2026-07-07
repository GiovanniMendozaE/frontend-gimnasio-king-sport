import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, LayoutDashboard, Store, ShoppingCart, CreditCard, 
  ShoppingBag, Users, Dumbbell, FileText, Truck, Package, 
  AlertTriangle, UserCog, LogOut, ClipboardList
} from 'lucide-react';
import { logoutAPI } from '../services/authService';

// Función auxiliar para decodificar el JWT sin librerías externas
const decodificarToken = () => {
  const token = localStorage.getItem('gym_token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuarioInfo, setUsuarioInfo] = useState({ email: 'usuario@gym.com', rol: 'ADMIN' });

  useEffect(() => {
    const tokenData = decodificarToken();
    if (tokenData) {
      // Ajusta 'role' o 'roles' o 'authorities' dependiendo de cómo lo llame tu backend en el JWT
      const rolEncontrado = tokenData.rol || tokenData.role || tokenData.roles || tokenData.authorities || 'ADMIN';
      
      // Si Spring Security lo devuelve como un array o con el prefijo ROLE_
      let rolLimpio = Array.isArray(rolEncontrado) ? rolEncontrado[0] : rolEncontrado;
      rolLimpio = rolLimpio.replace('ROLE_', ''); 

      setUsuarioInfo({
        email: tokenData.sub || tokenData.email || 'usuario',
        rol: rolLimpio
      });
    }
  }, []);

  const handleLogout = () => {
    logoutAPI();
    navigate('/login');
  };

  // DEFINICIÓN DE ROLES PERMITIDOS POR RUTA
  const menuGroups = [
    {
      title: '',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO', 'ENTRENADOR'] },
        { name: 'Catálogo Web', icon: Store, path: '/dashboard/catalogo', roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO'] }
      ]
    },
    {
      title: 'VENTAS',
      items: [
        { name: 'Ventas de Caja', icon: ShoppingCart, path: '/dashboard/ventas', roles: ['ADMIN', 'VENDEDOR'] },
        { name: 'Pedidos Web', icon: ShoppingBag, path: '/dashboard/pedidos', roles: ['ADMIN', 'VENDEDOR'] }
      ]
    },
    {
      title: 'SOCIOS',
      items: [
        { name: 'Clientes', icon: Users, path: '/dashboard/clientes', roles: ['ADMIN', 'VENDEDOR'] },
        { name: 'Membresías', icon: CreditCard, path: '/dashboard/membresias', roles: ['ADMIN', 'VENDEDOR'] },
        { name: 'Planes', icon: ClipboardList, path: '/dashboard/planes', roles: ['ADMIN'] },
        { name: 'Entrenamientos', icon: Dumbbell, path: '/dashboard/entrenamientos', roles: ['ADMIN', 'ENTRENADOR'] },
        { name: 'Catálogo Ejercicios', icon: Activity, path: '/dashboard/ejercicios', roles: ['ADMIN', 'ENTRENADOR'] }
      ]
    },
    {
      title: 'COMPRAS',
      items: [
        { name: 'Órdenes de Compra', icon: FileText, path: '/dashboard/ordenes', roles: ['ADMIN', 'ALMACENERO'] },
        { name: 'Proveedores', icon: Truck, path: '/dashboard/proveedores', roles: ['ADMIN', 'ALMACENERO'] }
      ]
    },
    {
      title: 'ALMACÉN',
      items: [
        { name: 'Productos', icon: Package, path: '/dashboard/productos', roles: ['ADMIN', 'ALMACENERO'] },
        { name: 'Categorías', icon: Package, path: '/dashboard/categorias', roles: ['ADMIN', 'ALMACENERO'] },
        { name: 'Stock Bajo', icon: AlertTriangle, path: '/dashboard/stock-bajo', roles: ['ADMIN', 'ALMACENERO', 'VENDEDOR'] }
      ]
    },
    {
      title: 'SEGURIDAD',
      items: [
        { name: 'Usuarios y Accesos', icon: UserCog, path: '/dashboard/usuarios', roles: ['ADMIN'] }
      ]
    }
  ];

  // FILTRAR MENÚ SEGÚN EL ROL DEL USUARIO
  const menuFiltrado = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(usuarioInfo.rol))
  })).filter(group => group.items.length > 0); // Ocultar grupos vacíos

  return (
    <div className="flex h-screen bg-gym-gray overflow-hidden">
      
      {/* Menú Lateral */}
      <aside className="w-64 bg-gym-dark text-white flex flex-col shadow-xl hidden md:flex h-full shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-neutral-800 shrink-0">
          <Activity className="h-8 w-8 text-gym-yellow mr-3" />
          <span className="text-xl font-bold tracking-wider text-white">GYM KING</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pt-4">
          {menuFiltrado.map((group, index) => (
            <div key={index} className="mb-2">
              {group.title && (
                <div className="px-6 py-2 text-[11px] font-bold text-gray-500 tracking-widest mt-2">
                  {group.title}
                </div>
              )}
              <nav className="px-4 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                        isActive 
                          ? 'bg-gym-yellow text-gym-dark font-bold' 
                          : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3 shrink-0" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Tarjeta del Usuario Activo */}
        <div className="p-4 border-t border-neutral-800 shrink-0">
          <div className="flex items-center px-4 py-3 mb-2 bg-neutral-900 rounded-lg">
             <div className="w-8 h-8 rounded-full bg-gym-yellow flex items-center justify-center text-gym-dark font-bold mr-3 shrink-0 uppercase">
               {usuarioInfo.email.charAt(0)}
             </div>
             <div className="truncate flex-1">
               <p className="text-sm font-bold text-white truncate">{usuarioInfo.email.split('@')[0]}</p>
               <p className="text-[10px] text-gym-yellow font-bold uppercase tracking-wider truncate">{usuarioInfo.rol}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 shrink-0" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-200 shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-gym-dark">
              {menuFiltrado.flatMap(g => g.items).find(item => item.path === location.pathname)?.name || 'Panel de Control'}
            </h1>
            <p className="text-sm text-gray-500">Resumen operativo general</p>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-gym-gray">
          <Outlet />
        </div>
      </main>
    </div>
  );
}