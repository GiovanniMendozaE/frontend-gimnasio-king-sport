const API_URL = 'http://localhost:8081/api/v1/ventas';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const realizarVenta = async (ventaData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ventaData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Error al procesar la venta');
  }
  return await response.json();
};

export const obtenerVentas = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar el historial de ventas');
  return await response.json();
};

export const anularVenta = async (id) => {
  const response = await fetch(`${API_URL}/${id}/anular`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al anular la venta');
  return await response.json();
};

export const obtenerVentaPorId = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar el comprobante');
  return await response.json();
};