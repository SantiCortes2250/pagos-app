export type Currency = 'USD' | 'COP';
export type Status = 'pendiente' | 'pagado';

export interface Pago {
  id: string;
  titulo: string;
  monto: number; // Valor interno sin redondear
  status: Status;
  fecha: Date;
}