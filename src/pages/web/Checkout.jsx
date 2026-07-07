import { useState } from 'react';
import { CreditCard, QrCode, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function Checkout({ carrito, total, onPagoExitoso, onCancelar }) {
  const [metodoPago, setMetodoPago] = useState('TARJETA'); // TARJETA o YAPE
  const [procesando, setProcesando] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);

  // Estados para el formulario de tarjeta (Solo visual, no se guarda)
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', nombre: '', vencimiento: '', cvv: '' });

  const handleSimularPago = (e) => {
    e.preventDefault();
    setProcesando(true);

    // Simulamos el tiempo de respuesta del banco (2.5 segundos)
    setTimeout(() => {
      setProcesando(false);
      setPagoCompletado(true);
      
      // Generamos un código de transacción falso pero realista
      const transaccionFake = `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Esperamos 1 segundo para mostrar el check verde y luego enviamos los datos
      setTimeout(() => {
        onPagoExitoso({ metodoPago, transaccionId: transaccionFake });
      }, 1500);

    }, 2500);
  };

  if (pagoCompletado) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-100 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-gym-dark mb-2">¡Pago Exitoso!</h2>
        <p className="text-gray-500 text-sm">Tu transacción ha sido aprobada. Generando tu orden de compra...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden border border-gray-100">
      <div className="bg-gym-dark p-6 text-center border-b-4 border-gym-yellow">
        <h2 className="text-xl font-black text-white uppercase tracking-widest">Pasarela Segura</h2>
        <p className="text-gray-400 text-xs mt-1 flex items-center justify-center"><ShieldCheck className="w-3 h-3 mr-1"/> Encriptación SSL 256-bit</p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-sm font-bold text-gray-500">Total a Pagar:</span>
          <span className="text-2xl font-black text-gym-dark">S/ {total.toFixed(2)}</span>
        </div>

        {/* Pestañas de Método de Pago */}
        <div className="flex space-x-2 mb-6">
          <button 
            type="button"
            onClick={() => setMetodoPago('TARJETA')}
            className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center transition-colors border ${metodoPago === 'TARJETA' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
          >
            <CreditCard className="h-6 w-6 mb-1" />
            <span className="text-xs font-bold uppercase">Tarjeta</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setMetodoPago('YAPE')}
            className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center transition-colors border ${metodoPago === 'YAPE' ? 'bg-[#74005e]/10 border-[#74005e] text-[#74005e]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
          >
            <QrCode className="h-6 w-6 mb-1" />
            <span className="text-xs font-bold uppercase">Yape / Plin</span>
          </button>
        </div>

        <form onSubmit={handleSimularPago}>
          {metodoPago === 'TARJETA' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Número de Tarjeta</label>
                <input required type="text" maxLength="16" placeholder="0000 0000 0000 0000" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Vencimiento</label>
                  <input required type="text" maxLength="5" placeholder="MM/YY" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CVV</label>
                  <input required type="password" maxLength="4" placeholder="•••" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Titular de la Tarjeta</label>
                <input required type="text" placeholder="Nombre como aparece en la tarjeta" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500" />
              </div>
            </div>
          )}

          {metodoPago === 'YAPE' && (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#74005e]/30 rounded-xl bg-[#74005e]/5 animate-fade-in">
              <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
                 {/* Un simple cuadrado gris para simular un QR */}
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded border border-gray-300">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700 text-center mb-1">Escanea el código con tu app de Yape o Plin</p>
              <p className="text-xs text-gray-500 text-center mb-4">A nombre de: Gym King Sport S.A.C.</p>
              <div className="w-full">
                <label className="block text-xs font-bold text-[#74005e] uppercase mb-1">N° de Celular del que pagas</label>
                <input required type="text" maxLength="9" placeholder="999 888 777" className="w-full p-3 bg-white border border-[#74005e]/30 rounded-xl text-sm font-medium outline-none focus:border-[#74005e] focus:ring-1 focus:ring-[#74005e]" />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col space-y-3">
            <button 
              type="submit" 
              disabled={procesando}
              className={`w-full py-4 text-white font-black text-sm rounded-xl uppercase tracking-widest transition-all flex items-center justify-center ${procesando ? 'bg-gray-400' : metodoPago === 'TARJETA' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#74005e] hover:bg-[#5a0049]'}`}
            >
              {procesando ? (
                <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Procesando pago...</>
              ) : (
                `Pagar S/ ${total.toFixed(2)}`
              )}
            </button>
            <button 
              type="button" 
              onClick={onCancelar} 
              disabled={procesando}
              className="w-full py-3 text-gray-500 font-bold text-xs hover:text-gray-700 transition-colors uppercase"
            >
              Cancelar y volver al carrito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}