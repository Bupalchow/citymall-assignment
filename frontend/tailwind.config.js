/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-pink': '#ff2a6d',
        'cyber-blue': '#05d9e8',
        'cyber-purple': '#d1058e',
        'cyber-yellow': '#f9f871',
        'cyber-dark': '#0d0221',
        'cyber-darker': '#07011a',
      },
      keyframes: {
        glitch: {
          '0%, 89%, 100%': { transform: 'translate(0)' },
          '90%': { transform: 'translate(-1px, 1px)' },
          '92%': { transform: 'translate(1px, -1px)' },
          '94%': { transform: 'translate(-0.5px, 0.5px)' },
          '96%': { transform: 'translate(0.5px, -0.5px)' },
          '98%': { transform: 'translate(-0.5px, -0.5px)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 5px #05d9e8, 0 0 10px #05d9e8' },
          '50%': { textShadow: '0 0 10px #05d9e8, 0 0 15px #05d9e8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        }
      },
      animation: {
        glitch: 'glitch 3s linear infinite',
        glow: 'glow 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        scan: 'scan 2s linear infinite',
        blink: 'blink 2s step-end infinite',
      }
    },
  },
  plugins: [],
}