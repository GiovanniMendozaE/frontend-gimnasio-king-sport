import { useState, useEffect } from 'react';
import { ShoppingCart, Search, X, Dumbbell, ShoppingBag, ArrowRight, User, LogOut } from 'lucide-react';
import { obtenerCatalogoPublico } from '../../services/web/catalogoWebService';
import { procesarPedido } from '../../services/web/pedidoWebService';
import Checkout from './Checkout'; 
import AuthModal from './AuthModal'; // El nuevo muro de seguridad

export default function TiendaVirtual() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  // Estados del Carrito y Checkout
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mostrandoCheckout, setMostrandoCheckout] = useState(false);

  // ESTADOS DE SEGURIDAD Y SESIÓN WEB
  const [usuarioWeb, setUsuarioWeb] = useState(() => {
    // Intentamos recuperar la sesión al cargar la página
    const guardado = localStorage.getItem('usuarioWeb');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [mostrandoAuth, setMostrandoAuth] = useState(false);

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const cargarCatalogo = async () => {
    try {
      setCargando(true);
      const data = await obtenerCatalogoPublico();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando el catálogo:", error);
    } finally {
      setCargando(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stockActual) {
        alert("¡Alcanzaste el límite de stock de este producto!");
        return;
      }
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setCarritoAbierto(true);
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
    if (carrito.length === 1) setMostrandoCheckout(false); 
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.precioVenta * item.cantidad), 0);
  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    p.categoriaNombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioWeb');
    setUsuarioWeb(null);
    setCarrito([]); // Por seguridad, vaciamos el carrito al salir
    alert("Has cerrado sesión exitosamente.");
  };

  // LA FUNCIÓN QUE CONECTA CON SPRING BOOT (Ahora segura)
  const handlePagoExitoso = async (datosPago) => {
    try {
      if (!usuarioWeb) throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");

      const payload = {
        clienteId: usuarioWeb.id, // ¡AHORA USA EL ID REAL DEL CLIENTE LOGUEADO!
        metodoPago: datosPago.metodoPago,
        transaccionId: datosPago.transaccionId,
        totalPagar: totalCarrito,
        detalles: carrito.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioVenta
        }))
      };

      const respuesta = await procesarPedido(payload);
      
      alert(respuesta.mensaje + "\nTu N° de Orden es: " + respuesta.transaccionId);
      
      setCarrito([]); 
      setMostrandoCheckout(false);
      setCarritoAbierto(false); 
      cargarCatalogo(); 

    } catch (error) {
      alert("Hubo un problema con tu pedido: " + error.message);
      setMostrandoCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* NAVBAR PÚBLICO CON PERFIL DE USUARIO */}
      <nav className="bg-gym-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-gym-yellow mr-3" />
            <span className="text-2xl font-black tracking-widest uppercase">Gym King <span className="text-gym-yellow">Sport</span></span>
          </div>
          
          <div className="flex-1 max-w-lg mx-8 hidden md:block relative">
            <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
            <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-full text-sm text-white focus:outline-none focus:border-gym-yellow transition-colors" placeholder="Buscar proteínas, creatinas, accesorios..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
          </div>

          <div className="flex items-center space-x-6">
            {/* Sección de Sesión */}
            {usuarioWeb ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-300 hidden sm:block">Hola, {usuarioWeb.nombre}</span>
                <button onClick={handleCerrarSesion} title="Cerrar Sesión" className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setMostrandoAuth(true)} className="flex items-center text-sm font-bold text-white hover:text-gym-yellow transition-colors">
                <User className="h-5 w-5 mr-2" /> Iniciar Sesión
              </button>
            )}

            {/* Botón del Carrito */}
            <button onClick={() => setCarritoAbierto(true)} className="relative p-2 text-white hover:text-gym-yellow transition-colors">
              <ShoppingCart className="h-7 w-7" />
              {cantidadItems > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-gym-yellow text-gym-dark text-xs font-black h-5 w-5 rounded-full flex items-center justify-center">
                  {cantidadItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* CATÁLOGO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gym-dark mb-4 uppercase tracking-tight">Suplementos y Accesorios</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Potencia tus entrenamientos con los mejores productos. Haz tu pedido web y recógelo directamente en la recepción.</p>
        </div>

        {cargando ? (
          <div className="text-center py-20 text-gray-400 font-bold">Cargando vitrina virtual...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtrados.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400">No encontramos productos con esa búsqueda.</div>
            ) : (
              filtrados.map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
                  <div className="h-48 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <ShoppingBag className="h-16 w-16 text-gray-300" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{prod.categoriaNombre}</span>
                    <h3 className="text-lg font-black text-gym-dark mb-2 line-clamp-2">{prod.nombre}</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-2xl font-black text-gym-yellow">S/ {prod.precioVenta.toFixed(2)}</span>
                    </div>
                    <button onClick={() => agregarAlCarrito(prod)} className="w-full mt-4 py-3 bg-gym-dark hover:bg-black text-white font-bold text-sm rounded-xl transition-colors">
                      Añadir al Carrito
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* MODAL LATERAL (Carrito y Checkout) */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCarritoAbierto(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
            <div className="w-full bg-white shadow-2xl flex flex-col">
              
              <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-xl font-black text-gym-dark flex items-center">
                  {mostrandoCheckout ? 'Finalizar Pago' : <><ShoppingCart className="mr-3 h-6 w-6 text-gym-yellow"/> Tu Pedido</>}
                </h2>
                <button onClick={() => { setCarritoAbierto(false); setMostrandoCheckout(false); }} className="text-gray-400 hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
              </div>

              {/* RENDERIZADO CONDICIONAL: Muestra la pasarela O el carrito */}
              {mostrandoCheckout ? (
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                  <Checkout 
                    carrito={carrito} 
                    total={totalCarrito} 
                    onPagoExitoso={handlePagoExitoso} 
                    onCancelar={() => setMostrandoCheckout(false)} 
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {carrito.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                        <ShoppingBag className="h-16 w-16 mb-4 text-gray-200"/>
                        <p>Tu carrito está vacío</p>
                      </div>
                    ) : (
                      carrito.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4">
                          <div className="flex-1 pr-4">
                            <h4 className="text-sm font-bold text-gym-dark line-clamp-1">{item.nombre}</h4>
                            <p className="text-xs text-gray-500 mt-1">S/ {item.precioVenta.toFixed(2)} x {item.cantidad}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-gym-dark mb-2">S/ {(item.precioVenta * item.cantidad).toFixed(2)}</p>
                            <button onClick={() => quitarDelCarrito(item.id)} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Quitar</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 font-bold uppercase text-sm">Total a pagar</span>
                      <span className="text-3xl font-black text-gym-dark">S/ {totalCarrito.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      disabled={carrito.length === 0}
                      onClick={() => {
                        // LA BARRERA DE SEGURIDAD
                        if (!usuarioWeb) {
                          setMostrandoAuth(true);
                        } else {
                          setMostrandoCheckout(true);
                        }
                      }}
                      className="w-full flex items-center justify-center py-4 bg-gym-yellow hover:bg-yellow-500 text-gym-dark font-black text-sm uppercase tracking-widest rounded-xl disabled:opacity-50 transition-colors"
                    >
                      Procesar Pedido <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EL MURO DE AUTENTICACIÓN (Emergente) */}
      {mostrandoAuth && (
        <AuthModal 
          onClose={() => setMostrandoAuth(false)}
          onLoginSuccess={(userData) => {
            // Guardamos la sesión en el navegador
            localStorage.setItem('usuarioWeb', JSON.stringify(userData));
            setUsuarioWeb(userData); // Actualizamos el estado
            setMostrandoAuth(false); // Cerramos el modal de login
            setMostrandoCheckout(true); // Y lo mandamos directo a la pasarela
          }}
        />
      )}
    </div>
  );
}