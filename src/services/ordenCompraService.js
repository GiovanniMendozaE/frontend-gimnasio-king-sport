const API_URL = 'http://localhost:8081/api/v1/ordenes';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obtenerOrdenes = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar las órdenes');
  return await response.json();
};

export const crearOrden = async (ordenData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ordenData),
  });
  if (!response.ok) throw new Error('Error al generar la orden');
  return await response.json();
};

// --- NUEVAS FUNCIONES LOGÍSTICAS ---

export const recibirOrden = async (id) => {
  const response = await fetch(`${API_URL}/${id}/recibir`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al recibir la orden');
  return await response.json();
};

export const rechazarOrden = async (id) => {
  const response = await fetch(`${API_URL}/${id}/rechazar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al rechazar la orden');
  return await response.json();
};
export const obtenerOrdenPorId = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al cargar el documento');
  return await response.json();
};