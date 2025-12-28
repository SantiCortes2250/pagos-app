import React, { useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { formatMonto } from "../utils/formatters";
import ModalPago from "./ModalPago";
import type { Pago } from "../types/pagos";
import pagadoIon from "@/assets/icons/pagado.png";
import editIcon from "@/assets/icons/edit.svg"; 
import arrowDownIcon from "@/assets/icons/arrow-down.svg";

interface PagosProps {
  total: number;
  moneda?: "USD" | "COP";
  prestamoId: string;
}

/*
 Este componente maneja la línea de tiempo de los pagos.
 Realice el diseño horizontal con scroll por si hay muchas cuotas,
 el usuario pueda navegar sin que la página se haga infinita hacia abajo.
 */

const Pagos: React.FC<PagosProps> = ({ total, moneda = "USD", prestamoId }) => {
  // Traigo toda la lógica del hook para dejar este componente solo con lo visual.
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

  // Estados locales para la UI: si estamos editando o qué pago se va a procesar.
  const [esEdicion, setEsEdicion] = useState(false);
  const [pagoParaPagar, setPagoParaPagar] = useState<Pago | null>(null);

  //  Aca necesito la fecha de hoy para bloquear días pasados en el calendario de edición.
  const hoy = new Date().toISOString().split("T")[0];

  /*
   Aca manejo el cierre del modal y confirmo la acción.
   Lo puse aquí porque es una acción que depende directamente de la interacción con el Modal.
  */
  const handleConfirmarPago = (metodo: string) => {
    if (pagoParaPagar) {
      marcarComoPagado(pagoParaPagar.id, metodo);
      setPagoParaPagar(null);
      //@todo: api post para notificar al servidor que se completó un pago.
    }
  };

  /*
   Helper para que el input type="date" no de errores de formato.
   Los inputs nativos de HTML piden YYYY-MM-DD entonces me aseguro de dárselo así.
  */
  const formatFechaParaInput = (fecha: Date | string) => {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto relative overflow-hidden">
      {/* --- NOTIFICACIÓN DE ERROR --- 
          Aparece con una animación desde arriba para que el usuario note que algo falló
          (como cuando el título está vacío o el orden de pago es incorrecto).
      */}
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
          <h2 className="text-orange-600 font-semibold sm:text-lg md:text-2xl">Pagos</h2>
          <img className="w-4 md:mt-2" src={arrowDownIcon} alt="" />
        </div>

        <div className="flex items-center gap-6">
          {/* Botón de toggle para modo edición. Cambia de color cuando está activo. */}
          <button
            onClick={() => setEsEdicion(!esEdicion)}
            className={`cursor-pointer ${
              esEdicion
                ? "bg-orange-600 text-white px-5 py-1.5 rounded-md"
                : "text-orange-600 font-semibold text-base"
            } text-sm transition-colors`}
          >
            {esEdicion ? "Guardar" : 
            <div className="flex items-center">
              <span className="mr-2">Editar</span>
              <img className="h-3.5 w-3.5" src={editIcon} alt="" />
              </div>}
          </button>

          <div className="text-gray-400 sm:text-lg md:text-2xl">
            Por cobrar{" "}
            <span className="text-gray-900 font-semibold">
              {formatMonto(total)} {moneda}
            </span>
          </div>
        </div>
      </div>

      {/* --- FLUJO DE CUOTAS --- */}

      <div className="flex items-center overflow-x-auto pb-6 scrollbar-hide pt-4">
        {/* Botón inicial de agregar: Solo aparece si ya hay divisiones hechas */}
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
              {/* Círculo de estado: Verde si está pagado, naranja si estamos editando */}
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
                   <img src={pagadoIon} alt="" />
                ) : esEdicion ? (
                      <img src={editIcon} alt="" />
                ) : (
                    <span className="hidden group-hover:block text-xs font-bold transition-all">
                      <img src={editIcon} alt="" />
                    </span>
                )}
              </div>

              <div className="mt-4 w-full text-center">
                {/* Renderizado condicional según el estado.
                   Si es modo edición, mostramos inputs para que el usuario pueda cambiar valores.
                */}
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
                    {/* El onBlur asegura que solo validamos cuando el usuario termina de escribir */}
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
                    {/* Controles de porcentaje para ajustar montos entre cuotas vecinas */}
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
                  // Vista de lectura normal
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

            {/* --- CONECTORES (La línea entre cuotas) --- 
                La línea se pone verde cuando el pago anterior se completa. 
                Aparece un botón "+" flotante para dividir cuotas fácilmente.
            */}
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
              // Botón de "Agregar Pago" al final si solo hay una cuota (estado inicial).
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

      {/* --- MODAL DE PAGO --- 
          Solo se activa cuando seleccionamos un nodo que está pendiente.
      */}
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
