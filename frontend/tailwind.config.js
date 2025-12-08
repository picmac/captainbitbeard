/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ocean-blue': '#0F4C81',
        'ocean-dark': '#191970',
        'night-sky': '#191970',
        'sand-beige': '#E8D5B7',
        'pirate-gold': '#FFD700',
        'wood-brown': '#8B4513',
        'skull-white': '#F5F5F5',
        'blood-red': '#DC143C',
        'treasure-green': '#2E8B57',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      spacing: {
        '1px': '1px',
        '2px': '2px',
        '4px': '4px',
        '8px': '8px',
      },
    },
  },
  plugins: [],
};
