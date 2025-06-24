// C:\Users\Rocket\Documents\quiz\tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}", // برای فایل هایی مثل App.tsx و index.tsx در ریشه پروژه
    "./components/**/*.{js,ts,jsx,tsx}" // برای فایل های داخل پوشه components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}