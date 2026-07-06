// La URL base de tu backend (Asegúrate de que Spring Boot esté corriendo)
const API_URL = 'http://localhost:8081/api/v1/auth';

export const loginAPI = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales incorrectas o usuario inactivo');
    }

    const data = await response.json();
    
    // Guardamos el token JWT en el navegador de forma segura
    localStorage.setItem('gym_token', data.token);
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const logoutAPI = () => {
  localStorage.removeItem('gym_token');
};

export const isAuthenticated = () => {
  return localStorage.getItem('gym_token') !== null;
};