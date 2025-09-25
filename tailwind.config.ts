import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
        cormorant: ['var(--font-cormorant)', 'serif'],
        lora: ['var(--font-lora)', 'serif'],
      },
      colors: {
        // Palette LAIA SKIN moderne
        laia: {
          // Or rose - couleur principale
          primary: '#d4a574',
          'primary-light': '#e8c4a0',
          'primary-dark': '#b8935f',
          
          // Tons nude/beige
          nude: '#f5e6d3',
          beige: '#e5d4c1',
          cream: '#faf7f3',
          
          // Rose poudré
          rose: '#e8b4b8',
          'rose-light': '#f5d5d8',
          'rose-dark': '#d49296',
          
          // Neutres
          dark: '#2c1810',
          gray: '#8b7355',
          'gray-light': '#c4b5a4',
          
          // Ancienne palette (compatibilité)
          gold: '#d4b5a0',
          'gold-dark': '#c9a084',
          text: '#2c3e50',
        }
      },
      backgroundImage: {
        'laia-gradient': 'linear-gradient(135deg, #d4a574 0%, #e8b4b8 100%)',
        'laia-gradient-soft': 'linear-gradient(135deg, #faf7f3 0%, #f5e6d3 100%)',
        'laia-gradient-premium': 'linear-gradient(135deg, #d4a574 0%, #b8935f 50%, #e8b4b8 100%)',
      },
      boxShadow: {
        'laia-sm': '0 2px 4px rgba(212, 165, 116, 0.1)',
        'laia-md': '0 4px 12px rgba(212, 165, 116, 0.15)',
        'laia-lg': '0 8px 24px rgba(212, 165, 116, 0.2)',
        'laia-xl': '0 12px 48px rgba(212, 165, 116, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};

export default config;