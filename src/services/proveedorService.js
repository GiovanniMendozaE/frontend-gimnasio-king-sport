const API_URL = 'http://localhost:8081/api/v1/proveedores';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obtenerProveedores = async (activo = true) => {
  const response = await fetch(`${API_URL}?activo=${activo}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar proveedores');
  return await response.json();
};

export const crearProveedor = async (proveedor) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(proveedor),
  });
  if (!response.ok) throw new Error('Error al registrar proveedor');
  return await response.json();
};

export const actualizarProveedor = async (id, proveedor) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(proveedor),
  });
  if (!response.ok) throw new Error('Error al actualizar proveedor');
  return await response.json();
};

export const eliminarProveedor = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al inhabilitar proveedor');
  return await response.json();
};

export const habilitarProveedor = async (id) => {
  const response = await fetch(`${API_URL}/${id}/habilitar`, { method: 'PUT', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al habilitar proveedor');
  return await response.json();
};