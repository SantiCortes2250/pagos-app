# 💸 Pagos-App: Gestión Dinámica de Préstamos

Esta es una aplicación técnica desarrollada con **React**, **TypeScript** y **Tailwind CSS**. El objetivo principal es permitir la gestión de planes de pago de forma dinámica, permitiendo dividir cuotas, ajustar montos proporcionalmente y mantener la persistencia de datos localmente.

## 🚀 Características Principales

* **Arquitectura Maestro-Detalle**: Navegación fluida entre una lista global de préstamos y el detalle específico de cada uno.
* **Gestión Dinámica de Cuotas**: Posibilidad de dividir cuotas existentes manteniendo la integridad del monto total.
* **Cálculo Proporcional**: Ajuste de montos mediante porcentajes; el cambio en una cuota afecta automáticamente a su vecina para evitar errores financieros.
* **Validación de Datos con Zod**: Esquemas de validación en tiempo de ejecución para asegurar la integridad de los datos y el manejo correcto de tipos.
* **Persistencia Local**: Uso de `localStorage` con lógica de rehidratación para que la información no se pierda al recargar el navegador.
* **Manejo Inteligente de Fechas**: Solución al desfase de zonas horarias (UTC vs Local) en los inputs de fecha.

## 🛠️ Stack Tecnológico

* **Frontend**: React 18 (Vite)
* **Estilos**: Tailwind CSS
* **Validación**: Zod
* **Tipado**: TypeScript

## 📁 Estructura del Proyecto

Basado en buenas prácticas de **Clean Code** y separación de responsabilidades:

```text
src/
├── components/       # Componentes visuales (Pagos, ListaPrestamos, Modal)
├── hooks/            # Lógica de negocio extraída en Custom Hooks (usePagos)
├── types/            # Definición de tipos de TS y Esquemas de Zod
├── utils/            # Funciones de ayuda (formateadores de moneda)
├── App.tsx           # Punto de entrada principal
└── main.tsx          # Renderizado de la aplicación
```

## 🛠️ Instalación y Uso

```

1. Clonar el repositorio:
git clone https://github.com/SantiCortes2250/pagos-app

2. Instalar dependencias:
npm install

3.Ejecutar el proyecto:
npm run dev

```

## 🌍 Live Demo

[text](https://pagos-app.netlify.app/)