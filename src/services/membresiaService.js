const API_URL = 'http://localhost:8081/api/v1/membresias';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

export const obtenerMembresias = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar membresías');
  return await response.json();
};

export const asignarMembresia = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al asignar la membresía');
  return await response.json();
};

export const anularMembresia = async (id) => {
  const response = await fetch(`${API_URL}/${id}/anular`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al anular la membresía');
  // Como el backend devuelve un String plano, leemos text() en lugar de json()
  return await response.text(); 
};