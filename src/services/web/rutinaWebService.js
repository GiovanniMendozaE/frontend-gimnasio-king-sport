const API_URL = 'http://localhost:8081/api/v1/web/rutinas';

export const obtenerRutinasCliente = async (clienteId) => {
  const response = await fetch(`${API_URL}/cliente/${clienteId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Error al obtener las rutinas");
  }
  return await response.json();
};