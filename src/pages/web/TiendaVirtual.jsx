import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, X, Dumbbell, ShoppingBag, ArrowRight, User, LogOut, Plus, Minus } from 'lucide-react';
import { obtenerCatalogoPublico } from '../../services/web/catalogoWebService';
import { procesarPedido } from '../../services/web/pedidoWebService';
import { sincronizarCarritoApi, guardarCarritoApi } from '../../services/web/carritoWebService';
import Checkout from './Checkout'; 
import AuthModal from './AuthModal';
import MiCuenta from './MiCuenta'; // IMPORTAMOS EL NUEVO PORTAL DEL CLIENTE

export default function TiendaVirtual() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carritoWeb');
    return guardado ? JSON.parse(guardado) : [];
  });
  
  const [usuarioWeb, setUsuarioWeb] = useState(() => {
    const guardado = localStorage.getItem('usuarioWeb');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mostrandoCheckout, setMostrandoCheckout] = useState(false);
  const [mostrandoAuth, setMostrandoAuth] = useState(false);
  const [accionPostLogin, setAccionPostLogin] = useState(null); 
  
  // NUEVO ESTADO: Controla si el usuario está viendo su perfil o la tienda
  const [viendoPerfil, setViendoPerfil] = useState(false);

  const isMounted = useRef(false);

  // EFECTO MAESTRO: Controla el guardado local y en la nube (Debounce)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      if (usuarioWeb) {
        ejecutarSincronizacion(usuarioWeb);
      }
      return; 
    }

    localStorage.setItem('carritoWeb', JSON.stringify(carrito));

    if (usuarioWeb) {
      const timer = setTimeout(() => {
        guardarCarritoApi(usuarioWeb.id, carrito).catch(err => console.error("Error en sincronización silenciosa:", err));
      }, 500); 
      
      return () => clearTimeout(timer); 
    }
  }, [carrito, usuarioWeb]);

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

  const ejecutarSincronizacion = async (usuarioData) => {
    try {
      const carritoNube = await sincronizarCarritoApi(usuarioData.id, carrito);
      setCarrito(carritoNube);
    } catch (error) {
      console.error("No se pudo sincronizar el carrito:", error);
    }
  };

  const actualizarCantidad = (producto, delta) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.id);
      
      if (!existente && delta > 0) {
        if (producto.stockActual < 1) {
          alert("Producto agotado."); return prev;
        }
        return [...prev, { ...producto, cantidad: 1 }];
      }
      
      return prev.map(item => {
        if (item.id === producto.id) {
          const nuevaCantidad = item.cantidad + delta;
          if (nuevaCantidad > producto.stockActual) {
            alert("¡Límite de stock alcanzado!");
            return item;
          }
          return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
        }
        return item;
      }).filter(Boolean); 
    });
  };

  const getCantidad = (id) => {
    const item = carrito.find(i => i.id === id);
    return item ? item.cantidad : 0;
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
    localStorage.removeItem('carritoWeb'); 
    setUsuarioWeb(null);
    setCarrito([]); 
    setViendoPerfil(false); // Si cierra sesión, lo regresamos a la tienda
    alert("Has cerrado sesión exitosamente.");
  };

  const handlePagoExitoso = async (datosPago) => {
    try {
      if (!usuarioWeb) throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");

      const payload = {
        clienteId: usuarioWeb.id,
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

  // RENDERIZADO CONDICIONAL: Si el usuario quiere ver su perfil, mostramos MiCuenta
  if (viendoPerfil && usuarioWeb) {
    return <MiCuenta usuarioLogueado={usuarioWeb} onVolverTienda={() => setViendoPerfil(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <nav className="bg-gym-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-gym-yellow mr-3" />
            <span className="text-2xl font-black tracking-widest uppercase">Gym King <span className="text-gym-yellow">Sport</span></span>
          </div>
          
          <div className="flex-1 max-w-lg mx-8 hidden md:block relative">
            <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
            <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-full text-sm text-white focus:outline-none focus:border-gym-yellow transition-colors" placeholder="Buscar productos..." value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} />
          </div>

          <div className="flex items-center space-x-6">
            {usuarioWeb ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-300 hidden sm:block">Hola, {usuarioWeb.nombre}</span>
                
                {/* BOTÓN PARA IR A MI CUENTA */}
                <button onClick={() => setViendoPerfil(true)} title="Mi Cuenta" className="text-gray-400 hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </button>

                <button onClick={handleCerrarSesion} title="Cerrar Sesión" className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAccionPostLogin('nada'); setMostrandoAuth(true); }} className="flex items-center text-sm font-bold text-white hover:text-gym-yellow transition-colors">
                <User className="h-5 w-5 mr-2" /> Iniciar Sesión
              </button>
            )}

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gym-dark mb-4 uppercase tracking-tight">Suplementos y Accesorios</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Potencia tus entrenamientos. Haz tu pedido web y recógelo en recepción.</p>
        </div>

        {cargando ? (
          <div className="text-center py-20 text-gray-400 font-bold">Cargando vitrina virtual...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtrados.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400">No encontramos productos.</div>
            ) : (
              filtrados.map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
                  <div className="h-48 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <ShoppingBag className="h-16 w-16 text-gray-300" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{prod.categoriaNombre}</span>
                    <h3 className="text-lg font-black text-gym-dark mb-2 line-clamp-2">{prod.nombre}</h3>
                    <div className="mt-auto flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-gym-yellow">S/ {prod.precioVenta.toFixed(2)}</span>
                    </div>

                    {getCantidad(prod.id) === 0 ? (
                      <button onClick={() => actualizarCantidad(prod, 1)} className="w-full py-3 bg-gym-dark hover:bg-black text-white font-bold text-sm rounded-xl transition-colors">
                        Añadir al Carrito
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-1">
                        <button onClick={() => actualizarCantidad(prod, -1)} className="p-2 text-gray-500 hover:text-gym-dark hover:bg-gray-200 rounded-lg transition-colors">
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="font-black text-lg text-gym-dark w-10 text-center">{getCantidad(prod.id)}</span>
                        <button onClick={() => actualizarCantidad(prod, 1)} className="p-2 text-gym-dark hover:bg-gray-200 rounded-lg transition-colors">
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

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

              {mostrandoCheckout ? (
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                  <Checkout carrito={carrito} total={totalCarrito} onPagoExitoso={handlePagoExitoso} onCancelar={() => setMostrandoCheckout(false)} />
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
                            <p className="text-xs text-gray-500 mt-1">S/ {item.precioVenta.toFixed(2)} c/u</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                              <button onClick={() => actualizarCantidad(item, -1)} className="p-1 hover:bg-white rounded"><Minus className="h-3 w-3" /></button>
                              <span className="text-xs font-black w-6 text-center">{item.cantidad}</span>
                              <button onClick={() => actualizarCantidad(item, 1)} className="p-1 hover:bg-white rounded"><Plus className="h-3 w-3" /></button>
                            </div>
                            <div className="text-right w-16">
                              <p className="text-sm font-black text-gym-dark mb-1">S/ {(item.precioVenta * item.cantidad).toFixed(2)}</p>
                              <button onClick={() => quitarDelCarrito(item.id)} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Quitar</button>
                            </div>
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
                        if (!usuarioWeb) { 
                          setAccionPostLogin('pagar');
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

      {mostrandoAuth && (
        <AuthModal 
          onClose={() => setMostrandoAuth(false)}
          onLoginSuccess={async (userData) => {
            localStorage.setItem('usuarioWeb', JSON.stringify(userData));
            setUsuarioWeb(userData);
            setMostrandoAuth(false);
            
            await ejecutarSincronizacion(userData);

            if (accionPostLogin === 'pagar') {
              setMostrandoCheckout(true); 
            }
          }}
        />
      )}
    </div>
  );
}