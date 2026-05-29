/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  corePlugins: { preflight: false }, // re-enabled scoped via a base layer in Task 5
  theme: { extend: {} },
  plugins: [],
}
