import React, { useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { formatMonto } from "../utils/formatters";
import type { Pago } from "../types/pagos";

interface PagosProps {
  total: number;
  moneda?: "USD" | "COP";
}

const Pagos: React.FC<PagosProps> = ({ total, moneda = "USD" }) => {
  const {
    pagos,
    agregarPago,
    marcarComoPagado,
    obtenerPorcentajeText,
    actualizarPorcentaje,
    actualizarFecha,
  } = usePagos(total);
  const [esEdicion, setEsEdicion] = useState(false);

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 cursor-pointer group">
          <h2 className="text-orange-500 font-bold text-xl">Pagos</h2>
          <span className="text-orange-400 text-xs">⌄</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setEsEdicion(!esEdicion)}
            className={`${
              esEdicion
                ? "bg-orange-600 text-white px-5 py-1.5 rounded-md font-bold"
                : "text-orange-400 font-medium"
            } text-sm transition-colors`}
          >
            {esEdicion ? "Guardar" : "Editar ✎"}
          </button>

          <div className="text-slate-400 font-medium text-sm">
            Por cobrar{" "}
            <span className="text-slate-900 font-bold ml-1">
              {formatMonto(total)} {moneda}
            </span>
          </div>
        </div>
      </div>

      {/* --- FLUJO DE CUOTAS --- */}
      <div className="flex items-start overflow-x-auto pb-6 scrollbar-hide">
        {/* BOTÓN IZQUIERDO: Solo aparece si hay más de 1 pago */}

        {pagos.length > 1 && (
          <div className="flex items-center self-start mt-3 mr-2 shrink-0">
            <button
              onClick={() => agregarPago(pagos.length - 1)}
              className="w-6 h-6 rounded-full border border-gray-200 bg-slate-50 text-orange-500 flex items-center justify-center text-lg font-light shadow-sm hover:bg-orange-50 transition-all"
            >
              +
            </button>
            <div className="w-4 h-[1px] bg-gray-200"></div>
          </div>
        )}

        {pagos.map((pago: Pago, index: number) => (
          <div key={pago.id} className="flex items-center">
            {/* --- NODO DE CUOTA --- */}
            <div className="flex flex-col items-start min-w-[170px]">
              <div
                onClick={() =>
                  !esEdicion &&
                  pago.status === "pendiente" &&
                  marcarComoPagado(pago.id)
                }
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer
                ${
                  pago.status === "pagado"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : esEdicion
                    ? "bg-white border-orange-500 text-orange-500"
                    : "bg-slate-200 border-slate-200 text-slate-400"
                }`}
              >
                {pago.status === "pagado" && (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <div className="mt-4 w-full pr-4">
                {esEdicion && pago.status !== "pagado" ? (
                  <div className="space-y-2">
                    <input
                      className={`font-bold text-base border-b outline-none w-full px-1 transition-colors
                        ${
                          pago.titulo === "Nuevo"
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 text-slate-800"
                        }`}
                      defaultValue={pago.titulo}
                    />
                    <div className="flex items-center border border-gray-200 rounded px-2 py-1 bg-white">
                      <span className="text-sm font-bold text-slate-700">
                        {formatMonto(pago.monto)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarPorcentaje(index, -1)}
                        className="w-5 h-5 flex items-center justify-center border rounded-full text-orange-500 hover:bg-orange-50"
                      >
                        -
                      </button>
                      <span className="text-xs text-gray-500 font-bold">
                        {obtenerPorcentajeText(pago.monto)}%
                      </span>
                      <button
                        onClick={() => actualizarPorcentaje(index, 1)}
                        className="w-5 h-5 flex items-center justify-center border rounded-full text-orange-500 hover:bg-orange-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-800 text-base">
                      {pago.titulo}
                    </p>
                    <p className="text-[13px] font-semibold text-slate-700 mt-0.5">
                      {formatMonto(pago.monto)} {moneda}
                      <span className="text-gray-400 font-normal ml-1">
                        ({obtenerPorcentajeText(pago.monto)}%)
                      </span>
                    </p>
                  </>
                )}
                <div className="mt-2">
                  {esEdicion && pago.status !== "pagado" ? (
                    <div className="relative">
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">
                        VENCE
                      </label>
                      <div className="flex items-center gap-1 group cursor-pointer">
                        <input
                          type="date"
                          className="text-[11px] font-bold text-orange-500 outline-none border-b border-transparent focus:border-orange-500 bg-transparent uppercase cursor-pointer"
                          value={pago.fecha.toISOString().split("T")[0]}
                          min={new Date().toISOString().split("T")[0]} // Restricción nativa
                          onChange={(e) =>
                            actualizarFecha(pago.id, new Date(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1 uppercase">
                        Vence
                      </label>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {pago.fecha
                          .toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .replace(".", "")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- CONECTORES Y BOTÓN INTERMEDIO --- */}
            {index < pagos.length - 1 ? (
              <div className="relative flex items-center group">
                <div
                  className={`h-[2px] w-20 mx-2 transition-colors ${
                    pagos[index].status === "pagado"
                      ? "bg-emerald-500"
                      : "bg-gray-100"
                  }`}
                />
                <button
                  onClick={() => {
                    agregarPago(index);
                    setEsEdicion(true);
                  }}
                  className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-50 border border-blue-100 rounded-full text-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 hover:scale-110 font-bold"
                >
                  +
                </button>
              </div>
            ) : (
              /* BOTÓN DERECHO GRANDE: Solo si hay 1 solo pago */
              pagos.length === 1 &&
              !esEdicion && (
                <div className="flex items-center shrink-0">
                  <div className="h-[1px] w-8 bg-gray-100 mx-2" />
                  <div className="flex flex-col items-center gap-1 group/final">
                    <button
                      onClick={() => agregarPago(index)}
                      className="w-10 h-10 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center text-orange-500 shadow-sm group-hover/final:bg-orange-50 transition-all text-2xl font-light"
                    >
                      +
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">
                      Agregar Pago
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pagos;
