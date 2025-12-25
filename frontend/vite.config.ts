import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      devOptions: {
        enabled: false, // Enable in dev for testing: true
      },
      manifest: {
        name: 'Captain Bitbeard - Retro Gaming Platform',
        short_name: 'Bitbeard',
        description: 'Self-hosted retro gaming platform with 60+ emulated systems. Play classic games offline!',
        theme_color: '#0F4C81',
        background_color: '#191970',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Game Library',
            short_name: 'Library',
            description: 'Browse your game collection',
            url: '/library',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Save States',
            short_name: 'Saves',
            description: 'View your saved games',
            url: '/save-states',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Collections',
            short_name: 'Collections',
            description: 'Browse your collections',
            url: '/collections',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Aggressive caching for emulator cores (large .data files)
            urlPattern: /\/emulatorjs\/data\/cores\/.*\.data$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'emulator-cores-cache',
              expiration: {
                maxEntries: 200, // All 187 cores + room
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year - cores rarely change
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache other EmulatorJS assets
            urlPattern: /\/emulatorjs\/(loader|data)\/(?!cores).*\.(js|wasm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'emulatorjs-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Network-first for ROM downloads (user content changes frequently)
            urlPattern: /\/api\/games\/.*\/rom$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'roms-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 10, // Only cache recently played games
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [200, 206], // Cache full and partial responses
              },
            },
          },
          {
            // Cache game cover images and screenshots
            urlPattern: /\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Network-first for game list and metadata
            urlPattern: /\/api\/games(\?.*)?$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-games-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            // Cache-first for save states (offline viewing)
            urlPattern: /\/api\/save-states/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'save-states-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
