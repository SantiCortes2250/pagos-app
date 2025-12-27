import React, { useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { formatMonto } from "../utils/formatters";
import ModalPago from "./ModalPago";
import type { Pago } from "../types/pagos";

interface PagosProps {
  total: number;
  moneda?: "USD" | "COP";
  prestamoId: string;
}

const Pagos: React.FC<PagosProps> = ({ total, moneda = "USD", prestamoId }) => {
  const {
    pagos,
    agregarPago,
    marcarComoPagado,
    obtenerPorcentajeText,
    actualizarPorcentaje,
    actualizarFecha,
    actualizarTitulo,
    errorMsg,
  } = usePagos(total, prestamoId);

  const [esEdicion, setEsEdicion] = useState(false);
  const [pagoParaPagar, setPagoParaPagar] = useState<Pago | null>(null);

  const hoy = new Date().toISOString().split("T")[0];

  const handleConfirmarPago = (metodo: string) => {
    if (pagoParaPagar) {
      marcarComoPagado(pagoParaPagar.id, metodo);
      setPagoParaPagar(null);
    }
  };

  const formatFechaParaInput = (fecha: Date | string) => {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto relative overflow-hidden">
      {/* --- NOTIFICACIÓN DE ERROR --- */}
      {errorMsg && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top duration-300 z-50">
          <span className="text-red-500 text-lg">⚠️</span>
          <p className="text-red-700 text-xs font-bold uppercase tracking-tight">
            {errorMsg}
          </p>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 cursor-pointer group">
          <h2 className="text-orange-600 font-semibold text-2xl">Pagos</h2>
          <span className="text-orange-400 text-xs">⌄</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setEsEdicion(!esEdicion)}
            className={`cursor-pointer ${
              esEdicion
                ? "bg-orange-600 text-white px-5 py-1.5 rounded-md"
                : "text-orange-600 font-semibold text-base"
            } text-sm transition-colors`}
          >
            {esEdicion ? "Guardar" : "Editar ✎"}
          </button>

          <div className="text-gray-400 text-[23px]">
            Por cobrar{" "}
            <span className="text-gray-900 font-semibold">
              {formatMonto(total)} {moneda}
            </span>
          </div>
        </div>
      </div>

      {/* --- FLUJO DE CUOTAS --- */}

      <div className="flex items-center overflow-x-auto pb-6 scrollbar-hide pt-4">
        {pagos.length > 1 && (
          <div className="flex items-center self-start mt-3 mr-2 shrink-0">
            <button
              onClick={() => agregarPago(pagos.length - 1)}
              className="cursor-pointer w-6 h-6 rounded-full bg-gray-200 text-orange-500 flex items-center justify-center text-lg shadow-sm hover:bg-gray-300 transition-all font-bold"
            >
              +
            </button>
            <div className="w-4 h-[1px] bg-gray-200"></div>
          </div>
        )}

        {pagos.map((pago: Pago, index: number) => (
          <div key={pago.id} className="flex items-center">
            {/* --- NODO DE CUOTA --- */}
            <div className="flex flex-col items-center w-35">
              <div
                onClick={() =>
                  !esEdicion &&
                  pago.status === "pendiente" &&
                  setPagoParaPagar(pago)
                }
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer group
                ${
                  pago.status === "pagado"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : esEdicion
                    ? "bg-white border-orange-500 text-orange-500"
                    : "bg-slate-200 border-slate-200 text-slate-400 hover:bg-white hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                {pago.status === "pagado" ? (
                  <span className="text-xl">🎉</span>
                ) : esEdicion ? (
                  <span className="text-xs">✎</span>
                ) : (
                  <span className="hidden group-hover:block text-xs font-bold transition-all">
                    ✎
                  </span>
                )}
              </div>

              <div className="mt-4 w-full text-center">
                {pago.status === "pagado" ? (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-900 text-xl">
                      {pago.titulo}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatMonto(pago.monto)} {moneda}
                      <span className="font-normal text-gray-900 ml-1">
                        ({obtenerPorcentajeText(pago.monto)}%)
                      </span>
                    </p>
                    <p className="text-[14px] text-green-600 leading-tight">
                      Pagado{" "}
                      {pago.fechaPagoReal
                        ? new Date(pago.fechaPagoReal).toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "short" }
                          )
                        : "Hoy"}{" "}
                      <br />
                      con {pago.metodoPago || "efectivo"}
                    </p>
                  </div>
                ) : esEdicion ? (
                  <div className="space-y-2">
                    <input
                      className={`font-semibold text-gray-900 text-xl border border-gray-200 rounded outline-none w-full px-2`}
                      defaultValue={pago.titulo}
                      onBlur={(e) => actualizarTitulo(pago.id, e.target.value)}
                    />
                    <div className="flex items-center border border-gray-200 rounded px-2 py-1 bg-white justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatMonto(pago.monto)}
                      </p>
                      <span className="font-semibold text-sm text-gray-400">
                        {moneda}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => actualizarPorcentaje(index, -1)}
                        className="w-6 h-6 flex items-center justify-center border rounded-full text-orange-500 hover:bg-orange-50 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-[14px] text-gray-900">
                        {obtenerPorcentajeText(pago.monto)}%
                      </span>
                      <button
                        onClick={() => actualizarPorcentaje(index, 1)}
                        className="w-6 h-6 flex items-center justify-center border rounded-full text-orange-500 hover:bg-orange-50 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-col mt-2 items-start">
                      <p className="text-[14px] text-gray-400">Vence</p>
                      <input
                        type="date"
                        min={hoy}
                        className="..."
                        value={formatFechaParaInput(pago.fecha)} // <--- Cambia esto
                        onChange={(e) => {
                          // Creamos la fecha a partir del string YYYY-MM-DD
                          const [y, m, d] = e.target.value
                            .split("-")
                            .map(Number);
                          const nuevaFecha = new Date(y, m - 1, d); // Esto crea la fecha local pura
                          actualizarFecha(pago.id, nuevaFecha);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 text-xl">
                      {pago.titulo}
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {formatMonto(pago.monto)} {moneda}
                      <span className="font-normal text-gray-900 ml-1">
                        ({obtenerPorcentajeText(pago.monto)}%)
                      </span>
                    </p>
                    <div className="mt-0.5">
                      <p className="text-[14px] text-gray-900">
                        {new Date(pago.fecha).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* --- CONECTORES --- */}
            {index < pagos.length - 1 ? (
              <div className="relative flex items-center self-start mt-6 mr-2 group">
                <div
                  className={`h-0.5 w-30 transition-colors duration-500 ${
                    pagos[index].status === "pagado"
                      ? "bg-emerald-500"
                      : "bg-gray-100"
                  }`}
                />
                {pagos[index].status !== "pagado" && (
                  <button
                    onClick={() => {
                      agregarPago(index);
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-none bg-gray-200 text-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 hover:scale-110 font-bold cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            ) : (
              pagos.length === 1 &&
              !esEdicion && (
                <div className="relative flex items-center self-start mr-2 group">
                  <div className="h-0.5 w-20 bg-gray-100 mx-2" />
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => agregarPago(index)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-orange-500 shadow-sm hover:bg-gray-300 transition-all text-lg font-bold cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-500">Agregar Pago</span>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL DE PAGO --- */}
      {pagoParaPagar && (
        <ModalPago
          isOpen={!!pagoParaPagar}
          onClose={() => setPagoParaPagar(null)}
          onConfirm={handleConfirmarPago}
        />
      )}
    </div>
  );
};

export default Pagos;
