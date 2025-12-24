// hooks/usePagos.ts
import { useState } from 'react';
import type { Pago, ViewMode } from '../types/pagos';

export const usePagos = (totalInicial: number) => {
  const [pagos, setPagos] = useState<Pago[]>([
    { 
      id: crypto.randomUUID(), 
      titulo: 'Anticipo', 
      monto: totalInicial, 
      status: 'pendiente', 
      fecha: new Date() 
    }
  ]);
  const [modo, setModo] = useState<ViewMode>('view');

  /**
   * Lógica principal para dividir pagos.
   * Se encarga de insertar un "Nuevo" pago dividiendo el monto del pago de referencia.
   */
  const agregarPago = (indexReferencia: number) => {
    const nuevosPagos = [...pagos];
    const pagoBase = nuevosPagos[indexReferencia];

    // Regla: Un pago en estado "pagado" no puede ser modificado ni dividido
    if (pagoBase.status === 'pagado') {
      // Si el actual está pagado, buscamos el siguiente disponible para dividir
      alert("Este pago ya está cerrado. El sistema dividirá el próximo pendiente.");
      return; 
    }

    // Regla: Dividir el monto a la mitad
    const montoMitad = pagoBase.monto / 2;
    pagoBase.monto = montoMitad;

    const nuevoPago: Pago = {
      id: crypto.randomUUID(),
      titulo: 'Nuevo', // Identificador temporal para el resaltado visual
      monto: montoMitad,
      status: 'pendiente',
      fecha: new Date(),
    };

    // Insertar el nuevo pago justo después de la referencia
    nuevosPagos.splice(indexReferencia + 1, 0, nuevoPago);

    // Re-indexar títulos para mantener la consistencia del flujo
    const totalElementos = nuevosPagos.length;
    const pagosProcesados = nuevosPagos.map((p, i) => {
      if (i === 0) return { ...p, titulo: 'Anticipo' };
      if (i === totalElementos - 1) return { ...p, titulo: 'Pago Final' };
      // Si no es el recién creado "Nuevo", le asignamos su número correlativo
      if (p.titulo !== 'Nuevo') return { ...p, titulo: `Pago ${i}` };
      return p;
    });

    setPagos(pagosProcesados);
    setModo('edit'); // Cambiamos a modo edición automáticamente según el flujo
    
    //@todo: API PATCH para actualizar la distribución completa y montos modificados
  };

  /**
   * Cambia el estado a pagado validando la correlatividad.
   */
  const marcarComoPagado = (id: string) => {
    const index = pagos.findIndex(p => p.id === id);
    
    // Regla: No se puede pagar una cuota si la anterior no se ha pagado
    if (index > 0 && pagos[index - 1].status === 'pendiente') {
      alert("No se puede pagar esta cuota si la anterior no se ha pagado.");
      return;
    }

    setPagos(prev => prev.map(p => p.id === id ? { ...p, status: 'pagado' } : p));
    //@todo: API PUT para actualizar el estado del pago individual a 'pagado'
  };

  /**
   * Utilidad para la visualización de porcentajes.
   * Regla: Redondeo a un decimal solo si es necesario.
   */
  const obtenerPorcentajeText = (monto: number): string => {
    const porcentaje = (monto / totalInicial) * 100;
    return porcentaje % 1 === 0 ? porcentaje.toString() : porcentaje.toFixed(1);
  };

  return { 
    pagos, 
    modo, 
    setModo,
    agregarPago, 
    marcarComoPagado, 
    obtenerPorcentajeText 
  };
};