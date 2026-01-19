/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{vue,js,ts}",
    "./app/**/**/*.{vue,js,ts}",

    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.{vue,js,ts}",

    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
