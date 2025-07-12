import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({ 
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        name: "Wacken GLUP",
        short_name: "Wacken GLUP",
        description: "An application to share your favorite acts with your group",
        background_color: "#181211",
        theme_color: "#181211"
      },
      workbox: {
        globPatterns: ['**/*'],
        maximumFileSizeToCacheInBytes: 5000000,
      },
      includeAssets: ['**/*'],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
