import { useState } from "react";

interface ModalPagoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (metodo: string) => void;
}

const ModalPago = ({ isOpen, onClose, onConfirm }: ModalPagoProps) => {
  const [metodo, setMetodo] = useState("Efectivo");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400"
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
            className="w-full border rounded-md p-2 mt-1 outline-none focus:border-orange-500"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button className="p-2 text-gray-300 hover:text-red-500">🗑</button>
          <button
            onClick={() => onConfirm(metodo)}
            className="bg-orange-600 text-white px-6 py-2 rounded-md font-bold text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPago;
