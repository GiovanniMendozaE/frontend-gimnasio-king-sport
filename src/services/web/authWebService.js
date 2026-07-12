const API_URL = 'http://localhost:8081/api/v1/web';

export const registrarCliente = async (datos) => {
  const response = await fetch(`${API_URL}/clientes/registro`, {
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

export const loginCliente = async (credenciales) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Correo o contraseña incorrectos');
  }
  return await response.json();
};