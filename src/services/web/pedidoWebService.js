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