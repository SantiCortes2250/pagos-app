// components/Pagos.tsx
import React from 'react';
import { usePagos } from '../hooks/usePagos';
import { formatMonto } from '../utils/formatters';
// Importación de tipo obligatoria por verbatimModuleSyntax
import type { Pago } from '../types/pagos';

interface PagosProps {
  total: number;
  moneda?: 'USD' | 'COP';
}

const Pagos: React.FC<PagosProps> = ({ total, moneda = 'USD' }) => {
  const { pagos, agregarPago, marcarComoPagado } = usePagos(total);

  // Esta función la cree para calcular el porcentaje de cada cuota respecto al total
  const calcularPorcentaje = (monto: number): string => {
    const porcentaje = (monto / total) * 100;
    // Sin decimales si es entero, o 1 decimal si no lo es
    return porcentaje % 1 === 0 ? porcentaje.toString() : porcentaje.toFixed(1);
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      {/* Header*/}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2 cursor-pointer group">
          <h2 className="text-orange-500 font-bold text-xl">Pagos</h2>
          <span className="text-orange-400 text-xs transition-transform group-hover:translate-y-0.5">v</span>
        </div>
         
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-orange-400 text-sm font-medium hover:text-orange-500 transition-colors">
            Editar <span className="text-[10px]">✎</span>
          </button>
          <div className="text-slate-400 font-medium text-sm">
            Por cobrar <span className="text-slate-900 font-bold ml-1">{formatMonto(total)} {moneda}</span>
          </div>
        </div>
      </div>

      {/* Flujo de Cuotas */}
      <div className="flex items-start overflow-x-auto pb-6 scrollbar-hide">
        {pagos.map((pago: Pago, index: number) => (
          <div key={pago.id} className="flex items-center">
            
            {/* Nodo de Cuota */}
            <div className="flex flex-col items-start min-w-[140px]">
              <div 
                onClick={() => pago.status === 'pendiente' && marcarComoPagado(pago.id)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm
                ${pago.status === 'pagado' 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white border-orange-500 text-orange-500 hover:scale-105'}`}
              >
                {pago.status === 'pagado' ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : null}
              </div>
              
              <div className="mt-4">
                <p className="font-bold text-slate-800 text-base">{pago.titulo}</p>
                <p className="text-[13px] font-semibold text-slate-700 mt-0.5">
                  {formatMonto(pago.monto)} {moneda} 
                  <span className="text-gray-400 font-normal ml-1">({calcularPorcentaje(pago.monto)}%)</span>
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                  {/* Aca tengo que implementar selector de fecha real */}
                  22 Ene, 2022
                </p>
              </div>
            </div>

            {/* Conector dinámico */}
            {index < pagos.length - 1 ? (
              <div className={`h-[3px] w-20 mx-2 transition-colors ${pagos[index].status === 'pagado' ? 'bg-emerald-500' : 'bg-gray-100'}`} />
            ) : (
              /* Botón de Agregar Pago*/
              <div className="flex">
                <div className="h-[1px] w-12 bg-gray-100 mx-2" />
                <div className="flex flex-col items-center gap-1.5 mr-8">
                  <button 
                    onClick={() => agregarPago(index)}
                    className="w-10 h-10 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center text-orange-500 hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm"
                  >
                    <span className="text-2xl font-light">+</span>
                  </button>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Agregar Pago</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pagos;