import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FinancEasy',
        short_name: 'FinancEasy',
        description: 'Gerencie suas finanças de forma fácil e eficiente.',
        start_url: '/',
        display: 'standalone',
        background_color: '#121212',
        theme_color: '#2d3748',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['finance', 'productivity'],
        shortcuts: [
          {
            name: 'Nova Despesa',
            short_name: 'Despesa',
            description: 'Adicionar nova despesa',
            url: '/transacoes?tab=despesas',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Nova Receita',
            short_name: 'Receita',
            description: 'Adicionar nova receita',
            url: '/transacoes?tab=receitas',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      includeAssets: [
        '/android-chrome-192x192.png',
        '/android-chrome-512x512.png',
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // Adicione esta linha para proxy das rotas API para o backend
    },
  },
});
