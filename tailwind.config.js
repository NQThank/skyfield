/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF9B44',
        gradient: {
          from: '#af7d53',
          to: '#fc6075'
        },
        milestone: {
          not_started: '#CE6E6E',
          in_progress: '#3F51B5',
          completed: '#55CE63'
        },
        bg: {
          main: '#F0F1F7'
        },
        label: '#212121'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
