// Ajusta la URL si tu controlador tiene una ruta distinta
const API_URL = 'http://localhost:8081/api/v1/dashboard';

export const obtenerKpisDashboard = async () => {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gym_token')}`, // Si usas seguridad
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener los datos del Dashboard');
  }

  return await response.json();
};