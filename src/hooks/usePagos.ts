import { useState, useEffect } from 'react';
import type { Pago } from '../types/pagos';
import { PagoSchema } from '../types/pagos';
import { z } from "zod";

/*
  Custom hook para gestionar la lógica de los pagos.
  Decidí separar esto en un hook para no llenar el componente visual y 
  porque manejar estados complejos de arrays me parecio mas comodo.
 */


export const usePagos = (totalInicial: number, prestamoId: string) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper para mostrar errores temporales. 
  // Lo puse en 4 segundos para que al usuario le de tiempo de leerlo bien.
  const mostrarError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // --- CARGA INICIAL ---
  const [pagos, setPagos] = useState<Pago[]>(() => {
    // Use el ID del préstamo en la key para que los pagos de un cliente 
    // no se mezclen con los de otro en el almacenamiento local.
    const storageKey = `pagos_prestamo_${prestamoId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use Zod aquí porque el localStorage puede venir con datos corruptos 
        // o fechas en formato string y necesitamos objetos Date reales.
        return z.array(PagoSchema).parse(parsed);
      } catch (e) {
        console.error("Error cargando pagos específicos:", e);
      }
    }
    // Si no hay nada, el primer pago siempre es por el total.
    return [{
      id: crypto.randomUUID(), 
      titulo: 'Anticipo', 
      monto: totalInicial, 
      status: 'pendiente', 
      fecha: new Date(),
      metodoPago: ''
    }];
  });

  // Guardo en LocalStorage cada vez que cambian los pagos o el ID del préstamo.
  // Me parece forma sencilla de tener persistencia sin backend todavía.
  useEffect(() => {
    if (prestamoId) {
      localStorage.setItem(`pagos_prestamo_${prestamoId}`, JSON.stringify(pagos));
      //@todo: api post para sincronizar los cambios con la base de datos de forma persistente.
    }
  }, [pagos, prestamoId]);

  /*
    Esta es la función para actualizar el estado.
    La hice así para centralizar la validación de Zod y no repetir el manejo de errores
    en cada pequeña función de arriba.
   */
  const setPagosValidados = (nuevosPagos: Pago[]) => {
    const result = z.array(PagoSchema).safeParse(nuevosPagos);

    if (result.success) {
      setPagos(result.data);
      return true;
    } else {
      // Si Zod falla, agarramos el primer error de la lista para mostrar algo claro.
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

  const actualizarTitulo = (id: string, nuevoTitulo: string) => {
    const nuevos = pagos.map(p => p.id === id ? { ...p, titulo: nuevoTitulo } : p);
    setPagosValidados(nuevos);
    //@todo: api patch para actualizar solo el título en el servidor.
  };

  /*
    Divide un pago a la mitad.
    Elegí usar splice para insertar el nuevo pago justo después del que estamos dividiendo,
    así mantenemos un flujo visual lógico en la línea de tiempo.
   */
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
    //@todo: api post para guardar la creación de esta nueva cuota.
  };

  /*
    Marca como pagado.
    Agregué una validación de orden para que el usuario no vaya a pagar la cuota 2 si la 1 está pendiente.
   */
  const marcarComoPagado = (id: string, metodo: string) => {
    const index = pagos.findIndex(p => p.id === id);
    if (index > 0 && pagos[index - 1].status === 'pendiente') {
      mostrarError(`Debes pagar "${pagos[index-1].titulo}" primero.`);
      return;
    }
    setPagosValidados(pagos.map(p => 
      p.id === id ? { ...p, status: 'pagado', metodoPago: metodo, fechaPagoReal: new Date() } : p
    ));
    //@todo: api put para registrar el pago y disparar notificaciones de cobro.
  };

  /*
   Mueve los montos entre pagos vecinos.
   Si sumo a uno se le resta al de al lado para que el total del préstamo no cambie y siga siendo el 100%.
   Me parece una forma de mantener la integridad de la deuda total sin cálculos extras.
   */
  const actualizarPorcentaje = (index: number, incremento: number) => {
    const nuevos = [...pagos];
    const vecinoIdx = index === 0 ? index + 1 : index - 1;
    if (!nuevos[vecinoIdx] || nuevos[index].status === 'pagado' || nuevos[vecinoIdx].status === 'pagado') return;
    
    const delta = totalInicial * 0.01 * incremento;
    // Validación para no tener montos negativos, eso rompería la lógica financiera.
    if (nuevos[index].monto + delta <= 0 || nuevos[vecinoIdx].monto - delta <= 0) return;
    
    nuevos[index] = { ...nuevos[index], monto: nuevos[index].monto + delta };
    nuevos[vecinoIdx] = { ...nuevos[vecinoIdx], monto: nuevos[vecinoIdx].monto - delta };
    setPagosValidados(nuevos);
  };

  const actualizarFecha = (id: string, nuevaFecha: Date) => {
    setPagosValidados(pagos.map(p => p.id === id ? { ...p, fecha: nuevaFecha } : p));
    //@todo: api patch para actualizar fecha de vencimiento.
  };

  // Formateador para los porcentajes. 
  // Uso una lógica de redondeo para que si es un número entero (como 10%) no muestre decimales.
  const obtenerPorcentajeText = (monto: number) => 
    ((monto / totalInicial) * 100).toFixed((monto / totalInicial * 100) % 1 === 0 ? 0 : 1);

  return { 
    pagos, 
    agregarPago, 
    marcarComoPagado, 
    obtenerPorcentajeText, 
    actualizarPorcentaje, 
    actualizarFecha, 
    actualizarTitulo, 
    errorMsg 
  };
};