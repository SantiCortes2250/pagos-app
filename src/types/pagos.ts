import { z } from "zod";


// Esquema y tipo para Pago
export const PagoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(1, "El título es obligatorio").max(20, "Título muy largo"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  status: z.enum(["pendiente", "pagado"]),
  fecha: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      const d = new Date(arg);
      // Ajustamos la diferencia horaria para que no "salte" al día anterior
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      return d;
    }
    return arg;
  }, z.date()), // Coerce ayuda a convertir strings de JSON a objetos Date
  metodoPago: z.string().optional(),
  fechaPagoReal: z.coerce.date().optional(),
});

// Esquema y tipo para Préstamo
export const PrestamoSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().min(1, "Nombre requerido"),
  total: z.number().positive(),
  moneda: z.enum(["USD", "COP"]),
  fechaCreacion: z.coerce.date(),
  pagos: z.array(PagoSchema)
});

export type Pago = z.infer<typeof PagoSchema>;
export type Prestamo = z.infer<typeof PrestamoSchema>;