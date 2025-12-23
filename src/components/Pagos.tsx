
import React from 'react';


interface PagosProps {
  total: number;
  moneda?: 'USD' | 'COP';
}

const Pagos: React.FC<PagosProps> = ({ total, moneda = 'USD' }) => {
 

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-4">pago:{total} {moneda}</h2>
    </div>
  );
};

export default Pagos;