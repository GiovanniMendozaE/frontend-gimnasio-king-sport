const API_URL = 'http://localhost:8081/api/v1/web/carrito';

export const sincronizarCarritoApi = async (clienteId, carritoLocal) => {
  const payload = {
    clienteId: clienteId,
    itemsLocales: carritoLocal.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad
    }))
  };

  const response = await fetch(`${API_URL}/sincronizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Error al sincronizar el carrito con la nube');
  }

  return await response.json();
};

// NUEVA FUNCIÓN: Envía el carrito a MySQL de forma silenciosa
export const guardarCarritoApi = async (clienteId, carritoLocal) => {
  const payload = {
    clienteId: clienteId,
    itemsLocales: carritoLocal.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad
    }))
  };

  await fetch(`${API_URL}/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};