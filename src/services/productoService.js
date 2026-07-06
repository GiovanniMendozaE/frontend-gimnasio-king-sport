const API_URL = 'http://localhost:8081/api/v1/productos';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gym_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Modificado para aceptar el parámetro booleano (por defecto true)
export const obtenerProductos = async (activo = true) => {
  try {
    const response = await fetch(`${API_URL}?activo=${activo}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar los productos');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const crearProducto = async (producto) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(producto),
  });
  if (!response.ok) throw new Error('Error al registrar');
  return await response.json();
};

export const actualizarProducto = async (id, producto) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(producto),
  });
  if (!response.ok) throw new Error('Error al actualizar');
  return await response.json();
};

export const eliminarProducto = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al inhabilitar');
  return await response.json();
};

// NUEVA FUNCIÓN PARA RESTAURAR
export const habilitarProducto = async (id) => {
  const response = await fetch(`${API_URL}/${id}/habilitar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al habilitar');
  return await response.json();
};
export const obtenerProductosStockBajo = async () => {
  const response = await fetch(`${API_URL}/stock-bajo`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al cargar alertas de stock');
  return await response.json();
};