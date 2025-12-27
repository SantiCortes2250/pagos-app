import { z } from "zod";

/*
 Esquema y tipo para Pago.
 Uso Zod aquí porque me permite validar los datos en tiempo de ejecución. 
 Si algo viene mal del LocalStorage o de una futura API, la app no se rompe 
 silenciosamente, sino que me avisa qué campo falló.
 */
export const PagoSchema = z.object({
  id: z.string().uuid(),
  // Puse un máximo de 20 caracteres para que el diseño de cada prestamo 
  // en la línea de tiempo no se rompa con textos largos.
  titulo: z.string().min(1, "El título es obligatorio").max(20, "Título muy largo"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  status: z.enum(["pendiente", "pagado"]),
  
  /*
   Me parece que el manejo de fechas en JS es complicado con las zonas horarias.
   Uso preprocess para que al cargar el JSON la fecha no se atrase un día 
   por la conversión a UTC. Básicamente "force" la hora local.
   */
  fecha: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      const d = new Date(arg);
      // Ajuste los minutos para compensar el desfase horario del navegador.
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      return d;
    }
    return arg;
  }, z.date()), 
  
  metodoPago: z.string().optional(),
  // coerce.date() me parece muy bueno porque convierte automáticamente strings de fecha a objetos Date de JS.
  fechaPagoReal: z.coerce.date().optional(),
});

/**
 * Esquema y tipo para Préstamo.
 * Esto representa el "Expediente" completo del cliente.
 */
export const PrestamoSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().min(1, "Nombre requerido"),
  total: z.number().positive(),
  moneda: z.enum(["USD", "COP"]),
  fechaCreacion: z.coerce.date(),
  // Relaciono el préstamo con sus cuotas. 
  // Al ser un array de PagoSchema, heredamos todas las validaciones de arriba.
  pagos: z.array(PagoSchema)
});

// Extraigo los tipos de TypeScript automáticamente de los esquemas.
// Así no tengo que escribir la interfaz dos veces.
export type Pago = z.infer<typeof PagoSchema>;
export type Prestamo = z.infer<typeof PrestamoSchema>;

//@todo: api get para traer los esquemas actualizados si cambian en la base de datos.