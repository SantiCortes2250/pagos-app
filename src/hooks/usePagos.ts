// hooks/usePagos.ts
import { useState } from 'react';
import type { Pago } from '../types/pagos';

export const usePagos = (totalInicial: number) => {
  const [pagos, setPagos] = useState<Pago[]>([
    { id: '1', titulo: 'Anticipo', monto: totalInicial, status: 'pendiente', fecha: new Date() }
  ]);

  // Lógica para añadir pago dividiendo a la mitad
  const agregarPago = (indexInsertar: number) => {
    const nuevosPagos = [...pagos];
    const pagoReferencia = nuevosPagos[indexInsertar];

    if (pagoReferencia && pagoReferencia.status === 'pendiente') {
      const mitad = pagoReferencia.monto / 2;
      pagoReferencia.monto = mitad; // El actual se reduce
      
      const nuevoPago: Pago = { 
        id: crypto.randomUUID(),
        titulo: `Pago ${nuevosPagos.length}`,
        monto: mitad,
        status: 'pendiente',
        fecha: new Date(),
      };
      
      nuevosPagos.splice(indexInsertar + 1, 0, nuevoPago);
      setPagos(nuevosPagos);
      
      //@todo: API PATCH para actualizar el monto del pago anterior y POST para el nuevo
    }
  };

  const marcarComoPagado = (id: string) => {
    // No se puede pagar si el anterior no está pagado
    const index = pagos.findIndex(p => p.id === id);
    if (index > 0 && pagos[index - 1].status === 'pendiente') {
      alert("Debes pagar la cuota anterior primero");
      return;
    }

    setPagos(prev => prev.map(p => p.id === id ? { ...p, status: 'pagado' } : p));
    //@todo: API PUT para cambiar estado a 'pagado'
  };

  // Calcula el porcentaje respecto al total inicial
const calcularPorcentaje = (monto: number, total: number): string => {
  const porcentaje = (monto / total) * 100;
  // Uso la misma lógica de redondeo: si es entero sin decimales, si no, un decimal.
  return porcentaje % 1 === 0 ? porcentaje.toString() : porcentaje.toFixed(1);
};

  return { pagos, agregarPago, marcarComoPagado, calcularPorcentaje };
};