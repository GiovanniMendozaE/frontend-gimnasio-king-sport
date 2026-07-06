const API_URL = 'http://localhost:8081/api/v1/planes';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

export const obtenerPlanes = async (activo = true) => {
  const response = await fetch(`${API_URL}?activo=${activo}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar los planes');
  return await response.json();
};

export const crearPlan = async (planData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(planData),
  });
  if (!response.ok) throw new Error('Error al crear el plan');
  return await response.json();
};

export const actualizarPlan = async (id, planData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(planData),
  });
  if (!response.ok) throw new Error('Error al actualizar el plan');
  return await response.json();
};

export const inhabilitarPlan = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al inhabilitar el plan');
  return await response.json();
};

export const habilitarPlan = async (id) => {
  const response = await fetch(`${API_URL}/${id}/habilitar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al habilitar el plan');
  return await response.json();
};