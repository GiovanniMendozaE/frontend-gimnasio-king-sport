const API_URL = 'http://localhost:8081/api/v1/ejercicios';
const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('gym_token')}` });

export const obtenerEjercicios = async (activo = true) => {
  const response = await fetch(`${API_URL}?activo=${activo}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar ejercicios');
  return await response.json();
};

export const crearEjercicio = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear ejercicio');
  return await response.json();
};

export const actualizarEjercicio = async (id, data) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar ejercicio');
  return await response.json();
};

export const inhabilitarEjercicio = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al inhabilitar ejercicio');
  return await response.json();
};
export const habilitarEjercicio = async (id) => {
  const response = await fetch(`${API_URL}/${id}/habilitar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al habilitar ejercicio');
  return await response.json();
};