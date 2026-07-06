const API_URL = 'http://localhost:8081/api/v1/clientes';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obtenerClientes = async (activo = true) => {
  const response = await fetch(`${API_URL}?activo=${activo}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar clientes');
  return await response.json();
};

export const habilitarCliente = async (id) => {
  const response = await fetch(`${API_URL}/${id}/habilitar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al habilitar cliente');
  return await response.json();
};

export const crearCliente = async (cliente) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cliente),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al registrar cliente. Verifica que el DNI no esté duplicado.');
  }
  return await response.json();
};

export const actualizarCliente = async (id, cliente) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error('Error al actualizar cliente');
  return await response.json();
};

export const eliminarCliente = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al inhabilitar cliente');
  return await response.json();
};