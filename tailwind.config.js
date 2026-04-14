/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/views/**/*.{erb,jsx}',
    './app/javascript/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          brown:       '#3c3532', // rgb(60,53,50)  — primary, sidebar, CTA
          'brown-mid': '#4a4240', // hover state for brown
          taupe:       '#785f51', // rgb(120,95,81) — secondary actions
          'taupe-mid': '#8a6e60', // hover state for taupe
          gold:        '#c9a96e', // antique gold — accent, logo, highlights
          'gold-light':'#e8d5b0', // light gold for tinted backgrounds
          cream:       '#f5f4f2', // warm off-white page background
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
