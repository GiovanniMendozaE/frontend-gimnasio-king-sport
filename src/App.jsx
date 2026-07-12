import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Productos from './pages/almacen/Productos';
import Categorias from './pages/almacen/Categorias'; 
import Proveedores from './pages/compras/Proveedores';
import OrdenesCompra from './pages/compras/OrdenesCompra';
import StockBajo from './pages/almacen/StockBajo';
import Clientes from './pages/ventas/Clientes';
import Ventas from './pages/ventas/Ventas';
import Membresias from './pages/socios/Membresias';
import Planes from './pages/socios/Planes';
import Entrenamientos from './pages/socios/Entrenamientos';
import Ejercicios from './pages/socios/Ejercicios';
import Usuarios from './pages/seguridad/Usuarios';
import TiendaVirtual from './pages/web/TiendaVirtual';
import PedidosWeb from './pages/admin/PedidosWeb';
import CatalogoWeb from './pages/admin/CatalogoWeb';
import Dashboard from './pages/admin/Dashboard';

// Vistas temporales (Aquí luego irán tus verdaderos componentes)
const VistaGenerica = ({ titulo }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-gym-yellow">
    <h2 className="text-2xl font-bold text-gym-dark">{titulo}</h2>
    <p className="mt-2 text-gray-500">Módulo en construcción conectado al backend...</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<TiendaVirtual />} />
        
        {/* Rutas Protegidas (Requieren Token) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Pantalla principal del Dashboard (Las tarjetas e indicadores irán aquí) */}
            <Route index element={<Dashboard />} />
            
            {/* Secciones del Menú Lateral */}
            <Route path="catalogo" element={<CatalogoWeb />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="membresias" element={<Membresias />} />
            <Route path="planes" element={<Planes />} />
            <Route path="pedidos" element={<PedidosWeb />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="entrenamientos" element={<Entrenamientos />} />
            <Route path="ejercicios" element={<Ejercicios />} />        
            <Route path="ordenes" element={<OrdenesCompra />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="stock-bajo" element={<StockBajo />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;