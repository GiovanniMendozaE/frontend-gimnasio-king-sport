const API_URL = 'http://localhost:8081/api/v1/rutinas';
const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('gym_token')}` });

export const crearRutina = async (rutinaData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(rutinaData),
  });

  if (!response.ok) {
    // 1. Leemos la respuesta cruda del backend
    const errorText = await response.text();
    let errorMessage = 'Error al guardar la rutina. Verifica la membresía.';
    
    try {
      // 2. Intentamos convertirla a JSON (si el GlobalExceptionHandler funcionó)
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (e) {
      // 3. Si no es JSON (es un error genérico de Spring Boot), lo atrapamos
      console.error("Error crudo del backend:", errorText);
    }
    
    // 4. Lanzamos el error real hacia la vista
    throw new Error(errorMessage);
  }
  
  return await response.json();
};