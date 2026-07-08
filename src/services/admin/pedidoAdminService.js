const API_URL = 'http://localhost:8081/api/v1/admin/pedidos';

const getHeaders = () => {
  const token = localStorage.getItem('gym_token'); // Nombre corregido
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const obtenerPedidosAdmin = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error("Error al obtener los pedidos.");
  return await response.json();
};

export const cambiarEstadoPedido = async (id, nuevoEstado) => {
  const response = await fetch(`${API_URL}/${id}/estado`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ estado: nuevoEstado })
  });
  if (!response.ok) throw new Error("Error al actualizar el estado");
  return await response.json();
};