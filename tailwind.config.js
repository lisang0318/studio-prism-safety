/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        prism: {
          50: '#fff1f0',
          100: '#ffe1df',
          200: '#ffc8c5',
          300: '#ffa19b',
          400: '#ff6b61',
          500: '#FF4B3E', // Official Studio Prism Red
          600: '#FF3823',
          700: '#e02410',
          800: '#b81c0c',
          900: '#941c10',
          950: '#520902',
          red: '#FF4B3E',
          dark: '#0B0F19',
          card: '#111827',
          border: '#1E293B',
          surface: '#161F30'
        },
        slate: {
          850: '#151f32',
          900: '#0B0F19',
          950: '#070A11',
        }
      },
    },
  },
  plugins: [],
};

