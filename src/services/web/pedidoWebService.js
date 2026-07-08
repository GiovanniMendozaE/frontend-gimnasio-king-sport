const API_URL = 'http://localhost:8081/api/v1/web/pedidos';

export const procesarPedido = async (pedidoData) => {
  const response = await fetch(`${API_URL}/procesar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pedidoData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al procesar el pago y crear el pedido');
  }

  return await response.json();
};
export const obtenerHistorialPedidos = async (clienteId) => {
  const response = await fetch(`http://localhost:8081/api/v1/web/pedidos/historial/${clienteId}`);
  if (!response.ok) throw new Error("Error al obtener el historial");
  return await response.json();
};