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
      manifest: {
        name: 'Captain Bitbeard',
        short_name: 'Bitbeard',
        description: 'Self-hosted retro gaming platform',
        theme_color: '#0F4C81',
        background_color: '#191970',
        display: 'standalone',
        orientation: 'portrait-primary',
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
      },
      workbox: {
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
