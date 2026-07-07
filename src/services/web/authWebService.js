const API_URL = 'http://localhost:8081/api/v1/web/clientes';

export const registrarCliente = async (datos) => {
  const response = await fetch(`${API_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al crear la cuenta. Verifica tus datos.');
  }

  return await response.json();
};