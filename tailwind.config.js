/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1F3A',
          blue: '#1D6FD8',
          teal: '#0EA5B7',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6'
        }
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(11, 31, 58, 0.05)',
        'elevated': '0 10px 30px -4px rgba(11, 31, 58, 0.08)',
      }
    },
  },
  plugins: [],
}
