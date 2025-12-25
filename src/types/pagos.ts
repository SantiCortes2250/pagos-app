export type Currency = 'USD' | 'COP';
export type Status = 'pendiente' | 'pagado';
export type ViewMode = 'view' | 'edit';

export interface Pago {
  fechaPagoReal: any;
  metodoPago: string;
  id: string;
  titulo: string;
  monto: number; // Valor interno sin redondear
  status: Status;
  fecha: Date;
}