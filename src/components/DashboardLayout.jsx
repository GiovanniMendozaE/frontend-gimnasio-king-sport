import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, LayoutDashboard, Store, ShoppingCart, CreditCard, 
  ShoppingBag, Users, Dumbbell, FileText, Truck, Package, 
  AlertTriangle, UserCog, LogOut, ClipboardList
} from 'lucide-react';
import { logoutAPI } from '../services/authService';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutAPI();
    navigate('/login');
  };

  const menuGroups = [
    {
      title: '',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Catálogo', icon: Store, path: '/dashboard/catalogo' }
      ]
    },
    {
      title: 'VENTAS',
      items: [
        { name: 'Ventas', icon: ShoppingCart, path: '/dashboard/ventas' },
        { name: 'Pedidos Web', icon: ShoppingBag, path: '/dashboard/pedidos' }
      ]
    },
    {
      title: 'SOCIOS',
      items: [
        { name: 'Clientes', icon: Users, path: '/dashboard/clientes' },
        { name: 'Membresías', icon: CreditCard, path: '/dashboard/membresias' },
        { name: 'Planes', icon: ClipboardList, path: '/dashboard/planes' },
        { name: 'Entrenamientos', icon: Dumbbell, path: '/dashboard/entrenamientos' }
      ]
    },
    {
      title: 'COMPRAS',
      items: [
        { name: 'Órdenes de Compra', icon: FileText, path: '/dashboard/ordenes' },
        { name: 'Proveedores', icon: Truck, path: '/dashboard/proveedores' }
      ]
    },
    {
      title: 'ALMACÉN',
      items: [
        { name: 'Productos', icon: Package, path: '/dashboard/productos' },
        { name: 'Categorías', icon: Package, path: '/dashboard/categorias' },
        { name: 'Stock Bajo', icon: AlertTriangle, path: '/dashboard/stock-bajo' }
      ]
    },
    {
      title: 'USUARIOS Y ACCESOS',
      items: [
        { name: 'Usuarios y Accesos', icon: UserCog, path: '/dashboard/usuarios' }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gym-gray overflow-hidden">
      
      {/* Menú Lateral (Sidebar) */}
      <aside className="w-64 bg-gym-dark text-white flex flex-col shadow-xl hidden md:flex h-full">
        {/* LOGO */}
        <div className="h-20 flex items-center px-6 border-b border-neutral-800 shrink-0">
          <Activity className="h-8 w-8 text-gym-yellow mr-3" />
          <span className="text-xl font-bold tracking-wider text-white">GYM KING</span>
        </div>

        {/* LISTA DE NAVEGACIÓN CON SCROLL OCULTO */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pt-4">
          {menuGroups.map((group, index) => (
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

        {/* CONTENEDOR INFERIOR UNIFICADO */}
        <div className="p-4 border-t border-neutral-800 shrink-0">
          <div className="flex items-center px-4 py-3 mb-2 bg-neutral-900 rounded-lg">
             <div className="w-8 h-8 rounded-full bg-gym-yellow flex items-center justify-center text-gym-dark font-bold mr-3 shrink-0">
               A
             </div>
             <div className="truncate">
               <p className="text-sm font-bold text-white truncate">admin</p>
               <p className="text-xs text-gray-500 truncate">Administrador</p>
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
              {menuGroups.flatMap(g => g.items).find(item => item.path === location.pathname)?.name || 'Panel de Control'}
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