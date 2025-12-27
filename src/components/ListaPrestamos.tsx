import React, { useState, useEffect } from 'react';
import Pagos from './Pagos'; // Tu componente actual
import type { Prestamo } from '../types/pagos';
import {  PrestamoSchema } from '../types/pagos';
import { z } from 'zod';

const ListaPrestamos: React.FC = () => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);

  // Cargar lista inicial
 
useEffect(() => {
  const saved = localStorage.getItem('lista_prestamos');
  let listaBase: Prestamo[] = [];

  if (saved) {
    try {
      listaBase = z.array(PrestamoSchema).parse(JSON.parse(saved));
    } catch (e) { console.error("Error al cargar préstamos", e); }
  } else {
    // Data inicial de ejemplo
    listaBase = [
      { id: '1', cliente: "Juan Perez", total: 182, moneda: "USD", fechaCreacion: new Date(), pagos: [] },
      { id: '2', cliente: "Maria Sosa", total: 190, moneda: "USD", fechaCreacion: new Date(), pagos: [] }
    ];
  }

  // REHIDRATACIÓN: Buscamos si hay pagos guardados para cada préstamo en el localStorage
  const listaConPagosCargados = listaBase.map(p => {
    const pagosGuardados = localStorage.getItem(`pagos_prestamo_${p.id}`);
    return {
      ...p,
      pagos: pagosGuardados ? JSON.parse(pagosGuardados) : p.pagos
    };
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setPrestamos(listaConPagosCargados);
}, []);

  if (prestamoSeleccionado) {
    return (
      <div className="p-4">
        <button 
          onClick={() => setPrestamoSeleccionado(null)}
          className="mb-4 text-orange-600 font-bold hover:underline cursor-pointer"
        >
          ← Volver a la lista
        </button>
        <h1 className="text-2xl font-bold mb-6 text-slate-800">
          Para: {prestamoSeleccionado.cliente}
        </h1>
        <Pagos 
          total={prestamoSeleccionado.total} 
          moneda={prestamoSeleccionado.moneda}
          prestamoId={prestamoSeleccionado.id} // Pasar ID para persistencia única
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Mis Préstamos</h2>
      <div className="grid gap-4">
        {prestamos.map((p) => (
          <div 
            key={p.id}
            onClick={() => setPrestamoSeleccionado(p)}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-orange-300 transition-all cursor-pointer flex justify-between items-center group"
          >
            <div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors">
                {p.cliente}
              </h3>
              <p className="text-slate-500 text-sm">Creado el {p.fechaCreacion.toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-slate-800">
                {p.total.toLocaleString()} {p.moneda}
              </p>
              <span className="text-xs text-orange-600 font-bold uppercase tracking-widest">Ver detalle →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaPrestamos;