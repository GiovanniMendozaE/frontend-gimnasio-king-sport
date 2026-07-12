const API_URL = 'http://localhost:8081/api/v1/admin/catalogo';

export const obtenerCatalogoAdmin = async () => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('gym_token')}` }
  });
  if (!response.ok) throw new Error("Error al obtener catálogo");
  return await response.json();
};

export const togglePublicacionProducto = async (id) => {
  const response = await fetch(`${API_URL}/${id}/toggle-web`, {
    method: 'PUT', // AHORA USAMOS PUT
    headers: { 'Authorization': `Bearer ${localStorage.getItem('gym_token')}` }
  });
  if (!response.ok) throw new Error("Error al cambiar estado");
  return await response.json();
};