import { useState, useEffect } from 'react';
import type { Pago } from '../types/pagos';
import { PagoSchema } from '../types/pagos';
import { z } from "zod";

export const usePagos = (totalInicial: number, prestamoId: string) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mostrarError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // --- CARGA INICIAL ---
  const [pagos, setPagos] = useState<Pago[]>(() => {
    // Usamos una llave única por cada préstamo
    const storageKey = `pagos_prestamo_${prestamoId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Zod coerce convertirá los strings de fecha de nuevo a objetos Date
        return z.array(PagoSchema).parse(parsed);
      } catch (e) {
       console.error("Error cargando pagos específicos:", e);
      }
    }
    return [{
      id: crypto.randomUUID(), 
      titulo: 'Anticipo', 
      monto: totalInicial, 
      status: 'pendiente', 
      fecha: new Date(),
      metodoPago: ''
    }];
  });

// Guardar cambios siempre referenciando al ID del préstamo
  useEffect(() => {
    if (prestamoId) {
      localStorage.setItem(`pagos_prestamo_${prestamoId}`, JSON.stringify(pagos));
    }
  }, [pagos, prestamoId]);

  // Función central de actualización con validación
  const setPagosValidados = (nuevosPagos: Pago[]) => {
    const result = z.array(PagoSchema).safeParse(nuevosPagos);

    if (result.success) {
      setPagos(result.data);
      return true;
    } else {
      // safeParse no lanza excepción, devuelve un objeto con los errores
      // Tomamos el primer error de cualquier campo
      const issues = result.error.issues;
      if (issues.length > 0) {
        mostrarError(issues[0].message);
      } else {
        mostrarError("Error de validación en los datos");
      }
      return false;
    }
  };

  // --- FUNCIONES DE GESTIÓN DE PAGOS ---

  // Actualiza el título de un pago
  const actualizarTitulo = (id: string, nuevoTitulo: string) => {
    const nuevos = pagos.map(p => p.id === id ? { ...p, titulo: nuevoTitulo } : p);
    setPagosValidados(nuevos);
  };


  // Agrega un nuevo pago dividiendo el monto del pago referenciado
  const agregarPago = (indexReferencia: number) => {
    const listaActual = [...pagos];
    const pagoBase = { ...listaActual[indexReferencia] };
    if (pagoBase.status === 'pagado') return;

    const montoMitad = pagoBase.monto / 2;
    pagoBase.monto = montoMitad;
    listaActual[indexReferencia] = pagoBase;

    const nuevoPago: Pago = {
      id: crypto.randomUUID(),
      titulo: 'Nuevo',
      monto: montoMitad,
      status: 'pendiente',
      fecha: new Date(),
      metodoPago: ''
    };

    listaActual.splice(indexReferencia + 1, 0, nuevoPago);
    setPagosValidados(listaActual);
  };

  // Marca un pago como pagado, validando el orden
  const marcarComoPagado = (id: string, metodo: string) => {
    const index = pagos.findIndex(p => p.id === id);
    if (index > 0 && pagos[index - 1].status === 'pendiente') {
      mostrarError(`Debes pagar "${pagos[index-1].titulo}" primero.`);
      return;
    }
    setPagosValidados(pagos.map(p => 
      p.id === id ? { ...p, status: 'pagado', metodoPago: metodo, fechaPagoReal: new Date() } : p
    ));
  };

  // Actualiza el monto de un pago y ajusta el vecino para mantener el total
  const actualizarPorcentaje = (index: number, incremento: number) => {
    const nuevos = [...pagos];
    const vecinoIdx = index === 0 ? index + 1 : index - 1;
    if (!nuevos[vecinoIdx] || nuevos[index].status === 'pagado' || nuevos[vecinoIdx].status === 'pagado') return;
    
    const delta = totalInicial * 0.01 * incremento;
    if (nuevos[index].monto + delta <= 0 || nuevos[vecinoIdx].monto - delta <= 0) return;
    
    nuevos[index] = { ...nuevos[index], monto: nuevos[index].monto + delta };
    nuevos[vecinoIdx] = { ...nuevos[vecinoIdx], monto: nuevos[vecinoIdx].monto - delta };
    setPagosValidados(nuevos);
  };

  // Actualiza la fecha de un pago
  const actualizarFecha = (id: string, nuevaFecha: Date) => {
    setPagosValidados(pagos.map(p => p.id === id ? { ...p, fecha: nuevaFecha } : p));
  };


  // Obtiene el porcentaje que representa un monto respecto al total inicial
  const obtenerPorcentajeText = (monto: number) => 
    ((monto / totalInicial) * 100).toFixed((monto / totalInicial * 100) % 1 === 0 ? 0 : 1);

  return { pagos, agregarPago, marcarComoPagado, obtenerPorcentajeText, actualizarPorcentaje, actualizarFecha, actualizarTitulo, errorMsg };
};