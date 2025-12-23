export const formatMonto = (valor: number): string => {
  // Aqui redondeamos a un decimal
  const rounded = Math.round(valor * 10) / 10;
  // Si es entero, no muestra decimales. Si tiene decimal, muestra uno.
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
};