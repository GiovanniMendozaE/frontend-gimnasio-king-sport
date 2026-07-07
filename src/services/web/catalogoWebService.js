// OJO: Esta ruta tiene el /web/ que configuramos como público en Spring Boot
const API_URL = 'http://localhost:8081/api/v1/web/catalogo';

export const obtenerCatalogoPublico = async () => {
  // Nota que NO enviamos el gym_token en los headers, porque es público
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al cargar el catálogo de productos');
  return await response.json();
};