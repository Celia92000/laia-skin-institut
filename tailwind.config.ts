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
        'laia-gold': '#d4b5a0',
        'laia-gold-dark': '#c9a084',
        'laia-cream': '#fdfbf7',
        'laia-cream-dark': '#f8f6f0',
        'laia-text': '#2c3e50',
      },
    },
  },
  plugins: [],
};

export default config;