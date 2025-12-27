import { useState } from "react";

interface ModalPagoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (metodo: string) => void;
}

/*
 Este modal lo hice sencillo pero funcional. 
 Su única responsabilidad es capturar el método de pago y avisarle al padre.
*/
const ModalPago = ({ isOpen, onClose, onConfirm }: ModalPagoProps) => {
  // Manejo el método de pago en un estado local para que el componente sea "controlado".
  const [metodo, setMetodo] = useState("Efectivo");
  // Si el modal no debe estar abierto, no renderizamos nada (Early return).
  if (!isOpen) return null;

  return (
    // El "fixed inset-0" crea el fondo oscuro (overlay) que bloquea el resto de la app.
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] relative">
        {/* Botón de cerrar tipo "X" */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold mb-4">Pagar</h3>
        <p className="text-sm text-gray-500 mb-4">Selecciona método de pago.</p>

        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase">
            Estado
          </label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            className="w-full border rounded-md p-2 mt-1 outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          {/* Este botón de borrar está ahí por si en el futuro añado la funcion de cancelar la cuota, 
              por ahora solo es visual para seguir el diseño. */}
          <button className="p-2 text-gray-300 hover:text-red-500 cursor-pointer">🗑</button>
          <button
          // Le pasamos el método seleccionado a la función que viene del hook usePagos.
            onClick={() => onConfirm(metodo)}
            //@todo: api post para registrar el log de la transacción.
            className="bg-orange-600 text-white px-6 py-2 rounded-md font-bold text-sm cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPago;
