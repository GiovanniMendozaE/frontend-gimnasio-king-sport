const API_URL = 'http://localhost:8081/api/v1/usuarios';
const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('gym_token')}` });

export const obtenerUsuarios = async (activo = true) => {
  const response = await fetch(`${API_URL}?activo=${activo}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar usuarios');
  return await response.json();
};

export const crearUsuario = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al crear usuario');
  }
  return await response.json();
};

export const inhabilitarUsuario = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al inhabilitar usuario');
  return await response.json();
};

export const habilitarUsuario = async (id) => {
  const response = await fetch(`${API_URL}/${id}/habilitar`, { method: 'PUT', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al habilitar usuario');
  return await response.json();
};