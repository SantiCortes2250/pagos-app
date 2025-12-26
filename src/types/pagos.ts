import { z } from "zod";


// Esquema y tipo para Pago
export const PagoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(1, "El título es obligatorio").max(20, "Título muy largo"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  status: z.enum(["pendiente", "pagado"]),
  fecha: z.coerce.date(), // Coerce ayuda a convertir strings de JSON a objetos Date
  metodoPago: z.string().optional(),
  fechaPagoReal: z.coerce.date().optional(),
});

export type Pago = z.infer<typeof PagoSchema>;