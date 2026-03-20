import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1D4ED8',
          green: '#16A34A'
        }
      }
    }
  },
  plugins: []
} satisfies Config
