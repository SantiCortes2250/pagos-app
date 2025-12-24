// components/Pagos.tsx
import React, { useState } from 'react';
import { usePagos } from '../hooks/usePagos';
import { formatMonto } from '../utils/formatters';
import type { Pago } from '../types/pagos';

interface PagosProps {
  total: number;
  moneda?: 'USD' | 'COP';
}

const Pagos: React.FC<PagosProps> = ({ total, moneda = 'USD' }) => {
  // Extraemos la lógica del hook organizado
  const { pagos, agregarPago, marcarComoPagado, obtenerPorcentajeText } = usePagos(total);
  
  // Estado local para alternar la interfaz entre lectura y edición
  const [esEdicion, setEsEdicion] = useState(false);

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2 cursor-pointer group">
          <h2 className="text-orange-500 font-bold text-xl">Pagos</h2>
          <span className="text-orange-400 text-xs transition-transform group-hover:translate-y-0.5">⌄</span>
        </div>
         
        <div className="flex items-center gap-6">
          {!esEdicion ? (
            <button 
              onClick={() => setEsEdicion(true)}
              className="flex items-center cursor-pointer gap-1.5 text-orange-400 text-sm font-medium hover:text-orange-500 transition-colors"
            >
              Editar <span className="text-[10px]">✎</span>
            </button>
          ) : (
            <button 
              onClick={() => setEsEdicion(false)}
              className="bg-orange-600 text-white px-5 py-1.5 rounded-md text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors"
            >
              Guardar
              {/* @todo: api post para persistir la nueva distribución de cuotas */}
            </button>
          )}
          
          <div className="text-slate-400 font-medium text-sm">
            Por cobrar <span className="text-slate-900 font-bold ml-1">{formatMonto(total)} {moneda}</span>
          </div>
        </div>
      </div>

      {/* --- FLUJO DE CUOTAS (Timeline) --- */}
      <div className="flex items-start overflow-x-auto pb-6 scrollbar-hide">
        {pagos.map((pago: Pago, index: number) => (
          <div key={pago.id} className="flex items-center">
            
            {/* --- NODO DE CUOTA --- */}
            <div className="flex flex-col items-start min-w-[160px]">
              {/* Círculo de Estado */}
              <div 
                onClick={() => !esEdicion && pago.status === 'pendiente' && marcarComoPagado(pago.id)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm
                ${pago.status === 'pagado' 
                  ? 'bg-emerald-500 border-emerald-500 text-white cursor-default' 
                  : 'bg-white border-orange-500 text-orange-500 cursor-pointer hover:scale-105'}`}
              >
                {pago.status === 'pagado' && (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                   </svg>
                )}
              </div>
              
              {/* Información de la Cuota */}
              <div className="mt-4 w-full pr-4">
                {esEdicion && pago.status !== 'pagado' ? (
                  <div className="space-y-2">
                    {/* Título editable con resaltado para "Nuevo" */}
                    <input 
                      className={`font-bold text-base border-b outline-none w-full px-1 transition-colors
                        ${pago.titulo === 'Nuevo' 
                          ? 'border-blue-500 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 text-slate-800 focus:border-orange-400'}`}
                      defaultValue={pago.titulo}
                    />
                    
                    {/* Input de Monto (Read-only según reglas de división) */}
                    <div className="flex items-center border border-gray-200 rounded px-2 py-1 bg-white shadow-sm">
                      <input 
                        type="text" 
                        className="w-full text-sm font-bold outline-none text-slate-700" 
                        value={formatMonto(pago.monto)} 
                        readOnly 
                      />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{moneda}</span>
                    </div>
                    
                    {/* Controles de Porcentaje */}
                    <div className="flex items-center gap-2">
                      <button className="w-5 h-5 flex items-center justify-center border border-gray-200 rounded-full text-orange-500 hover:bg-orange-50 transition-colors">-</button>
                      <span className="text-xs text-gray-500 font-medium">{obtenerPorcentajeText(pago.monto)}%</span>
                      <button className="w-5 h-5 flex items-center justify-center border border-gray-200 rounded-full text-orange-500 hover:bg-orange-50 transition-colors">+</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-800 text-base">{pago.titulo}</p>
                    <p className="text-[13px] font-semibold text-slate-700 mt-0.5">
                      {formatMonto(pago.monto)} {moneda} 
                      <span className="text-gray-400 font-normal ml-1">({obtenerPorcentajeText(pago.monto)}%)</span>
                    </p>
                  </>
                )}
                
                {/* Selector de Fecha / Fecha Fija */}
                <p className={`text-[11px] mt-2 uppercase font-bold tracking-wider
                  ${esEdicion && pago.status !== 'pagado' ? 'text-orange-500 cursor-pointer hover:underline' : 'text-gray-400'}`}>
                   {esEdicion && pago.status !== 'pagado' ? '📅 Seleccionar' : '22 Ene, 2022'}
                </p>
              </div>
            </div>

            {/* --- CONECTORES Y ACCIONES INTERMEDIAS --- */}
            {index < pagos.length - 1 ? (
              <div className="relative flex items-center group">
                {/* Línea conectora que se pinta de verde si el pago anterior está completo */}
                <div className={`h-[3px] w-24 mx-2 transition-colors ${pagos[index].status === 'pagado' ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                
                {/* Botón (+) Azul para insertar cuotas (Hover) */}
                {!esEdicion && (
                  <button 
                    onClick={() => {
                      agregarPago(index);
                      setEsEdicion(true); // Entramos en edición al crear intermedio
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-50 border border-blue-100 rounded-full text-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 hover:scale-110"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                )}
              </div>
            ) : (
              /* Botón de "Agregar Pago" final (Vista inicial/limpia) */
              !esEdicion && (
                <div className="flex items-center">
                  <div className="h-[1px] w-12 bg-gray-100 mx-2" />
                  <div className="flex flex-col items-center gap-1.5 mr-8 group/btn">
                    <button 
                      onClick={() => agregarPago(index)}
                      className="w-10 h-10 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center text-orange-500 group-hover/btn:bg-orange-50 group-hover/btn:border-orange-200 transition-all shadow-sm"
                    >
                      <span className="text-2xl font-light">+</span>
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap uppercase tracking-tighter">Agregar Pago</span>
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