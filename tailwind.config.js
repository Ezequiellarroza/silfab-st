/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a', // Azul profundo, serio
        secondary: '#38bdf8', // Celeste fresco
        accent: '#fbbf24', // Amarillo de energía
        neutral: '#f3f4f6', // Gris claro zen
        dark: '#0f172a', // Azul casi negro para fondos
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Moderna y clara
        heading: ['Poppins', 'sans-serif'], // Para títulos
      },
      borderRadius: {
        xl: '1rem', // Bordes suaves y redondeados
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
