/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fire: {
          dark: '#2A1617',      // Stop 1: Darkest Brown/Near Black
          brown: '#7A4B47',     // Stop 2: Medium Reddish-Brown
          cream: '#FFFB97',     // Stop 3: Very Pale Cream
          orange: '#FE7F42',    // Stop 4: Bright Orange
          cherry: '#B32C1A',    // Stop 5: Deep Cherry Red
          surface: '#1c0f10',   // Deep card background
          elevated: '#241415',  // Elevated card background
          border: '#3d2022',    // Border tone
          subtle: '#522b2d',    // Subtle divider tone
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'on-fire-linear': 'linear-gradient(135deg, #2A1617 0%, #7A4B47 25%, #FFFB97 50%, #FE7F42 75%, #B32C1A 100%)',
        'on-fire-horizontal': 'linear-gradient(90deg, #2A1617 0%, #7A4B47 25%, #FFFB97 50%, #FE7F42 75%, #B32C1A 100%)',
        'on-fire-radial': 'radial-gradient(circle at 60% 40%, #FFFB97 0%, #FE7F42 28%, #B32C1A 55%, #7A4B47 78%, #2A1617 100%)',
        'on-fire-banner': 'linear-gradient(110deg, #2A1617 0%, #3D1F20 18%, #7A4B47 38%, #FFFB97 55%, #FE7F42 75%, #B32C1A 100%)',
      }
    },
  },
  plugins: [],
}
