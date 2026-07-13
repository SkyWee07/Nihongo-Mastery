/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // var(--primary-color)
          hover: '#4F46E5',   // var(--primary-hover)
        },
        bg: {
          dark: '#0F172A',    // var(--bg-color)
        },
        card: {
          bg: 'rgba(30, 41, 59, 0.7)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        text: {
          main: '#F8FAFC',    // var(--text-main)
          muted: '#94A3B8',   // var(--text-muted)
        },
        accent: '#10B981',    // var(--accent)
        danger: '#EF4444',    // var(--danger)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'gradient-bg': 'gradientBG 15s ease infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.8s ease forwards',
        'scale-up': 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        gradientBG: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeInDown: {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          'from': { transform: 'scale(0.8)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-50px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
}
