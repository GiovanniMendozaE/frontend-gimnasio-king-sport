import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

export default function ProtectedRoute() {
  // Si el usuario tiene el token, renderiza la ruta que pidió (Outlet). 
  // Si no, lo redirige a /login
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}