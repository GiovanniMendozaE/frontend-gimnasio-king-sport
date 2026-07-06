const API_URL = 'http://localhost:8081/api/v1/categorias';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obtenerCategorias = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar las categorías');
  return await response.json();
};

export const crearCategoria = async (categoria) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoria),
  });
  if (!response.ok) throw new Error('Error al crear la categoría');
  return await response.json();
};

export const actualizarCategoria = async (id, categoria) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoria),
  });
  if (!response.ok) throw new Error('Error al actualizar la categoría');
  return await response.json();
};

export const eliminarCategoria = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar la categoría');
  return await response.json();
};