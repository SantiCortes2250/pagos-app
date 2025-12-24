import { useState } from 'react';
import type { Pago } from '../types/pagos';

export const usePagos = (totalInicial: number) => {
  const [pagos, setPagos] = useState<Pago[]>([
    { id: crypto.randomUUID(), titulo: 'Anticipo', monto: totalInicial, status: 'pendiente', fecha: new Date() }
  ]);

  const agregarPago = (indexReferencia: number) => {
    const listaActual = [...pagos];
    const pagoBase = { ...listaActual[indexReferencia] };
    if (pagoBase.status === 'pagado') return;

    const montoMitad = pagoBase.monto / 2;
    pagoBase.monto = montoMitad;
    listaActual[indexReferencia] = pagoBase;

    // Lógica de nombres: Si ya hay pagos, el nuevo es "Nuevo" (intermedio) o "Pago Final" (si es el último)
    const esAlFinal = indexReferencia === listaActual.length - 1;
    
    const nuevoPago: Pago = {
      id: crypto.randomUUID(),
      titulo: esAlFinal ? 'Pago Final' : 'Nuevo',
      monto: montoMitad,
      status: 'pendiente',
      fecha: new Date(),
    };

    listaActual.splice(indexReferencia + 1, 0, nuevoPago);

    // Re-indexar nombres para mantener el orden Pago 1, Pago 2...
    const pagosProcesados = listaActual.map((p, i, arr) => {
      if (i === 0) return { ...p, titulo: 'Anticipo' };
      if (i === arr.length - 1) return { ...p, titulo: p.titulo === 'Nuevo' ? 'Nuevo' : 'Pago Final' };
      if (p.titulo === 'Nuevo') return p; // Mantener "Nuevo" si se acaba de crear
      return { ...p, titulo: `Pago ${i}` };
    });

    setPagos(pagosProcesados);
  };

  const marcarComoPagado = (id: string) => {
    const index = pagos.findIndex(p => p.id === id);
    // Validación de pago anterior
    if (index > 0 && pagos[index - 1].status === 'pendiente') {
      alert(`Debes marcar como pagado el "${pagos[index - 1].titulo}" antes de continuar.`);
      return;
    }
    setPagos(prev => prev.map(p => p.id === id ? { ...p, status: 'pagado' } : p));
  };

  const actualizarPorcentaje = (index: number, incremento: number) => {
    const nuevos = [...pagos];
    const vecinoIdx = index === 0 ? index + 1 : index - 1;
    if (!nuevos[vecinoIdx] || nuevos[index].status === 'pagado' || nuevos[vecinoIdx].status === 'pagado') return;
    
    const delta = totalInicial * 0.01 * incremento;
    if (nuevos[index].monto + delta < 0 || nuevos[vecinoIdx].monto - delta < 0) return;
    
    nuevos[index] = { ...nuevos[index], monto: nuevos[index].monto + delta };
    nuevos[vecinoIdx] = { ...nuevos[vecinoIdx], monto: nuevos[vecinoIdx].monto - delta };
    setPagos(nuevos);
  };

  const actualizarFecha = (id: string, nuevaFecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar para comparar solo fechas

    if (nuevaFecha < hoy) {
      alert("La fecha no puede ser menor a la fecha actual");
      return;
    }

    setPagos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fecha: nuevaFecha } : p))
    );
  };

  const obtenerPorcentajeText = (monto: number) => 
    ((monto / totalInicial) * 100).toFixed((monto / totalInicial * 100) % 1 === 0 ? 0 : 1);


  return { pagos, agregarPago, marcarComoPagado, obtenerPorcentajeText, actualizarPorcentaje, actualizarFecha };
};