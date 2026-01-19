import { resolve } from 'path'

export default defineNuxtConfig({
  srcDir: 'app',

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  alias: {
    '#root': resolve(__dirname),
  },

  vite: {
    resolve: {
      alias: {
        '#root': resolve(__dirname),
      },
    },
  },
})
