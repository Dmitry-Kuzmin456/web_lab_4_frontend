import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Хак: используем Deepseek
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // Включаем PWA даже в режиме npm run dev (по умолчанию отключено!)
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/api/] // Не кэшируем запросы к бэкенду
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Lab 4 Offline App',
        short_name: 'Lab4',
        description: 'Web Lab 4 with Offline Mode',
        theme_color: '#ffffff',
        background_color: '#ffffff', // Обязательно
        display: 'standalone',       // Обязательно: запускать как отдельное приложение
        start_url: '/',              // Обязательно
        icons: [
          {
            src: 'img/duck_without_background_1.png', // Убедись, что путь верный
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/duck_without_background_1.png', // Хак: используем ту же утку как 512px
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})